"""Calendar effects that matter in Egypt. Ramadan dates are approximate (±1 day, by moon sighting)."""

import pandas as pd

RAMADAN = [
    ('2010-08-11', '2010-09-09'), ('2011-08-01', '2011-08-29'), ('2012-07-20', '2012-08-18'), ('2013-07-09', '2013-08-07'),
    ('2014-06-28', '2014-07-27'), ('2015-06-18', '2015-07-16'), ('2016-06-06', '2016-07-05'), ('2017-05-27', '2017-06-24'),
    ('2018-05-16', '2018-06-14'), ('2019-05-06', '2019-06-03'), ('2020-04-24', '2020-05-23'), ('2021-04-13', '2021-05-12'),
    ('2022-04-02', '2022-05-01'), ('2023-03-23', '2023-04-20'), ('2024-03-11', '2024-04-09'), ('2025-03-01', '2025-03-29'),
    ('2026-02-18', '2026-03-19'), ('2027-02-08', '2027-03-09'), ('2028-01-28', '2028-02-26'), ('2029-01-16', '2029-02-14'),
    ('2030-01-06', '2030-02-04'),
]
_R = [(pd.Timestamp(a), pd.Timestamp(b)) for a, b in RAMADAN]


def in_ramadan(days: pd.DatetimeIndex) -> pd.Series:
    out = pd.Series(False, index=days)
    for a, b in _R:
        out |= (days >= a) & (days <= b)
    return out


def pre_ramadan(days: pd.DatetimeIndex, weeks: int = 2) -> pd.Series:
    out = pd.Series(False, index=days)
    for a, _ in _R:
        out |= (days >= a - pd.Timedelta(weeks=weeks)) & (days < a)
    return out


def days_in_month(periods: pd.PeriodIndex, which: str = 'ramadan') -> list[int]:
    """How many Ramadan (or pre-Ramadan) days fall in each month."""
    out = []
    for p in periods:
        days = pd.date_range(p.start_time, p.end_time.normalize(), freq='D')
        flag = in_ramadan(days) if which == 'ramadan' else pre_ramadan(days)
        out.append(int(flag.sum()))
    return out


def covers_ramadan(start: pd.Timestamp, end: pd.Timestamp) -> bool:
    return any(a <= end and b >= start for a, b in _R)


# Currencies of markets where Ramadan moves sales, and of those where the weekend is Friday and Saturday.
RAMADAN_MARKETS = {'EGP', 'SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD', 'LBP', 'IQD', 'MAD', 'DZD', 'TND', 'LYD', 'SDG', 'YER', 'SYP', 'PKR', 'BDT', 'IDR', 'MYR', 'TRY'}
FRI_SAT_WEEKEND = {'EGP', 'SAR', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD', 'IQD', 'DZD', 'LYD', 'SDG', 'YER', 'SYP'}


def market_settings(currency: str, overrides: dict | None = None) -> dict:
    """The calendar a client's sales follow, guessed from its currency unless set by hand."""
    cur = (currency or 'EGP').upper()
    out = {'ramadan': cur in RAMADAN_MARKETS, 'weekend': [4, 5] if cur in FRI_SAT_WEEKEND else [5, 6]}
    out.update({k: v for k, v in (overrides or {}).items() if k in out})
    return out
