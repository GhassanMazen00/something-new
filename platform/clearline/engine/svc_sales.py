"""Sales: four services."""

from __future__ import annotations

import warnings

import numpy as np
import pandas as pd
import statsmodels.api as sm
from scipy.stats import norm

from .calendar import covers_ramadan, days_in_month, in_ramadan, pre_ramadan
from .core import Ctx, NeedsData, Param, Service, bars, chart, finding, kpi, line, month_label, result, series, table


def _mape(a, f) -> float:
    a, f = np.asarray(a, float), np.asarray(f, float)
    ok = a != 0
    return float(np.mean(np.abs((a[ok] - f[ok]) / a[ok]))) if ok.any() else np.inf


def _sf_models(n: int) -> list:
    from statsforecast.models import AutoARIMA, AutoETS, AutoTheta, SeasonalNaive

    seasonal = n >= 24
    models = [AutoETS(season_length=12 if seasonal else 1, alias='ETS'), AutoTheta(season_length=12 if seasonal else 1, alias='Theta'), AutoARIMA(season_length=12 if n >= 30 else 1, alias='ARIMA')]
    if seasonal:
        models.append(SeasonalNaive(12, alias='Seasonal naive'))
    return models


def _sf_forecast(y: pd.Series, h: int, level: int | None = None) -> dict[str, tuple[np.ndarray, np.ndarray | None, np.ndarray | None]]:
    """Forecasts from each statsforecast model: point, low, high."""
    from statsforecast import StatsForecast

    df = pd.DataFrame({'unique_id': 'x', 'ds': y.index.to_timestamp(), 'y': y.values.astype(float)})
    out = {}
    for model in _sf_models(len(y)):
        try:
            with warnings.catch_warnings():
                warnings.simplefilter('ignore')
                fc = StatsForecast(models=[model], freq='MS').forecast(df=df, h=h, level=[level] if level else None)
            name = model.alias
            lo = fc[f'{name}-lo-{level}'].values if level else None
            hi = fc[f'{name}-hi-{level}'].values if level else None
            out[name] = (fc[name].values, lo, hi)
        except Exception:  # noqa: BLE001 - a model that fails simply leaves the contest
            continue
    return out


def _ramadan_reg(y: pd.Series, h: int, level: int | None = None):
    """Monthly regression on trend, the yearly cycle and Ramadan / pre-Ramadan days in each month."""
    idx = y.index
    allp = pd.period_range(idx[0], periods=len(y) + h, freq='M')

    def X(periods, start):
        m = periods.month.values
        t = np.arange(start, start + len(periods))
        return np.column_stack([np.ones(len(periods)), t, np.sin(2 * np.pi * m / 12), np.cos(2 * np.pi * m / 12), np.sin(4 * np.pi * m / 12), np.cos(4 * np.pi * m / 12), days_in_month(periods, 'ramadan'), days_in_month(periods, 'pre')])

    fit = sm.OLS(y.values.astype(float), X(idx, 0)).fit()
    pred = fit.get_prediction(X(allp[len(y) :], len(y))).summary_frame(alpha=1 - (level or 80) / 100)
    return pred['mean'].values, pred['obs_ci_lower'].values, pred['obs_ci_upper'].values


