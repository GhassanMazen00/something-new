"""Marketing: five services."""

from __future__ import annotations

import numpy as np
import pandas as pd
from scipy.optimize import minimize
from scipy.special import betaln, gammaln, hyp2f1
from scipy.stats import norm
from sklearn.metrics import roc_auc_score

from .core import Ctx, NeedsData, Service, bars, chart, finding, heatmap, kpi, month_label, result, table

# ---------- Customer groups (RFM) ----------


def customer_groups(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    r = d.recent(365)
    r = r[r['customer'].notna()]
    if r['customer'].nunique() < 20:
        raise NeedsData('Fewer than 20 identified customers in the last year.')
    g = r.groupby('customer').agg(last=('date', 'max'), f=('order_id', 'nunique'), m=('amount', 'sum'))
    g['r'] = (d.end - g['last']).dt.days
    g['rs'] = pd.qcut(g['r'].rank(method='first'), 5, labels=[5, 4, 3, 2, 1]).astype(int)
    fs = np.select([g['f'] >= 4, g['f'] == 3, g['f'] == 2], [5, 4, 3], 1)
    g['seg'] = np.select(
        [(g['rs'] >= 4) & (fs >= 3), (fs >= 3) & (g['rs'] >= 3), g['rs'] >= 4, (fs >= 2) & (g['rs'] <= 2), g['rs'] <= 2],
        ['Best customers', 'Loyal', 'New or one-time', 'At risk', 'Lost'],
        'Need attention',
    )
    order = ['Best customers', 'Loyal', 'New or one-time', 'Need attention', 'At risk', 'Lost']
    total = g['m'].sum()
    grp = g.groupby('seg').agg(n=('m', 'size'), rev=('m', 'sum'), rec=('r', 'mean')).reindex(order).dropna()
    repeat = (g['f'] > 1).mean()
    tone = {'At risk': 'orange', 'Lost': 'muted', 'Best customers': 'green'}
    findings = []
    if 'Best customers' in grp.index:
        b = grp.loc['Best customers']
        findings.append(finding(f'{int(b.n):,} best customers ({f.pct(b.n / len(g), 0)}) bring {f.pct(b.rev / total, 0)} of sales.', 'high', 'Give them early access and a named contact.'))
    if 'At risk' in grp.index:
        a = grp.loc['At risk']
        findings.append(finding(f'{int(a.n):,} regular customers have gone quiet; they spent {f.money(a.rev)} last year.', 'high', 'A win-back message this month, before they are lost.'))
    findings.append(finding(f'{f.pct(repeat, 0)} of customers bought more than once in the year.', 'high', 'Most buy once, normal for big purchases: focus on referrals and accessories.' if repeat < 0.2 else 'Repeat buying is healthy; protect it.'))
    return result(
        [kpi('Customers, last 12 months', f.num(len(g))), kpi('Bought more than once', f.pct(repeat, 0)), kpi('Best customers', f.num(grp.loc['Best customers', 'n']) if 'Best customers' in grp.index else '0'), kpi('At risk', f.num(grp.loc['At risk', 'n']) if 'At risk' in grp.index else '0', tone='bad')],
        [
            chart('Share of sales by group (%)', bars(grp.index, (grp['rev'] / total * 100).values, 'num', horizontal=True, tones=[tone.get(i, 'accent') for i in grp.index])),
            chart('Groups', table(['Group', 'Customers', 'Sales', 'Days since last order'], [[i, f.num(r_.n), f.money(r_.rev), f.num(r_.rec)] for i, r_ in grp.iterrows()], [False, True, True, True])),
        ],
        findings,
    )


# ---------- Ad channels ----------


def _weekly_ads(d) -> pd.DataFrame:
    a = d.t('ads').copy()
    a['week'] = a['date'].dt.to_period('W-SUN').dt.start_time
    return a.groupby(['week', 'channel'], as_index=False).agg(spend=('spend', 'sum'), new_customers=('new_customers', lambda x: x.sum(min_count=1)), revenue=('revenue', lambda x: x.sum(min_count=1)))


def _spend_only(d, level):
    a = d.t('ads')
    if not (a['new_customers'].notna().any() or a['revenue'].notna().any()):
        return 'none', 'The ad file has spend only: this needs new customers or revenue per channel. The budget split works from total sales instead.'
    return None


def ad_channels(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    a = _weekly_ads(d)
    recent = a[a['week'] > a['week'].max() - pd.Timedelta(weeks=26)]
    has_nc = recent['new_customers'].notna().any()
    has_rev = recent['revenue'].notna().any()
    margin = 1 - (d.sales['cost'] * d.sales['qty']).sum() / d.sales['amount'].sum() if (d.has('sales') or d.has('einv')) and d.sales['cost'].notna().mean() > 0.5 else np.nan
    g = recent.groupby('channel').agg(spend=('spend', 'sum'), nc=('new_customers', 'sum'), rev=('revenue', 'sum'))
    g = g[g['spend'] > 0]
    g['cac'] = np.where(g['nc'] > 0, g['spend'] / g['nc'], np.nan)
    g['roas'] = np.where(g['spend'] > 0, g['rev'] / g['spend'], np.nan)
    if not has_nc and not has_rev:
        raise NeedsData('The ad file has spend only: add new customers or revenue per channel, or use the budget split, which works from total sales.')
    key = 'cac' if has_nc else 'roas'
    g = g.sort_values(key, ascending=key == 'cac')
    best, worst = g.index[0], g.index[-1]
    rows = [[i, f.money(r.spend), f.num(r.nc) if has_nc else '–', f.money(r.cac) if has_nc and np.isfinite(r.cac) else '–', f'{r.roas:.1f}×' if has_rev else '–', (f'{r.cac / (r.rev / r.nc * margin):.1f} orders' if has_rev and has_nc and np.isfinite(margin) and r.nc > 0 and r.rev > 0 else '–')] for i, r in g.iterrows()]
    if has_nc:
        ch = chart('Cost to win one customer, last 26 weeks', bars(g.index, g['cac'].values, horizontal=True, tones=['green'] + ['accent'] * (len(g) - 2) + ['orange'] if len(g) > 1 else ['green']))
        fnd = finding(f'{best} wins customers for {f.money(g.loc[best, "cac"])} each; {worst} costs {f.money(g.loc[worst, "cac"])}, {g.loc[worst, "cac"] / g.loc[best, "cac"]:.1f} times as much.', 'high', 'See the budget split before moving money: cheap channels can be close to their limit.')
    else:
        ch = chart('Return on ad spend, last 26 weeks', bars(g.index, g['roas'].values, 'num', horizontal=True, tones=['green'] + ['accent'] * (len(g) - 1)))
        fnd = finding(f'{best} returns {g.loc[best, "roas"]:.1f}× its spend; {worst} {g.loc[worst, "roas"]:.1f}×.', 'medium', 'Revenue credited by the ad platforms is often inflated; confirm with the budget split.')
    return result(
        [kpi('Ad spend, last 26 weeks', f.money(g['spend'].sum())), kpi('New customers', f.num(g['nc'].sum()) if has_nc else '–'), kpi('Best channel', str(best), (f.money(g.loc[best, 'cac']) + ' each') if has_nc else f'{g.loc[best, "roas"]:.1f}×', 'good'), kpi('Weakest', str(worst), (f.money(g.loc[worst, 'cac']) + ' each') if has_nc else f'{g.loc[worst, "roas"]:.1f}×', 'bad')],
        [ch, chart('By channel', table(['Channel', 'Spend', 'New customers', 'Cost each', 'Return on spend', 'Payback'], rows, [False, True, True, True, True, True]))],
        [fnd],
    )


# ---------- Budget split (media mix) ----------


def _adstock(x: np.ndarray, decay: float) -> np.ndarray:
    out = np.zeros_like(x, dtype=float)
    carry = 0.0
    for i, v in enumerate(x):
        carry = v + decay * carry
        out[i] = carry
    return out


def budget_split(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    a = _weekly_ads(d)
    spend = a.pivot_table(index='week', columns='channel', values='spend', aggfunc='sum').fillna(0)
    spend = spend.loc[:, spend.sum() > 0]
    chans = list(spend.columns)
    # The outcome: new customers per channel if tracked, else total weekly sales.
    per_channel = a['new_customers'].notna().any()
    if per_channel:
        outcome = a.pivot_table(index='week', columns='channel', values='new_customers', aggfunc='sum').reindex(spend.index).fillna(0)
        unit = 'customers'
    else:
        raw = d.t('ads')
        if 'total_sales' in raw and raw['total_sales'].notna().any():
            # A weekly marketing sheet carries total sales on every channel's row: count each date once.
            t = raw.drop_duplicates('date')
            wk = t.groupby(t['date'].dt.to_period('W-SUN').dt.start_time)['total_sales'].sum(min_count=1)
        elif d.has('sales') or d.has('einv'):
            wk = d.sales.groupby(d.sales['date'].dt.to_period('W-SUN').dt.start_time)['amount'].sum()
        else:
            raise NeedsData('Needs new customers per channel, or a sales file to measure against.')
        y_total = wk.reindex(spend.index)
        keep = y_total.notna()
        spend = spend[keep]
        y_total = y_total[keep]
        unit = c.fmt.cur
    weeks = len(spend)
    if weeks < 26:
        raise NeedsData('Fewer than 26 weeks of ad spend.')
    decays = [0.0, 0.2, 0.4, 0.6]
    fits = {}
    if per_channel:
        for ch in chans:
            x, y = spend[ch].values, outcome[ch].values
            best = None
            for dec in decays:
                ad = _adstock(x, dec)
                for s_ in np.geomspace(max(ad.max(), 1) * 0.1, max(ad.max(), 1) * 4, 30):
                    g = 1 - np.exp(-ad / s_)
                    k = (y * g).sum() / max((g * g).sum(), 1e-9)
                    err = ((y - k * g) ** 2).sum()
                    if best is None or err < best[0]:
                        best = (err, k, s_, dec)
            fits[ch] = best[1:]
    else:
        X = spend.values
        y = y_total.values

        def pred(theta):
            base = theta[0]
            out = np.full(len(y), base)
            for j in range(len(chans)):
                k, s_ = np.exp(theta[1 + 2 * j]), np.exp(theta[2 + 2 * j])
                out += k * (1 - np.exp(-_adstock(X[:, j], 0.3) / s_))
            return out

        theta0 = [np.median(y) * 0.6] + sum([[np.log(max(y.std(), 1)), np.log(max(X[:, j].mean(), 1))] for j in range(len(chans))], [])
        opt = minimize(lambda t: ((y - pred(t)) ** 2).sum(), theta0, method='Nelder-Mead', options={'maxiter': 4000, 'xatol': 1e-4, 'fatol': 1e-4})
        for j, ch in enumerate(chans):
            fits[ch] = (np.exp(opt.x[1 + 2 * j]), np.exp(opt.x[2 + 2 * j]), 0.3)
    avg = spend.tail(26).mean()
    budget = float(avg.sum())

    def resp(ch, x):
        k, s_, dec = fits[ch]
        return k * (1 - np.exp(-(x / (1 - dec)) / s_))

    step = max(budget / 200, 1)
    alloc = dict.fromkeys(chans, 0.0)
    left = budget
    while left >= step:
        gains = {ch: resp(ch, alloc[ch] + step) - resp(ch, alloc[ch]) for ch in chans}
        best = max(gains, key=gains.get)
        alloc[best] += step
        left -= step
    now = sum(resp(ch, avg[ch]) for ch in chans)
    better = sum(resp(ch, alloc[ch]) for ch in chans)
    per1000 = {ch: (resp(ch, avg[ch] + 1000) - resp(ch, avg[ch])) for ch in chans}
    top, low = max(per1000, key=per1000.get), min(per1000, key=per1000.get)
    gain = better / now - 1 if now > 0 else 0
    fmt_out = (lambda v: f.num(v, 1)) if per_channel else f.money
    return result(
        [kpi('Weekly budget', f.money(budget)), kpi(f'{"Customers" if per_channel else "Sales from ads"} a week now', fmt_out(now)), kpi('With the suggested split', fmt_out(better), f.spct(gain), 'good' if gain > 0.02 else None), kpi('Next 1,000 should go to', top)],
        [
            chart('Weekly spend: now and suggested', bars(chans, [avg[ch] for ch in chans], extra={'name': 'Suggested', 'values': [alloc[ch] for ch in chans]})),
            chart(f'{"Customers" if per_channel else unit + " of sales"} from the next 1,000 spent', bars(chans, [per1000[ch] for ch in chans], 'num', horizontal=True, tones=['green' if ch == top else 'orange' if ch == low else 'accent' for ch in chans])),
        ],
        [
            finding(f'The same budget, split differently, could bring {f.spct(gain, 0)} more {"customers" if per_channel else "sales"} a week.', 'medium', 'Move money in steps of 10–20% and check results after four weeks.') if gain > 0.02 else finding('Today’s split is already close to the best one for this budget.', 'medium', 'Extra budget should go to the channel with the most return per 1,000.'),
            finding(f'{low} is closest to its limit: the next 1,000 there brings ' + (f'{per1000[low]:.1f} customers, against {per1000[top]:.1f} on {top}.' if per_channel else f'{f.money(per1000[low])} in sales, against {f.money(per1000[top])} on {top}.'), 'medium'),
        ],
        notes=['Response curves are fitted with carry-over (adstock) and diminishing returns. A pause test in one area is the best confirmation before large moves.'],
    )


# ---------- Customer value and churn (BG/NBD) ----------


def _rfm(s: pd.DataFrame, cutoff: pd.Timestamp) -> pd.DataFrame:
    s = s[(s['date'] < cutoff) & s['customer'].notna()]
    day = s['date'].dt.normalize()
    g = day.groupby(s['customer'])
    first, last = g.min(), g.max()
    x = g.nunique() - 1  # repeat purchases: distinct buying days after the first
    return pd.DataFrame({'x': x.astype(float), 'tx': (last - first).dt.days / 7, 'T': (cutoff - first).dt.days / 7})


def _bgnbd_fit(df: pd.DataFrame) -> np.ndarray:
    x, tx, T = df['x'].values, df['tx'].values, df['T'].values

    def nll(lp):
        r, alpha, a, b = np.exp(lp)
        A1 = gammaln(r + x) - gammaln(r) + r * np.log(alpha)
        A2 = betaln(a, b + x) - betaln(a, b)
        A3 = -(r + x) * np.log(alpha + T)
        A4 = np.where(x > 0, np.log(a) - np.log(np.maximum(b + x - 1, 1e-9)) - (r + x) * np.log(alpha + tx), -np.inf)
        return -(A1 + A2 + np.logaddexp(A3, A4)).sum()

    # Bounded, so a flat likelihood (little sign of anyone leaving) can't push a parameter to absurd values.
    res = minimize(nll, np.log([0.5, 5, 0.6, 2.0]), method='L-BFGS-B', bounds=[(-6.0, 6.0)] * 4)
    return np.exp(res.x)


def _expected(p, df: pd.DataFrame, t: float) -> np.ndarray:
    r, alpha, a, b = p
    a = a if abs(a - 1) > 1e-3 else 1.001  # the formula divides by a − 1; it holds on either side of 1
    x, tx, T = df['x'].values, df['tx'].values, df['T'].values
    z = t / (alpha + T + t)
    head = (a + b + x - 1) / (a - 1)
    body = 1 - ((alpha + T) / (alpha + T + t)) ** (r + x) * hyp2f1(r + x, b + x, a + b + x - 1, z)
    tail = 1 + np.where(x > 0, a / np.maximum(b + x - 1, 1e-9) * ((alpha + T) / (alpha + tx)) ** (r + x), 0)
    return np.maximum(head * body / tail, 0)


def _alive(p, df: pd.DataFrame) -> np.ndarray:
    r, alpha, a, b = p
    x, tx, T = df['x'].values, df['tx'].values, df['T'].values
    return np.where(x == 0, 1.0, 1 / (1 + a / np.maximum(b + x - 1, 1e-9) * ((alpha + T) / (alpha + tx)) ** (r + x)))


def churn(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    s = d.sales[d.sales['customer'].notna()]
    if s['customer'].nunique() < 20:
        raise NeedsData('Fewer than 20 identified customers.')
    now = _rfm(s, d.end + pd.Timedelta(days=1))
    repeat = (now['x'] > 0).mean()
    # Cohorts: share of each month's new customers who buy again 1..6 months later.
    mon = s['date'].dt.to_period('M')
    first = mon.groupby(s['customer']).min()
    months_bought = pd.DataFrame({'c': s['customer'], 'm': mon}).drop_duplicates()
    months_bought['k'] = (months_bought['m'] - months_bought['c'].map(first)).apply(lambda o: o.n)
    cohort_months = sorted(first.unique())[-14:-6] if len(first.unique()) > 7 else sorted(first.unique())
    grid, labels = [], []
    for cm in cohort_months:
        members = first[first == cm].index
        if len(members) < 5:
            continue
        mb = months_bought[months_bought['c'].isin(members)]
        grid.append([float(mb[mb['k'] == k]['c'].nunique() / len(members) * 100) for k in range(1, 7)])
        labels.append(month_label(cm))
    cohort = chart('Cohorts: % buying again, months after first order', heatmap(labels, ['+1', '+2', '+3', '+4', '+5', '+6'], grid, 'pct'))
    month_one = np.mean([g[0] for g in grid]) / 100 if grid else np.nan
    # A few large business customers: watch each account instead.
    if len(now) < 500:
        rec = s[s['date'] > d.end - pd.Timedelta(days=365)]
        g = rec.groupby('customer').apply(lambda x: pd.Series({'recent': x[x['date'] > d.end - pd.Timedelta(days=91)]['amount'].sum() / 3, 'before': x[x['date'] <= d.end - pd.Timedelta(days=91)]['amount'].sum() / 9, 'last': (d.end - x['date'].max()).days}), include_groups=False)
        g = g[g['before'] > 0]
        g['change'] = g['recent'] / g['before'] - 1
        floor = g['before'].quantile(0.33)
        falling = g[(g['change'] < -0.5) & (g['before'] >= floor)].sort_values('before', ascending=False)
        stake = ((falling['before'] - falling['recent']) * 12).sum()
        return result(
            [kpi('Active accounts', f.num(len(g))), kpi('Ordering less than half as much', f.num(len(falling)), tone='bad' if len(falling) else 'good'), kpi('Sales at stake', f.money(stake), 'a year, if they don’t come back', 'bad' if len(falling) else None)],
            [chart('Accounts whose orders fell most (last 3 months vs the 9 before)', table(['Account', 'Monthly before', 'Monthly now', 'Change', 'Days since last order'], [[i, f.money(r.before), f.money(r.recent), f.spct(r.change, 0), f.num(r['last'])] for i, r in falling.head(12).iterrows()], [False, True, True, True, True], ['red' if r.recent == 0 else 'orange' for _, r in falling.head(12).iterrows()]), wide=True)],
            [
                finding(f'{len(falling)} accounts now order less than half what they used to; {int((falling["recent"] == 0).sum())} have stopped completely.', 'high', 'A sales visit this month: ask what changed before a competitor’s terms become habit.') if len(falling) else finding('No account has cut its orders sharply.', 'high'),
                finding('With few, large customers, each account is watched one by one instead of using a churn model.', 'high'),
            ],
        )
    if c.level == 'low' or repeat < 0.2:
        return result(
            [kpi('Customers', f.num(len(now))), kpi('Ever bought twice', f.pct(repeat, 0), tone='bad'), kpi('Back within a month', f.pct(month_one, 1) if np.isfinite(month_one) else '–')],
            [cohort],
            [finding(f'Only {f.pct(repeat, 0)} of customers ever buy a second time: this is a one-purchase business.', 'high', 'Value comes from referrals, accessories and service, not repeat orders.'), finding('A churn model would mislabel almost everyone, so it was not run.', 'high')],
        )
    sample = now.sample(min(len(now), 20000), random_state=1)
    p = _bgnbd_fit(sample)
    # Test: fit on data up to 90 days before the end, check who actually bought in the last 90 days.
    cut = d.end - pd.Timedelta(days=89)
    before = _rfm(s, cut)
    b_sample = before.sample(min(len(before), 20000), random_state=2)
    p2 = _bgnbd_fit(b_sample)
    came_back = set(s[s['date'] >= cut]['customer'])
    score = roc_auc_score(b_sample.index.isin(list(came_back)), _expected(p2, b_sample, 90 / 7)) if 0 < b_sample.index.isin(list(came_back)).mean() < 1 else np.nan
    prob = 1 - np.exp(-_expected(p, now, 90 / 7))
    alive = _alive(p, now)
    spent = s[s['date'] > d.end - pd.Timedelta(days=365)].groupby('customer')['amount'].sum().reindex(now.index).fillna(0)
    lost = prob < 0.05
    fading = (now['x'] >= 1).values & (alive >= 0.2) & (alive < 0.7)
    # Over a short history the model may see almost nobody leave for good (a tiny drop-out rate per purchase).
    # Then judge each repeat customer against their own rhythm: quiet for well over their usual gap.
    rhythm = p[2] / (p[2] + p[3]) < 0.01
    if rhythm:
        gap = now['tx'] / now['x'].clip(lower=1)
        quiet = now['T'] - now['tx']
        fading = ((now['x'] >= 2) & (quiet > np.maximum(2.5 * gap, 4.3))).values
        lost = (quiet > 26).values
    stake = spent[fading].sum()
    buckets = [0, 0.05, 0.15, 0.3, 0.5, 1.01]
    dist = [int(((prob >= lo) & (prob < hi)).sum()) for lo, hi in zip(buckets[:-1], buckets[1:])]
    return result(
        [kpi('Customers', f.num(len(now)), f'{f.pct(repeat, 0)} have bought twice or more'), kpi('Quiet for 6+ months' if rhythm else 'Probably lost', f.pct(lost.mean(), 0), 'no order in the last 26 weeks' if rhythm else 'under 5% chance of buying in 90 days', 'bad'), kpi('Regulars fading', f.num(fading.sum()), f'spent {f.money(stake)} last year'), kpi('Test: who comes back', f'AUC {score:.2f}' if np.isfinite(score) else '–', tone='good' if np.isfinite(score) and score > 0.7 else 'bad')],
        [chart('Chance each customer buys in the next 90 days', bars(['<5%', '5–15%', '15–30%', '30–50%', '>50%'], dist, 'num', tones=['muted', 'orange', 'amber', 'accent', 'green'])), cohort],
        [
            finding(f'{int(fading.sum()):,} regular customers are fading: they used to buy often but have gone quiet. Together they spent {f.money(stake)} in the last 12 months.', 'high' if np.isfinite(score) and score > 0.7 else 'medium', 'Send them a personal offer now; it is too late for the lost group.') if fading.sum() else finding('No regular customer has gone unusually quiet.', 'high'),
            finding(f'{f.pct(lost.mean(), 0)} of past customers haven’t ordered in over six months.', 'medium') if rhythm else finding(f'About {f.pct(lost.mean(), 0)} of past customers have probably stopped buying for good.', 'medium'),
            *([finding('Over this period the model sees almost no customers leave for good, which is common with about a year of history. “Fading” compares each repeat customer with their own usual gap between orders instead.', 'low')] if rhythm else []),
            finding(f'{f.pct(month_one, 0)} of new customers buy again within their first month.', 'high', 'A reminder 3–5 weeks after the first order is the cheapest lever.') if np.isfinite(month_one) else finding('Too few cohorts to measure repeat timing.', 'low'),
        ],
        accuracy=f'Fitted on data up to 90 days before the end, then checked against who actually bought in those 90 days: AUC {score:.2f} (0.5 is a coin toss, 1.0 is perfect).' if np.isfinite(score) else None,
    )


# ---------- A/B test ----------


def ab_test(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    t = d.t('abtest').groupby('variant', as_index=False)[['visitors', 'conversions']].sum()
    if len(t) < 2:
        raise NeedsData('The file needs two versions.')
    t = t.sort_values('visitors', ascending=False).head(2).sort_values('variant')
    # The control is the version named like one, else the first.
    ctrl_mask = t['variant'].astype(str).str.lower().str.contains('control|old|^a$|original|baseline')
    A = t[ctrl_mask].iloc[0] if ctrl_mask.any() else t.iloc[0]
    B = t[t['variant'] != A['variant']].iloc[0]
    pa, pb = A.conversions / A.visitors, B.conversions / B.visitors
    pool = (A.conversions + B.conversions) / (A.visitors + B.visitors)
    se0 = np.sqrt(pool * (1 - pool) * (1 / A.visitors + 1 / B.visitors))
    z = (pb - pa) / se0
    p = 2 * (1 - norm.cdf(abs(z)))
    se = np.sqrt(pa * (1 - pa) / A.visitors + pb * (1 - pb) / B.visitors)
    lo, hi = pb - pa - 1.96 * se, pb - pa + 1.96 * se
    rng = np.random.default_rng(0)
    prob_b = (rng.beta(1 + B.conversions, 1 + B.visitors - B.conversions, 20000) > rng.beta(1 + A.conversions, 1 + A.visitors - A.conversions, 20000)).mean()
    win = p < 0.05
    return result(
        [kpi(str(A.variant) if 'control' in str(A.variant).lower() else f'{A.variant} (control)', f.pct(pa, 2), f'{int(A.conversions):,} of {int(A.visitors):,}'), kpi(str(B.variant), f.pct(pb, 2), f'{int(B.conversions):,} of {int(B.visitors):,}'), kpi('Lift', f.spct(pb / pa - 1), tone='good' if win and pb > pa else None), kpi('p-value', '< 0.001' if p < 0.001 else f'{p:.3f}', 'chance of a gap this big if there were no real difference', 'good' if win else 'bad')],
        [chart('Conversion rate (%)', bars([str(A.variant), str(B.variant)], [pa * 100, pb * 100], 'num', tones=['muted', 'green' if win and pb > pa else 'accent']))],
        [
            finding(f'{B.variant} really is {"better" if pb > pa else "worse"}: {f.spct(pb / pa - 1)} conversion.', 'high', f'Switch everyone to {B.variant}.' if pb > pa else f'Keep {A.variant}.') if win else finding('The difference could easily be chance.', 'medium', 'Keep the test running or test a bolder change.'),
            finding(f'The true change is most likely between {f.spct(lo / pa)} and {f.spct(hi / pa)}; chance that {B.variant} is better: {f.pct(prob_b, 0)}.', 'high'),
        ],
    )


SERVICES = [
    Service('customer-groups', 'marketing', 'Customer groups', [['sales']], customer_groups, medium=[['einv']]),
    Service('ad-channel-performance', 'marketing', 'Ad channel performance', [['ads', 'sales'], ['ads', 'einv']], ad_channels, medium=[['ads']], adjust=_spend_only),
    Service('budget-split-across-channels', 'marketing', 'Budget split across channels', [['ads']], budget_split, adjust=lambda d, l: ('medium', 'Under two years of weekly spend: curves are rougher; confirm with a pause test.') if d.t('ads')['date'].dt.to_period('W').nunique() < 100 else None, preview='Response curves with carry-over (adstock) and diminishing returns fitted per channel, or jointly against weekly sales when new customers aren’t tracked; budget moved in small steps to wherever it brings the most. Google Meridian joins in a later version.'),
    Service('customer-value-and-churn', 'marketing', 'Customer value and churn', [['sales']], churn, medium=[['einv']], adjust=lambda d, l: ('low', 'Under a year of orders: cohort tables only.') if (d.end - d.sales['date'].min()).days < 365 else None, preview='BG/NBD model fitted by maximum likelihood, tested on a 90-day hold-out; accounts watched one by one when there are under 500 customers.'),
    Service('a-b-test-check', 'marketing', 'A/B test check', [['abtest']], ab_test),
]

