"""Built-in checks: tests every result must pass before it reaches a client.

Each check returns {'id', 'title', 'status', 'detail'} with status 'pass', 'warn' or 'fail'.
- fail: something is wrong with the numbers. The report can't be sent for review until it is fixed, or until the
  analyst writes down why it is fine (the reviewer sees that reason).
- warn: something the analyst should look at and may want to mention to the client.
- pass: checked and fine; the detail says what was checked, so the reviewer can see it.

The checks never change a result. They sit beside it.
"""

from __future__ import annotations

import math
import re
from collections.abc import Iterable

import numpy as np
import pandas as pd

from .core import Data, Fmt, Service, complete_months, month_label

PASS, WARN, FAIL = 'pass', 'warn', 'fail'
SALES_KINDS = {'sales', 'einv'}


def check(id_: str, title: str, status: str, detail: str) -> dict:
    # A true minus sign before numbers, as in the rest of the report.
    return {'id': id_, 'title': title, 'status': status, 'detail': re.sub(r'(?<![\w-])-(?=\d)', '−', detail)}


# ---------- Reading values back out of a result ----------

_MONEY = re.compile(r'(−|-)?\b(?:[A-Z]{3})\s*(\d[\d,]*(?:\.\d+)?)\s*([KMB])?\b')
_PCT = re.compile(r'(−|-|\+)?(\d[\d,]*(?:\.\d+)?)%')
_NUM = re.compile(r'(?<![\w.])(−|-|\+)?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?(?![\w%])')


def money_value(s: str) -> float | None:
    m = _MONEY.search(s or '')
    if not m:
        return None
    v = float(m.group(2).replace(',', '')) * {'K': 1e3, 'M': 1e6, 'B': 1e9}.get(m.group(3) or '', 1)
    return -v if m.group(1) else v


def pct_value(s: str) -> float | None:
    m = _PCT.search(s or '')
    if not m:
        return None
    v = float(m.group(2).replace(',', '')) / 100
    return -v if m.group(1) in ('−', '-') else v


def kpi_value(k: dict) -> float | None:
    """A KPI's value as a number, when it holds a single money amount, percentage or count."""
    v = k.get('value', '')
    if '–' in v.strip('–') or ' to ' in v or ' of ' in v:
        return None  # a range or a fraction
    return money_value(v) if _MONEY.search(v) else pct_value(v) if '%' in v else _plain(v)


def _plain(v: str) -> float | None:
    m = re.fullmatch(r'\s*(−|-|\+)?([\d,]+(?:\.\d+)?)\s*', v or '')
    if not m:
        return None
    x = float(m.group(2).replace(',', ''))
    return -x if m.group(1) in ('−', '-') else x


def strings(x) -> Iterable[str]:
    if isinstance(x, str):
        yield x
    elif isinstance(x, dict):
        for v in x.values():
            yield from strings(v)
    elif isinstance(x, list):
        for v in x:
            yield from strings(v)


def numbers(x) -> Iterable[float]:
    if isinstance(x, bool):
        return
    if isinstance(x, (int, float)):
        yield x
    elif isinstance(x, dict):
        for v in x.values():
            yield from numbers(v)
    elif isinstance(x, list):
        for v in x:
            yield from numbers(v)


# ---------- 1. Is the result whole? ----------

LEVELS = {'high', 'medium', 'low', 'none'}
BAD_TEXT = re.compile(r'(?i:\bnan\b|\binf\b)|\bNaT\b|\bNone\b(?! of)|[{}]|\de[+-]\d\d\b')