def forecast(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    y = d.monthly
    n = len(y)
    if n < 12:
        raise NeedsData('A forecast needs at least 12 full months of sales.')
    h = int(c.p['h'])
    test = 6 if n >= 24 else 3
    train = y.iloc[:-test]
    scores = {name: _mape(y.iloc[-test:], fc[0]) for name, fc in _sf_forecast(train, test).items()}
    ramadan_ok = d.ramadan and n >= 18 and covers_ramadan(y.index[0].start_time, y.index[-1].end_time)
    if ramadan_ok:
        try:
            scores['Ramadan-calendar regression'] = _mape(y.iloc[-test:], _ramadan_reg(train, test)[0])
        except Exception:  # noqa: BLE001
            pass
    if not scores:
        raise NeedsData('None of the models could fit this series.')
    best = min(scores, key=scores.get)
    if best == 'Ramadan-calendar regression':
        point, lo, hi = _ramadan_reg(y, h, 80)
    else:
        point, lo, hi = _sf_forecast(y, h, 80)[best]
    point, lo, hi = np.maximum(point, 0), np.maximum(lo, 0), np.maximum(hi, 0)
    future = pd.period_range(y.index[-1] + 1, periods=h, freq='M')
    labels = [month_label(p) for p in list(y.index) + list(future)]
    total = point.sum()
    # The total's range: monthly errors are partly linked, so take the middle of "independent" and "fully linked".
    sd = (hi - lo) / (2 * norm.ppf(0.9))
    tsd = (np.sqrt((sd**2).sum()) + sd.sum()) / 2
    z = norm.ppf(0.9)
    same_last_year = y.iloc[-12 : -12 + h].sum() if n >= 12 + h else np.nan
    peak = int(np.argmax(point))
    err = scores[best]
    level_text = 'high' if err < 0.1 and n >= 24 else 'medium' if err < 0.2 else 'low'
    seasonal = n >= 24
    return result(
        [
            kpi(f'Next {h} months', f.money(total), f'{f.spct(total / same_last_year - 1)} on the same months last year' if np.isfinite(same_last_year) and same_last_year > 0 else None),
            kpi('Likely range (80%)', f'{f.money(max(0, total - z * tsd))} – {f.money(total + z * tsd)}'),
            kpi('Peak month', month_label(future[peak]), f.money(point[peak])) if seasonal else kpi('Peak month', '–', 'needs two years of history'),
            kpi('Error on hidden months', f.pct(err), tone='good' if err < 0.1 else 'bad'),
        ],
        [
            chart(
                'Monthly sales and forecast',
                line(
                    labels,
                    [series('Actual', list(y.values) + [None] * h), series(f'Forecast ({best})', [None] * (n - 1) + [y.values[-1]] + list(point), dashed=True)],
                    band={'lo': [None] * n + list(lo), 'hi': [None] * n + list(hi), 'name': '80% range'},
                    marks=[{'index': n + peak, 'label': 'Peak'}] if seasonal else None,
                    zero=True,
                ),
                wide=True,
            ),
            chart(f'Model contest: error on the {test} hidden months (%)', bars(sorted(scores, key=scores.get), [scores[k] * 100 for k in sorted(scores, key=scores.get)], 'num', horizontal=True, tones=['green'] + ['muted'] * (len(scores) - 1))),
        ],
        [
            finding(f'Expected sales over the next {h} months: {f.money(total)}, most likely between {f.money(max(0, total - z * tsd))} and {f.money(total + z * tsd)}.', level_text),
            finding(f'{month_label(future[peak])} should be the strongest month.', 'medium', 'Place stock orders at least one supplier lead time before it.')
            if seasonal
            else finding('With under two years of history the models can’t learn the yearly pattern, so they can’t say which month will peak or allow for seasonal highs and lows.', 'high', 'Ask the client for an earlier year of sales.'),
            finding(f'{best} won the accuracy test with {f.pct(err)} average error on {test} months it had not seen.', 'high')
            if err < 0.2
            else finding(f'Even the best model ({best}) was off by {f.pct(err)} on the {test} months it had not seen: treat these figures as a rough guide only.', 'high', 'Don’t plan stock or budgets on this forecast alone.'),
        ],
        accuracy=f'Each model was fitted without the last {test} months, then compared with what really happened: {best} was off by {f.pct(err)} on average.',
        notes=[] if n >= 24 else ['Under two years of history: no yearly seasonal pattern can be learned, so ranges are wider.'],
    ) | ({'level': 'low'} if err >= 0.2 else {})


def price_whatif(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    x = c.p['x'] / 100
    s = d.sales
    rec = d.recent(365)
    rev = rec['amount'].sum()
    has_cost = rec['cost'].notna().mean() > 0.5
    m = 1 - (rec['cost'] * rec['qty']).sum() / rev if has_cost else c.p['margin'] / 100
    # Elasticity from the business's own price changes: daily units against the price level, on non-promotion days.
    base = s.groupby('product')['price'].median()
    s = s.assign(rel=s['price'] / s['product'].map(base), day=s['date'].dt.normalize())
    dd = s[~s['promo']].groupby('day').agg(units=('qty', 'sum'), rel=('rel', 'mean'))
    dd = dd[dd['units'] > 0]
    e = None
    if len(dd) > 60 and np.log(dd['rel']).std() > 0.02:
        idx = dd.index
        X = pd.DataFrame({'logp': np.log(dd['rel']), 'trend': np.arange(len(dd)) / 365, 'sin': np.sin(2 * np.pi * idx.dayofyear / 365.25), 'cos': np.cos(2 * np.pi * idx.dayofyear / 365.25), **({'ram': in_ramadan(idx).astype(float).values, 'pre': pre_ramadan(idx).astype(float).values} if d.ramadan else {})}, index=idx)
        for k in range(6):
            X[f'wd{k}'] = (idx.dayofweek == k).astype(float)
        X = X.loc[:, X.std() > 0]
        fit = sm.OLS(np.log(dd['units']), sm.add_constant(X)).fit(cov_type='HC3')
        if 'logp' in fit.params and fit.pvalues['logp'] < 0.2:
            e = float(np.clip(fit.params['logp'], -5, 0.5))
    el = e if e is not None else -1.0
    be = x / (m + x)
    vol = (1 + x) ** el - 1
    cost_share = 1 - m

    def profit(k):
        return ((1 + k) ** el * ((1 + k) - cost_share)) / m - 1

    curve = list(range(-20, 31))
    chosen = profit(x)
    findings = [finding(f'A {f.spct(x, 0)} price change pays off as long as sales fall by less than {f.pct(abs(be), 0)}.' if x >= 0 else f'A {f.spct(x, 0)} price cut pays off only if sales rise by more than {f.pct(abs(be), 0)}.', 'high' if has_cost else 'medium')]
    if e is not None:
        findings.append(finding(f'From past price changes, units fall about {abs(el):.1f}% for every 1% price rise (elasticity {el:.2f}).', 'medium', f'Expected profit change at {f.spct(x, 0)}: {f.spct(chosen)}.'))
    else:
        findings.append(finding('Prices haven’t changed enough in this data to measure how customers react.', 'low', 'Run a two-week price test on a few products or one branch before a full change.'))
    notes = [] if has_cost else [f'No costs supplied: margin set to {c.p["margin"]:.0f}% by the analyst.']
    return result(
        [
            kpi('Gross margin today', f.pct(m), None if has_cost else 'analyst estimate'),
            kpi('Sales drop it can survive' if x >= 0 else 'Sales rise it needs', f.pct(abs(be))),
            kpi('Expected change in units', f.spct(vol), f'elasticity {el:.2f}' if e is not None else 'assumed elasticity −1.0'),
            kpi('Expected profit change', f.spct(chosen), tone='good' if chosen >= 0 else 'bad'),
        ],
        [chart('Profit change at each price change (%)', line([f'{k:+d}%' for k in curve], [series('Profit change', [profit(k / 100) * 100 for k in curve])], 'num', marks=[{'index': int(c.p['x']) + 20, 'label': f'{int(c.p["x"]):+d}%', 'tone': 'green' if chosen >= 0 else 'red'}]), wide=True)],
        findings,
        notes=notes,
    )


def ranking(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    r_all = d.recent(365)
    if r_all['product'].nunique() < 3:
        return _customer_ranking(c, r_all)
    r = d.goods(r_all)
    total = r['amount'].sum()
    prod = r.groupby('product').agg(rev=('amount', 'sum'))
    if r['cost'].notna().any():
        prod['profit'] = (r['amount'] - r['cost'] * r['qty']).groupby(r['product']).sum()
    prod = prod.sort_values('rev', ascending=False)
    cum = prod['rev'].cumsum() / total
    prod['cls'] = np.where(cum.shift(fill_value=0) < 0.8, 'A', np.where(cum.shift(fill_value=0) < 0.95, 'B', 'C'))
    cnt = prod['cls'].value_counts()
    # Customer shares are of sales to customers the file names; anonymous sales can't be ranked.
    custs = r_all.groupby('customer')['amount'].sum().sort_values(ascending=False) if r_all['customer'].notna().any() else pd.Series(dtype=float)
    top20 = custs.head(max(1, round(len(custs) * 0.2))).sum() / custs.sum() if len(custs) else np.nan
    unnamed = 1 - custs.sum() / r_all['amount'].sum() if len(custs) else 0.0
    show = prod.head(40)
    tones = ['accent' if c_ == 'A' else 'muted' if c_ == 'B' else 'orange' for c_ in show['cls']]
    rows = [[i, cl, f.money(rw['rev']), f.pct(rw['rev'] / total), f.money(rw['profit']) if 'profit' in prod else '–'] for (i, rw), cl in zip(show.iterrows(), show['cls'])]
    findings = [finding(f'{cnt.get("A", 0)} of {len(prod)} products bring 80% of sales.', 'high', 'Never let these run out; review their prices first.'), finding(f'{cnt.get("C", 0)} products together bring under 5% of sales.', 'high', 'Candidates to drop or sell to order only, freeing cash and shelf space.')]
    if np.isfinite(top20):
        findings.append(finding(f'The top 20% of customers bring {f.pct(top20, 0)} of sales to known customers' + (f' ({f.pct(unnamed, 0)} of sales carry no customer).' if unnamed >= 0.02 else '.'), 'high', 'Look after them: a loyalty offer or a named contact.' if top20 > 0.6 else 'Sales are well spread across customers.'))
    return result(
        [kpi('A products (80% of sales)', f'{cnt.get("A", 0)} of {len(prod)}'), kpi('C products (last 5%)', str(cnt.get('C', 0)), tone='bad' if cnt.get('C', 0) > len(prod) * 0.3 else None), kpi('Top 20% of customers bring', f.pct(top20, 0) if np.isfinite(top20) else '–')],
        [chart('Products by sales, last 12 months (A · B · C)', bars(show.index, show['rev'].values, tones=tones), wide=True), chart(f'Ranking (top {len(show)})', table(['Product', 'Class', 'Sales', 'Share', 'Profit'], rows, [False, False, True, True, True]), wide=True)],
        findings,
    )


def _customer_ranking(c: Ctx, r: pd.DataFrame) -> dict:
    f = c.fmt
    total = r['amount'].sum()
    cust = r.groupby('customer')['amount'].sum().sort_values(ascending=False)
    cum = cust.cumsum() / total
    cls = np.where(cum.shift(fill_value=0) < 0.8, 'A', np.where(cum.shift(fill_value=0) < 0.95, 'B', 'C'))
    cnt = pd.Series(cls).value_counts()
    show = cust.head(30)
    return result(
        [kpi('A customers (80% of sales)', f'{cnt.get("A", 0)} of {len(cust)}'), kpi('Largest customer', f.pct(cust.iloc[0] / total, 1), str(cust.index[0])), kpi('Top 20% of customers bring', f.pct(cust.head(max(1, round(len(cust) * 0.2))).sum() / total, 0))],
        [chart('Customers by sales, last 12 months', bars(show.index, show.values, tones=['accent' if c_ == 'A' else 'muted' if c_ == 'B' else 'orange' for c_ in cls[: len(show)]]), wide=True)],
        [finding(f'{cnt.get("A", 0)} customers bring 80% of sales; the largest alone brings {f.pct(cust.iloc[0] / total, 1)}.', 'high', 'Losing one of the top five would hurt: keep a named contact for each.' if cust.head(5).sum() / total > 0.3 else 'Sales are well spread.')],
        notes=['E-invoices carry no products, so customers are ranked instead.'],
    )


def _croston(y: np.ndarray, alpha: float = 0.1) -> float:
    z = p = None
    q = 1
    for v in y:
        if v > 0:
            if z is None:
                z, p = v, q
            else:
                z = alpha * v + (1 - alpha) * z
                p = alpha * q + (1 - alpha) * p
            q = 1
        else:
            q += 1
    return 0.0 if z is None else z / p


def stock(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    if d.sales['product'].nunique() < 3:
        raise NeedsData('The sales data carries no products (e-invoices list totals only): send a sales list with product codes.')
    window = 180
    s = d.goods(d.sales[d.sales['date'] > d.end - pd.Timedelta(days=window)])
    days = pd.date_range(d.end - pd.Timedelta(days=window - 1), d.end, freq='D')
    pivot = s.groupby([s['product'].astype(str).str.strip().str.lower(), s['date'].dt.normalize()])['qty'].sum().unstack(fill_value=0).reindex(columns=days, fill_value=0)
    st = d.t('stock').copy() if d.has('stock') else None
    if st is not None:
        st['key'] = d.label(st['product']).astype(str).str.strip().str.lower()
        st = st.drop_duplicates('key', keep='last').set_index('key')
    names = s.groupby(s['product'].astype(str).str.strip().str.lower())['product'].first()
    cost = d.products.set_index('key')['cost'] if len(d.products) else pd.Series(dtype=float)
    z = norm.ppf(c.p['service'] / 100)
    rows = []
    for key, y in pivot.iterrows():
        y = y.values.astype(float)
        slow = (y > 0).mean() < 1 / 3
        mu = _croston(y) if slow else y.mean()
        sigma = y.std(ddof=1)
        lead = c.p['lead']
        on = np.nan
        if st is not None and key in st.index:
            on = float(st.loc[key, 'on_hand'])
            if 'lead_days' in st and pd.notna(st.loc[key, 'lead_days']):
                lead = float(st.loc[key, 'lead_days'])
        safety = z * sigma * np.sqrt(lead)
        rop = mu * lead + safety
        cover = on / mu if mu > 0 and np.isfinite(on) else np.inf
        if not np.isfinite(on):
            status = 'No stock count'
        elif on <= rop:
            status = 'Order now'
        elif on <= rop + mu * 14:
            status = 'Order within 2 weeks'
        elif cover > 150:
            status = 'Overstocked'
        else:
            status = 'OK'
        qty = max(0, round(mu * (lead + 30) + safety - (on if np.isfinite(on) else 0)))
        rows.append({'name': names.get(key, key), 'on': on, 'mu': mu, 'lead': lead, 'rop': rop, 'cover': cover, 'status': status, 'qty': qty, 'slow': slow, 'tied': max(0, on - mu * 90) * cost.get(key, np.nan) if np.isfinite(on) else np.nan})
    if not rows:
        raise NeedsData('No product sold in the last six months.')
    rank = {'Order now': 0, 'Order within 2 weeks': 1, 'Overstocked': 2, 'OK': 3, 'No stock count': 4}
    rows.sort(key=lambda r: (rank[r['status']], r['cover'], -r['mu']))
    cnt = pd.Series([r['status'] for r in rows]).value_counts()
    tied = np.nansum([r['tied'] for r in rows if r['status'] == 'Overstocked'])
    tone = {'Order now': 'red', 'Order within 2 weeks': 'amber', 'Overstocked': 'orange'}
    show = rows[:40]
    table_rows = [[r['name'] + (' *' if r['slow'] else ''), f.num(r['on']) if np.isfinite(r['on']) else '–', f'{r["mu"]:.1f}', f'{r["lead"]:.0f} d', f.num(np.ceil(r['rop'])), f.num(r['cover']) if np.isfinite(r['cover']) else '–', r['status'], f.num(r['qty']) if r['qty'] else '–'] for r in show]
    now_ = [r['name'] for r in rows if r['status'] == 'Order now']
    findings = []
    if st is None:
        findings.append(finding('No stock count was sent, so reorder points are shown but not what to order.', 'medium', 'Ask the client for a current stock count.'))
    elif now_:
        findings.append(finding(f'{len(now_)} products are at or below their reorder point: {", ".join(now_[:3])}{"…" if len(now_) > 3 else ""}.', c.level, 'Place these orders this week.'))
    else:
        findings.append(finding('No product is below its reorder point.', 'high'))
    if cnt.get('Overstocked', 0):
        findings.append(finding(f'{cnt["Overstocked"]} products have more than five months of stock.', 'high', f'About {f.money(tied)} of cash is tied up; pause their orders.' if tied else 'Pause their orders.'))
    notes = ['* Slow seller: demand estimated with Croston’s method.']
    if st is None or 'lead_days' not in st:
        notes.append(f'Supplier lead time not supplied: {c.p["lead"]:.0f} days assumed.')
    return result(
        [kpi('Order now', str(cnt.get('Order now', 0)), tone='bad' if cnt.get('Order now', 0) else 'good'), kpi('Order within 2 weeks', str(cnt.get('Order within 2 weeks', 0))), kpi('Overstocked', str(cnt.get('Overstocked', 0)), f.money(tied) + ' tied up' if tied else None), kpi('Service level', f'{c.p["service"]:.0f}%', 'chance of no stock-out')],
        [chart(f'Reorder plan (most urgent {len(show)} of {len(rows)})', table(['Product', 'On hand', 'Sells a day', 'Lead time', 'Reorder at', 'Days of cover', 'Status', 'Order qty'], table_rows, [False, True, True, True, True, True, False, True], [tone.get(r['status']) for r in show]), wide=True)],
        findings,
        notes=notes,
    )


def _no_cost(d, level):
    if d.sales['cost'].notna().mean() < 0.5:
        return ('low', 'Sales can’t be matched to product costs: margin is the analyst’s estimate.')
    return None


SERVICES = [
    Service(
        'sales-forecast-3-to-12-months',
        'sales',
        'Sales forecast, 3 to 12 months',
        [['sales'], ['einv']],
        forecast,
        params=[Param('h', 'Months ahead', 3, 12, 1, 6)],
        adjust=lambda d, l: ('medium', 'Under two years of history: no seasonal model, wider ranges.') if len(d.monthly) < 24 else None,
        preview='A contest between ETS, ARIMA, Theta, seasonal naive and a regression that follows the moving Ramadan calendar; each is tested on the last months it never saw and the most accurate one is used. Prophet and Chronos join the contest in a later version.',
    ),
    Service('price-change-what-if', 'sales', 'Price change what-if', [['cost', 'sales'], ['cost', 'einv']], price_whatif, medium=[['sales']], params=[Param('x', 'Price change', -20, 30, 1, 8, 'pct'), Param('margin', 'Gross margin if costs are unknown', 5, 90, 1, 35, 'pct')], adjust=_no_cost),
    Service('product-and-customer-ranking', 'sales', 'Product and customer ranking', [['sales']], ranking, medium=[['einv']]),
    Service('stock-reorder-plan', 'sales', 'Stock reorder plan', [['stock', 'sales'], ['stock', 'einv']], stock, medium=[['sales'], ['einv']], params=[Param('lead', 'Supplier lead time if not in the file (days)', 3, 120, 1, 30), Param('service', 'Service level', 80, 99, 1, 95, 'pct')], preview='Reorder point with safety stock at the chosen service level; Croston’s method for products that sell on fewer than a third of days.'),
]
