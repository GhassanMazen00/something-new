"""Data analysis: seven services."""

from __future__ import annotations

import numpy as np
import pandas as pd
import statsmodels.api as sm
from statsmodels.tsa.seasonal import STL

from .calendar import covers_ramadan, in_ramadan, pre_ramadan
from .core import Ctx, NeedsData, Service, bars, chart, finding, kpi, line, month_label, result, series, table

DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


def health_check(c: Ctx) -> dict:
    files = c.client.get('files', [])
    rows, findings, scores = [], [], []
    for f in files:
        h = f.get('health') or {}
        issues = h.get('issues', [])
        scores.append(h.get('score', 100))
        rows.append([f['name'], f.get('kind_label', f.get('kind', '')), f"{h.get('rows_in', f.get('rows', 0)):,}", f"{h.get('rows_out', f.get('rows', 0)):,}", ' · '.join(issues) or 'No problems found'])
        if h.get('duplicates', 0) > 0:
            findings.append(finding(f"{f['name']}: {h['duplicates']:,} rows appear twice.", 'high', 'Removed before analysis. Ask the client whether their system posts lines twice.'))
    d = c.data
    # Checks across files.
    if d.has('payroll') and d.has('staff'):
        unknown = set(d.t('payroll')['employee_id'].astype(str)) - set(d.t('staff')['employee_id'].astype(str))
        if unknown:
            findings.append(finding(f'{len(unknown)} {"person is" if len(unknown) == 1 else "people are"} paid but not on the staff list.', 'high', 'Flagged for the payroll error scan.'))
    if d.has('einv'):
        nums = pd.to_numeric(d.t('einv')['invoice_no'].astype(str).str.extract(r'(\d+)$')[0], errors='coerce').dropna().astype(int).sort_values().unique()
        if len(nums) > 10:
            gaps = int(np.clip(np.diff(nums) - 1, 0, 50).sum())
            if gaps:
                findings.append(finding(f'{gaps:,} invoice numbers are missing from the sequence.', 'high', 'Ask for the cancelled-invoice log; unexplained gaps are a tax-audit risk.'))
    score = int(np.average(scores, weights=[max(1, f.get('rows', 1)) for f in files])) if files else 0
    findings.insert(0, finding(f'Data quality score: {score} out of 100.' + (' The files are in good shape.' if score >= 85 else ' Several files need attention before results can be trusted fully.'), 'high', 'Every fix below is applied automatically and listed in the report appendix.'))
    return result(
        [kpi('Health score', f'{score} / 100', tone='good' if score >= 85 else 'bad'), kpi('Files checked', str(len(files))), kpi('Rows checked', f"{sum((f.get('health') or {}).get('rows_in', f.get('rows', 0)) for f in files):,}"), kpi('Files with problems', str(sum(1 for r in rows if r[4] != 'No problems found')))],
        [chart('File by file', table(['File', 'Type', 'Rows in', 'Clean rows', 'What we found'], rows, [False, False, True, True, False]), wide=True)],
        findings,
    )


