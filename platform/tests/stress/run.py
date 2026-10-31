"""Stress test: many made-up clients through intake and every service, with checks on each result.

    python -m tests.stress.run --clients 200 --workers 4

Writes one JSON line per check to tests/stress/out/results.jsonl and prints a summary of every failure type.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
import time
import traceback
from collections import Counter, defaultdict
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

OUT = Path(__file__).parent / 'out'
LEVELS = {'high', 'medium', 'low'}
BAD_TEXT = re.compile(r'(?i:\bnan\b|\binf\b)|\bNaT\b|\bNone\b(?! of)|[{}]|\de[+-]\d\d\b|(?<![\d.,])\b1 (?:people|months|customers|products|days|weeks|accounts|files|rows|employees|branches)\b')


def money_value(s: str) -> float | None:
    m = re.search(r'(−|-)?[A-Z]{3}\s*([\d,.]+)\s*([KMB])?', s)
    if not m:
        return None
    v = float(m.group(2).replace(',', ''))
    v *= {'K': 1e3, 'M': 1e6, 'B': 1e9}.get(m.group(3) or '', 1)
    return -v if m.group(1) else v


def pct_value(s: str) -> float | None:
    m = re.search(r'(−|-|\+)?([\d.]+)%', s)
    if not m:
        return None
    v = float(m.group(2)) / 100
    return -v if m.group(1) in ('−', '-') else v


def strings(x):
    if isinstance(x, str):
        yield x
    elif isinstance(x, dict):
        for v in x.values():
            yield from strings(v)
    elif isinstance(x, list):
        for v in x:
            yield from strings(v)


def numbers(x):
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


def check_result(res: dict) -> list[str]:
    """Problems with one result's shape and text."""
    out = []
    for k in ('kpis', 'charts', 'findings'):
        if not isinstance(res.get(k), list):
            out.append(f'missing {k}')
    if not res.get('kpis') and not res.get('charts'):
        out.append('empty result')
    for kp in res.get('kpis', []):
        if not kp.get('label') or not isinstance(kp.get('value'), str) or not kp['value'].strip():
            out.append('kpi without label or value')
    for fd in res.get('findings', []):
        if not fd.get('text') or fd.get('level') not in LEVELS | {'none'}:
            out.append('finding without text or valid level')
    for ch in res.get('charts', []):
        c = ch.get('chart', {})
        t = c.get('type')
        if t == 'line':
            n = len(c['x'])
            for s in c['series']:
                if len(s['values']) != n:
                    out.append(f'line series length {len(s["values"])} ≠ x {n}: {ch["title"]}')
            if c.get('band') and (len(c['band']['lo']) != n or len(c['band']['hi']) != n):
                out.append(f'band length ≠ x: {ch["title"]}')
            if not n:
                out.append(f'empty line chart: {ch["title"]}')
        elif t == 'bars':
            if len(c['labels']) != len(c['values']):
                out.append(f'bars labels ≠ values: {ch["title"]}')
            if not c['labels']:
                out.append(f'empty bar chart: {ch["title"]}')
            if any(v is None for v in c['values']):
                out.append(f'blank bar value: {ch["title"]}')
            if c.get('tones') and len(c['tones']) != len(c['labels']):
                out.append(f'bars tones ≠ labels: {ch["title"]}')
        elif t == 'table':
            w = len(c['columns'])
            if any(len(r) != w for r in c['rows']):
                out.append(f'table row width ≠ columns: {ch["title"]}')
        elif t == 'heatmap':
            if len(c['values']) != len(c['rows']) or any(len(r) != len(c['cols']) for r in c['values']):
                out.append(f'heatmap shape: {ch["title"]}')
        else:
            out.append(f'unknown chart type {t}')
    for n in numbers(res):
        if isinstance(n, float) and not math.isfinite(n):
            out.append('non-finite number')
            break
    for s in strings(res):
        m = BAD_TEXT.search(s)
        if m:
            out.append(f'bad text “{m.group(0)}” in: {s[:90]}')
    return out


def kpi(res, label_part):
    for k in res.get('kpis', []):
        if label_part.lower() in k['label'].lower():
            return k['value']
    return None


