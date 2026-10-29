"""Accounting and finance: six services."""

from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

from .core import Ctx, Data, NeedsData, Param, Service, bars, canonical_names, chart, finding, kpi, line, month_label, result, series, table

BENFORD = np.log10(1 + 1 / np.arange(1, 10))
SALES_ACCOUNT = r'sale|revenue|income|turnover|مبيعات|إيراد'


def _first_digit(a: pd.Series) -> pd.Series:
    s = a.abs()
    s = s[s >= 10]
    return (s / 10 ** np.floor(np.log10(s))).astype(int).clip(1, 9)


def _entries(d: Data) -> tuple[pd.DataFrame, str]:
    """Payments and expenses to scan: the ledger's non-sales entries, else bank money out, else e-invoices."""
    if d.has('ledger'):
        l_ = d.t('ledger')
        e = l_[~l_['account'].astype(str).str.contains(SALES_ACCOUNT, case=False, na=False)] if l_['account'].notna().any() else l_
        e = e.assign(party=canonical_names(e['party'])[0])
        return e[['date', 'party', 'amount', 'reference']].assign(amount=e['amount'].abs()), 'ledger entries'
    if d.has('bank'):
        b = d.t('bank')
        b = b[b['amount'] < 0]
        return pd.DataFrame({'date': b['date'], 'party': b['description'].fillna('Unknown'), 'amount': -b['amount'], 'reference': b.get('reference')}), 'bank payments'
    e = d.t('einv')
    return pd.DataFrame({'date': e['date'], 'party': e['customer'], 'amount': e['amount'], 'reference': e['invoice_no'].astype(str)}), 'e-invoices'


