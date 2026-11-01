"""Builds samples/test-pack: made-up files with answers planted in them, for testing the workspace by hand.

    python samples/make_test_pack.py

Every file is invented. The planted answers are listed in test-pack/ANSWERS.md.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

OUT = Path(__file__).parent / 'test-pack'
rng = np.random.default_rng(2025)

AGREE = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree']
AGREE_AR = ['لا أوافق بشدة', 'لا أوافق', 'محايد', 'أوافق', 'أوافق بشدة']


def likert(latent: np.ndarray, labels: list[str]) -> list[str]:
    """A 1–5 answer from a hidden attitude score, as words."""
    cut = np.clip(np.round(3 + latent + rng.normal(0, 0.7, len(latent))), 1, 5).astype(int)
    return [labels[k - 1] for k in cut]


def teaching_pilot() -> None:
    """A school study: a new teaching method in some classes. Planted: +6 points from the method, North school +3."""
    n = 480
    arm = rng.choice(['New method', 'Usual method'], n)
    school = rng.choice(['North', 'South', 'East'], n)
    gender = rng.choice(['F', 'M'], n)
    before = rng.normal(60, 9, n) + np.where(school == 'North', 3, 0)
    after = before + 2 + rng.normal(0, 4, n) + np.where(arm == 'New method', 6, 0)
    attitude = rng.normal(0.4, 0.9, n) + np.where(arm == 'New method', 0.3, 0)
    df = pd.DataFrame({
        'Student ID': [f'ST-{i:04d}' for i in range(1, n + 1)],
        'School': school,
        'Gender': gender,
        'Group': arm,
        'Score before': before.round(1),
        'Score after': after.round(1),
        'Attendance %': np.clip(rng.normal(88, 8, n), 40, 100).round(),
        'Test date': (pd.Timestamp('2025-03-01') + pd.to_timedelta(rng.integers(0, 60, n), unit='D')).strftime('%d/%m/%Y'),
        'Q1 Lessons were clear': likert(attitude, AGREE),
        'Q2 I understood the homework': likert(attitude, AGREE),
        'Q3 I felt confident in tests': likert(attitude - 0.2, AGREE),
        'Q4 I would recommend this class': likert(attitude, AGREE),
        'Q5 The classroom was comfortable': likert(rng.normal(-0.6, 0.9, n), AGREE),
    })
    df.loc[rng.choice(n, 14, replace=False), 'Attendance %'] = np.nan
    df.to_csv(OUT / '1_teaching_pilot_2025.csv', index=False)


def clinic_visits() -> None:
    """Three years of clinic visits. Planted: waits rise about 10% a year, peak in January, Clinic B about 8 minutes longer."""
    days = pd.date_range('2023-01-01', '2025-12-31', freq='D')
    rows = []
    for d in days:
        season = 1 + 0.25 * np.cos(2 * np.pi * (d.dayofyear - 15) / 365)
        growth = 1.10 ** ((d - days[0]).days / 365)
        for _ in range(rng.poisson(9 * season)):
            clinic = rng.choice(['Clinic A', 'Clinic B', 'Clinic C'])
            wait = rng.gamma(4, 5) * season * growth + (8 if clinic == 'Clinic B' else 0)
            rows.append({'Visit date': d.date(), 'Clinic': clinic, 'Department': rng.choice(['General', 'Children', 'Dental', 'Eyes']), 'Patient age': int(np.clip(rng.normal(38, 18), 1, 95)), 'Waiting minutes': round(wait)})
    pd.DataFrame(rows).to_excel(OUT / '2_clinic_visits_2023_2025.xlsx', index=False)


def bottling_line() -> None:
    """Fill volume, five bottles per sample. Planted: stable at 500 ml, then a shift to about 503 ml from sample 61."""
    rows = []
    t = pd.Timestamp('2025-09-01 08:00')
    for s in range(1, 81):
        mean = 500 if s <= 60 else 503
        for b in range(5):
            rows.append({'Sample': s, 'Time': (t + pd.Timedelta(minutes=30 * s)).strftime('%Y-%m-%d %H:%M'), 'Bottle': b + 1, 'Fill ml': round(rng.normal(mean, 1.0), 2)})
    pd.DataFrame(rows).to_csv(OUT / '3_bottling_line_readings.csv', index=False)


def ngo_households() -> None:
    """A livelihoods programme. Planted: income +250 EGP a month from the programme on top of +90 for everyone."""
    n = 900
    village = rng.choice(['Kafr Saad', 'Mit Ghamr', 'Tala', 'Shibin', 'Quesna', 'Ashmoun'], n)
    took = np.isin(village, ['Kafr Saad', 'Tala', 'Quesna'])
    before = rng.gamma(9, 380, n).round(-1)
    after = (before + 90 + np.where(took, 250, 0) + rng.normal(0, 220, n)).round(-1)
    sat = rng.normal(0.3, 1, n) + np.where(took, 0.5, 0)
    df = pd.DataFrame({
        'رقم الأسرة': [f'HH{i:04d}' for i in range(1, n + 1)],
        'Village': village,
        'Took part': np.where(took, 'Yes', 'No'),
        'Household size': rng.integers(2, 9, n),
        'Monthly income before (EGP)': before,
        'Monthly income after (EGP)': after,
        'Satisfied with services': likert(sat, AGREE_AR),
        'Would join again': likert(sat, AGREE_AR),
    })
    df.to_excel(OUT / '4_ngo_household_survey.xlsx', index=False)


def loan_applicants() -> None:
    """Who repays on time. Planted: stable income, prior loans repaid and a guarantor matter; age doesn't."""
    n = 1500
    stable = rng.choice(['Yes', 'No'], n, p=[0.6, 0.4])
    prior = rng.integers(0, 6, n)
    guarantor = rng.choice(['Yes', 'No'], n)
    age = rng.integers(21, 66, n)
    amount = rng.gamma(3, 15000, n).round(-2)
    logit = -0.6 + 1.4 * (stable == 'Yes') + 0.35 * prior + 0.7 * (guarantor == 'Yes') - 0.000004 * amount
    repaid = rng.random(n) < 1 / (1 + np.exp(-logit))
    pd.DataFrame({'Applicant': [f'L{i:05d}' for i in range(1, n + 1)], 'Age': age, 'Stable income': stable, 'Prior loans repaid': prior, 'Guarantor': guarantor, 'Loan amount': amount, 'Repaid on time': np.where(repaid, 'Yes', 'No')}).to_csv(OUT / '5_loan_applicants.csv', index=False)