def run_client(seed: int, scale: float) -> list[dict]:
    import warnings

    warnings.filterwarnings('ignore')
    import pandas as pd

    from clearline import engine, intake
    from clearline.engine import checks
    from clearline.engine.calendar import market_settings
    from tests.stress.gen import make_client

    recs: list[dict] = []

    def rec(stage, status, msg='', service=None, **kw):
        recs.append({'seed': seed, 'stage': stage, 'service': service, 'status': status, 'msg': msg, **kw})

    t0 = time.time()
    try:
        c = make_client(seed, scale)
    except Exception as e:  # noqa: BLE001
        rec('generate', 'error', f'{type(e).__name__}: {e}', trace=traceback.format_exc(limit=6))
        return recs
    p = c.profile
    tables: dict[str, list] = {}
    mapped_ok: dict[str, bool] = {}
    for f in c.files:
        try:
            head = intake.read_raw(f.name, f.data, nrows=400)
        except Exception as e:  # noqa: BLE001
            rec('read', 'error', f'{f.kind} {f.style["fmt"]}: {type(e).__name__}: {e}', trace=traceback.format_exc(limit=6))
            continue
        kind, mapping, conf = intake.suggest_kind(f.name, head)
        if kind != f.kind and not (f.kind == 'adswide' and kind == 'ads'):
            rec('kind', 'fail', f'{f.kind} guessed as {kind}', file=f.name, style=f.style)
            kind = f.kind
            mapping = intake.suggest_mapping(kind, head)
        else:
            rec('kind', 'ok')
        k = intake.KINDS[kind]
        wrong = []
        for fld in k.fields:
            want = f.headers.get(fld.key)
            if want is None:
                continue
            got = mapping.get(fld.key)
            if got != want and not (got and got.startswith(want)):
                wrong.append(f'{fld.key}{"*" if fld.required else ""}: {got!r} (want {want!r})')
        if wrong:
            req_wrong = [w for w in wrong if '*' in w.split(':')[0]]
            rec('mapping', 'fail' if req_wrong else 'warn', f'{kind}: ' + '; '.join(wrong), file=f.name)
            # The analyst corrects it on the column check screen.
            mapping = {fld: h for fld, h in f.headers.items() if fld in {x.key for x in k.fields}}
            mapped_ok[kind] = False
        else:
            rec('mapping', 'ok')
            mapped_ok.setdefault(kind, True)
        probs = intake.mapping_problems(kind, mapping)
        if probs:
            rec('mapping', 'fail', f'{kind}: ' + ' '.join(probs), file=f.name)
            continue
        try:
            raw = intake.read_raw(f.name, f.data)
            std, health = intake.standardize(kind, raw, mapping, {})
        except Exception as e:  # noqa: BLE001
            rec('clean', 'error', f'{kind} {f.style["fmt"]} {f.style["date"]}/{f.style["num"]}: {type(e).__name__}: {e}', trace=traceback.format_exc(limit=6))
            continue
        unread = [i for i in health['issues'] if 'couldn’t be read' in i]
        if std.empty:
            rec('clean', 'fail', f'{kind}: no rows left after cleaning', file=f.name)
            continue
        if unread:
            rec('clean', 'fail', f'{kind} {f.style["fmt"]} date={f.style["date"]} num={f.style["num"]} digits={f.style["arabic_digits"]}: ' + '; '.join(unread)[:200], file=f.name)
        else:
            rec('clean', 'ok')
        expected = len(c.tables[f.kind])
        if kind not in ('abtest', 'adswide') and health['rows_out'] < expected * 0.97 and kind != 'sales':
            rec('clean', 'fail', f'{kind}: {health["rows_out"]} rows kept of {expected}', file=f.name)
        tables.setdefault(k.store_as or kind, []).append(std)
    if not tables:
        rec('client', 'ok', 'no files')
    data = engine.build_data(tables, market_settings(p['currency']))
    info = {'currency': p['currency'], 'sector': 'retail', 'files': [{'name': f.name, 'kind': f.kind, 'store_as': intake.KINDS[f.kind].store_as, 'kind_label': f.kind, 'rows': 1, 'health': {'score': 90, 'issues': [], 'rows_in': 1, 'rows_out': 1}} for f in c.files]}
    rng = np.random.default_rng(seed + 1)
    for s in engine.SERVICES:
        try:
            r = engine.readiness(s, data)
        except Exception as e:  # noqa: BLE001
            rec('readiness', 'error', f'{type(e).__name__}: {e}', service=s.id, trace=traceback.format_exc(limit=6))
            continue
        if r['level'] == 'none':
            continue
        variants = [None]
        if s.params:
            for _ in range(2):
                variants.append({x.key: float(rng.uniform(x.min, x.max)) for x in s.params})
            variants.append({x.key: x.min for x in s.params})
            variants.append({x.key: x.max for x in s.params})
        for vi, params in enumerate(variants):
            t1 = time.time()
            try:
                out = engine.run(s.id, data, params, info)
            except Exception as e:  # noqa: BLE001
                rec('run', 'error', f'{type(e).__name__}: {e}', service=s.id, trace=traceback.format_exc(limit=8))
                continue
            dt = time.time() - t1
            if 'error' in out:
                if 'trace' in out:
                    rec('run', 'error', out['error'][:200], service=s.id, trace=out['trace'], params=params, level=r['level'])
                else:
                    rec('run', 'needs', out['error'][:160], service=s.id, level=r['level'])
                continue
            try:
                json.dumps(out['result'], allow_nan=False)
            except ValueError as e:
                rec('run', 'fail', f'not JSON-safe: {e}', service=s.id)
            probs = check_result(out['result'])
            if out['level'] not in LEVELS:
                probs.append(f'level {out["level"]}')
            if dt > 20:
                rec('speed', 'warn', f'{dt:.0f}s', service=s.id)
            if probs:
                for pr in sorted(set(probs)):
                    rec('result', 'fail', pr, service=s.id, params=params)
            else:
                rec('result', 'ok', service=s.id)
            if vi == 0:
                truth_checks(c, s.id, out, mapped_ok, rec, data)
                built_in_checks(c, s.id, out, rec, data)
                if seed % 3 == 0:
                    again = engine.run(s.id, data, params, info)
                    if 'result' in again:
                        st = checks.stability({'result': out['result'], 'params': out['params'], 'files': []}, {'result': again['result'], 'params': again['params'], 'files': []})
                        rec('repeat', 'ok' if st['status'] == 'pass' else 'fail', '' if st['status'] == 'pass' else st['detail'][:200], service=s.id)
    rec('client', 'done', f'{time.time() - t0:.1f}s', profile={k: v for k, v in p.items() if k in ('biz', 'months', 'currency', 'products', 'customers', 'staff')})
    return recs


