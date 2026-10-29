"""The analysis engine: 32 services, each a function from the client's standard tables to a result."""

from __future__ import annotations

import json
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


def readiness(s: Service, data: Data) -> dict:
    level = level_for(s, data.kinds)
    why = None
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
    return {'level': level, 'why': r['why'], 'params': p, 'result': clean_json(out), 'ms': int((time.perf_counter() - t0) * 1000)}


def build_data(tables: dict[str, list[pd.DataFrame]], settings: dict | None = None) -> Data:
    """One table per kind, joining several files of the same kind."""
    joined = {k: pd.concat(v, ignore_index=True) for k, v in tables.items() if v}
    return Data(joined, settings or {})
