"""The analysis engine: 32 services, each a function from the client's standard tables to a result."""

from __future__ import annotations

import json
import re
import time
import traceback
from dataclasses import asdict
from pathlib import Path

import pandas as pd

from . import svc_accounting, svc_data, svc_market, svc_marketing, svc_people, svc_sales
from .core import Ctx, Data, Fmt, NeedsData, Service, clean_json, level_for, missing_for

_CATALOG = json.loads((Path(__file__).parent / 'catalog.json').read_text(encoding='utf-8'))
_TEXT = {s['id']: s for d in _CATALOG for s in d['services']}
DEPTS = [{'id': d['id'], 'name': d['name']} for d in _CATALOG]

# The website describes the full offer; these say what this version actually runs, for reports and the screens.
METHODS = {
    'kpi-dashboard': 'Targets from the same month last year plus the business’s own growth',
    'driver-analysis': 'Multiple regression with robust errors, on weekly data',
    'sales-forecast-3-to-12-months': 'ETS, ARIMA and Theta compared with a Ramadan-aware regression on months held back; the most accurate wins',
    'budget-split-across-channels': 'Marketing mix model with carry-over (adstock) and saturation curves',
    'employee-survey': 'eNPS and themes from keywords in the written comments',
    'demand-trends': 'Google Trends export with seasonal decomposition (STL)',
    'competitor-check': 'Price comparison against the competitor list',
    'market-conditions': 'Scenario analysis of inflation, the exchange rate and margins',
    'staffing-plan': 'Sales by hour and day turned into staff hours with a labour-cost ratio',
    'staff-turnover-analysis': 'Kaplan–Meier survival curves and logistic regression',
    'pay-fairness-check': 'Regression of pay on role, tenure and gender',
}

SERVICES: list[Service] = [*svc_data.SERVICES, *svc_sales.SERVICES, *svc_marketing.SERVICES, *svc_accounting.SERVICES, *svc_people.SERVICES, *svc_market.SERVICES]
BY_ID = {s.id: s for s in SERVICES}

missing_text = set(_TEXT) - set(BY_ID)
assert not missing_text, f'Services in the catalogue without an engine: {missing_text}'


def describe(s: Service) -> dict:
    t = _TEXT[s.id]
    return {
        'id': s.id,
        'dept': s.dept,
        'name': t['name'],
        'get': t['get'].replace('EGP ', ''),
        'method': METHODS.get(s.id, t['method']),
        'data': s.data_text or t['data'],
        'missing': s.missing_text or t['missing'],
        'preview': s.preview,
        'params': [asdict(p) for p in s.params],
        'needs': {'high': s.high, 'medium': s.medium, 'low': s.low, 'public': s.public},
    }


def catalog() -> list[dict]:
    return [describe(s) for s in SERVICES]


def _staff_ok(d: Data) -> bool:
    s = svc_people._staff(d)
    s = s[~s['left'] & s['salary'].notna() & (s['salary'] > 0) & s['gender'].isin(['F', 'M'])]
    return s['gender'].nunique() == 2 and len(s) >= 20


def _trend_points(d: Data) -> bool:
    t = d.t('trends').groupby('date')['interest'].mean()
    weekly = t.index.to_series().diff().dt.days.median() < 20
    return len(t) >= (104 if weekly else 24)


def _budget_weeks(d: Data) -> bool:
    a = d.t('ads')
    weeks = set(a.loc[a['spend'] > 0, 'date'].dt.to_period('W-SUN').dt.start_time)
    if a['new_customers'].notna().any():
        return len(weeks) >= 26
    if 'total_sales' in a and a['total_sales'].notna().any():
        return len(weeks & set(a.dropna(subset=['total_sales'])['date'].dt.to_period('W-SUN').dt.start_time)) >= 26
    if d.has('sales') or d.has('einv'):
        return len(weeks & set(d.sales['date'].dt.to_period('W-SUN').dt.start_time)) >= 26
    raise NeedsData('Needs new customers per channel, or a sales file to measure against.')


def _competitor_prices(d: Data) -> bool:
    t = d.t('competitors')
    if 'our_price' in t and t['our_price'].notna().any():
        return True
    return len(d.products) > 0 and t['product'].astype(str).str.strip().str.lower().isin(set(d.products['key'])).any()