def built_in_checks(c, sid, out, rec, data):
    """The app's own checks: planted mistakes must be caught, and nothing else may fail."""
    got = {k['id']: k for k in out['result'].get('checks', [])}
    edge = c.truth.get('edge')
    for k in got.values():
        planted = (edge == 'future' and k['id'] == 'dates')
        if k['status'] == 'fail' and not planted:
            rec('check', 'fail', f'{k["id"]}: {k["detail"][:160]}', service=sid)
        elif k['status'] == 'warn':
            rec('check', 'warn', f'{k["id"]}: {re.sub(r"[“”].*?[“”]", "…", k["detail"])[:90]}', service=sid)
    if 'reconcile' not in got:
        return
    if edge == 'missing_month':
        k = got.get('coverage', {})
        rec('caught', 'ok' if k.get('status') == 'warn' and c.truth['month'] in k.get('detail', '') else 'fail', f'missing month {c.truth["month"]} not caught: {k.get("detail", "")[:100]}', service=sid)
    if edge == 'typo':
        k = got.get('outliers', {})
        rec('caught', 'ok' if k.get('status') == 'warn' else 'fail', f'extra-zeros line not caught: {k.get("detail", "")[:100]}', service=sid)
    if edge == 'future' and (data.sales['date'] > pd.Timestamp.now() + pd.Timedelta(days=2)).any():
        k = got.get('dates', {})
        rec('caught', 'ok' if k.get('status') == 'fail' else 'fail', f'future dates not caught: {k.get("detail", "")[:100]}', service=sid)


