"""What every service shares: the client's data, result building, formatting and confidence levels."""

from __future__ import annotations

import difflib
import math
import re
from dataclasses import dataclass, field
from functools import cached_property
from typing import Any, Callable

import numpy as np
import pandas as pd

LEVELS = ['high', 'medium', 'low', 'none']

# ---------- Formatting ----------


class Fmt:
    def __init__(self, currency: str = 'EGP'):
        self.cur = currency

    def money(self, n: float, exact: bool = False) -> str:
        if n is None or not np.isfinite(n):
            return '–'
        sign = '−' if n < 0 else ''
        a = abs(float(n))
        if not exact:
            if a >= 1e9:
                return f'{sign}{self.cur} {a / 1e9:.2f}B'
            if a >= 1e6:
                return f'{sign}{self.cur} {a / 1e6:.{1 if a >= 1e7 else 2}f}M'
            if a >= 1e4:
                return f'{sign}{self.cur} {a / 1e3:.0f}K'
        return f'{sign}{self.cur} {a:,.0f}' if a >= 100 or a == int(a) else f'{sign}{self.cur} {a:,.2f}'

    @staticmethod
    def num(n: float, digits: int = 0) -> str:
        if n is None or not np.isfinite(n):
            return '–'
        return f'{n:,.{digits}f}'

    @staticmethod
    def pct(x: float, digits: int = 1) -> str:
        if x is None or not np.isfinite(x):
            return '–'
        return f'{x * 100:.{digits}f}%'

    @staticmethod
    def spct(x: float, digits: int = 1) -> str:
        if x is None or not np.isfinite(x):
            return '–'
        return f'{"+" if x >= 0 else "−"}{abs(x) * 100:.{digits}f}%'


# ---------- Results ----------


def kpi(label: str, value: str, note: str | None = None, tone: str | None = None) -> dict:
    return {k: v for k, v in {'label': label, 'value': value, 'note': note, 'tone': tone}.items() if v is not None}


def finding(text: str, level: str = 'high', action: str | None = None) -> dict:
    return {k: v for k, v in {'text': text, 'action': action, 'level': level}.items() if v is not None}


def line(x, series, fmt='money', band=None, marks=None, zero=False) -> dict:
    return {'type': 'line', 'x': [str(v) for v in x], 'series': series, 'band': band, 'marks': marks, 'format': fmt, 'zero': zero}


def series(name, values, tone='accent', dashed=False) -> dict:
    return {'name': name, 'values': list(values), 'tone': tone, 'dashed': dashed}


def text(v) -> str:
    """A value as table or label text: blanks (None, NaN, NaT) show as a dash, never as 'nan'."""
    if v is None or (not isinstance(v, str) and pd.isna(v)):
        return '–'
    if isinstance(v, pd.Timestamp):
        return v.strftime('%Y-%m-%d') if v == v.normalize() else v.strftime('%Y-%m-%d %H:%M')
    return str(v)


def bars(labels, values, fmt='money', tones=None, horizontal=False, ref=None, extra=None) -> dict:
    return {'type': 'bars', 'labels': [text(v) for v in labels], 'values': list(values), 'format': fmt, 'tones': tones, 'horizontal': horizontal, 'ref': ref, 'extra': extra}


def table(columns, rows, numeric=None, tones=None) -> dict:
    return {'type': 'table', 'columns': columns, 'rows': [[text(v) for v in r] for r in rows], 'numeric': numeric, 'tones': tones}


def heatmap(rows, cols, values, fmt='num') -> dict:
    return {'type': 'heatmap', 'rows': [text(r) for r in rows], 'cols': [text(c) for c in cols], 'values': values, 'format': fmt}


def chart(title: str, c: dict, wide: bool = False) -> dict:
    return {'title': title, 'chart': c, 'wide': wide}


def result(kpis, charts, findings, accuracy=None, notes=None) -> dict:
    return {'kpis': kpis, 'charts': charts, 'findings': findings, 'accuracy': accuracy, 'notes': notes or []}