def result_problems(res: dict) -> list[str]:
    """Problems with a result's shape and text: missing parts, charts that don't line up, 'nan' in a sentence."""
    out = []
    for k in ('kpis', 'charts', 'findings'):
        if not isinstance(res.get(k), list):
            out.append(f'missing {k}')
    if not res.get('kpis') and not res.get('charts'):
        out.append('empty result')
    for kp in res.get('kpis') or []:
        if not kp.get('label') or not isinstance(kp.get('value'), str) or not kp['value'].strip():
            out.append('a key number without a label or value')
    for fd in res.get('findings') or []:
        if not fd.get('text') or fd.get('level') not in LEVELS:
            out.append('a finding without text or confidence')
    for ch in res.get('charts') or []:
        c, title = ch.get('chart', {}), ch.get('title', '')
        t = c.get('type')
        if t == 'line':
            n = len(c['x'])
            if not n:
                out.append(f'empty line chart “{title}”')
            if any(len(s['values']) != n for s in c['series']):
                out.append(f'a line in “{title}” doesn’t match its dates')
            if c.get('band') and (len(c['band']['lo']) != n or len(c['band']['hi']) != n):
                out.append(f'the range in “{title}” doesn’t match its dates')
        elif t == 'bars':
            if not c['labels']:
                out.append(f'empty bar chart “{title}”')
            if len(c['labels']) != len(c['values']):
                out.append(f'bars and labels don’t match in “{title}”')
            if any(v is None for v in c['values']):
                out.append(f'a blank bar in “{title}”')
            if c.get('tones') and len(c['tones']) != len(c['labels']):
                out.append(f'bar colours don’t match in “{title}”')
        elif t == 'table':
            if any(len(r) != len(c['columns']) for r in c['rows']):
                out.append(f'a row in “{title}” has the wrong number of cells')
        elif t == 'heatmap':
            if len(c['values']) != len(c['rows']) or any(len(r) != len(c['cols']) for r in c['values']):
                out.append(f'the grid in “{title}” has the wrong shape')
        else:
            out.append(f'unknown chart type in “{title}”')
    if any(isinstance(n, float) and not math.isfinite(n) for n in numbers(res)):
        out.append('a number that isn’t finite')
    for s in strings(res):
        m = BAD_TEXT.search(s)
        if m:
            out.append(f'“{m.group(0)}” in the text: {s[:80]}')
            break
    return out


def integrity(res: dict) -> dict:
    p = result_problems(res)
    if p:
        return check('integrity', 'Result is complete', FAIL, 'Fix before use: ' + '; '.join(sorted(set(p))[:4]) + '.')
    n = len(res['kpis']), len(res['charts']), len(res['findings'])
    return check('integrity', 'Result is complete', PASS, f'{n[0]} key numbers, {n[1]} charts and {n[2]} findings, all readable.')


# ---------- 2. Do the numbers make sense on their face? ----------

_NEVER_NEGATIVE = re.compile(r'(?i)^(sales|orders|customers|revenue|staff|employees|rows|files|days|entries|visitors|units)\b')
_SHARE = re.compile(r'(?i)\bshare\b|\bof (sales|customers|costs)\b|bought more than once|ever bought|back within')


def plausible(res: dict) -> dict:
    bad, blank = [], []
    for k in res.get('kpis') or []:
        label, v = k.get('label', ''), k.get('value', '')
        if v.strip() == '–':
            if not k.get('note'):  # a blank with a note already says why
                blank.append(label)
            continue
        x = kpi_value(k)
        if x is None:
            continue
        if x < 0 and _NEVER_NEGATIVE.search(label):
            bad.append(f'{label} is negative ({v})')
        if '%' in v and 'margin' in label.lower() and 'safety' not in label.lower() and abs(x) > 1:
            bad.append(f'{label} is beyond ±100% ({v})')
        if '%' in v and _SHARE.search(label) and not 0 <= x <= 1.0005:
            bad.append(f'{label} is outside 0–100% ({v}); ' + ('the market figures in the settings are too small for this client’s sales. Enter real, cited market figures' if 'share today' in label.lower() else 'check the settings or the file it comes from'))
    if bad:
        return check('plausible', 'Numbers are possible', FAIL, '; '.join(bad) + '.')
    if blank:
        return check('plausible', 'Numbers are possible', WARN, f'Couldn’t be worked out from these files: {", ".join(blank)}. Say so in the report or remove it.')
    return check('plausible', 'Numbers are possible', PASS, 'No negative counts or sales, margins within ±100%, shares within 0–100%.')


def confidence(level: str) -> dict:
    if level == 'low':
        return check('confidence', 'Confidence level', WARN, 'Low: built mostly on estimates or a stand-in. Present it as a direction, not a figure to plan on.')
    if level == 'medium':
        return check('confidence', 'Confidence level', PASS, 'Medium: one gap filled with a stand-in. The report says which.')
    return check('confidence', 'Confidence level', PASS, 'High: built on the client’s own data.')


# ---------- 3. Were the files good enough? ----------


