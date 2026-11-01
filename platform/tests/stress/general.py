"""Stress test for the any-data services: random messy tables through intake and all eight services, with random
column choices, and planted effects that the services must find.

    python -m tests.stress.general --tables 300 --workers 4
"""

from __future__ import annotations

import argparse
import io
import json
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

AGREE = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree']
AGREE_AR = ['لا أوافق بشدة', 'لا أوافق', 'محايد', 'أوافق', 'أوافق بشدة']


def make_table(seed: int) -> tuple[str, bytes, dict]:
    """A messy table and what was planted in it."""
    rng = np.random.default_rng(seed)
    n = int(rng.choice([12, 25, 60, 150, 400, 1500, 5000]))
    truth: dict = {'n': n}
    cols: dict[str, list] = {}
    groups = list(rng.choice(['North', 'South', 'East', 'West', 'Centre', 'Clinic A', 'Clinic B', 'Line 1', 'Line 2'], size=int(rng.integers(2, 6)), replace=False))
    g = rng.choice(groups, n)
    effect = float(rng.choice([0, 0, 0.8]))  # in standard deviations, for the first group
    truth['group_effect'] = effect
    truth['groups'] = groups
    base = rng.normal(50, 10, n) + np.where(g == groups[0], effect * 10, 0)
    cols['ID'] = [f'R{i:05d}' for i in range(n)]
    cols['Site'] = list(g)
    before = base + rng.normal(0, 3, n)
    gain = float(rng.choice([0, 0, 5]))
    truth['gain'] = gain
    after = before + gain + rng.normal(0, 3, n)
    cols['Score before'] = list(before.round(1))
    cols['Score after'] = list(after.round(1))
    if rng.random() < 0.7:
        start = pd.Timestamp('2020-01-01') + pd.Timedelta(days=int(rng.integers(0, 900)))
        span = int(rng.choice([20, 200, 900, 1600]))
        d = start + pd.to_timedelta(np.sort(rng.integers(0, span, n)), unit='D')
        fmt = str(rng.choice(['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%b-%Y']))
        cols['Visit date'] = [x.strftime(fmt) for x in d]
    if rng.random() < 0.6:
        scale = AGREE_AR if rng.random() < 0.3 else AGREE
        for q in range(int(rng.integers(1, 6))):
            cols[f'Q{q + 1}'] = list(rng.choice(scale, n, p=[0.05, 0.1, 0.25, 0.35, 0.25]))
    if rng.random() < 0.5:
        cols['Rating 1-10'] = list(rng.integers(1, 11, n))
    cols['Weight'] = list(rng.normal(70, 12, n).round(1))
    cols['Passed'] = list(np.where(after + rng.normal(0, 5, n) > 55, 'Yes', 'No'))
    if rng.random() < 0.5:
        cols['Batch'] = list(np.repeat(np.arange(n // 5 + 1), 5)[:n])
        cols['Thickness mm'] = list(rng.normal(5, 0.1, n).round(3))
    if rng.random() < 0.3:
        cols['Comment'] = [rng.choice(['ok', 'good service', 'too slow', 'no comment', '']) + f' {i}' for i in range(n)]
    if rng.random() < 0.3:
        cols['Empty'] = [None] * n
    df = pd.DataFrame(cols)
    # Mess: blanks, n/a, Arabic digits, units, a total row, a constant column.
    for col in df.columns:
        if rng.random() < 0.3 and col != 'ID':
            idx = rng.choice(n, size=max(1, n // 15), replace=False)
            df.loc[idx, col] = rng.choice(['', 'n/a', None])
    if rng.random() < 0.3:
        df['Weight'] = df['Weight'].map(lambda v: f'{v} kg' if isinstance(v, float) and not np.isnan(v) else v)
    if rng.random() < 0.2:
        tr = str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩')
        df['Score after'] = df['Score after'].map(lambda v: str(v).translate(tr) if v is not None else v)
    if rng.random() < 0.2:
        df.loc[len(df)] = ['Total'] + [''] * (df.shape[1] - 1)
    fmt = str(rng.choice(['csv', 'xlsx', 'csv;']))
    if fmt == 'xlsx':
        buf = io.BytesIO()
        df.to_excel(buf, index=False)
        return f'study_{seed}.xlsx', buf.getvalue(), truth
    return f'records_{seed}.csv', df.to_csv(index=False, sep=';' if fmt == 'csv;' else ',').encode('utf-8'), truth


def run_table(seed: int) -> list[dict]:
    import warnings

    warnings.filterwarnings('ignore')
    from clearline import engine, intake
    from clearline.engine import checks

    recs = []

    def rec(stage, status, msg='', service=None, **kw):
        recs.append({'seed': seed, 'stage': stage, 'status': status, 'msg': msg, 'service': service, **kw})

    try:
        name, data, truth = make_table(seed)
        raw = intake.read_raw(name, data)
        kind, _, _ = intake.suggest_kind(name, raw)
        rec('kind', 'ok' if kind == 'table' else 'warn', f'guessed {kind}')
        std, health = intake.standardize('table', raw, {}, {})
    except Exception as e:  # noqa: BLE001
        rec('intake', 'error', f'{type(e).__name__}: {e}', trace=traceback.format_exc(limit=6))
        return recs
    types = health['types']
    for col, want in (('Score before', 'number'), ('Score after', 'number'), ('Visit date', 'date'), ('ID', 'text')):
        if col in types and types[col] != want:
            rec('types', 'fail', f'{col} read as {types[col]}')
    std.attrs['file'] = name
    d = engine.build_data({'table': [std]})
    info = {'currency': 'EGP', 'files': [{'name': name, 'kind': 'table', 'store_as': None, 'health': health}]}
    rng = np.random.default_rng(seed + 7)
    for s in engine.SERVICES:
        if s.dept != 'general':
            continue
        r = engine.readiness(s, d)
        if r['level'] == 'none':
            rec('ready', 'needs', r['why'] or '', service=s.id)
            continue
        ch = engine.choices(s, d)
        variants = [engine.start_params(s, d, info)]
        for _ in range(3):
            v = dict(variants[0])
            for k, opts in ch.items():
                if opts:
                    v[k] = str(rng.choice(opts + ([''] if any(x.key == k and x.optional for x in s.params) else [])))
            variants.append(v)
        for vi, p in enumerate(variants):
            try:
                out = engine.run(s.id, d, p, info)
            except Exception as e:  # noqa: BLE001
                rec('run', 'error', f'{type(e).__name__}: {e}', service=s.id, trace=traceback.format_exc(limit=8), params=p)
                continue
            if 'error' in out:
                rec('run', 'error' if 'trace' in out else 'needs', out['error'][:160], service=s.id, trace=out.get('trace'), params=p)
                continue
            res = out['result']
            try:
                json.dumps(res, allow_nan=False)
            except ValueError as e:
                rec('run', 'fail', f'not JSON-safe: {e}', service=s.id)
            for k in res.get('checks', []):
                if k['status'] == 'fail':
                    rec('check', 'fail', f'{k["id"]}: {k["detail"][:150]}', service=s.id, params=p)
            if vi == 0:
                again = engine.run(s.id, d, p, info)
                st = checks.stability({'result': res, 'params': out['params'], 'files': []}, {'result': again.get('result', {}), 'params': again.get('params'), 'files': []})
                rec('repeat', 'ok' if st['status'] == 'pass' else 'fail', '' if st['status'] == 'pass' else st['detail'][:150], service=s.id)
                truth_checks(seed, s.id, p, res, truth, rec)
            rec('result', 'ok', service=s.id)
    return recs


def truth_checks(seed, sid, p, res, truth, rec):
    kp = {k['label']: k['value'] for k in res['kpis']}
    big = truth['n'] >= 150
    if sid == 'before-and-after-impact' and p.get('before') == 'Score before' and p.get('after') == 'Score after' and big:
        found = 'very unlikely' in res['findings'][0]['text'] or 'unlikely to be chance' in res['findings'][0]['text']
        if truth['gain'] and not found:
            rec('truth', 'fail', f'planted gain {truth["gain"]} not found: {res["findings"][0]["text"][:120]}', service=sid)
        elif not truth['gain'] and 'very unlikely' in res['findings'][0]['text']:
            rec('truth', 'warn', 'no gain planted but found one (a 1-in-100 false alarm is expected now and then)', service=sid)
        else:
            rec('truth', 'ok', service=sid)
    if sid == 'group-comparison' and p.get('group') == 'Site' and p.get('measure') in ('Score before', 'Score after') and big:
        real = kp.get('Real difference?') == 'Yes'
        if truth['group_effect'] and not real:
            rec('truth', 'fail', f'planted group effect not found ({kp})', service=sid)
        elif not truth['group_effect'] and real:
            rec('truth', 'warn', 'no group effect planted but found one (5% false alarms expected)', service=sid)
        else:
            rec('truth', 'ok', service=sid)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tables', type=int, default=100)
    ap.add_argument('--start', type=int, default=1)
    ap.add_argument('--workers', type=int, default=4)
    ap.add_argument('--seeds', type=str, default='')
    a = ap.parse_args()
    OUT.mkdir(exist_ok=True)
    seeds = [int(x) for x in a.seeds.split(',')] if a.seeds else list(range(a.start, a.start + a.tables))
    t0 = time.time()
    recs = []
    with ProcessPoolExecutor(a.workers) as ex:
        futs = {ex.submit(run_table, s): s for s in seeds}
        for i, fu in enumerate(as_completed(futs), 1):
            try:
                recs += fu.result()
            except Exception as e:  # noqa: BLE001
                recs.append({'seed': futs[fu], 'stage': 'worker', 'status': 'error', 'msg': repr(e)})
            if i % 25 == 0:
                print(f'  {i}/{len(seeds)} tables, {time.time() - t0:.0f}s', flush=True)
    (OUT / 'general.jsonl').write_text('\n'.join(json.dumps(r, default=str) for r in recs))
    runs = sum(1 for r in recs if r['stage'] in ('result', 'run'))
    print(f'\n{len(seeds)} tables · {runs} service runs · {sum(1 for r in recs if r["stage"] == "truth")} truth checks · {time.time() - t0:.0f}s')
    print('status:', dict(Counter((r['stage'], r['status']) for r in recs if r['status'] not in ('ok',))))
    groups = defaultdict(list)
    for r in recs:
        if r['status'] in ('error', 'fail', 'warn'):
            groups[(r['status'], r['stage'], r.get('service') or '', re.sub(r'\d[\d,.]*', '#', r['msg'])[:110])].append(r['seed'])
    for (st, stage, svc, msg), ss in sorted(groups.items(), key=lambda x: -len(x[1])):
        print(f'{st:5} {len(ss):4}× {stage:7} {svc[:30]:30} {msg}   seeds {sorted(set(ss))[:6]}')


if __name__ == '__main__':
    main()