def clean_json(x: Any) -> Any:
    """Plain JSON: no NaN or infinity, no numpy types."""
    if isinstance(x, dict):
        return {k: clean_json(v) for k, v in x.items() if v is not None or k in ('band', 'marks')}
    if isinstance(x, (list, tuple)):
        return [clean_json(v) for v in x]
    if isinstance(x, (np.integer,)):
        return int(x)
    if isinstance(x, (np.floating, float)):
        return None if not math.isfinite(float(x)) else round(float(x), 6)
    if isinstance(x, (np.bool_,)):
        return bool(x)
    if isinstance(x, (pd.Timestamp,)):
        return x.isoformat()
    return x


class NeedsData(Exception):
    """Raised by a service when the files can't support it after all; the message says what is missing."""


# ---------- Names typed differently ----------


def canonical_names(names: pd.Series) -> tuple[pd.Series, list[list[str]]]:
    """Merge spellings of the same name (case, punctuation, Al/El, small typos). Returns new names and the groups merged."""

    def norm(s: str) -> str:
        s = str(s).lower()
        s = re.sub(r'[.\-_,&/()]', ' ', s)
        s = re.sub(r'\b(el|al)\b', 'al', s)
        s = re.sub(r'\b(co|company|ltd|llc|inc|s a e|sae)\b', '', s)
        return re.sub(r'\s+', ' ', s).strip()

    uniq = names.dropna().astype(str).unique()
    if len(uniq) > 20000:
        return names, []
    key_of = {u: norm(u) for u in uniq}
    keys = sorted(set(key_of.values()))
    # Small typos: compare keys that start alike.
    parent = {k: k for k in keys}
    if len(keys) <= 5000:
        by_start: dict[str, list[str]] = {}
        for k in keys:
            by_start.setdefault(k[:3], []).append(k)
        for group in by_start.values():
            for i, a in enumerate(group):
                for b in group[i + 1 :]:
                    if len(a) > 6 and re.sub(r'\D', '', a) == re.sub(r'\D', '', b) and difflib.SequenceMatcher(None, a, b).ratio() >= 0.93:
                        parent[b] = parent[a]
    counts = names.astype(str).value_counts()
    groups: dict[str, list[str]] = {}
    for u in uniq:
        groups.setdefault(parent[key_of[u]], []).append(u)
    rename = {}
    merged = []
    for members in groups.values():
        if len(members) > 1:
            best = max(members, key=lambda m: (counts.get(m, 0), m[:1].isupper() and not m.isupper()))
            merged.append([best] + [m for m in members if m != best])
            for m in members:
                rename[m] = best
    return names.map(lambda v: rename.get(v, v) if isinstance(v, str) else v), merged


# ---------- The client's data ----------


# Lines in a sales export that aren't goods: shipping, fees, discounts and manual corrections. Words that could
# also be part of a real product's name ("Manual juicer") only count when they are the whole name.
NOT_GOODS = r'(?i)\b(?:postage|carriage|shipping|delivery charges?|bank charges?|fees?|commission|service charge)\b|شحن|رسوم'
NOT_GOODS_NAMES = {'MANUAL', 'DISCOUNT', 'ADJUSTMENT', 'ADJUST BAD DEBT', 'SAMPLES', 'DELIVERY', 'POST', 'DOT', 'M', 'C2', 'D', 'S', 'B', 'CRUK', 'AMAZONFEE', 'PADS', 'خصم', 'توصيل'}