def inputs(used: set[str], files: list[dict]) -> dict:
    mine = [f for f in files if (f.get('store_as') or f.get('kind')) in used]
    if not mine:
        return check('inputs', 'Files behind this result', PASS, 'Public or built-in data only.')
    weak = []
    for f in mine:
        h = f.get('health') or {}
        rin, rout = h.get('rows_in') or 0, h.get('grouped', h.get('rows_out')) or 0
        lost = 1 - rout / rin if rin else 0
        if h.get('score', 100) < 70 or lost > 0.05:
            weak.append(f'{f["name"]}: health {h.get("score", "?")}/100' + (f', {lost:.0%} of rows set aside' if lost > 0.05 else ''))
    names = ', '.join(f['name'] for f in mine)
    if weak:
        return check('inputs', 'Files behind this result', WARN, 'Look at the column check for ' + '; '.join(weak) + '.')
    return check('inputs', 'Files behind this result', PASS, f'{len(mine)} file{"s" if len(mine) > 1 else ""}, all healthy: {names}.')


# ---------- 4. Do the sales add up? ----------


def sales_reconcile(d: Data, fmt: Fmt) -> list[dict]:
    out = []
    s_all, s = d.sales_all, d.sales
    kept = s_all.loc[~s_all['is_return'] & (s_all['amount'] > 0), 'amount'].sum()
    returns = -s_all.loc[s_all['is_return'], 'amount'].sum()
    cancelled = d.cancelled['value']
    used = s['amount'].sum()
    gap = kept - cancelled - used
    status = PASS if abs(gap) <= max(0.005 * kept, 1) else FAIL
    out.append(check(
        'reconcile', 'Sales add up', status,
        f'{fmt.money(kept, True)} of sales lines − {fmt.money(cancelled, True)} cancelled soon after = {fmt.money(used, True)} analysed'
        + (f' (gap {fmt.money(gap, True)})' if status == FAIL else '')
        + (f'. Returns of {fmt.money(abs(returns), True)} are shown separately.' if returns else '.'),
    ))

    # Months with no sales in the middle of the data usually mean a missing file or export.
    m = complete_months(s['date'], s['amount'])
    holes = [month_label(p) for p, v in m.items() if v <= 0]
    low = [month_label(p) for p, v in m.items() if 0 < v < 0.15 * m.median()] if len(m) >= 4 else []
    if holes or low:
        bits = ([f'no sales in {", ".join(holes[:6])}'] if holes else []) + ([f'very low sales in {", ".join(low[:6])}'] if low else [])
        out.append(check('coverage', 'Every month is there', WARN, f'{"; ".join(bits)[:1].upper()}{"; ".join(bits)[1:]}. Ask the client whether a file is missing for those months.'))
    else:
        out.append(check('coverage', 'Every month is there', PASS, f'{len(m)} full month{"s" if len(m) != 1 else ""} from {month_label(m.index[0])} to {month_label(m.index[-1])}, none missing.' if len(m) else 'Less than a full month of sales.'))

    # Dates after today mean the day and month were probably read the wrong way round.
    future = int((s['date'] > pd.Timestamp.now() + pd.Timedelta(days=2)).sum())
    if future:
        out.append(check('dates', 'Dates are believable', FAIL, f'{future:,} sales lines are dated in the future. Check the day/month order on the column check.'))
    else:
        out.append(check('dates', 'Dates are believable', PASS, f'From {s["date"].min():%d %b %Y} to {s["date"].max():%d %b %Y}, none in the future.'))

    # One line that is a big part of all sales is often a typo (an extra zero, a code typed into the price).
    if len(s) >= 50:
        total, top = s['amount'].sum(), s['amount'].max()
        share = top / max(total, 1e-9)
        if share > 0.02 and top > 50 * s['amount'].median():
            row = s.loc[s['amount'].idxmax()]
            out.append(check('outliers', 'No single line dominates', WARN, f'One line on {row["date"]:%d %b %Y} ({fmt.money(top, True)}, {str(row["product"])[:40]}) is {share:.0%} of all sales in the files, {top / s["amount"].median():,.0f} times a typical line. Confirm it isn’t a typo.'))
        else:
            out.append(check('outliers', 'No single line dominates', PASS, f'The largest line is {"under 0.1%" if share < 0.001 else f"{share:.1%}"} of all sales; nothing looks like a typed-in extra zero.'))

    # Price × quantity should match the line total, apart from discounts.
    if d.has('sales') and {'price', 'qty', 'amount'} <= set(s.columns) and s['price'].notna().mean() > 0.9 and s['qty'].notna().mean() > 0.9:
        calc = s['price'] * s['qty']
        off = ((calc - s['amount']).abs() > 0.05 * s['amount'].abs() + 0.01).mean()
        if off > 0.2:
            out.append(check('lines', 'Price × quantity = total', WARN, f'On {off:.0%} of lines price × quantity is more than 5% away from the line total. Could be discounts, or a wrong column match.'))
        else:
            out.append(check('lines', 'Price × quantity = total', PASS, f'Matches on {1 - off:.0%} of lines (the rest look like discounts).'))
    return out


