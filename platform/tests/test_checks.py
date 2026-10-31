"""The built-in checks on their own: reading figures back, the number checker, stability and the sales tests."""

import numpy as np
import pandas as pd

from clearline import engine
from clearline.engine import checks


def res(kpis, findings=()):
    return {'kpis': [{'label': a, 'value': b} for a, b in kpis], 'charts': [{'title': 'x', 'chart': {'type': 'bars', 'labels': ['a'], 'values': [1.0], 'format': 'num'}}], 'findings': [{'text': t, 'level': 'high'} for t in findings]}


def test_reads_formatted_values():
    assert checks.money_value('EGP 1.25M') == 1.25e6
    assert checks.money_value('−USD 4,200') == -4200
    assert checks.pct_value('−12.5%') == -0.125
    assert checks.kpi_value({'value': '3,284'}) == 3284
    assert checks.kpi_value({'value': 'EGP 1M – EGP 2M'}) is None


def test_number_checker_allows_rounding_and_catches_made_up_figures():
    r = res([('Sales, last 12 months', 'EGP 13.1M'), ('Margin', '32.6%'), ('Orders', '16,182')], ['Five products bring 41% of sales.'])
    assert checks.unbacked_numbers('Sales reached EGP 13.1M on 16,182 orders, a 32.6% margin.', [r]) == []
    assert checks.unbacked_numbers('Margin is about 33% and five products bring 41%.', [r]) == []
    assert checks.unbacked_numbers('Sales were EGP 14.2M and margin 38%.', [r]) == ['EGP 14.2M', '38%']
    assert checks.unbacked_numbers('In 2025, over 3 months, things improved.', [r]) == []


def test_plausible_flags_impossible_values():
    assert checks.plausible(res([('Sales, last 12 months', '−EGP 5,000')]))['status'] == 'fail'
    assert checks.plausible(res([('Gross margin', '140%')]))['status'] == 'fail'
    assert checks.plausible(res([('Bought more than once', '81%')]))['status'] == 'pass'
    assert checks.plausible(res([('Targets met', '–')]))['status'] == 'warn'


def test_integrity_catches_broken_results():
    r = res([('A', '1')])
    r['charts'][0]['chart']['values'] = [1.0, 2.0]
    assert checks.integrity(r)['status'] == 'fail'
    r = res([('A', '1')], ['Sales were nan this month.'])
    assert checks.integrity(r)['status'] == 'fail'


def test_stability():
    a = {'result': res([('Sales', 'EGP 100K')]), 'params': {}, 'files': ['s.csv']}
    assert checks.stability(None, a)['status'] == 'pass'
    assert checks.stability(a, a)['status'] == 'pass'
    b = {**a, 'result': res([('Sales', 'EGP 101K')])}
    assert checks.stability(a, b)['status'] == 'fail'  # same inputs, different answer
    c = {**b, 'files': ['s.csv', 't.csv'], 'result': res([('Sales', 'EGP 200K')])}
    assert checks.stability(a, c)['status'] == 'warn'


def sales_data(months=14, gap=None, future=False, typo=False):
    rng = np.random.default_rng(1)
    days = pd.date_range('2024-01-01', periods=months * 30, freq='D')
    rows = []
    for i, d in enumerate(days):
        if gap and d.to_period('M') == pd.Period(gap):
            continue
        for j in range(5):
            q, p = 1 + int(rng.integers(0, 3)), float(rng.uniform(50, 150))
            rows.append({'date': d, 'order_id': f'{i}-{j}', 'customer': f'C{rng.integers(0, 60)}', 'product': f'P{rng.integers(0, 9)}', 'branch': None, 'channel': None, 'qty': q, 'price': p, 'amount': q * p, 'is_return': False, 'promo': False, 'hour': np.nan})
    if typo:
        rows[100]['amount'] = rows[100]['price'] = 9e6
    if future:
        rows[-1]['date'] = pd.Timestamp.now() + pd.Timedelta(days=90)
    return engine.build_data({'sales': [pd.DataFrame(rows)]})


def statuses(d):
    return {k['id']: k['status'] for k in checks.sales_reconcile(d, engine.Fmt('EGP'))}


def test_sales_checks():
    assert statuses(sales_data()) == {'reconcile': 'pass', 'coverage': 'pass', 'dates': 'pass', 'outliers': 'pass', 'lines': 'pass'}
    assert statuses(sales_data(gap='2024-05'))['coverage'] == 'warn'
    assert statuses(sales_data(future=True))['dates'] == 'fail'
    assert statuses(sales_data(typo=True))['outliers'] == 'warn'


def test_every_result_carries_checks():
    d = sales_data()
    out = engine.run('business-snapshot', d, None, {'currency': 'EGP', 'files': []})
    ids = {k['id'] for k in out['result']['checks']}
    assert {'integrity', 'plausible', 'confidence', 'recount', 'reconcile'} <= ids
    assert all(k['status'] == 'pass' for k in out['result']['checks'] if k['id'] in ('integrity', 'recount', 'reconcile'))