@dataclass
class Data:
    tables: dict[str, pd.DataFrame]
    settings: dict = field(default_factory=dict)

    @property
    def kinds(self) -> set[str]:
        return {k for k, v in self.tables.items() if v is not None and len(v)}

    def has(self, kind: str) -> bool:
        return kind in self.kinds

    # Where the client trades: whether the Ramadan calendar moves its sales, and which days are the weekend.
    @property
    def ramadan(self) -> bool:
        return bool(self.settings.get('ramadan', True))

    @property
    def weekend(self) -> list[int]:
        return list(self.settings.get('weekend', [4, 5]))

    def t(self, kind: str) -> pd.DataFrame:
        if not self.has(kind):
            raise NeedsData(f'No {kind} file.')
        return self.tables[kind]

    @cached_property
    def merges(self) -> dict[str, list[list[str]]]:
        return {}

    @cached_property
    def names(self) -> dict[str, str]:
        """Product code (lower case) to product name, from the sales file's name column and the price list."""
        out: dict[str, str] = {}
        s = self.tables.get('sales')
        if s is not None and 'product_name' in s and s['product_name'].notna().any():
            named = s.dropna(subset=['product_name'])
            top = named.groupby(named['product'].astype(str).str.strip().str.lower())['product_name'].agg(lambda x: x.value_counts().index[0])
            out.update({k: str(v).strip() for k, v in top.items()})
        if self.has('cost') and 'name' in self.tables['cost']:
            c = self.tables['cost'].dropna(subset=['name'])
            out.update(zip(c['product'].astype(str).str.strip().str.lower(), c['name'].astype(str).str.strip()))
        return out

    def label(self, products: pd.Series) -> pd.Series:
        """Product names in place of codes, where the price list gives them."""
        if not self.names:
            return products
        key = products.astype(str).str.strip().str.lower()
        return key.map(self.names).fillna(products)

    @cached_property
    def sales_all(self) -> pd.DataFrame:
        """Sales lines from the sales file, or built from e-invoices when there is none."""
        if self.has('sales'):
            s = self.tables['sales'].copy()
        elif self.has('einv'):
            e = self.tables['einv']
            s = pd.DataFrame({'date': e['date'], 'order_id': e['invoice_no'].astype(str), 'customer': e['customer'], 'product': 'All products', 'branch': None, 'channel': None, 'qty': 1.0, 'price': e['amount'], 'amount': e['amount'], 'is_return': e['amount'] < 0, 'promo': False, 'hour': np.nan})
        else:
            raise NeedsData('No sales or e-invoice file.')
        if 'customer' in s and s['customer'].notna().any():
            s['customer'], groups = canonical_names(s['customer'])
            if groups:
                self.merges['customer'] = groups
        s['product'] = self.label(s['product'])
        if self.has('cost') and ('cost' not in s or s['cost'].isna().all()):
            c = self.products
            # Unit cost from the price list, matched on the product code or name.
            s['cost'] = s['product'].astype(str).str.strip().str.lower().map(c.set_index('key')['cost'])
        if 'cost' not in s:
            s['cost'] = np.nan
        s['branch'] = s['branch'].fillna('Unknown') if s['branch'].notna().any() else None
        return s.sort_values('date').reset_index(drop=True)

    @cached_property
    def sales(self) -> pd.DataFrame:
        """Sales lines, without returns and without orders cancelled in full soon after (same customer, product and
        quantity returned within 30 days): those were never really sold."""
        s = self.sales_all
        ret = s[s['is_return']]
        out = s[~s['is_return'] & (s['amount'] > 0)]
        self.cancelled = {'lines': 0, 'value': 0.0}
        if len(ret) and len(out):
            def keyed(x):
                return pd.DataFrame({'date': x['date'], 'k': x['customer'].astype(str) + '|' + x['product'].astype(str) + '|' + x['qty'].abs().round(3).astype(str) + '|' + x['price'].abs().round(2).astype(str), 'i': x.index})
            r, o = keyed(ret).sort_values('date'), keyed(out).sort_values('date')
            m = pd.merge_asof(r, o.rename(columns={'i': 'sale'}), on='date', by='k', direction='backward', tolerance=pd.Timedelta(days=30))
            gone = m['sale'].dropna().astype(int).unique()
            if len(gone):
                self.cancelled = {'lines': int(len(gone)), 'value': float(out.loc[gone, 'amount'].sum())}
                out = out.drop(index=gone)
        if out.empty:
            raise NeedsData('No sales lines with a readable date and a positive amount: check the date and number columns on the file’s column check.')
        return out.reset_index(drop=True)

    def goods(self, s: pd.DataFrame) -> pd.DataFrame:
        """Only real products: no postage, delivery, fees, discounts or manual adjustments."""
        names = s['product'].astype(str)
        return s[~names.str.contains(NOT_GOODS, regex=True) & ~names.str.strip().str.upper().isin(NOT_GOODS_NAMES)]

    @cached_property
    def products(self) -> pd.DataFrame:
        if not self.has('cost'):
            return pd.DataFrame(columns=['product', 'key', 'price', 'cost', 'category', 'imported'])
        c = self.tables['cost'].copy()
        c['product'] = self.label(c['product'])
        c['key'] = c['product'].astype(str).str.strip().str.lower()
        for col in ('category', 'imported'):
            if col not in c:
                c[col] = np.nan
        return c.drop_duplicates('key', keep='last')

    @cached_property
    def end(self) -> pd.Timestamp:
        """The last day the data covers: 'last 12 months' means the 12 months before this, not before today."""
        return self.sales['date'].max().normalize()

    def recent(self, days: int = 365) -> pd.DataFrame:
        s = self.sales
        return s[s['date'] > self.end - pd.Timedelta(days=days)]

    @cached_property
    def monthly(self) -> pd.Series:
        """Sales by calendar month, without a partial first or last month."""
        return complete_months(self.sales['date'], self.sales['amount'])

    @cached_property
    def daily(self) -> pd.Series:
        s = self.sales.groupby(self.sales['date'].dt.normalize())['amount'].sum()
        return s.reindex(pd.date_range(s.index.min(), s.index.max(), freq='D'), fill_value=0.0)