# Cheap checks of the minimum each service needs, so the list says "Needs data" before anyone presses Run.
# They mirror the NeedsData checks inside each service, which stay as the last word.
PRECHECK = {
    'business-snapshot': (lambda d: len(d.monthly) >= 2, 'Less than two full months of sales.'),
    'kpi-dashboard': (lambda d: len(d.monthly) >= 3, 'Fewer than three full months of sales.'),
    'trends-and-seasonality': (lambda d: len(d.monthly) >= 6, 'Fewer than six full months of sales.'),
    'sales-forecast-3-to-12-months': (lambda d: len(d.monthly) >= 12, 'A forecast needs at least 12 full months of sales.'),
    'stock-reorder-plan': (lambda d: d.sales['product'].nunique() >= 3, 'The sales data carries no products (e-invoices list totals only): send a sales list with product codes.'),
    'product-and-customer-ranking': (lambda d: d.sales['product'].nunique() >= 3 or d.sales['customer'].nunique() >= 3, 'Fewer than three products and no customer names to rank.'),
    'customer-groups': (lambda d: d.recent(365)['customer'].nunique() >= 20, 'Fewer than 20 identified customers in the last year.'),
    'customer-value-and-churn': (lambda d: d.sales['customer'].nunique() >= 20, 'Fewer than 20 identified customers.'),
    'profit-projection-with-what-ifs': (lambda d: len(svc_accounting._pnl(d)[0].tail(12)) >= 6, 'Fewer than six months of profit and loss.'),
    'pay-fairness-check': (_staff_ok, 'Needs salaries and gender for at least 20 current staff, both women and men.'),
    'error-and-fraud-scan': (lambda d: (svc_accounting._entries(d)[0]['amount'] > 0).sum() >= 50, 'Fewer than 50 entries to scan.'),
    'demand-trends': (_trend_points, 'Needs at least two years of search interest.'),
    'budget-split-across-channels': (_budget_weeks, 'Fewer than 26 weeks of ad spend that overlap with the sales.'),
    'competitor-check': (_competitor_prices, 'Add “our price” to the competitor sheet, or upload the client’s price list with the same product names.'),
    'branch-and-product-benchmarking': (lambda d: (d.sales['branch'] is not None and d.sales['branch'].nunique() > 1) or d.sales['product'].nunique() >= 3, 'No branches and no products to compare: send a sales list with products or branch details.'),
    'driver-analysis': (lambda d: d.sales['date'].dt.normalize().nunique() >= 28, 'Fewer than four weeks of trading days: too little to separate the effect of each factor.'),
    'exchange-rate-and-inflation-impact': (lambda d: (d.recent(365)['cost'] * d.recent(365)['qty']).sum() > 0, 'Sales can’t be matched to product costs: send a sales list with product codes that match the price list.'),
    'a-b-test-check': (lambda d: (d.t('abtest').groupby('variant')['visitors'].sum() > 0).sum() >= 2 and d.t('abtest')['conversions'].sum() > 0, 'The file needs two versions with visitors, and some conversions.'),
}


def readiness(s: Service, data: Data) -> dict:
    level = level_for(s, data.kinds)
    why = None
    if level != 'none' and s.id in PRECHECK:
        ok, msg = PRECHECK[s.id]
        try:
            passed = ok(data)
        except NeedsData as e:
            passed, msg = False, str(e)
        except Exception:  # noqa: BLE001 - a check must never break the list; the run will say what's wrong
            passed = True
        if not passed:
            return {'level': 'none', 'why': msg, 'missing': missing_for(s, data.kinds)}
    if level != 'none' and s.adjust:
        try:
            adj = s.adjust(data, level)
        except NeedsData as e:
            adj = ('none', str(e))
        except Exception:  # noqa: BLE001 - an adjust check must never break the list
            adj = None
        if adj:
            level, why = adj
    return {'level': level, 'why': why, 'missing': missing_for(s, data.kinds)}


def start_params(s: Service, data: Data, client: dict) -> dict:
    p = {x.key: x.value for x in s.params}
    if s.defaults:
        try:
            p.update(s.defaults(data, client))
        except Exception:  # noqa: BLE001
            pass
    return p


_ONE = {'people': 'person', 'products': 'product', 'months': 'month', 'customers': 'customer', 'accounts': 'account', 'weeks': 'week', 'days': 'day', 'employees': 'employee', 'branches': 'branch', 'files': 'file', 'rows': 'row', 'entries': 'entry', 'invoices': 'invoice', 'payments': 'payment', 'channels': 'channel', 'orders': 'order', 'suppliers': 'supplier', 'flags': 'flag', 'lines': 'line'}
_VERB = {'are': 'is', 'have': 'has', 'bring': 'brings', 'order': 'orders', 'make': 'makes', 'buy': 'buys', 'were': 'was', 'need': 'needs', 'sell': 'sells', 'appear': 'appears', 'pay': 'pays', 'look': 'looks'}
_ONE_RE = re.compile(r'(?<![\d.,])\b1 (' + '|'.join(_ONE) + r')\b((?: \w+ly| now| also| together)?) ?(' + '|'.join(_VERB) + r')?\b')


def _grammar(x):
    """'1 products have' → '1 product has', everywhere in a result."""
    if isinstance(x, str):
        return _ONE_RE.sub(lambda m: f'1 {_ONE[m.group(1)]}{m.group(2)}' + (f' {_VERB[m.group(3)]}' if m.group(3) else (' ' if m.group(0).endswith(' ') else '')), x)
    if isinstance(x, list):
        return [_grammar(v) for v in x]
    if isinstance(x, dict):
        return {k: _grammar(v) for k, v in x.items()}
    return x


def run(service_id: str, data: Data, params: dict | None, client: dict) -> dict:
    """Runs one service. Returns {'level', 'result'} or {'level', 'error'} with a plain-language reason."""
    s = BY_ID[service_id]
    r = readiness(s, data)
    if r['level'] == 'none':
        return {'level': 'none', 'error': r['why'] or 'The files this needs haven’t been sent.'}
    p = start_params(s, data, client)
    p.update({k: float(v) for k, v in (params or {}).items() if k in p})
    t0 = time.perf_counter()
    try:
        out = s.run(Ctx(data=data, level=r['level'], p=p, fmt=Fmt(client.get('currency', 'EGP')), client=client))
    except NeedsData as e:
        return {'level': r['level'], 'error': str(e), 'params': p}
    except Exception as e:  # noqa: BLE001
        return {'level': r['level'], 'error': f'The model failed on this data: {e}', 'trace': traceback.format_exc(limit=4), 'params': p}
    out['currency'] = client.get('currency', 'EGP')
    level = out.pop('level', None) or r['level']
    return {'level': level, 'why': r['why'], 'params': p, 'result': _grammar(clean_json(out)), 'ms': int((time.perf_counter() - t0) * 1000)}


def build_data(tables: dict[str, list[pd.DataFrame]], settings: dict | None = None) -> Data:
    """One table per kind, joining several files of the same kind."""
    joined = {k: pd.concat(v, ignore_index=True) for k, v in tables.items() if v}
    return Data(joined, settings or {})