def truth_checks(c, sid, out, mapped_ok, rec, data):
    """Does the result match what was planted in the data?"""
    res, t = out['result'], c.truth

    def check(name, ok, msg):
        rec('truth', 'ok' if ok else 'fail', '' if ok else f'{name}: {msg}', service=sid)

    st = t.get('sales')
    if sid == 'business-snapshot' and st and mapped_ok.get('sales'):
        v = money_value(kpi(res, 'Sales, last 12') or '')
        if v is not None and st['sales_12m'] > 0:
            err = abs(v / st['sales_12m'] - 1)
            check('sales total', err < 0.02, f'reported {v:,.0f} vs true {st["sales_12m"]:,.0f} ({err:.1%})')
        o = kpi(res, 'Orders')
        if o:
            n = float(o.replace(',', ''))
            check('orders', abs(n / max(st['orders_12m'], 1) - 1) < 0.01, f'reported {n:,.0f} vs true {st["orders_12m"]:,}')
        cu = kpi(res, 'Customers')
        if cu and cu != '–' and st['customers_12m']:
            n = float(cu.replace(',', ''))
            check('customers', abs(n / st['customers_12m'] - 1) < 0.01, f'reported {n:,.0f} vs true {st["customers_12m"]:,}')
    if sid == 'business-snapshot' and st and st['top_product'] and data.has('sales'):
        led = next((f['text'] for f in res['findings'] if 'led by' in f['text']), '')
        if led:
            s = data.goods(data.recent(365))
            g = s.groupby('product')['amount'].sum().sort_values(ascending=False)
            clear = len(g) < 2 or g.iloc[0] > g.iloc[1] * 1.05
            code_of = dict(zip(c.tables['sales']['product_name'], c.tables['sales']['product']))
            if clear:
                check('top product', st['top_product'] in led or code_of.get(st['top_product'], '§') in led, f'{led[:80]} (true: {st["top_product"]})')
    pt = t.get('people')
    if sid == 'payroll-error-scan' and pt and pt['ghosts'] and data.has('staff'):
        text = ' '.join(strings(res))
        for g in pt['ghosts']:
            check('ghost employee', g in text, f'{g} not flagged')
    if sid == 'pay-fairness-check' and pt and pt['staff'] >= 80 and data.has('staff') and 'gender' in data.t('staff'):
        k = next((x for x in res['kpis'] if 'Same role' in x['label']), None)
        m = re.search(r'95% range (\S+%) to (\S+%)', (k or {}).get('note', ''))
        if m:
            lo, hi = pct_value(m.group(1)), pct_value(m.group(2))
            truth = -pt['pay_gap']
            check('pay gap', lo - 0.01 <= truth <= hi + 0.01, f'planted {truth:+.0%} outside the reported range {m.group(1)} to {m.group(2)}')
    at = t.get('accounts')
    if sid == 'error-and-fraud-scan' and at and at['dup_ledger'] and data.has('ledger'):
        cells = {str(x) for x in strings(res)}
        for party, amt in at['dup_ledger']:
            check('duplicate payment', party in cells or any(party in x and 'twice' in x.lower() for x in cells), f'{party} {amt:,.2f} not flagged')
    if sid == '13-week-cash-forecast' and at and data.has('bank'):
        op = out['params'].get('opening')
        check('opening balance', op is not None and abs(op - at['closing_balance']) < 1, f'opening {op} vs bank closing {at["closing_balance"]:,.2f}')
    sm = t.get('small', {})
    if sid == 'employee-survey' and 'enps' in sm:
        m = re.search(r'([−+-]?\d+)', kpi(res, 'eNPS') or '')
        if m:
            check('eNPS', abs(int(m.group(1).replace('−', '-')) - sm['enps']) <= 1, f'reported {m.group(1)} vs true {sm["enps"]}')
    if sid == 'a-b-test-check' and 'ab_obs' in sm:
        v = pct_value(kpi(res, 'Lift') or kpi(res, 'lift') or kpi(res, 'difference') or '')
        if v is not None and abs(sm['ab_obs']) > 0.02:
            check('A/B direction', np.sign(v) == np.sign(sm['ab_obs']), f'reported {v:+.1%} vs observed {sm["ab_obs"]:+.1%}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--clients', type=int, default=50)
    ap.add_argument('--start', type=int, default=1)
    ap.add_argument('--workers', type=int, default=4)
    ap.add_argument('--scale', type=float, default=1.0)
    ap.add_argument('--seeds', type=str, default='')
    a = ap.parse_args()
    OUT.mkdir(exist_ok=True)
    seeds = [int(x) for x in a.seeds.split(',')] if a.seeds else list(range(a.start, a.start + a.clients))
    t0 = time.time()
    all_recs = []
    with ProcessPoolExecutor(a.workers) as ex, open(OUT / 'results.jsonl', 'w') as fh:
        futs = {ex.submit(run_client, s, a.scale): s for s in seeds}
        for i, fu in enumerate(as_completed(futs), 1):
            try:
                recs = fu.result()
            except Exception as e:  # noqa: BLE001
                recs = [{'seed': futs[fu], 'stage': 'worker', 'status': 'error', 'msg': repr(e)}]
            for r in recs:
                fh.write(json.dumps(r, default=str) + '\n')
            all_recs += recs
            if i % 10 == 0:
                print(f'  {i}/{len(seeds)} clients, {time.time() - t0:.0f}s', flush=True)
    summarize(all_recs, time.time() - t0)


def summarize(recs, secs):
    status = Counter(r['status'] for r in recs)
    runs = sum(1 for r in recs if r['stage'] in ('result', 'run'))
    print(f'\n{len({r["seed"] for r in recs})} clients · {runs} service runs · {sum(1 for r in recs if r["stage"] == "truth")} truth checks · {sum(1 for r in recs if r["stage"] == "caught")} planted mistakes · {secs:.0f}s')
    print('status:', dict(status))
    groups = defaultdict(list)
    for r in recs:
        if r['status'] in ('error', 'fail', 'warn'):
            msg = re.sub(r'\d[\d,.]*', '#', r['msg'])[:110]
            groups[(r['status'], r['stage'], r.get('service') or '', msg)].append(r['seed'])
    for (st, stage, svc, msg), seeds in sorted(groups.items(), key=lambda x: (-['warn', 'fail', 'error'].index(x[0][0]), -len(x[1]))):
        print(f'{st:5} {len(seeds):4}× {stage:9} {svc[:28]:28} {msg}   seeds {sorted(set(seeds))[:6]}')


if __name__ == '__main__':
    main()