def complete_months(dates: pd.Series, values: pd.Series) -> pd.Series:
    m = values.groupby(dates.dt.to_period('M')).sum().sort_index()
    if m.empty:
        return m
    full = pd.period_range(m.index.min(), m.index.max(), freq='M')
    m = m.reindex(full, fill_value=0.0)
    first, last = dates.min(), dates.max()
    if first.day > 3 and len(m) > 1:
        m = m.iloc[1:]
    if last.day < last.days_in_month - 3 and len(m) > 1:
        m = m.iloc[:-1]
    return m


def month_label(p: pd.Period) -> str:
    return p.strftime('%b %y')


# ---------- Service definitions ----------


@dataclass
class Param:
    key: str
    label: str
    min: float
    max: float
    step: float
    value: float
    format: str = 'num'  # num, pct, rate, money


@dataclass
class Ctx:
    data: Data
    level: str
    p: dict
    fmt: Fmt
    client: dict


@dataclass
class Service:
    id: str
    dept: str
    name: str
    high: list[list[str]]
    run: Callable[[Ctx], dict]
    medium: list[list[str]] = field(default_factory=list)
    low: list[list[str]] = field(default_factory=list)
    public: bool = False
    params: list[Param] = field(default_factory=list)
    defaults: Callable[[Data, dict], dict] | None = None
    adjust: Callable[[Data, str], tuple[str, str] | None] | None = None
    preview: str | None = None  # how this version computes it, when that differs from the catalogue's method
    data_text: str | None = None  # overrides the catalogue's "data we need"
    missing_text: str | None = None


def level_for(svc: Service, kinds: set[str]) -> str:
    if svc.public:
        return 'high'
    for level, ways in (('high', svc.high), ('medium', svc.medium), ('low', svc.low)):
        if any(all(k in kinds for k in w) for w in ways):
            return level
    return 'none'


def missing_for(svc: Service, kinds: set[str]) -> list[str]:
    if svc.public or not svc.high:
        return []
    return sorted((list(k for k in w if k not in kinds) for w in svc.high), key=len)[0]