def shop_sales() -> None:
    """A shop's sales with two planted mistakes the checks must catch: April 2025 missing, and one line with extra zeros."""
    products = {'Desk lamp': 450, 'Office chair': 2900, 'Bookshelf': 3800, 'Side table': 1650, 'Floor rug': 2200, 'Wall clock': 380, 'Cushion set': 520, 'Mirror': 1250}
    rows = []
    for d in pd.date_range('2024-01-01', '2025-09-30', freq='D'):
        if d.year == 2025 and d.month == 4:
            continue  # the planted missing month
        season = 1 + 0.3 * np.sin(2 * np.pi * (d.month - 3) / 12)
        for k in range(rng.poisson(14 * season * (1.12 if d.year == 2025 else 1))):
            p = rng.choice(list(products))
            q = int(rng.integers(1, 4))
            rows.append({'Invoice': f'INV-{d:%y%m%d}-{k:03d}', 'Date': d.strftime('%d/%m/%Y'), 'Customer': f'C{rng.integers(1, 900):04d}', 'Product': p, 'Qty': q, 'Unit price': products[p], 'Total': q * products[p]})
    df = pd.DataFrame(rows)
    i = len(df) // 3
    df.loc[i, 'Unit price'] *= 1000  # the planted typo
    df.loc[i, 'Total'] *= 1000
    df.to_csv(OUT / '6_shop_sales_with_mistakes.csv', index=False)


if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    teaching_pilot()
    clinic_visits()
    bottling_line()
    ngo_households()
    loan_applicants()
    shop_sales()
    print('written to', OUT)
