"""Market research: five services. Market size and conditions run on the analyst's own inputs, which the
report cites; trends, competitors and the price survey read files the analyst or client provides."""

from __future__ import annotations

import numpy as np
import pandas as pd
from statsmodels.tsa.seasonal import STL

from .core import Ctx, Data, NeedsData, Param, Service, bars, chart, finding, kpi, line, result, series, table

MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


def market_size(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    tam = c.p['buyers'] * 1e6 * c.p['spend']
    sam = tam * c.p['reach'] / 100
    ours = d.recent(365)['amount'].sum() if (d.has('sales') or d.has('einv')) else np.nan
    share = ours / sam if np.isfinite(ours) and sam else np.nan
    som = sam * c.p['target'] / 100
    labels = ['Total market', 'Reachable market', 'Realistic target'] + (['Client today'] if np.isfinite(ours) else [])
    vals = [tam, sam, som] + ([ours] if np.isfinite(ours) else [])
    return result(
        [kpi('Total market (TAM)', f.money(tam)), kpi('Reachable market (SAM)', f.money(sam)), kpi('Client’s share today', f.pct(share, 1) if np.isfinite(share) else '–', f.money(ours) if np.isfinite(ours) else 'no sales file'), kpi('Realistic in 3 years (SOM)', f.money(som))],
        [chart('Market funnel', bars(labels, vals, horizontal=True, tones=['muted', 'accent', 'green', 'amber'][: len(vals)]))],
        [
            finding(f'The client holds about {f.pct(share, 1)} of the market it can reach.', 'medium', 'Plenty of room to grow in the current market.' if share < 0.05 else 'Growth will need new areas or price ranges.') if np.isfinite(share) else finding(f'The reachable market is worth about {f.money(sam)} a year.', 'medium'),
            finding('Sized top-down (buyers × yearly spend). Check it bottom-up with outlets × average sales before quoting it.', 'medium'),
        ],
        notes=['Every input above is set by the analyst. Cite the source for each one in the report (CAPMAS, World Bank, industry body).'],
    )


def demand_trends(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    t = d.t('trends').sort_values('date')
    t = t.groupby('date', as_index=False)['interest'].mean()
    s = t.set_index('date')['interest'].astype(float)
    freq = 'W' if s.index.to_series().diff().dt.days.median() < 20 else 'M'
    period = 52 if freq == 'W' else 12
    if len(s) < period * 2:
        raise NeedsData('Needs at least two years of search interest.')
    trend = STL(s.values, period=period, robust=True).fit().trend
    last, prev = s.iloc[-period:].mean(), s.iloc[-2 * period : -period].mean()
    yoy = last / prev - 1 if prev else np.nan
    by_month = s.groupby(s.index.month).mean()
    peak_m = int(by_month.idxmax())
    low_m = int(by_month.idxmin())
    return result(
        [kpi('Interest, last 12 months', f.spct(yoy), 'vs the year before', 'good' if yoy > 0 else 'bad'), kpi('Peak month', MONTHS[peak_m - 1], f'{f.spct(by_month.max() / by_month.mean() - 1, 0)} on average'), kpi('Quietest month', MONTHS[low_m - 1])],
        [chart('Search interest (100 = peak)', line([x.strftime('%b %y') for x in s.index], [series('Interest', s.values, 'muted'), series('Trend', trend)], 'num'), wide=True), chart('Average by month', bars(MONTHS, [by_month.get(m, np.nan) for m in range(1, 13)], 'num'))],
        [finding(f'Interest is {"rising" if yoy >= 0 else "falling"}: {f.spct(yoy)} on the year before.', 'medium'), finding(f'Demand peaks in {MONTHS[peak_m - 1]} and is lowest in {MONTHS[low_m - 1]}.', 'medium', 'Start campaigns three to four weeks before the peak, when attention is cheaper.')],
        notes=['Search interest shows attention, not sales: confirm with the client’s own sales trend.'],
    )


def competitors(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    t = d.t('competitors').copy()
    t['key'] = t['product'].astype(str).str.strip().str.lower()
    ours = t.groupby('key')['our_price'].first() if 'our_price' in t and t['our_price'].notna().any() else d.products.set_index('key')['price'] if len(d.products) else pd.Series(dtype=float)
    t['ours'] = t['key'].map(ours)
    priced = t.dropna(subset=['ours'])
    if priced.empty:
        raise NeedsData('Add “our price” to the competitor sheet, or upload the client’s price list.')
    priced = priced[(priced['price'] > 0) & (priced['ours'] > 0)]
    if priced.empty:
        raise NeedsData('No product has both a competitor price and our price above zero.')
    idx = (priced['ours'] / priced['price']).groupby(priced['competitor']).mean() * 100
    avg_gap = priced['ours'].sum() / priced['price'].sum() - 1
    pivot = priced.pivot_table(index='product', columns='competitor', values='price', aggfunc='mean')
    pivot.insert(0, 'Client', priced.groupby('product')['ours'].first())
    charts = [chart('Price index (competitor = 100; above 100 means the client is dearer)', bars(idx.index, idx.values, 'num', ref={'value': 100, 'label': 'Same price'}, tones=['orange' if v > 105 else 'green' if v < 95 else 'accent' for v in idx.values])), chart('Price check', table(['Product'] + list(pivot.columns), [[i] + [f.money(v, exact=True) if pd.notna(v) else '–' for v in r] for i, r in pivot.head(20).iterrows()], [False] + [True] * len(pivot.columns)), wide=True)]
    findings = [finding(f'The client is {f.pct(abs(avg_gap), 0)} {"dearer" if avg_gap > 0 else "cheaper"} than competitors on matching products.', 'high' if len(priced) >= 15 else 'medium')]
    if 'complaint' in t and t['complaint'].notna().any():
        comp = t['complaint'].dropna().str.strip().str.capitalize().value_counts()
        charts.append(chart('What competitors’ customers complain about', bars(comp.index[:6], comp.values[:6], 'num', horizontal=True)))
        findings.append(finding(f'“{comp.index[0]}” is the most common complaint about competitors.', 'medium', 'Promise and advertise exactly what they fail at.'))
    return result([kpi('Client vs market', f.spct(avg_gap), 'on matching products'), kpi('Competitors compared', str(t['competitor'].nunique())), kpi('Products matched', str(priced['key'].nunique()))], charts, findings)


def price_survey(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    a = d.t('custsurvey')
    lo, hi = a[['too_cheap', 'cheap']].min().min(), a[['expensive', 'too_expensive']].max().max()
    prices = np.linspace(lo, hi, 80)
    too_cheap = np.array([(a['too_cheap'] >= p).mean() for p in prices])
    not_cheap = np.array([(a['cheap'] < p).mean() for p in prices])
    not_exp = np.array([(a['expensive'] > p).mean() for p in prices])
    too_exp = np.array([(a['too_expensive'] <= p).mean() for p in prices])

    def cross(u, v):
        diff = u - v
        i = np.where(np.diff(np.sign(diff)) != 0)[0]
        return float(prices[i[0] + 1]) if len(i) else float('nan')

    pmc, pme, opp = cross(too_cheap, not_cheap), cross(too_exp, not_exp), cross(too_cheap, too_exp)
    current = c.p['current']
    inside = pmc <= current <= pme if current else None
    return result(
        [kpi('Acceptable price range', f'{f.money(pmc, exact=True)} – {f.money(pme, exact=True)}'), kpi('Optimal price point', f.money(opp, exact=True)), kpi('Price today', f.money(current, exact=True) if current else '–', tone=('good' if inside else 'bad') if current else None), kpi('Answers', f.num(len(a)))],
        [chart('Van Westendorp price test (% of answers)', line([f'{p:,.0f}' for p in prices], [series('Too cheap', too_cheap * 100, 'muted', True), series('Not cheap', not_cheap * 100, 'green'), series('Not expensive', not_exp * 100), series('Too expensive', too_exp * 100, 'red', True)], 'num', marks=[{'index': int(np.argmin(abs(prices - pmc))), 'label': 'Lowest', 'tone': 'amber'}, {'index': int(np.argmin(abs(prices - pme))), 'label': 'Highest', 'tone': 'amber'}]), wide=True)],
        [finding(f'Customers find {f.money(pmc, exact=True)} to {f.money(pme, exact=True)} acceptable.', 'high' if len(a) >= 300 else 'medium')] + ([finding(f'Today’s price of {f.money(current, exact=True)} is {"inside" if inside else "outside"} that range.', 'high', None if inside else 'Reprice before the next campaign.')] if current else []),
        accuracy=f'{len(a):,} answers: margin of error about ±{98 / np.sqrt(len(a)):.0f} points on each curve.',
    )


def conditions(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    if not (d.has('sales') or d.has('einv')) or d.sales['cost'].notna().mean() < 0.5:
        gm = c.p['margin'] / 100
        imp = c.p['imported'] / 100
        est = True
    else:
        r = d.recent(365)
        gm = 1 - (r['cost'] * r['qty']).sum() / r['amount'].sum()
        imp_by = r['product'].astype(str).str.strip().str.lower().map(d.products.set_index('key')['imported']) if len(d.products) else pd.Series(np.nan, index=r.index)
        imp = float(((r['cost'] * r['qty'] * imp_by.fillna(c.p['imported'] / 100)).sum()) / (r['cost'] * r['qty']).sum())
        est = imp_by.isna().mean() > 0.5
    scen = [('Calm', c.p['infl'] * 0.7, 1.0), ('Base', c.p['infl'], 1 + c.p['dev'] / 100 / 2), ('Shock', c.p['infl'] * 1.7, 1 + c.p['dev'] / 100 * 1.5)]
    out = []
    for name, infl, fxm in scen:
        cost_up = imp * (fxm - 1) + (1 - imp) * infl / 100
        out.append((name, infl, fxm, 1 - (1 - gm) * (1 + cost_up)))
    return result(
        [kpi(f'{n} scenario', f.pct(m), f'margin · {i:.0f}% inflation · currency {f.spct(x - 1, 0)}', 'bad' if m < gm - 0.05 else None) for n, i, x, m in out],
        [chart('Gross margin under each scenario (%)', bars([o[0] for o in out], [o[3] * 100 for o in out], 'num', ref={'value': gm * 100, 'label': 'Today'}, tones=['red' if o[3] < gm - 0.05 else 'amber' if o[3] < gm else 'green' for o in out]))],
        [finding(f'In a currency shock, gross margin would fall from {f.pct(gm)} to about {f.pct(out[2][3])}.', 'medium', 'Agree in advance which prices move and when, so the reaction is fast.'), finding(f'{f.pct(imp, 0)} of costs are imported, so the currency matters more than local inflation.' if imp > 0.4 else 'Most costs are local: inflation matters more than the currency.', 'low' if est else 'medium')],
        notes=['Scenario inputs are the analyst’s; cite Central Bank of Egypt, CAPMAS and IMF figures for each in the report.'] + (['Margin or imported share are estimates: send the price list with costs to firm this up.'] if est else []),
    )


def _size_defaults(d: Data, client: dict) -> dict:
    presets = {'furniture': (6.8, 30, 9000), 'medical': (0.082, 35, 1_400_000), 'beauty': (9.5, 45, 2400)}
    b, r, s = presets.get(client.get('sector', ''), (1.0, 30, 5000))
    return {'buyers': b, 'reach': r, 'spend': s}


SERVICES = [
    Service('market-size', 'market', 'Market size', [], market_size, public=True, params=[Param('buyers', 'Potential buyers (millions)', 0.001, 100, 0.001, 1), Param('reach', 'Share in the client’s area and price range', 1, 100, 1, 30, 'share'), Param('spend', 'Yearly spend per buyer', 1, 1e7, 100, 5000, 'money'), Param('target', 'Share the client could reach in 3 years', 0.1, 30, 0.1, 3, 'share')], defaults=_size_defaults, data_text='Population and spending figures from CAPMAS, the World Bank or an industry body', missing_text='Inputs are set by the analyst and cited in the report'),
    Service('demand-trends', 'market', 'Demand trends', [['trends']], demand_trends, data_text='A Google Trends export (CSV) for the client’s main keywords, in Egypt, 5 years', missing_text='Download it free from trends.google.com: search the keyword, set Egypt and 5 years, then the download icon'),
    Service('competitor-check', 'market', 'Competitor check', [['competitors']], competitors, data_text='A price sheet: competitor, product, their price, our price, and what their reviews complain about', missing_text='Collect 15–30 matching products from competitors’ shops and websites'),
    Service('customer-survey', 'market', 'Customer survey', [['custsurvey']], price_survey, params=[Param('current', 'Price today (0 if new)', 0, 1e7, 5, 0, 'money')]),
    Service('market-conditions', 'market', 'Market conditions', [], conditions, public=True, params=[Param('infl', 'Inflation, base case', 0, 80, 1, 18, 'share'), Param('dev', 'Currency fall, base case', 0, 80, 1, 15, 'share'), Param('margin', 'Gross margin if no costs', 5, 90, 1, 35, 'share'), Param('imported', 'Imported share if unknown', 0, 100, 5, 30, 'share')], data_text='Inflation, interest and exchange-rate scenarios from the Central Bank of Egypt, CAPMAS and the IMF', missing_text='Inputs are set by the analyst and cited in the report'),
]