def cross_source(d: Data, fmt: Fmt) -> list[dict]:
    """The same months in two different files should tell the same story."""
    out = []
    if not d.has('sales'):
        return out
    s = d.sales
    ours = complete_months(s['date'], s['amount'])
    others = []
    if d.has('einv'):
        e = d.t('einv')
        e = e[e['amount'] > 0]
        others.append(('e-invoices', complete_months(e['date'], e['amount'])))
    if d.has('pnl'):
        p = d.t('pnl')
        if 'revenue' in p and p['revenue'].notna().any():
            others.append(('profit & loss revenue', p.groupby(p['month'].dt.to_period('M'))['revenue'].sum()))
    for name, theirs in others:
        both = ours.index.intersection(theirs.index)
        both = [m for m in both if ours[m] > 0 and theirs[m] > 0]
        if len(both) < 2:
            continue
        ratio = pd.Series({m: theirs[m] / ours[m] for m in both})
        r = float(ratio.median())
        if 1.12 <= r <= 1.16 and (ratio.between(1.1, 1.18)).mean() > 0.8:
            out.append(check(f'match-{name[:4]}', f'Sales match the {name}', PASS, f'The {name} run about 14% above the sales list in every month: they look VAT-inclusive, which explains the gap.'))
            continue
        apart = [f'{month_label(m)} ({ratio[m] - 1:+.0%})' for m in both if abs(ratio[m] - 1) > 0.1]
        if abs(r - 1) > 0.1 or len(apart) > len(both) / 3:
            out.append(check(f'match-{name[:4]}', f'Sales match the {name}', WARN, f'Over {len(both)} shared months the {name} are {r - 1:+.0%} from the sales list' + (f'; furthest apart: {", ".join(apart[:4])}' if apart else '') + '. Ask the client why: one file may be incomplete, cover only some customers or branches, or include VAT or returns.'))
        else:
            out.append(check(f'match-{name[:4]}', f'Sales match the {name}', PASS, f'Within 10% in {len(both) - len(apart)} of {len(both)} shared months (typical gap {abs(r - 1):.1%}).'))
    return out


# ---------- 5. Service-specific tests ----------


def forecast_baseline(d: Data, res: dict) -> list[dict]:
    """A forecast is only worth having if it beats the simplest guess on months it didn't see."""
    out = []
    y = d.monthly
    n = len(y)
    err_k = next((k for k in res['kpis'] if 'Error on hidden' in k['label']), None)
    err = pct_value(err_k['value']) if err_k else None
    if err is None or n < 12:
        return out
    test = 6 if n >= 24 else 3
    actual = y.iloc[-test:].values
    guesses = {}
    if n >= 12 + test:
        guesses['the same months last year'] = y.iloc[-test - 12 : -12].values
    guesses['the average of the previous year'] = np.full(test, y.iloc[-test - 12 : -test].mean() if n >= 12 + test else y.iloc[:-test].mean())
    errs = {k: float(np.mean(np.abs((actual - g) / actual))) for k, g in guesses.items() if (actual != 0).all()}
    if errs:
        name = min(errs, key=errs.get)
        simple = errs[name]
        if err >= simple:
            out.append(check('baseline', 'Beats a simple guess', WARN, f'On the {test} hidden months the model was off by {err:.1%}; just using {name} was off by {simple:.1%}. Say so in the report, or use the simple figure.'))
        else:
            out.append(check('baseline', 'Beats a simple guess', PASS, f'Off by {err:.1%} on the {test} hidden months, against {simple:.1%} for using {name}.'))
    note = next((k.get('note', '') for k in res['kpis'] if k['label'].startswith('Next ')), '')
    change = pct_value(note) if 'last year' in note else None
    if change is not None and not -0.4 <= change <= 0.6:
        out.append(check('jump', 'No sudden jump', WARN, f'The forecast is {change:+.0%} on the same months last year. Check that a one-off month isn’t driving it before presenting it.'))
    return out


