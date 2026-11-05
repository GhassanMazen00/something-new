"""Customer balances and collection: what each customer owes, for how long, how fast they pay, and how.

Built from the invoices (a sales list or e-invoices) and a customer statement of payments, discounts, returns and
transfers. Payments are matched to the oldest unpaid invoices first, which is how most businesses settle accounts.
"""

from __future__ import annotations

import re

import numpy as np
import pandas as pd

from .core import BALANCE_LINE, Ctx, Data, NeedsData, Service, bars, chart, choice_param, finding, kpi, result, table

# What each movement does to the balance, read from its type (English or Arabic).
PAYMENT = re.compile(r'(?i)pay|paid|receipt|collect|settle|دفع|سداد|تحصيل|قبض|ايداع|إيداع')
DISCOUNT = re.compile(r'(?i)discount|allowance|rebate|write.?off|خصم|تخفيض|اعدام|إعدام|تسوية')
RETURN = re.compile(r'(?i)return|credit note|refund|مرتجع|مرتجعات|ارجاع|إرجاع|رد')
TRANSFER = re.compile(r'(?i)transfer|post|journal|ترحيل|تحويل رصيد|نقل')
CASH_CUSTOMER = re.compile(r'(?i)^\s*(?:cash|walk.?in|نقدي|نقدى|نقدا|نقداً|كاش)\s*$')
METHODS = [  # the specific wallets first: 'Vodafone Cash' must not count as cash
    ('Vodafone Cash', re.compile(r'(?i)vodafone|فودافون')),
    ('InstaPay', re.compile(r'(?i)insta|انستا|إنستا')),
    ('Cash', re.compile(r'(?i)cash|نقد|كاش')),
    ('Bank or cheque', re.compile(r'(?i)bank|transfer|cheque|check|بنك|تحويل|شيك')),
]
BUCKETS = [(30, '0–30 days'), (60, '31–60 days'), (90, '61–90 days'), (10**6, 'Over 90 days')]


def _movement(t: str) -> str:
    t = str(t or '')
    if DISCOUNT.search(t):
        return 'discount'
    if RETURN.search(t):
        return 'return'
    if TRANSFER.search(t):
        return 'transfer'
    if PAYMENT.search(t):
        return 'payment'
    return 'other'


def _method(text: str) -> str:
    for name, rx in METHODS:
        if rx.search(str(text or '')):
            return name
    return 'Not stated'


def _invoices(d: Data) -> pd.DataFrame:
    """One row per invoice (customer, date, total), opening balances included: they are money owed too."""
    if d.has('sales'):
        s = d.sales_all
        s = s[~s['is_return']]
        key = s['order_id'].astype(str) + '|' + s['customer'].astype(str)
        inv = s.groupby(key).agg(date=('date', 'min'), customer=('customer', 'first'), amount=('amount', 'sum'), carried=('product', lambda x: x.astype(str).str.contains(BALANCE_LINE, regex=True).any()))
    elif d.has('einv'):
        e = d.t('einv')
        inv = pd.DataFrame({'date': e['date'], 'customer': e['customer'], 'amount': e['amount'], 'carried': False})
    else:
        raise NeedsData('Needs the invoices too: a sales list or e-invoices.')
    inv = inv.dropna(subset=['customer'])
    inv['customer'] = inv['customer'].astype(str).str.strip()
    return inv[inv['amount'] > 0].reset_index(drop=True)


def _fifo(inv: pd.DataFrame, credits: pd.DataFrame, end: pd.Timestamp) -> tuple[pd.DataFrame, list[float]]:
    """Match each customer's payments, discounts and returns to their oldest invoices. Returns the unpaid part of
    each invoice and, for paid invoices, the days each took to pay (weighted by the amount)."""
    open_rows, days = [], []
    for cust, own in inv.sort_values('date').groupby('customer', sort=False):
        pay = credits[credits['customer'] == cust].sort_values('date')
        queue = [[r.date, r.amount] for r in own.itertuples()]
        i = 0
        for p in pay.itertuples():
            left = p.amount
            while left > 0.005 and i < len(queue):
                take = min(left, queue[i][1])
                if take > 0 and p.kind == 'payment':
                    days.append((max(0, (p.date - queue[i][0]).days), take))  # paid ahead: zero days, never negative
                queue[i][1] -= take
                left -= take
                if queue[i][1] <= 0.005:
                    i += 1
        for date, amount in queue[i:]:
            if amount > 0.5:
                open_rows.append((cust, date, amount, (end - date).days))
    return pd.DataFrame(open_rows, columns=['customer', 'date', 'amount', 'age']), days


