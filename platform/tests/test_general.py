"""The any-data services: reading any table, the column settings, and answers on data with known effects."""

import io

import numpy as np
import pandas as pd

from clearline import engine, intake


def study(n=300, effect=6.0, seed=3):
    rng = np.random.default_rng(seed)
    arm = rng.choice(['Programme', 'Comparison'], n)
    before = rng.normal(60, 8, n)
    after = before + rng.normal(2, 4, n) + np.where(arm == 'Programme', effect, 0)
    return pd.DataFrame({
        'Student ID': [f'S{i:04d}' for i in range(n)],
        'Arm': arm,
        'School': rng.choice(['North', 'South', 'East'], n),
        'Score before': before.round(1),
        'Score after': after.round(1),
        'Test date': pd.Timestamp('2023-01-01') + pd.to_timedelta(rng.integers(0, 800, n), unit='D'),
        'Q1': rng.choice(['Agree', 'Strongly agree', 'Neutral', 'Disagree'], n),
        'Q2': rng.integers(1, 6, n),
        'Q3': rng.integers(1, 6, n),
    })


def data_of(df, name='study.csv'):
    raw = intake.read_raw(name, df.to_csv(index=False).encode())
    std, health = intake.standardize('table', raw, {}, {})
    std.attrs['file'] = name
    return engine.build_data({'table': [std]}), health


INFO = {'currency': 'EGP', 'files': []}


def run(d, sid, **p):
    s = engine.BY_ID[sid]
    params = {**engine.start_params(s, d, INFO), **p}
    out = engine.run(sid, d, params, INFO)
    assert 'error' not in out, out
    assert all(k['status'] != 'fail' for k in out['result']['checks']), out['result']['checks']
    return out


def test_reads_any_table():
    raw = intake.read_raw('trial_results.csv', study().to_csv(index=False).encode())
    assert intake.suggest_kind('trial_results.csv', raw)[0] == 'table'
    _, health = data_of(study())
    t = health['types']
    assert t['Student ID'] == 'text' and t['Score before'] == 'number' and t['Test date'] == 'date' and t['Arm'] == 'text'


def test_column_choices_and_defaults():
    d, _ = data_of(study())
    ch = engine.choices(engine.BY_ID['group-comparison'], d)
    assert 'Score after' in ch['measure'] and 'Student ID' not in ch['measure']
    assert 'Arm' in ch['group'] and 'School' in ch['group']
    p = engine.start_params(engine.BY_ID['before-and-after-impact'], d, INFO)
    assert p['before'] == 'Score before' and p['after'] == 'Score after'


def test_finds_a_planted_effect_and_not_a_missing_one():
    d, _ = data_of(study(effect=6))
    out = run(d, 'group-comparison', measure='Score after', group='Arm')
    assert next(k for k in out['result']['kpis'] if k['label'] == 'Real difference?')['value'] == 'Yes'
    out = run(d, 'group-comparison', measure='Score before', group='School')
    assert next(k for k in out['result']['kpis'] if k['label'] == 'Real difference?')['value'] == 'Not shown'


def test_difference_in_differences_recovers_the_effect():
    d, _ = data_of(study(n=2000, effect=6))
    out = run(d, 'before-and-after-impact', group='Arm')
    k = next(k for k in out['result']['kpis'] if k['label'] == 'Effect vs comparison')
    assert 5 <= float(k['value'].replace('+', '').replace('−', '-')) <= 7


def test_every_any_data_service_runs():
    d, _ = data_of(study())
    for s in engine.SERVICES:
        if s.dept == 'general':
            run(d, s.id, **({'measure': 'Score after'} if s.id == 'quality-and-process-control' else {}))


def test_columns_are_only_guessed_from_their_names():
    d, _ = data_of(study())
    p = engine.start_params(engine.BY_ID['group-comparison'], d, INFO)
    assert p == {'measure': 'Score after', 'group': 'Arm'}  # the after score, by the arm that took part
    assert engine.start_params(engine.BY_ID['what-drives-an-outcome'], d, INFO)['outcome'] == 'Score after'
    assert engine.start_params(engine.BY_ID['quality-and-process-control'], d, INFO)['measure'] is None  # nothing looks like a measurement
    out = engine.run('quality-and-process-control', d, None, INFO)
    assert out['error'] == 'Choose the measurement.'


def test_short_daily_data_is_not_stretched_to_a_year():
    d, _ = data_of(study().assign(**{'Test date': pd.Timestamp('2025-03-01') + pd.to_timedelta(np.arange(300) % 60, unit='D')}))
    out = run(d, 'trend-and-forecast-for-any-measure', date='Test date', measure='Score before', how='Average')
    assert out['level'] == 'low'
    assert any(k['label'].startswith('Change over') for k in out['result']['kpis'])


def test_a_steady_series_is_called_stable():
    d, _ = data_of(pd.DataFrame({'Reading': np.random.default_rng(4).normal(10, 0.1, 480).round(3)}), 'steady.csv')
    out = run(d, 'quality-and-process-control', measure='Reading')
    assert next(k for k in out['result']['kpis'] if k['label'] == 'Stable?')['value'] == 'Yes'


def test_quality_control_flags_a_shift():
    v = np.r_[np.random.default_rng(1).normal(10, 0.1, 40), np.random.default_rng(2).normal(10.4, 0.1, 15)]
    d, _ = data_of(pd.DataFrame({'Reading': v.round(3)}), 'line.csv')
    out = run(d, 'quality-and-process-control', measure='Reading', lsl=9.7, usl=10.3)
    kp = {k['label']: k['value'] for k in out['result']['kpis']}
    assert kp['Stable?'] == 'No' and float(kp['Capability (Cpk)']) < 1


def test_bad_settings_say_what_is_wrong():
    d, _ = data_of(study())
    out = engine.run('before-and-after-impact', d, {'before': 'Score before', 'after': 'Score before'}, INFO)
    assert 'chosen for two settings' in out['error']
    out = engine.run('quality-and-process-control', d, {'measure': 'Score after', 'lsl': 'abc'}, INFO)
    assert 'valid number' in out['error']