def cash_opening(d: Data, params: dict, fmt: Fmt) -> list[dict]:
    if not d.has('bank') or 'balance' not in d.t('bank') or d.t('bank')['balance'].isna().all():
        return [check('opening', 'Opening cash matches the bank', WARN, 'The bank file has no balance column, so the opening balance was typed in. Confirm it with the client.')]
    b = d.t('bank').dropna(subset=['balance']).sort_values('date')
    last = float(b['balance'].iloc[-1])
    op = float(params.get('opening', 0))
    if abs(op - last) > max(1, 0.01 * abs(last)):
        return [check('opening', 'Opening cash matches the bank', WARN, f'Opening balance {fmt.money(op, True)} differs from the bank’s last balance {fmt.money(last, True)} on {b["date"].iloc[-1]:%d %b %Y}. Fine if it was updated on purpose.')]
    return [check('opening', 'Opening cash matches the bank', PASS, f'Starts from the bank’s last balance, {fmt.money(last, True)} on {b["date"].iloc[-1]:%d %b %Y}.')]


def snapshot_recount(d: Data, res: dict, fmt: Fmt) -> list[dict]:
    """Counts the headline figures again, straight from the cleaned sales lines."""
    r = d.recent(365)
    by_order = r.groupby(r['order_id'].astype(str))['amount'].sum()
    total, true_orders = float(by_order.sum()), len(by_order)
    got = {k['label']: k['value'] for k in res['kpis']}
    bad = []
    shown = got.get('Sales, last 12 months', '')
    figs = _figures(shown)
    sales = figs[0][1] if figs else None
    rounding = figs[0][2] if figs else 0  # "29K" can be anything from 28.5K to 29.5K
    if sales is not None and abs(sales - total) > rounding + 0.001 * max(total, 1):
        bad.append(f'sales {got["Sales, last 12 months"]} vs {fmt.money(total, True)} recounted')
    orders = _plain(got.get('Orders', ''))
    if orders is not None and abs(orders - true_orders) > 0.001 * true_orders + 0.5:
        bad.append(f'orders {orders:,.0f} vs {true_orders:,} recounted')
    if bad:
        return [check('recount', 'Headline figures recounted', FAIL, '; '.join(bad) + '.')]
    return [check('recount', 'Headline figures recounted', PASS, f'Sales and orders added up again order by order, from the {len(r):,} cleaned lines of the last 12 months: they match.')]


# ---------- Running them ----------


def kinds_used(s: Service, kinds: set[str]) -> set[str]:
    ways = [w for w in s.high + s.medium + s.low if all(k in kinds for k in w)]
    return set(ways[0]) if ways else set()


def run_checks(s: Service, data: Data, res: dict, level: str, params: dict, info: dict) -> list[dict]:
    fmt = Fmt(info.get('currency', 'EGP'))
    used = kinds_used(s, data.kinds)
    out = [integrity(res)]
    if out[0]['status'] == FAIL:
        return out
    out += [plausible(res), confidence(level), inputs(used, info.get('files', []))]
    tests = []
    if used & SALES_KINDS and s.id not in ('data-health-check', 'data-cleaning-and-merging'):
        tests.append(lambda: sales_reconcile(data, fmt))
        tests.append(lambda: cross_source(data, fmt))
    if s.id == 'sales-forecast-3-to-12-months':
        tests.append(lambda: forecast_baseline(data, res))
    if s.id == '13-week-cash-forecast':
        tests.append(lambda: cash_opening(data, params, fmt))
    if s.id == 'business-snapshot':
        tests.append(lambda: snapshot_recount(data, res, fmt))
    for t in tests:
        try:
            out += t()
        except Exception as e:  # noqa: BLE001 - a check that can't run is itself worth knowing
            out.append(check('check-error', 'A check couldn’t run', WARN, f'{type(e).__name__}: {str(e)[:120]}'))
    return out