def balances(c: Ctx) -> dict:
    d, f = c.data, c.fmt
    if not d.has('custledger'):
        raise NeedsData('Needs the customer statement: payments, discounts and returns per customer.')
    inv = _invoices(d)
    led = d.t('custledger').copy()
    led['customer'] = led['customer'].astype(str).str.strip()
    # Names merged as spellings of one customer in the sales are merged in the statement too.
    rename = {m: g[0] for g in d.merges.get('customer', []) for m in g[1:]}
    led['customer'] = led['customer'].replace(rename)
    led['kind'] = led['type'].map(_movement)
    rule = c.p.get('transfers') or 'Leave out'
    end = max(inv['date'].max(), led['date'].max()).normalize()

    # Transfers: often the same invoice posted to the account again. Count them only if the analyst says so.
    tr = led[led['kind'] == 'transfer']
    same_day = inv.groupby([inv['customer'], inv['date'].dt.normalize()])['amount'].sum()
    echo = np.mean([abs(same_day.get((r.customer, r.date.normalize()), np.nan) - r.amount) < 1 for r in tr.itertuples()]) if len(tr) else 0.0
    charges = inv[['customer', 'date', 'amount']]
    if rule == 'Count as money owed' and len(tr):
        charges = pd.concat([charges, tr[['customer', 'date', 'amount']]], ignore_index=True)
    credit_kinds = {'payment', 'discount', 'return'} | ({'transfer'} if rule == 'Count as paid' else set())
    credits = led[led['kind'].isin(credit_kinds)][['customer', 'date', 'amount', 'kind']].copy()
    refunds = credits[credits['amount'] < 0]
    credits = credits[credits['amount'] > 0]

    cash = charges['customer'].str.match(CASH_CUSTOMER) | False
    charges = charges[~cash]
    credits = credits[~credits['customer'].str.match(CASH_CUSTOMER)]
    owed = charges.groupby('customer')['amount'].sum().sub(credits.groupby('customer')['amount'].sum(), fill_value=0)
    owing = owed[owed > 1].sort_values(ascending=False)
    in_credit = owed[owed < -1].sort_values()
    open_inv, pay_days = _fifo(charges, credits.assign(kind=credits['kind']), end)

    total = float(owing.sum())
    if open_inv.empty:
        aging = pd.Series(0.0, index=[b for _, b in BUCKETS])
    else:
        lab = pd.cut(open_inv['age'], [-1] + [x for x, _ in BUCKETS], labels=[b for _, b in BUCKETS])
        aging = open_inv.groupby(lab, observed=False)['amount'].sum()
    over90 = float(aging.get('Over 90 days', 0.0))
    if pay_days:
        dd = np.array(pay_days)
        avg_days = float(np.average(dd[:, 0], weights=dd[:, 1]))
    else:
        avg_days = np.nan
    last90 = charges[charges['date'] > end - pd.Timedelta(days=90)]['amount'].sum()
    dso = total / (last90 / 90) if last90 > 0 else np.nan

    # How each customer pays: days to pay, and what they still owe.
    per = []
    if pay_days:
        cust_days: dict[str, list] = {}
        # recompute per customer for the table
        for cust, own in charges.sort_values('date').groupby('customer', sort=False):
            _, dd_c = _fifo(own, credits[credits['customer'] == cust], end)
            if dd_c:
                a = np.array(dd_c)
                cust_days[cust] = [float(np.average(a[:, 0], weights=a[:, 1])), float(a[:, 1].sum())]
        per = sorted(cust_days.items(), key=lambda kv: -kv[1][1])
    oldest = open_inv.groupby('customer')['age'].max() if len(open_inv) else pd.Series(dtype=float)

    # Payment methods, read from the type and the note.
    paid = led[led['kind'] == 'payment'].copy()
    paid['method'] = (paid['type'].astype(str) + ' ' + paid.get('note', pd.Series('', index=paid.index)).astype(str)).map(_method)
    methods = paid[paid['amount'] > 0].groupby('method')['amount'].sum().sort_values(ascending=False)

    # Discounts against sales, per customer.
    disc = led[led['kind'] == 'discount'].groupby('customer')['amount'].sum()
    sales_c = inv[~inv['carried']].groupby('customer')['amount'].sum()
    disc_share = (disc / sales_c).replace([np.inf, -np.inf], np.nan).dropna()
    disc_share = disc_share[sales_c.reindex(disc_share.index) > 0]
    big_disc = disc_share[disc_share > max(0.1, disc_share.median() * 3)].sort_values(ascending=False) if len(disc_share) >= 5 else pd.Series(dtype=float)

    top = owing.head(15)
    charts = [
        chart('Who owes the most', bars(list(top.index), list(top.values), 'money', horizontal=True, tones=['orange' if oldest.get(k, 0) > 90 else 'accent' for k in top.index])),
        chart('How long the money has been owed', bars(list(aging.index), list(aging.values), 'money', tones=['accent', 'accent', 'orange', 'red'])),
        chart(
            'Balances, oldest debt and speed of payment',
            table(
                ['Customer', 'Owes', 'Oldest unpaid invoice', 'Usual days to pay'],
                [[k, f.money(v, True), f'{int(oldest.get(k, 0))} days' if k in oldest.index else '–', f'{dict(per).get(k, [np.nan])[0]:.0f}' if k in dict(per) else '–'] for k, v in owing.head(40).items()],
                numeric=[1, 2, 3],
            ),
            wide=True,
        ),
    ]
    if len(methods):
        charts.append(chart('How customers paid', bars(list(methods.index), list(methods.values), 'money', horizontal=True)))
    findings = [
        finding(f'Customers owe {f.money(total)} in all, across {len(owing):,} customers; the top five hold {owing.head(5).sum() / max(total, 1):.0%} of it.', 'high' if echo < 0.5 or rule == 'Leave out' else 'medium', 'Start collection calls with the top five.'),
    ]
    if over90 > 0:
        findings.append(finding(f'{f.money(over90)} ({over90 / max(total, 1):.0%}) has been owed for more than 90 days.', 'high', 'Agree a payment plan for each of these, or decide what to write off.'))
    if np.isfinite(avg_days):
        findings.append(finding(f'Paid invoices took {avg_days:.0f} days to pay on average, weighted by amount.' + (f' At today’s pace the money owed equals about {dso:.0f} days of credit sales.' if np.isfinite(dso) else ''), 'medium'))
    if len(in_credit):
        findings.append(finding(f'{len(in_credit):,} customers have paid more than they were invoiced in these files ({f.money(-in_credit.sum())} in all), led by {in_credit.index[0]} ({f.money(-in_credit.iloc[0])}).', 'high', 'Usually an opening balance or an invoice missing from the files: check these accounts with the client before treating them as credit.'))
    if len(big_disc):
        findings.append(finding(f'Discounts stand out for {", ".join(f"{k} ({v:.0%} of their purchases)" for k, v in big_disc.head(3).items())}.', 'medium', 'Check these discounts were approved.'))
    if len(refunds):
        findings.append(finding(f'{len(refunds):,} payments are negative ({f.money(-refunds["amount"].sum())}): refunds or account corrections.', 'medium', 'Confirm each one has a reason on file.'))
    if len(tr):
        findings.append(finding(
            f'{len(tr):,} transfers ({f.money(tr["amount"].sum())}): {echo:.0%} of them equal the same customer’s invoices on the same day, so they look like invoices posted to the account again. '
            + {'Leave out': 'They were left out, so nothing is counted twice.', 'Count as money owed': 'They were counted as money owed, as chosen.', 'Count as paid': 'They were counted as paid, as chosen.'}[rule],
            'medium', 'Confirm with the client what a transfer (ترحيل) means in their system.'))
    if cash.any():
        findings.append(finding(f'{int(cash.sum()):,} cash-sale invoices were left out of balances: they are paid on the spot.', 'low'))
    level = 'high' if rule == 'Leave out' and echo >= 0.5 else 'medium'
    return result(
        [
            kpi('Owed to you now', f.money(total), f'{len(owing):,} customers'),
            kpi('Owed over 90 days', f.money(over90), f'{over90 / max(total, 1):.0%} of the total', 'bad' if over90 / max(total, 1) > 0.25 else None),
            kpi('Usual days to pay', f'{avg_days:.0f}' if np.isfinite(avg_days) else '–', 'weighted by amount' if np.isfinite(avg_days) else 'no payments matched'),
            kpi('Customers in credit', f'{len(in_credit):,}', f.money(-in_credit.sum()) if len(in_credit) else None, 'bad' if len(in_credit) else None),
        ],
        charts,
        findings,
        accuracy='Payments, discounts and returns were matched to each customer’s oldest unpaid invoices first. Balances are only as complete as the files: an invoice or opening balance missing from them shows as credit.',
        notes=[f'Balances as of {end:%d %b %Y}, the last date in the files.'],
    ) | {'level': level}


SERVICES = [
    Service(
        'customer-balances-and-collection',
        'accounting',
        'Customer balances and collection',
        [['custledger', 'sales'], ['custledger', 'einv']],
        balances,
        params=[choice_param('transfers', 'Transfers (ترحيل) are', ['Leave out', 'Count as money owed', 'Count as paid'])],
        preview='Payments, discounts and returns matched to the oldest invoices first (FIFO); ageing in 30-day bands; days to pay weighted by amount; payment methods read from the notes.',
        data_text='Invoices (a sales list or e-invoices) and the customer statement: payments, discounts, returns and transfers per customer',
        missing_text='Without the statement, use 13-week cash forecast with the unpaid invoices list',
    ),
]

# The catalogue's words for this service (it isn't on the public website yet).
TEXT = {
    'customer-balances-and-collection': {
        'name': 'Customer balances and collection',
        'get': 'Who owes you what, for how long, how fast each customer pays, and how they pay',
        'method': 'Payments matched to the oldest invoices first (FIFO), ageing bands and days to pay',
        'data': 'Invoices and the customer statement of payments, discounts and returns',
        'missing': 'Without the statement, use the unpaid invoices list',
    },
}