def snapshot(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    m = d.monthly
    if len(m) < 2:
        raise NeedsData('Less than two full months of sales.')
    recent = d.recent(365)
    last12 = recent['amount'].sum()
    prev = d.sales[(d.sales['date'] <= d.end - pd.Timedelta(days=365)) & (d.sales['date'] > d.end - pd.Timedelta(days=730))]['amount'].sum()
    has_prev = (d.end - d.sales['date'].min()).days >= 700
    orders = recent['order_id'].nunique()
    custs = recent['customer'].nunique() if recent['customer'].notna().any() else None
    prod = recent.groupby('product')['amount'].sum().sort_values(ascending=False)
    top5 = prod.head(5)
    share5 = top5.sum() / last12
    charts = [
        chart('Monthly sales', line([month_label(p) for p in m.index], [series('Sales', m.values)], zero=True), wide=True),
        chart('Top products, last 12 months', bars(top5.index, top5.values, horizontal=True)),
    ]
    findings = []
    if has_prev and prev > 0:
        findings.append(finding(f'Sales {"grew" if last12 >= prev else "fell"} {f.spct(last12 / prev - 1)} over the last 12 months.', 'high'))
    findings.append(finding(f'Five products bring {f.pct(share5, 0)} of sales, led by {top5.index[0]}.', 'high', 'Keep these in stock first; they carry the business.'))
    if recent['branch'] is not None and recent['branch'].nunique() > 1:
        br = recent.groupby('branch')['amount'].sum().sort_values(ascending=False)
        charts.append(chart('Sales by branch, last 12 months', bars(br.index, br.values, horizontal=True, tones=['orange' if i == len(br) - 1 else 'accent' for i in range(len(br))])))
        findings.append(finding(f'{br.index[0]} sells the most; {br.index[-1]} the least ({f.pct(br.iloc[-1] / last12, 0)} of sales).', 'medium', 'See branch benchmarking for a fair comparison by size.'))
    elif custs:
        top = recent.groupby('customer')['amount'].sum().sort_values(ascending=False).head(6)
        charts.append(chart('Top customers, last 12 months', bars(top.index, top.values, horizontal=True)))
    return result(
        [
            kpi('Sales, last 12 months', f.money(last12), f'{f.spct(last12 / prev - 1)} on the year before' if has_prev and prev > 0 else f'{len(m)} full months of data', 'good' if has_prev and last12 >= prev else None),
            kpi('Orders', f.num(orders)),
            kpi('Average order', f.money(last12 / max(orders, 1))),
            kpi('Customers', f.num(custs) if custs else '–'),
        ],
        charts,
        findings,
    )


def cleaning(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    files = c.client.get('files', [])
    steps = []
    for fl in files:
        h = fl.get('health') or {}
        for issue in h.get('issues', []):
            steps.append([fl['name'], issue])
    _ = d.sales_all if (d.has('sales') or d.has('einv')) else None
    ledger_groups = []
    if d.has('ledger'):
        from .core import canonical_names

        _, ledger_groups = canonical_names(d.t('ledger')['party'])
    groups = d.merges.get('customer', []) + ledger_groups
    examples = [[' · '.join(g[1:4]) + (' …' if len(g) > 4 else ''), g[0], str(len(g))] for g in sorted(groups, key=len, reverse=True)[:10]]
    rows_in = sum(fl.get('health', {}).get('rows_in', fl.get('rows', 0)) for fl in files)
    rows_out = sum(fl.get('health', {}).get('rows_out', fl.get('rows', 0)) for fl in files)
    charts = [chart('What was fixed', table(['File', 'Fix'], steps or [['All files', 'Nothing needed fixing']]), wide=True)]
    if examples:
        charts.append(chart('Names merged (examples)', table(['Typed as', 'Merged into', 'Spellings'], examples, [False, False, True]), wide=True))
    findings = [finding(f'{rows_in:,} rows in, {rows_out:,} clean rows out, across {len(files)} files.', 'high', 'The clean tables are what every other service uses.')]
    if groups:
        findings.append(finding(f'{len(groups)} names were typed in more than one way and are now merged.', 'high', 'Customer and supplier totals and rankings are now correct.'))
    return result(
        [kpi('Rows in', f.num(rows_in)), kpi('Clean rows out', f.num(rows_out)), kpi('Fixes applied', str(len(steps))), kpi('Names merged', str(len(groups)))],
        charts,
        findings,
    )


def kpi_dashboard(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    s = d.sales
    per = s.groupby(s['date'].dt.to_period('M')).agg(rev=('amount', 'sum'), orders=('order_id', 'nunique'), custs=('customer', 'nunique'))
    per['cost'] = (s['cost'] * s['qty']).groupby(s['date'].dt.to_period('M')).sum(min_count=1)
    per = per.loc[d.monthly.index.intersection(per.index)]
    if len(per) < 3:
        raise NeedsData('Fewer than three full months.')
    n = len(per)
    growth = per['rev'].iloc[-12:].sum() / per['rev'].iloc[-24:-12].sum() if n >= 24 else 1.1
    target = [per['rev'].iloc[i - 12] * growth if i >= 12 else None for i in range(n)]
    labels = [month_label(p) for p in per.index]
    has_cost = per['cost'].notna().any()
    rows = []
    for k in range(max(0, n - 6), n):
        r = per.iloc[k]
        t = target[k]
        rows.append([labels[k], f.money(r['rev']), f.pct((r['rev'] - r['cost']) / r['rev']) if has_cost and pd.notna(r['cost']) else '–', f.num(r['orders']), f.money(r['rev'] / max(r['orders'], 1)), f.spct(r['rev'] / t - 1) if t else '–'])
    last = per.iloc[-1]
    lt = target[-1]
    hit = sum(1 for k in range(max(0, n - 6), n) if target[k] and per['rev'].iloc[k] >= target[k])
    return result(
        [
            kpi(f'Sales, {labels[-1]}', f.money(last['rev']), f'{f.spct(last["rev"] / lt - 1)} vs target' if lt else None, ('good' if last['rev'] >= lt else 'bad') if lt else None),
            kpi('Gross margin', f.pct((last['rev'] - last['cost']) / last['rev']) if has_cost and pd.notna(last['cost']) else '–', None if has_cost else 'needs costs'),
            kpi('Orders', f.num(last['orders'])),
            kpi('Targets met, last 6 months', f'{hit} of {min(6, sum(1 for t in target[-6:] if t))}' if lt else '–', tone=('good' if hit >= 4 else 'bad') if lt else None),
        ],
        [
            chart('Sales against suggested target', line(labels, [series('Sales', per['rev'].values), series('Target', target, 'muted', True)], zero=True), wide=True),
            chart('Last six months', table(['Month', 'Sales', 'Margin', 'Orders', 'Avg order', 'vs target'], rows, [False, True, True, True, True, True]), wide=True),
        ],
        [
            finding(f'Suggested target: the same month last year plus {f.spct(growth - 1, 0)}, the business’s own growth.', 'high' if n >= 24 else 'medium', 'Agree targets with the client; the dashboard refreshes every month.'),
            finding(f'Targets met in {hit} of the last 6 months.' if lt else 'Targets start once there are 13 months of data.', 'high'),
        ],
    )


def trends(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    m = d.monthly
    if len(m) < 6:
        raise NeedsData('Fewer than six full months.')
    labels = [month_label(p) for p in m.index]
    if len(m) >= 24:
        stl = STL(m.values, period=12, robust=True).fit()
        trend = stl.trend
        method = 'STL decomposition'
    else:
        trend = m.rolling(3, center=True).mean().values
        method = '3-month moving average'
    daily = d.daily
    avg = daily.mean()
    wd = [daily[daily.index.dayofweek == k].mean() / avg for k in range(7)]
    cal = [daily[daily.index.month == k + 1].mean() / avg if (daily.index.month == k + 1).any() else 0 for k in range(12)]
    order = sorted([(v, k) for k, v in enumerate(cal) if v > 0], reverse=True)
    best_days = sorted([(v, k) for k, v in enumerate(wd)], reverse=True)
    kpis = [kpi('Strongest month', MONTHS[order[0][1]], f'{f.spct(order[0][0] - 1, 0)} on an average month'), kpi('Weakest month', MONTHS[order[-1][1]], f.spct(order[-1][0] - 1, 0))]
    findings = []
    if best_days[0][0] > 1.05:
        findings.append(finding(f'{DAYS[best_days[0][1]]} and {DAYS[best_days[1][1]]} are the busiest days: {f.spct(best_days[0][0] - 1, 0)} and {f.spct(best_days[1][0] - 1, 0)} on an average day.', 'high', 'Put the strongest staff and the stock on these days.'))
    else:
        findings.append(finding('There is no real weekday pattern: every day sells about the same.', 'high'))
    if d.ramadan and covers_ramadan(daily.index.min(), daily.index.max()):
        ram = in_ramadan(daily.index)
        pre = pre_ramadan(daily.index)
        other = daily[~ram.values & ~pre.values].mean()
        r_eff, p_eff = daily[ram.values].mean() / other - 1, daily[pre.values].mean() / other - 1
        kpis += [kpi('Two weeks before Ramadan', f.spct(p_eff, 0), tone='good' if p_eff > 0 else 'bad'), kpi('During Ramadan', f.spct(r_eff, 0), tone='good' if r_eff > 0 else 'bad')]
        findings.append(finding(f'Sales change {f.spct(p_eff, 0)} in the two weeks before Ramadan and {f.spct(r_eff, 0)} during it.', 'high', 'Order stock and plan campaigns six weeks ahead of Ramadan.'))
    findings.append(finding(f'{MONTHS[order[0][1]]} is the strongest month and {MONTHS[order[-1][1]]} the weakest.', 'high' if len(m) >= 24 else 'medium'))
    return result(
        kpis,
        [
            chart('Monthly sales and underlying trend', line(labels, [series('Sales', m.values, 'muted'), series(f'Trend ({method})', trend)], zero=True), wide=True),
            chart('Day of the week (100 = average day)', bars(DAYS, [v * 100 for v in wd], 'num', ref={'value': 100, 'label': 'Average'})),
            chart('Month of the year (100 = average)', bars(MONTHS, [v * 100 for v in cal], 'num', ref={'value': 100, 'label': 'Average'})),
        ],
        findings,
    )


def drivers(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    s = d.sales
    days = d.daily.index
    daily = d.daily
    open_ = daily > 0
    base = s.groupby('product')['price'].median()
    s_rel = s['price'] / s['product'].map(base)
    price_idx = s_rel.groupby(s['date'].dt.normalize()).mean().reindex(days)
    promo = s.groupby(s['date'].dt.normalize())['promo'].max().astype(float).reindex(days).fillna(0.0)
    cands = {
        f'Weekend ({DAYS[d.weekend[0]][:3]}–{DAYS[d.weekend[-1]][:3]})': pd.Series(days.dayofweek.isin(d.weekend).astype(float), index=days),
        DAYS[(d.weekend[0] - 1) % 7]: pd.Series((days.dayofweek == (d.weekend[0] - 1) % 7).astype(float), index=days),
        'Promotion running': promo,
        **({'Two weeks before Ramadan': pre_ramadan(days).astype(float), 'During Ramadan': in_ramadan(days).astype(float)} if d.ramadan else {}),
        'Price level (+10%)': ((price_idx - 1) * 10).fillna(0),
        'Growth per month': pd.Series(np.arange(len(days)) / 30.4, index=days),
        'Season (yearly cycle)': pd.Series(np.sin(2 * np.pi * days.dayofyear / 365.25), index=days),
    }
    X = pd.DataFrame(cands)[open_]
    keep = []
    for col in X:
        v = X[col]
        if v.nunique() < 2:
            continue
        if any(abs(np.corrcoef(v, X[k])[0, 1]) > 0.85 for k in keep):
            continue
        keep.append(col)
    y = daily[open_]
    model = sm.OLS(y, sm.add_constant(X[keep])).fit(cov_type='HC3')
    eff = [(k, model.params[k], model.pvalues[k] < 0.05) for k in keep]
    eff.sort(key=lambda e: -abs(e[1]))
    findings = []
    if model.rsquared < 0.3:
        findings.append(finding(f'Calendar and price explain only {f.pct(model.rsquared, 0)} of the day-to-day swings: sales here depend on when customers order, not on the day.', 'medium', 'Look at customer-level drivers instead (account watch, customer groups).'))
    for name, b, sig in eff[:4]:
        unit = 'a day' + (' per 10% higher prices' if name.startswith('Price') else ' per month of growth' if name.startswith('Growth') else '')
        findings.append(finding(f'{name}: {"+" if b >= 0 else "−"}{f.money(abs(b))} {unit}.', 'high' if sig else 'low'))
    return result(
        [kpi('Explained by these factors', f.pct(model.rsquared, 0), 'R² on daily sales'), kpi('Biggest driver', eff[0][0]), kpi('Days analysed', f.num(len(y)))],
        [chart('Effect on daily sales', bars([e[0] for e in eff], [e[1] for e in eff], horizontal=True, tones=['muted' if not e[2] else 'green' if e[1] >= 0 else 'red' for e in eff]))],
        findings,
        notes=['Grey bars are not statistically clear (p ≥ 0.05, robust standard errors): treat as noise.'],
    )


def benchmarking(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    recent = d.recent(365)
    if recent['branch'] is not None and recent['branch'].nunique() > 1:
        by = recent.groupby('branch')['amount'].sum()
        info = d.t('branches').copy() if d.has('branches') else pd.DataFrame({'branch': by.index})
        info['branch'] = info['branch'].astype(str).str.strip()
        rows = []
        key = {str(b).strip().lower(): b for b in by.index}
        for _, r in info.iterrows():
            b = key.get(str(r['branch']).strip().lower())
            if b is None:
                continue
            sqm = r.get('area_sqm', np.nan)
            staff = r.get('staff', np.nan)
            rows.append({'name': r['branch'], 'rev': by[b], 'sqm': sqm, 'staff': staff, 'per_sqm': by[b] / sqm if sqm and sqm > 0 else np.nan, 'per_staff': by[b] / staff if staff and staff > 0 else np.nan})
        if not rows:
            rows = [{'name': b, 'rev': v, 'sqm': np.nan, 'staff': np.nan, 'per_sqm': np.nan, 'per_staff': np.nan} for b, v in by.items()]
        df = pd.DataFrame(rows)
        metric = 'per_sqm' if df['per_sqm'].notna().sum() >= 2 else 'per_staff' if df['per_staff'].notna().sum() >= 2 else 'rev'
        label = {'per_sqm': 'per m²', 'per_staff': 'per person', 'rev': 'in total'}[metric]
        df = df.sort_values(metric, ascending=False)
        avg = df[metric].mean()
        worst, best = df.iloc[-1], df.iloc[0]
        tbl = [[r['name'], f.money(r['rev']), f.num(r['sqm']) if pd.notna(r['sqm']) else '–', f.money(r['per_sqm']) if pd.notna(r['per_sqm']) else '–', f.num(r['staff']) if pd.notna(r['staff']) else '–', f.money(r['per_staff']) if pd.notna(r['per_staff']) else '–'] for _, r in df.iterrows()]
        notes = [] if metric == 'per_sqm' else ['No branch sizes: branches compared ' + label + '. Send branch areas for a fair comparison.']
        return result(
            [kpi(f'Best {label}', str(best['name']), f.money(best[metric]) + ' a year'), kpi(f'Weakest {label}', str(worst['name']), f'{f.pct(worst[metric] / avg, 0)} of average', 'bad'), kpi(f'Average {label}', f.money(avg))],
            [
                chart(f'Sales {label}, last 12 months (100 = average)', bars(df['name'], (df[metric] / avg * 100).values, 'num', ref={'value': 100, 'label': 'Average'}, tones=['orange' if v / avg < 0.75 else 'accent' for v in df[metric]])),
                chart('Branch comparison', table(['Branch', 'Sales', 'Area m²', 'Per m²', 'Staff', 'Per person'], tbl, [False, True, True, True, True, True])),
            ],
            [finding(f'{worst["name"]} sells {f.pct(1 - worst[metric] / avg, 0)} less {label} than the average branch.', 'high' if metric == 'per_sqm' else 'medium', 'Find out why before opening another branch: location, layout or staffing.'), finding(f'{best["name"]} is the model branch.', 'high')],
            notes=notes,
        )
    if recent['product'].nunique() < 3:
        raise NeedsData('No branches and no products to compare (e-invoices carry neither): send a sales list with products or branch details.')
    g = recent.groupby('product').agg(rev=('amount', 'sum'), units=('qty', 'sum'))
    has_cost = recent['cost'].notna().any()
    if has_cost:
        g['margin'] = 1 - (recent['cost'] * recent['qty']).groupby(recent['product']).sum() / g['rev']
    g = g.sort_values('rev', ascending=False).head(25)
    low = g['margin'].idxmin() if has_cost else None
    return result(
        [kpi('Products compared', str(len(g))), kpi('Average margin', f.pct(g['margin'].mean()) if has_cost else '–'), kpi('Lowest margin', str(low) if low is not None else '–', f.pct(g.loc[low, 'margin']) if low is not None else 'needs costs', 'bad' if low is not None else None)],
        [chart('Products, last 12 months', table(['Product', 'Sales', 'Units', 'Margin'], [[i, f.money(r['rev']), f.num(r['units']), f.pct(r['margin']) if has_cost else '–'] for i, r in g.iterrows()], [False, True, True, True]), wide=True)],
        [finding(f'{low} has the thinnest margin, {f.pct(g.loc[low, "margin"])}.', 'medium', 'Check its price and cost first in the price what-if.') if low is not None else finding('Without costs, products are compared on sales only.', 'medium')],
        notes=['No branch data: products are compared instead of branches.'],
    )


SERVICES = [
    Service('data-health-check', 'data', 'Data health check', [['sales'], ['einv'], ['ledger'], ['bank'], ['payroll'], ['staff'], ['ads'], ['pnl'], ['cost'], ['stock'], ['unpaid'], ['bills']], health_check),
    Service('business-snapshot', 'data', 'Business snapshot', [['sales']], snapshot, medium=[['einv']]),
    Service('data-cleaning-and-merging', 'data', 'Data cleaning and merging', [['sales'], ['einv'], ['ledger']], cleaning),
    Service('kpi-dashboard', 'data', 'KPI dashboard', [['sales', 'pnl'], ['sales', 'cost']], kpi_dashboard, medium=[['sales'], ['einv']]),
    Service('trends-and-seasonality', 'data', 'Trends and seasonality', [['sales']], trends, medium=[['einv']], adjust=lambda d, l: ('medium', 'Under two years of data: monthly pattern from one or two seasons only.') if len(d.monthly) < 24 else None),
    Service('driver-analysis', 'data', 'Driver analysis', [['sales']], drivers, medium=[['einv']], preview='Multiple regression on daily sales with robust standard errors; each factor’s contribution is exact for a linear model, which is what SHAP reduces to here.'),
    Service('branch-and-product-benchmarking', 'data', 'Branch and product benchmarking', [['sales', 'branches']], benchmarking, medium=[['sales'], ['einv']]),
]