# ---------- Comparing with the previous run ----------


def stability(prev: dict | None, new: dict) -> dict:
    """prev and new: {'result', 'params', 'files'}. The same files and settings must give the same numbers."""
    if not prev:
        return check('stability', 'Same answer as last time', PASS, 'First run of this service for this client.')
    a = {k['label']: k for k in prev['result'].get('kpis', [])}
    b = {k['label']: k for k in new['result'].get('kpis', [])}
    same_inputs = sorted(prev['files']) == sorted(new['files']) and prev['params'] == new['params']
    if same_inputs:
        diff = [f'{lb}: {a[lb]["value"]} → {b[lb]["value"]}' for lb in a.keys() & b.keys() if a[lb]['value'] != b[lb]['value']]
        if diff:
            return check('stability', 'Same answer as last time', FAIL, 'Same files and settings gave different numbers: ' + '; '.join(diff[:3]) + '. Report this to whoever maintains the app.')
        return check('stability', 'Same answer as last time', PASS, 'Re-run on the same files and settings: identical numbers.')
    moved = []
    for lb in a.keys() & b.keys():
        x, y = kpi_value(a[lb]), kpi_value(b[lb])
        if x is None or y is None or '%' in a[lb]['value']:
            continue
        if abs(x) > 0 and abs(y / x - 1) > 0.25:
            moved.append(f'{lb} {a[lb]["value"]} → {b[lb]["value"]}')
    why = 'files' if sorted(prev['files']) != sorted(new['files']) else 'settings'
    if moved:
        return check('stability', 'Same answer as last time', WARN, f'The {why} changed since the last run and these moved more than 25%: ' + '; '.join(moved[:3]) + '. Make sure the change explains it.')
    return check('stability', 'Same answer as last time', PASS, f'The {why} changed since the last run; no key number moved more than 25%.')


# ---------- Numbers typed into the report ----------

_IGNORE_NUMS = re.compile(r'^(19|20)\d\d$')


def _figures(text: str) -> list[tuple[str, float, float]]:
    """Numbers in a piece of writing: (as written, value, how precise it was written)."""
    out = []
    for m in _MONEY.finditer(text):
        v = money_value(m.group(0))
        if v is None:
            continue
        dec = len(m.group(2).split('.')[1]) if '.' in m.group(2) else 0
        unit = {'K': 1e3, 'M': 1e6, 'B': 1e9}.get(m.group(3) or '', 1)
        out.append((m.group(0).strip(), v, 0.5 * 10**-dec * unit))
    rest = _MONEY.sub(' ', text)
    for m in _PCT.finditer(rest):
        if pct_value(m.group(0)) is None:
            continue
        dec = len(m.group(2).split('.')[1]) if '.' in m.group(2) else 0
        out.append((m.group(0), pct_value(m.group(0)), 0.5 * 10**-dec / 100))
    rest = _PCT.sub(' ', rest)
    for m in _NUM.finditer(rest):
        whole = m.group(2).replace(',', '')
        if _IGNORE_NUMS.match(whole) or (not m.group(3) and int(whole) <= 12):
            continue  # years, and small counts like "three months" written as digits
        v = float(whole + ('.' + m.group(3) if m.group(3) else ''))
        out.append((m.group(0).strip(), -v if m.group(1) in ('−', '-') else v, 0.5 * 10 ** -len(m.group(3) or '')))
    return out


def known_values(results: list[dict]) -> list[float]:
    vals: list[float] = []
    for res in results:
        for s in strings(res):
            vals += [v for _, v, _ in _figures(s) if v is not None]
        vals += [float(n) for n in numbers(res) if n is not None]
    return vals


def unbacked_numbers(text: str, results: list[dict]) -> list[str]:
    """Figures in the analyst's writing that don't appear anywhere in the results, allowing for rounding."""
    known = np.array(known_values(results) or [math.nan])
    pct_known = np.concatenate([known, known / 100, known * 100])
    out = []
    for raw, v, tol in _figures(text):
        pool = pct_known if '%' in raw else known
        if not np.any(np.abs(pool - v) <= tol * 1.0001 + 1e-9) and not np.any(np.abs(np.abs(pool) - abs(v)) <= tol * 1.0001 + 1e-9):
            out.append(raw)
    return list(dict.fromkeys(out))