def fraud_scan(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    e, source = _entries(d)
    e = e[e['amount'] > 0].reset_index(drop=True)
    if len(e) < 50:
        raise NeedsData('Fewer than 50 entries to scan.')
    flags: list[dict] = []
    # Benford's law on first digits.
    fd = _first_digit(e['amount'])
    share = np.bincount(fd, minlength=10)[1:] / len(fd)
    n = len(fd)
    z = (share - BENFORD) / np.sqrt(BENFORD * (1 - BENFORD) / n)
    mad = float(np.mean(np.abs(share - BENFORD)))
    conformity = 'close' if mad < 0.006 else 'acceptable' if mad < 0.012 else 'marginal' if mad < 0.015 else 'non-conforming'
    # Approval limits: many amounts just under a round number, few just over.
    clusters = []
    for lim in (1000, 2000, 5000, 10000, 20000, 25000, 50000, 100000, 250000, 500000, 1000000):
        under = e[(e['amount'] >= 0.9 * lim) & (e['amount'] < lim)]
        over = e[(e['amount'] >= lim) & (e['amount'] < 1.1 * lim)]
        if len(under) >= 10 and len(under) > 3 * max(len(over), 1):
            party = under['party'].value_counts()
            clusters.append((lim, len(under), len(over), party.index[0], party.iloc[0]))
            for _, r in under[under['party'] == party.index[0]].nlargest(5, 'amount').iterrows():
                flags.append({'date': r['date'], 'party': r['party'], 'amount': r['amount'], 'ref': r['reference'], 'why': f'Just under {f.money(lim, exact=True)} (approval limit?)', 'tone': 'orange', 'rank': 1})
    # The same bill paid twice: same party and amount within five days.
    e = e.sort_values('date')
    dup_rows = []
    for _, g in e.groupby([e['party'].astype(str), e['amount'].round(2)]):
        if len(g) < 2:
            continue
        gaps = g['date'].diff().dt.days
        dup_rows.extend(g[gaps <= 5].index.tolist())
    dupes = e.loc[dup_rows]
    for _, r in dupes.iterrows():
        flags.append({'date': r['date'], 'party': r['party'], 'amount': r['amount'], 'ref': r['reference'], 'why': 'Same party and amount within 5 days', 'tone': 'red', 'rank': 0})
    # Unusual entries: Isolation Forest on size, size against the party's usual, roundness and timing.
    if len(e) >= 200:
        logs = np.log(e['amount'])
        med = logs.groupby(e['party']).transform('median')
        spread = (logs - med).abs().groupby(e['party']).transform('median').clip(lower=0.4)
        X = np.column_stack([logs, (logs - med) / spread, (e['amount'] % 1000 == 0).astype(float), e['date'].dt.dayofweek.isin(d.weekend).astype(float)])
        iso = IsolationForest(n_estimators=200, contamination=min(0.01, 30 / len(e)), random_state=0).fit(X)
        out = e[(iso.predict(X) == -1) & ((logs - med) / spread > 2.5)]
        for _, r in out.iterrows():
            flags.append({'date': r['date'], 'party': r['party'], 'amount': r['amount'], 'ref': r['reference'], 'why': 'Unusually large for this party', 'tone': 'amber', 'rank': 2})
    # Missing e-invoice numbers.
    gaps: list[int] = []
    if d.has('einv'):
        nums = pd.to_numeric(d.t('einv')['invoice_no'].astype(str).str.extract(r'(\d+)$')[0], errors='coerce').dropna().astype(int).sort_values().unique()
        for a, b in zip(nums[:-1], nums[1:]):
            if 1 < b - a <= 50:
                gaps.extend(range(a + 1, b))
    flags.sort(key=lambda x: (x['rank'], -x['amount']))
    dup_value = dupes['amount'].sum()
    findings = []
    if len(dupes):
        findings.append(finding(f'{len(dupes)} payments look like the same bill paid twice, worth {f.money(dup_value)}.', 'high', 'Check each against the supplier statement and claim back the duplicates.'))
    for lim, nu, no, party, k in clusters[:2]:
        findings.append(finding(f'{nu} amounts sit just under {f.money(lim, exact=True)} but only {no} just over; {k} of them are to {party}.', 'high', 'Check whether purchases were split to stay under an approval limit.'))
    odd = [i + 1 for i in range(9) if z[i] > 3]
    if odd and not clusters:
        findings.append(finding(f'Too many amounts start with {", ".join(map(str, odd))} (Benford’s law, {conformity}).', 'medium', 'Look at the entries starting with these digits first.'))
    if gaps:
        findings.append(finding(f'{len(gaps)} e-invoice numbers are missing from the sequence.', 'high', 'Ask for the cancellation records for each.'))
    findings.append(finding(f'{len(flags)} entries flagged out of {len(e):,} {source} checked. A flag is a question, not an accusation.', 'high'))
    show = flags[:16]
    charts = [
        chart('First digits against Benford’s law (%)', bars([str(i) for i in range(1, 10)], share * 100, 'num', extra={'name': 'Expected', 'values': list(BENFORD * 100)}, tones=['red' if v > 3 else 'accent' for v in z])),
        chart('Flagged entries (most serious first)', table(['Date', 'Party', 'Amount', 'Reference', 'Why'], [[r['date'].date(), r['party'], f.money(r['amount'], exact=True), r['ref'] if pd.notna(r['ref']) else '–', r['why']] for r in show], [False, False, True, False, False], [r['tone'] for r in show]), wide=True),
    ]
    if gaps:
        charts.append(chart('Missing invoice numbers', table(['Missing numbers'], [[', '.join(map(str, gaps[:40])) + (f' … and {len(gaps) - 40} more' if len(gaps) > 40 else '')]])))
    return result(
        [kpi('Entries checked', f.num(len(e))), kpi('Flagged for review', f.num(len(flags)), tone='bad' if flags else 'good'), kpi('Possible double payments', f.money(dup_value), tone='bad' if dup_value else 'good'), kpi('Benford fit (MAD)', f'{mad:.4f}', conformity, 'good' if mad < 0.012 else 'bad')],
        charts,
        findings,
        notes=[] if n >= 500 else ['Under 500 amounts: Benford’s law is only a rough guide at this size.'],
    )


def _inv_num(s: pd.Series) -> pd.Series:
    return s.astype(str).str.extract(r'(\d{3,})')[0]


def _match_by_amount(left: pd.DataFrame, right: pd.DataFrame, days_before: int, days_after: int) -> set:
    """Greedy one-to-one match on equal amount (to the cent) within a date window. Returns matched left indexes."""
    pool: dict[float, list] = {}
    for i, r in right.sort_values('date').iterrows():
        pool.setdefault(round(abs(r['amount']), 2), []).append((r['date'], i))
    used, hit = set(), set()
    for i, r in left.sort_values('date').iterrows():
        for dt, j in pool.get(round(abs(r['amount']), 2), []):
            if j in used:
                continue
            if r['date'] - pd.Timedelta(days=days_before) <= dt <= r['date'] + pd.Timedelta(days=days_after):
                used.add(j)
                hit.add(i)
                break
    return hit


def reconcile(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    rows, detail, findings = [], [], []
    tones = []
    einv = d.t('einv') if d.has('einv') else None
    if einv is not None:
        einv = einv.assign(num=_inv_num(einv['invoice_no']))
    if einv is not None and d.has('ledger'):
        l_ = d.t('ledger')
        sales_l = l_[l_['account'].astype(str).str.contains(SALES_ACCOUNT, case=False, na=False)] if l_['account'].notna().any() else l_
        sales_l = sales_l.assign(num=_inv_num(sales_l['reference']))
        if sales_l['num'].notna().mean() > 0.5:
            book = sales_l.dropna(subset=['num']).drop_duplicates('num').set_index('num')['amount']
            missing = einv[~einv['num'].isin(book.index)]
            both = einv[einv['num'].isin(book.index)]
            wrong = both[(both['num'].map(book).abs() - both['amount'].abs()).abs() > 0.5]
        else:
            hit = _match_by_amount(einv, sales_l, 3, 10)
            missing = einv.drop(index=list(hit))
            wrong = einv.iloc[0:0]
        rows += [['E-invoices not in the books', f.num(len(missing)), f.money(missing['amount'].sum())], ['Amount in books differs from the e-invoice', f.num(len(wrong)), f.money((wrong['num'].map(book).abs() - wrong['amount'].abs()).abs().sum()) if len(wrong) else f.money(0)]]
        tones += ['red', 'orange']
        detail += [[r['date'].date(), r['invoice_no'], r['customer'], f.money(r['amount'], exact=True), 'Not in the books'] for _, r in missing.head(6).iterrows()]
        detail += [[r['date'].date(), r['invoice_no'], r['customer'], f.money(r['amount'], exact=True), f'Books show {f.money(book[r["num"]], exact=True)}'] for _, r in wrong.head(4).iterrows()]
        if len(missing):
            findings.append(finding(f'{len(missing)} e-invoices ({f.money(missing["amount"].sum())}) were issued but never entered in the books.', 'high', 'Post them now: the books under-state sales.'))
        if len(wrong):
            findings.append(finding(f'{len(wrong)} invoices were entered in the books with a different amount.', 'high'))
    if einv is not None and d.has('bank'):
        dep = d.t('bank')
        dep = dep[dep['amount'] > 0].assign(num=_inv_num(dep['reference']) if 'reference' in dep else None)
        by_ref = dep['num'].notna().mean() > 0.5 if 'num' in dep else False
        if by_ref:
            paid_nums = set(dep['num'].dropna())
            unmatched_dep = dep[~dep['num'].isin(set(einv['num']))]
            paid = einv['num'].isin(paid_nums)
        else:
            hit_inv = _match_by_amount(einv, dep, 0, 150)
            paid = einv.index.isin(list(hit_inv))
            hit_dep = _match_by_amount(dep, einv, 150, 0)
            unmatched_dep = dep.drop(index=list(hit_dep))
        old_unpaid = einv[~paid & (einv['date'] < einv['date'].max() - pd.Timedelta(days=120))]
        rows += [['Deposits with no e-invoice', f.num(len(unmatched_dep)), f.money(unmatched_dep['amount'].sum())], ['Invoices over 4 months old, never paid', f.num(len(old_unpaid)), f.money(old_unpaid['amount'].sum())]]
        tones += ['red', 'amber']
        detail += [[r['date'].date(), '–', r['description'], f.money(r['amount'], exact=True), 'Deposit with no e-invoice'] for _, r in unmatched_dep.nlargest(6, 'amount').iterrows()]
        if len(unmatched_dep):
            findings.append(finding(f'{len(unmatched_dep)} deposits ({f.money(unmatched_dep["amount"].sum())}) have no e-invoice behind them.', 'high', 'If these are sales they need e-invoices: a tax risk to fix before an audit.'))
        if len(old_unpaid):
            findings.append(finding(f'{f.money(old_unpaid["amount"].sum())} of invoices older than four months have never been paid.', 'medium', 'Chase them or provide for them.'))
    if not rows:
        raise NeedsData('Needs at least two of: e-invoices, books, bank statements.')
    return result(
        [kpi(r[0], r[1], r[2], 'bad' if r[1] != '0' else 'good') for r in rows[:4]],
        [chart('What doesn’t match', table(['Check', 'Count', 'Value'], rows, [False, True, True], tones), wide=True), chart('Examples to check', table(['Date', 'Invoice', 'Party', 'Amount', 'Problem'], detail or [['–', '–', 'Nothing to show', '–', '–']], [False, False, False, True, False]), wide=True)],
        findings or [finding('Everything that could be matched agrees.', 'high')],
        notes=[] if einv is None or d.has('ledger') and d.has('bank') else ['Only two of the three sources were sent, so one side of the match is missing.'],
    )


def cash13(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    b = d.t('bank')
    end = b['date'].max().normalize()
    opening = c.p['opening']
    weeks = [{'in': 0.0, 'out': 0.0} for _ in range(13)]
    recent = b[b['date'] > end - pd.Timedelta(weeks=13)]
    wk_in = recent[recent['amount'] > 0].groupby(recent['date'].dt.to_period('W'))['amount'].sum()
    wk_out = -recent[recent['amount'] < 0].groupby(recent['date'].dt.to_period('W'))['amount'].sum()
    avg_in = wk_in.reindex(pd.period_range(end - pd.Timedelta(weeks=13), end, freq='W'), fill_value=0).mean()
    lag = int(c.p['lag'])
    late = c.p['late'] / 100
    overdue = 0.0
    if d.has('unpaid'):
        for _, r in d.t('unpaid').iterrows():
            w = int((r['due_date'] - end).days // 7)
            if w < 0:
                overdue += r['amount']
                weeks[min(3, (-w) % 4)]['in'] += r['amount'] * 0.6
            elif w < 13:
                weeks[w]['in'] += r['amount'] * (1 - late)
                if w + 4 < 13:
                    weeks[w + 4]['in'] += r['amount'] * late * 0.8
        start_new = lag
    else:
        start_new = 0
    # Sales made during the quarter start paying in after the usual collection lag.
    for w in range(start_new, 13):
        weeks[w]['in'] += avg_in * (min(1.0, (w - start_new + 1) / 4) if start_new else 1.0)
    if d.has('bills'):
        for _, r in d.t('bills').iterrows():
            w = int((r['due_date'] - end).days // 7)
            if 0 <= w < 13:
                weeks[w]['out'] += r['amount']
            elif w < 0:
                weeks[0]['out'] += r['amount']
        # Payroll and rent come on top of supplier bills.
        recurring = recent[recent['description'].astype(str).str.contains('payroll|salar|wage|rent|راتب|رواتب|إيجار|ايجار', case=False, na=False) & (recent['amount'] < 0)]
        monthly = -recurring['amount'].sum() / 3
        if d.has('payroll'):
            p = d.t('payroll')
            last = p[p['month'].dt.to_period('M') == p['month'].max().to_period('M')]
            monthly = max(monthly, (last['base'] + last['overtime']).sum())
        for w in (3, 7, 11):
            weeks[w]['out'] += monthly
        note_out = 'Money out: the bills file by due date, plus payroll and rent from the bank pattern.'
    else:
        base_out = wk_out.median() if len(wk_out) else 0
        for w in range(13):
            weeks[w]['out'] += base_out
        note_out = 'No bills file: money out is the typical (median) week of the last quarter.'
    bal = opening
    closing = []
    for w in weeks:
        bal += w['in'] - w['out']
        closing.append(bal)
    low = min(closing)
    low_w = closing.index(low)
    first_neg = next((i for i, v in enumerate(closing) if v < 0), None)
    labels = [f'W{i + 1}' for i in range(13)]
    big = []
    if d.has('bills'):
        bl = d.t('bills')
        bw = ((bl['due_date'] - end).dt.days // 7)
        big = bl[(bl['amount'] > bl['amount'].quantile(0.95)) & bw.between(low_w - 1, low_w)]['party'].drop_duplicates().tolist()[:3]
    findings = [
        finding(f'Cash runs short in week {first_neg + 1} and bottoms out at {f.money(low)} in week {low_w + 1}' + (f', when bills from {" and ".join(big)} fall due' if big else '') + '.', 'high' if c.level == 'high' else 'medium', f'Ask to split the large payments, or arrange a facility of at least {f.money(abs(low) * 1.2)} before week {max(1, first_neg)}.')
        if first_neg is not None
        else finding(f'Cash stays positive; the lowest point is {f.money(low)} in week {low_w + 1}.', 'high' if c.level == 'high' else 'medium')
    ]
    if overdue:
        findings.append(finding(f'{f.money(overdue)} is already overdue from customers.', 'high', f'Collecting half of it in the next four weeks would lift the low point by about {f.money(overdue * 0.5)}.'))
    notes = [note_out, f'Customers pay late {c.p["late"]:.0f}% of the time, by about four weeks; new sales start paying in after {lag} weeks.']
    if opening == 0:
        notes.insert(0, 'Opening balance is 0: set today’s bank balance above.')
    return result(
        [kpi('Cash today', f.money(opening)), kpi('Lowest point', f.money(low), f'week {low_w + 1}', 'bad' if low < 0 else 'good'), kpi('Runs out in' if first_neg is not None else 'Runs out', f'Week {first_neg + 1}' if first_neg is not None else 'Not in 13 weeks', tone='bad' if first_neg is not None else 'good'), kpi('Overdue from customers', f.money(overdue) if d.has('unpaid') else '–')],
        [
            chart('Cash at the end of each week', line(labels, [series('Closing cash', closing)], marks=[{'index': low_w, 'label': f'Lowest: {f.money(low)}', 'tone': 'red' if low < 0 else 'amber'}], zero=True), wide=True),
            chart('Week by week', table(['Week', 'Money in', 'Money out', 'Closing cash'], [[labels[i], f.money(w['in']), f.money(w['out']), f.money(closing[i])] for i, w in enumerate(weeks)], [False, True, True, True], ['red' if v < 0 else None for v in closing]), wide=True),
        ],
        findings,
        notes=notes,
    )


ASSUMED_MARGIN = 0.35


def _pnl(d: Data) -> tuple[pd.DataFrame, bool]:
    """Monthly profit and loss as sent, or rebuilt from sales, costs, staff and ads."""
    if d.has('pnl'):
        p = d.t('pnl').copy()
        p['m'] = p['month'].dt.to_period('M')
        p = p.groupby('m').sum(numeric_only=True)
        for col in ('cogs', 'payroll', 'rent', 'marketing', 'other'):
            if col not in p:
                p[col] = 0.0
        return p.fillna(0), False
    m = d.monthly
    s = d.sales
    cogs = (s['cost'] * s['qty']).groupby(s['date'].dt.to_period('M')).sum().reindex(m.index)
    # Without the cost of most goods sold, assume a typical retail gross margin rather than treating sales as profit.
    costed = s.loc[s['cost'].notna(), 'amount'].sum() / max(s['amount'].sum(), 1e-9)
    if costed < 0.5:
        cogs = m * (1 - ASSUMED_MARGIN)
    p = pd.DataFrame({'revenue': m, 'cogs': cogs})
    p.attrs['assumed_margin'] = costed < 0.5
    p['payroll'] = d.t('staff')['salary'].where(~d.t('staff')['left']).sum() * 1.1 if d.has('staff') and d.t('staff')['salary'].notna().any() else 0.0
    p['marketing'] = d.t('ads').groupby(d.t('ads')['date'].dt.to_period('M'))['spend'].sum().reindex(m.index).fillna(0) if d.has('ads') else 0.0
    p['rent'] = 0.0
    p['other'] = p['revenue'] * 0.08
    return p.fillna(0), True


def _net(p: pd.DataFrame) -> pd.Series:
    return p['revenue'] - p['cogs'] - p['payroll'] - p['rent'] - p['marketing'] - p['other']


def profit(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    p, est = _pnl(d)
    last = p.tail(12)
    if len(last) < 6:
        raise NeedsData('Fewer than six months of profit and loss.')
    rng = np.random.default_rng(7)
    sims = 2000
    g = rng.normal(c.p['growth'] / 100, 0.06, sims)[:, None]
    gm = rng.normal(0, 0.015, sims)[:, None]
    w = rng.normal(c.p['wages'] / 100, 0.03, sims)[:, None]
    rev = last['revenue'].values[None, :] * (1 + g)
    cogs_r = (last['cogs'] / last['revenue'].replace(0, np.nan)).fillna(0).values[None, :] - gm
    other_r = (last['other'] / last['revenue'].replace(0, np.nan)).fillna(0).values[None, :]
    prof = rev * (1 - cogs_r - other_r) - last['payroll'].values * (1 + w) - last['rent'].values * 1.1 - last['marketing'].values
    totals = prof.sum(axis=1)
    p10, p50, p90 = np.percentile(totals, [10, 50, 90])
    last_year = _net(last).sum()
    labels = [month_label(q) for q in pd.period_range(last.index[-1] + 1, periods=len(last), freq='M')]
    loss_m = int((np.median(prof, axis=0) < 0).sum())
    return result(
        [kpi('Profit, last 12 months', f.money(last_year)), kpi('Next 12 months, most likely', f.money(p50), f.spct(p50 / last_year - 1) if last_year > 0 else None, 'good' if p50 >= last_year else 'bad'), kpi('80% range', f'{f.money(p10)} – {f.money(p90)}'), kpi('Chance of a loss-making year', f.pct((totals < 0).mean(), 0), tone='bad' if (totals < 0).mean() > 0.1 else 'good')],
        [chart('Monthly profit, next 12 months', line(labels, [series('Most likely', np.median(prof, axis=0))], band={'lo': list(np.percentile(prof, 10, axis=0)), 'hi': list(np.percentile(prof, 90, axis=0)), 'name': '80% range'}, zero=True), wide=True)],
        [
            finding(f'With {f.spct(c.p["growth"] / 100, 0)} sales growth and a {c.p["wages"]:.0f}% wage rise, profit is most likely {f.money(p50)}' + (f': {f.spct(p50 / last_year - 1)} on last year.' if last_year > 0 else '.'), 'medium' if est else 'high'),
            finding(f'{loss_m} months are likely to make a loss on their own.' if loss_m else 'Every month is likely to stay profitable.', 'medium', 'Plan cash for those months in advance.' if loss_m else None),
            finding(f'Each extra 5% of wage rise costs about {f.money(last["payroll"].sum() * 0.05)} a year.', 'high'),
        ],
        notes=(['No profit and loss file: costs other than goods are estimates from staff and ad data. Ask the client for a P&L.'] if est else [])
        + ([f'No cost prices for most of what was sold: a {ASSUMED_MARGIN:.0%} gross margin was assumed. Send a price list with costs to replace it.'] if p.attrs.get('assumed_margin') else []),
    )


def break_even(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    p, est = _pnl(d)
    last3 = p.tail(3)
    rev = last3['revenue'].mean()
    cmr = 1 - (last3['cogs'] / last3['revenue']).mean() - (last3['other'] / last3['revenue']).mean()
    fixed = (last3['payroll'] + last3['rent'] + last3['marketing']).mean() * (1 + c.p['fixed'] / 100)
    if cmr <= 0:
        raise NeedsData('Costs are higher than sales on every unit: check the cost column.')
    be = fixed / cmr
    safety = (rev - be) / rev
    xs = np.linspace(0, rev * 1.6, 21)
    return result(
        [kpi('Monthly fixed costs', f.money(fixed)), kpi('Kept from each 100 of sales', f'{c.fmt.cur} {cmr * 100:.0f}', 'after goods and variable costs'), kpi('Break-even sales a month', f.money(be)), kpi('Safety margin', f.pct(safety, 0), 'how far sales can fall before a loss', 'good' if safety > 0.15 else 'bad')],
        [chart('Monthly sales against total costs', line([f.money(x) for x in xs], [series('Sales', xs), series('Total costs', fixed + xs * (1 - cmr), 'orange')], marks=[{'index': int(np.searchsorted(xs, be)), 'label': 'Break-even', 'tone': 'amber'}, {'index': int(round(rev / (rev * 1.6) * 20)), 'label': 'Today', 'tone': 'green'}]), wide=True)],
        [
            finding(f'The business needs {f.money(be)} of sales a month to cover its costs; it makes {f.money(rev)} today.', 'medium' if est else 'high'),
            finding(f'Sales could fall {f.pct(max(0, safety), 0)} before the business makes a loss.', 'high', 'Thin cushion: cut fixed costs or raise prices.' if safety < 0.15 else None),
            finding(f'A new branch adding {f.money(fixed * 0.15)} of fixed costs a month must sell at least {f.money(fixed * 0.15 / cmr)} a month to pay for itself.', 'medium'),
        ],
        notes=(['No profit and loss file: fixed costs are estimates.'] if est else []) + ([f'No cost prices for most of what was sold: a {ASSUMED_MARGIN:.0%} gross margin was assumed.'] if p.attrs.get('assumed_margin') else []),
    )


def fx(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    r = d.recent(365)
    rev = r['amount'].sum()
    cost = (r['cost'] * r['qty']).sum()
    if not np.isfinite(cost) or cost <= 0:
        raise NeedsData('Sales can’t be matched to product costs (e-invoices carry no products): send a sales list with product codes.')
    imp = d.products.set_index('key')['imported'] if len(d.products) else pd.Series(dtype=float)
    share_by = r['product'].astype(str).str.strip().str.lower().map(imp)
    known = share_by.notna().mean() > 0.5
    share_by = share_by.fillna(c.p['imported'] / 100)
    imported = (r['cost'] * r['qty'] * share_by).sum()
    local = cost - imported
    rate, infl = c.p['rate'], c.p['infl'] / 100
    scen = [round(rate * k * 2) / 2 for k in (0.9, 1, 1.1, 1.2, 1.3)]

    def margin(x):
        return 1 - (imported * x / rate + local * (1 + infl)) / rev

    today = 1 - cost / rev

    def hold(x):
        return (imported * x / rate + local * (1 + infl)) / (1 - today) / rev - 1

    return result(
        [kpi('Imported share of costs', f.pct(imported / cost, 0), None if known else 'analyst estimate'), kpi('Gross margin today', f.pct(today)), kpi(f'Margin at {scen[3]:g} to the dollar', f.pct(margin(scen[3])), tone='bad'), kpi('Price rise to hold margin', f.spct(hold(scen[3])), f'at {scen[3]:g}')],
        [
            chart('Gross margin at each exchange rate (%)', bars([f'{x:g}' for x in scen], [margin(x) * 100 for x in scen], 'num', ref={'value': today * 100, 'label': 'Today'}, tones=['red' if margin(x) < today - 0.05 else 'amber' if margin(x) < today else 'green' for x in scen])),
            chart('Scenarios', table(['Local currency per dollar', 'Gross margin', 'Price rise to keep today’s margin'], [[f'{x:g}', f.pct(margin(x)), f.spct(hold(x))] for x in scen], [True, True, True])),
        ],
        [
            finding(f'{f.pct(imported / cost, 0)} of what the business sells is paid for in foreign currency.', 'high' if known else 'low'),
            finding(f'Every 10% fall in the currency cuts gross margin by about {f.pct(margin(rate) - margin(rate * 1.1), 1)} points.', 'high', f'Holding margin at {scen[3]:g} would need prices {f.spct(hold(scen[3]), 0)}.'),
            finding('Agree a rate trigger with the client: the level at which prices are reviewed automatically.', 'medium'),
        ],
        notes=['Exchange rate and inflation are scenario inputs set by the analyst, not forecasts.'] + ([] if known else [f'Imported share not in the price list: {c.p["imported"]:.0f}% assumed.']),
    )


def _opening(d: Data, client: dict) -> dict:
    if d.has('bank') and 'balance' in d.t('bank') and d.t('bank')['balance'].notna().any():
        b = d.t('bank').dropna(subset=['balance'])
        return {'opening': float(b.sort_values('date')['balance'].iloc[-1])}
    return {}


SERVICES = [
    Service('error-and-fraud-scan', 'accounting', 'Error and fraud scan', [['ledger', 'bank']], fraud_scan, medium=[['einv', 'bank'], ['ledger']], low=[['einv'], ['bank']], preview='Benford’s law (first digits, MAD test), approval-limit clusters, duplicate payments within five days, Isolation Forest on size, size against the party’s usual, roundness and timing, and gaps in invoice numbers.'),
    Service('books-e-invoices-and-bank-matched', 'accounting', 'Books, e-invoices and bank, matched', [['ledger', 'einv', 'bank']], reconcile, medium=[['ledger', 'einv'], ['einv', 'bank']], preview='Matched on invoice numbers where the files carry them, otherwise one-to-one on exact amount within a date window.'),
    Service(
        '13-week-cash-forecast',
        'accounting',
        '13-week cash forecast',
        [['bank', 'unpaid']],
        cash13,
        medium=[['bank']],
        params=[Param('opening', 'Bank balance today', -1e9, 1e10, 1000, 0, 'money'), Param('lag', 'Weeks before new sales are paid', 0, 13, 1, 6), Param('late', 'Share of customers who pay late', 0, 80, 5, 30, 'share')],
        defaults=_opening,
    ),
    Service('profit-projection-with-what-ifs', 'accounting', 'Profit projection with what-ifs', [['pnl']], profit, medium=[['sales', 'cost'], ['ledger']], low=[['sales']], params=[Param('growth', 'Sales growth', -20, 40, 1, 10, 'pct'), Param('wages', 'Wage rise', 0, 40, 1, 15, 'share')], preview='Driver-based model of the next 12 months, run 2,000 times with uncertain growth, margin and wage rises (Monte Carlo).'),
    Service('break-even', 'accounting', 'Break-even', [['pnl', 'cost'], ['pnl']], break_even, medium=[['sales', 'cost']], params=[Param('fixed', 'Change in fixed costs', -30, 50, 1, 0, 'pct')]),
    Service('exchange-rate-and-inflation-impact', 'accounting', 'Exchange rate and inflation impact', [['cost', 'sales']], fx, medium=[['cost']], params=[Param('rate', 'Local currency per dollar today', 0.1, 200, 0.5, 50, 'rate'), Param('infl', 'Local cost inflation', 0, 60, 1, 12, 'share'), Param('imported', 'Imported share if not in the price list', 0, 100, 5, 30, 'share')]),
]
