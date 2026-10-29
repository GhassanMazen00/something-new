"""Made-up clients for stress testing: clean tables with known answers, then exported the messy ways real files arrive.

Each client is random but reproducible from its seed: business type, size, history, currency, which files exist,
and how each file is formatted (headers in English or Arabic, date and number styles, title rows, Excel or CSV).
Known answers (sales totals, planted duplicate payments, ghost employees, a pay gap, an A/B lift…) are returned
alongside the files so the checks can tell whether each service found them.
"""

from __future__ import annotations

import io
from dataclasses import dataclass, field

import numpy as np
import pandas as pd

MENA = {'EGP', 'SAR', 'AED'}
CURRENCIES = ['EGP', 'EGP', 'EGP', 'SAR', 'AED', 'USD', 'GBP']
AR_DIGITS = str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩')

# Ways each standard field is written in real exports.
HEADERS: dict[str, list[str]] = {
    'date': ['Date', 'Invoice Date', 'Transaction Date', 'DATE', 'التاريخ', 'Order date'],
    'order_id': ['Invoice No', 'Order ID', 'Receipt', 'InvoiceNo', 'رقم الفاتورة'],
    'customer': ['Customer', 'Customer ID', 'Client', 'العميل', 'CustomerID'],
    'product': ['Item Code', 'SKU', 'Product', 'Product ID', 'كود الصنف'],
    'product_name': ['Description', 'Product Name', 'Item Name', 'اسم الصنف'],
    'branch': ['Branch', 'Store', 'Shop', 'الفرع'],
    'qty': ['Qty', 'Quantity', 'Units', 'الكمية'],
    'price': ['Unit Price', 'Price', 'Selling Price', 'سعر الوحدة'],
    'amount': ['Total', 'Line Total', 'Amount', 'Net Amount', 'الإجمالي'],
    'cost': ['Unit Cost', 'Cost', 'Cost Price', 'التكلفة'],
    'promo': ['Promo', 'On Promotion', 'عرض'],
    'time': ['Time', 'Hour', 'الوقت'],
    'channel': ['Channel', 'Source'],
    'variant': ['Group', 'Variant', 'Version'],
    'converted': ['Converted', 'Purchased'],
}
KIND_FILES = {
    'sales': ['sales_export', 'POS sales', 'orders', 'مبيعات', 'sales'],
    'einv': ['eta_einvoices', 'e-invoices', 'einvoice export'],
    'bank': ['bank_statement', 'CIB statement', 'bank'],
    'ledger': ['general_ledger', 'GL export', 'journal'],
    'unpaid': ['receivables_aging', 'AR aging', 'unpaid invoices'],
    'bills': ['bills_to_pay', 'supplier bills', 'AP aging'],
    'pnl': ['monthly_pnl', 'P&L', 'profit and loss'],
    'cost': ['price_list', 'cost list', 'products'],
    'stock': ['stock_count', 'inventory', 'stock'],
    'ads': ['ad_spend', 'marketing spend', 'ads by channel'],
    'adswide': ['marketing_weekly', 'media mix weekly'],
    'payroll': ['payroll', 'salaries', 'رواتب'],
    'staff': ['staff_list', 'employees', 'HR list'],
    'branches': ['branches', 'stores'],
    'abtest': ['ab_test', 'checkout test'],
    'empsurvey': ['team_survey', 'employee survey'],
    'trends': ['google_trends', 'search interest'],
    'competitors': ['competitor_prices', 'competitors'],
    'custsurvey': ['price_survey', 'customer survey'],
}


@dataclass
class File:
    name: str
    kind: str
    data: bytes
    headers: dict[str, str]  # standard field -> header used
    style: dict


@dataclass
class Client:
    seed: int
    profile: dict
    files: list[File] = field(default_factory=list)
    truth: dict = field(default_factory=dict)
    tables: dict[str, pd.DataFrame] = field(default_factory=dict)


# ---------- Clean tables ----------


def _sales(rng, p) -> tuple[pd.DataFrame, dict]:
    end = p['end']
    days = pd.date_range(end - pd.DateOffset(months=p['months']) + pd.Timedelta(days=1), end, freq='D')
    n_prod = p['products']
    codes = [f'P{100 + i}' for i in range(n_prod)]
    names = [f'Item {chr(65 + i % 26)}{i}' for i in range(n_prod)]
    base_price = np.round(rng.lognormal(np.log(p['avg_price']), 0.6, n_prod), 2)
    popularity = rng.dirichlet(np.ones(n_prod) * 0.6)
    # Price steps per product over time, to give elasticity something to learn from.
    step_days = sorted(rng.choice(len(days), size=min(4, len(days) // 30 + 1), replace=False)) if len(days) > 60 else []
    price_mult = np.ones((len(days), n_prod))
    for sd in step_days:
        price_mult[sd:] *= rng.uniform(0.9, 1.12, n_prod)
    t = np.arange(len(days)) / 365
    season = 1 + p['season_amp'] * np.cos(2 * np.pi * (days.month - p['peak_month']) / 12)
    dow = np.ones(len(days))
    dow[days.dayofweek.isin(p['weekend'])] = p['weekend_effect']
    ram = np.ones(len(days))
    if p['ramadan_effect'] != 1:
        from clearline.engine.calendar import in_ramadan

        ram[np.asarray(in_ramadan(days))] = p['ramadan_effect']
    promo_day = rng.random(len(days)) < p['promo_rate']
    lam = p['orders_per_day'] * np.exp(p['growth'] * t) * season * dow * ram * np.where(promo_day, 1.3, 1)
    n_orders = rng.poisson(lam)
    rows = []
    oid = 100000
    cust_pool = p['customers']
    cust_weights = rng.dirichlet(np.ones(cust_pool) * 0.4) if cust_pool else None
    branches = [f'Branch {chr(65 + i)}' for i in range(p['branches'])]
    br_w = rng.dirichlet(np.ones(len(branches)) * 3)
    for di, day in enumerate(days):
        k = n_orders[di]
        if not k:
            continue
        lines = rng.integers(1, p['max_lines'] + 1, k)
        custs = rng.choice(cust_pool, size=k, p=cust_weights) if cust_pool else [None] * k
        brs = rng.choice(len(branches), size=k, p=br_w)
        hours = np.clip(rng.normal(p['peak_hour'], 3, k).round(), 8, 23).astype(int)
        for j in range(k):
            oid += 1
            prods = rng.choice(n_prod, size=min(lines[j], n_prod), replace=False, p=popularity)
            for pi in prods:
                price = base_price[pi] * price_mult[di, pi] * (0.8 if promo_day[di] else 1)
                rel = price / base_price[pi]
                qty = max(1, int(rng.poisson(max(0.2, p['qty_mean'] * rel ** p['elasticity']))))
                rows.append((day + pd.Timedelta(hours=int(hours[j]), minutes=int(rng.integers(60))), f'INV{oid}', None if custs[j] is None else f'C{int(custs[j]):05d}', codes[pi], names[pi], branches[brs[j]], qty, round(price, 2), bool(promo_day[di]), rng.random() < 0.0))
    df = pd.DataFrame(rows, columns=['date', 'order_id', 'customer', 'product', 'product_name', 'branch', 'qty', 'price', 'promo', 'x'])
    df = df.drop(columns='x')
    df['amount'] = (df['qty'] * df['price']).round(2)
    df['is_return'] = False
    # Returns: whole lines sent back within three weeks (these are not sales).
    ret_idx = df.sample(frac=p['return_rate'], random_state=int(rng.integers(1e9))).index if len(df) else []
    rets = df.loc[ret_idx].copy()
    rets['date'] = rets['date'] + pd.to_timedelta(rng.integers(1, 21, len(rets)), unit='D')
    rets = rets[rets['date'] <= end + pd.Timedelta(hours=23)]
    rets['order_id'] = 'C' + rets['order_id']
    rets['qty'] = -rets['qty']
    rets['amount'] = -rets['amount']
    rets['is_return'] = True
    cancelled = set(rets.index)
    # A mistaken huge order cancelled minutes later.
    big = None
    if p['big_cancel'] and len(df):
        b = df.iloc[len(df) // 2].copy()
        b['qty'], b['order_id'] = 50000, 'INV999999'
        b['amount'] = round(b['qty'] * b['price'], 2)
        big = b
        bc = b.copy()
        bc['qty'], bc['amount'], bc['order_id'], bc['is_return'] = -b['qty'], -b['amount'], 'CINV999999', True
        bc['date'] = b['date'] + pd.Timedelta(minutes=10)
        df = pd.concat([df, b.to_frame().T], ignore_index=True)
        rets = pd.concat([rets, bc.to_frame().T], ignore_index=True)
        cancelled.add(len(df) - 1)
    # Postage lines: count in totals, not in product rankings.
    if p['postage'] and len(df):
        po = df.sample(n=max(1, len(df) // 40), random_state=1).copy()
        po['product'], po['product_name'], po['qty'], po['price'] = 'POST', 'POSTAGE', 1, 25.0
        po['amount'] = 25.0
        df = pd.concat([df, po], ignore_index=True)
    sold = df.drop(index=list(cancelled))
    last = sold[sold['date'] > end.normalize() - pd.Timedelta(days=365)]
    goods = last[last['product'] != 'POST']
    top_product = goods.groupby('product_name')['amount'].sum().idxmax() if len(goods) else None
    truth = {
        'sales_12m': float(last['amount'].sum()),
        'orders_12m': int(last['order_id'].nunique()),
        'customers_12m': int(last['customer'].nunique()) if cust_pool else None,
        'top_product': top_product,
        'cancelled_lines': len(cancelled),
        'big_cancel': big is not None,
        'months_full': p['months'],
        'elasticity': p['elasticity'],
    }
    full = pd.concat([df, rets], ignore_index=True).infer_objects().sort_values('date').reset_index(drop=True)
    full['is_return'] = full['is_return'].astype(bool)
    full['promo'] = full['promo'].astype(bool)
    full['cost'] = full['product'].map(dict(zip(codes, base_price * p['cost_ratio']))).round(2)
    full.loc[full['product'] == 'POST', 'cost'] = np.nan
    return full, truth | {'codes': codes, 'names': names, 'base_price': base_price, 'branches': branches}


def _staff_payroll(rng, p) -> tuple[pd.DataFrame, pd.DataFrame, dict]:
    n = p['staff']
    end = p['end']
    roles = ['Sales', 'Cashier', 'Driver', 'Accountant', 'Manager', 'Storekeeper'][: max(2, min(6, n // 4))]
    role = rng.choice(roles, n)
    base = {'Sales': 9000, 'Cashier': 7000, 'Driver': 6500, 'Accountant': 14000, 'Manager': 30000, 'Storekeeper': 7500}
    female = rng.random(n) < 0.4
    tenure = rng.exponential(3, n).clip(0.1, 25)
    gap = p['pay_gap']  # women paid this share less, same role and tenure
    salary = np.array([base[r] for r in role]) * np.exp(0.03 * tenure + rng.normal(0, 0.12, n)) * np.where(female, 1 - gap, 1)
    hire = end - pd.to_timedelta((tenure * 365).astype(int), unit='D')
    left = rng.random(n) < p['attrition']
    leave = pd.Series(pd.NaT, index=range(n), dtype='datetime64[ns]')
    leave[left] = (hire[left] + pd.to_timedelta((rng.uniform(0.2, 1, left.sum()) * tenure[left] * 365).astype(int), unit='D')).values
    ids = [f'E-{1000 + i}' for i in range(n)]
    staff = pd.DataFrame({'employee_id': ids, 'name': [f'Person {i}' for i in range(n)], 'role': role, 'gender': np.where(female, 'F', 'M'), 'hire_date': hire, 'leave_date': leave, 'salary': salary.round(0), 'branch': rng.choice(p.get('branch_names') or ['Main'], n)})
    # Payroll: last 12 months for current staff, plus planted problems.
    months = pd.period_range(end.to_period('M') - 11, end.to_period('M'), freq='M')
    rows = []
    for i in range(n):
        for m in months:
            if left[i] and leave[i].to_period('M') < m:
                continue
            if hire[i].to_period('M') > m:
                continue
            ot = max(0, rng.normal(salary[i] * 0.05, salary[i] * 0.02))
            rows.append((m.start_time, ids[i], f'Person {i}', round(salary[i]), round(ot), f'ACC{1000 + i}'))
    pay = pd.DataFrame(rows, columns=['month', 'employee_id', 'name', 'base', 'overtime', 'account'])
    ghosts = []
    for g in range(p['ghosts']):
        gid = f'E-{9000 + g}'
        ghosts.append(gid)
        for m in months[-6:]:
            pay.loc[len(pay)] = (m.start_time, gid, f'Ghost {g}', 8000, 0, f'ACC{9000 + g}')
    dup_pay = 0
    for _ in range(p['dup_pay']):
        r = pay.sample(1, random_state=int(rng.integers(1e9))).iloc[0]
        pay.loc[len(pay)] = r
        dup_pay += 1
    ot_spikes = 0
    for _ in range(p['ot_spikes']):
        j = int(rng.integers(len(pay)))
        pay.loc[j, 'overtime'] = pay.loc[j, 'base'] * 1.5
        ot_spikes += 1
    truth = {'staff': n, 'ghosts': ghosts, 'dup_pay': dup_pay, 'ot_spikes': ot_spikes, 'pay_gap': gap, 'left': int(left.sum())}
    return staff, pay, truth


def _ledger_bank(rng, p, sales: pd.DataFrame | None) -> tuple[dict, dict]:
    end = p['end']
    start = end - pd.DateOffset(months=min(p['months'], 12))
    parties = [f'Supplier {i}' for i in range(p['suppliers'])]
    n = p['ledger_rows']
    dates = start + pd.to_timedelta(rng.integers(0, (end - start).days, n), unit='D')
    amounts = np.round(rng.lognormal(np.log(15000), 1.1, n), 2)
    party = rng.choice(parties, n)
    led = pd.DataFrame({'entry_id': [f'JE{10000 + i}' for i in range(n)], 'date': dates, 'account': rng.choice(['Purchases', 'Rent', 'Utilities', 'Transport'], n), 'party': party, 'amount': amounts, 'reference': [f'PV{20000 + i}' for i in range(n)]}).sort_values('date').reset_index(drop=True)
    dups = []
    for _ in range(p['dup_ledger']):
        r = led.iloc[int(rng.integers(len(led)))].copy()
        r['date'] = r['date'] + pd.Timedelta(days=int(rng.integers(1, 4)))
        r['entry_id'] = f'JE{90000 + len(dups)}'
        r['reference'] = f'PV{90000 + len(dups)}'
        led.loc[len(led)] = r
        dups.append((r['party'], r['amount']))
    led = led.sort_values('date').reset_index(drop=True)
    # E-invoices from sales orders (or made up), some never booked.
    einv = None
    missing_from_books = 0
    if p['has_einv']:
        if sales is not None and len(sales):
            s = sales[~sales['is_return']]
            o = s.groupby('order_id').agg(date=('date', 'min'), customer=('customer', 'first'), amount=('amount', 'sum')).reset_index()
            o = o[o['date'] > end - pd.Timedelta(days=365)]
            o = o.sample(n=min(len(o), 1500), random_state=3).sort_values('date')
            einv = pd.DataFrame({'invoice_no': o['order_id'].str.replace('INV', 'EI'), 'date': o['date'].dt.normalize(), 'customer': o['customer'].fillna('Walk-in'), 'amount': o['amount'].round(2)})
        else:
            k = 400
            einv = pd.DataFrame({'invoice_no': [f'EI{i}' for i in range(k)], 'date': (end - pd.to_timedelta(rng.integers(0, 360, k), unit='D')).normalize(), 'customer': rng.choice([f'Buyer {i}' for i in range(30)], k), 'amount': np.round(rng.lognormal(np.log(20000), 0.8, k), 2)}).sort_values('date')
        einv = einv.reset_index(drop=True)
    # Bank: supplier payments (from the ledger) and customer deposits (from e-invoices), balance column.
    pay_out = led[['date', 'party', 'amount', 'reference']].assign(amount=lambda x: -x['amount'], description=lambda x: 'Transfer to ' + x['party'])
    deps = []
    if einv is not None:
        paid = einv.sample(frac=0.85, random_state=4)
        deps = pd.DataFrame({'date': paid['date'] + pd.to_timedelta(rng.integers(5, 40, len(paid)), unit='D'), 'amount': paid['amount'], 'reference': paid['invoice_no'], 'description': 'Deposit ' + paid['customer'].astype(str)})
        deps = deps[deps['date'] <= end]
    else:
        k = max(20, len(led) // 2)
        deps = pd.DataFrame({'date': start + pd.to_timedelta(rng.integers(0, (end - start).days, k), unit='D'), 'amount': np.round(rng.lognormal(np.log(30000), 0.7, k), 2), 'reference': [f'DEP{i}' for i in range(k)], 'description': 'Customer deposit'})
    bank = pd.concat([pay_out[['date', 'description', 'amount', 'reference']], deps], ignore_index=True).sort_values('date').reset_index(drop=True)
    opening = float(rng.uniform(2e5, 3e6))
    bank['balance'] = (opening + bank['amount'].cumsum()).round(2)
    if einv is not None and p['missing_books']:
        # Invoices issued but never entered in the ledger: the ledger only holds supplier side here, so the
        # reconciliation compares e-invoices with deposits; plant deposits missing for some invoices instead.
        missing_from_books = 0
    unpaid = None
    if p['has_unpaid']:
        k = int(rng.integers(5, 60))
        unpaid = pd.DataFrame({'reference': [f'AR{i}' for i in range(k)], 'party': rng.choice([f'Buyer {i}' for i in range(25)], k), 'amount': np.round(rng.lognormal(np.log(40000), 0.9, k), 2), 'due_date': (end + pd.to_timedelta(rng.integers(-90, 60, k), unit='D')).normalize()})
    bills = None
    if p['has_bills']:
        k = int(rng.integers(5, 50))
        bills = pd.DataFrame({'reference': [f'AP{i}' for i in range(k)], 'party': rng.choice(parties, k), 'amount': np.round(rng.lognormal(np.log(30000), 0.9, k), 2), 'due_date': (end + pd.to_timedelta(rng.integers(-20, 80, k), unit='D')).normalize()})
    tables = {'ledger': led, 'bank': bank}
    if einv is not None:
        tables['einv'] = einv
    if unpaid is not None:
        tables['unpaid'] = unpaid
    if bills is not None:
        tables['bills'] = bills
    truth = {'dup_ledger': dups, 'closing_balance': float(bank['balance'].iloc[-1]), 'missing_from_books': missing_from_books}
    return tables, truth


def _small_tables(rng, p, s_truth) -> tuple[dict, dict]:
    end = p['end']
    out, truth = {}, {}
    if p['has_cost'] and s_truth.get('codes'):
        codes = s_truth['codes']
        keep = rng.random(len(codes)) < 0.95
        out['cost'] = pd.DataFrame({'product': np.array(codes)[keep], 'name': np.array(s_truth['names'])[keep], 'price': np.round(s_truth['base_price'][keep], 2), 'cost': np.round(s_truth['base_price'][keep] * p['cost_ratio'], 2), 'category': rng.choice(['A', 'B', 'C'], keep.sum()), 'imported': rng.choice([0, 30, 60, 100], keep.sum())})
    if p['has_stock'] and s_truth.get('codes'):
        codes = s_truth['codes']
        out['stock'] = pd.DataFrame({'product': codes, 'on_hand': rng.integers(0, 500, len(codes)), 'lead_days': rng.choice([7, 14, 30, 60], len(codes))})
    if p['has_branches'] and s_truth.get('branches') and len(s_truth['branches']) > 1:
        b = s_truth['branches']
        out['branches'] = pd.DataFrame({'branch': b, 'area_sqm': rng.integers(80, 900, len(b)), 'staff': rng.integers(3, 30, len(b))})
    if p['has_pnl']:
        months = pd.period_range(end.to_period('M') - min(p['months'], 24) + 1, end.to_period('M') - 1, freq='M')
        rev = rng.uniform(5e5, 2e7) * np.exp(p['growth'] * np.arange(len(months)) / 12) * rng.normal(1, 0.08, len(months))
        out['pnl'] = pd.DataFrame({'month': months.start_time, 'revenue': rev.round(), 'cogs': (rev * p['cost_ratio']).round(), 'payroll': (rev * 0.12).round(), 'rent': np.full(len(months), round(rev.mean() * 0.05)), 'marketing': (rev * 0.03).round(), 'other': (rev * 0.04).round()})
    if p['has_ads']:
        weeks = pd.date_range(end - pd.Timedelta(weeks=int(rng.integers(20, 110))), end, freq='W-MON')
        chans = ['Facebook', 'Google', 'Instagram', 'TikTok'][: int(rng.integers(2, 5))]
        rows = []
        eff = {c: rng.uniform(0.002, 0.03) for c in chans}
        for w in weeks:
            for c in chans:
                sp = max(0, rng.normal(20000, 8000))
                nc = rng.poisson(sp * eff[c] * 0.1) if p['ads_nc'] else np.nan
                rows.append((w, c, round(sp), nc, round(sp * rng.uniform(1, 6)) if p['ads_rev'] else np.nan))
        out['ads'] = pd.DataFrame(rows, columns=['date', 'channel', 'spend', 'new_customers', 'revenue']).dropna(axis=1, how='all')
    if p['has_abtest']:
        lift = p['ab_lift']
        va, vb = int(rng.integers(500, 20000)), int(rng.integers(500, 20000))
        ra = rng.uniform(0.01, 0.08)
        ca, cb = rng.binomial(va, ra), rng.binomial(vb, ra * (1 + lift))
        if p['ab_rows']:
            out['abtest'] = pd.DataFrame({'user_id': range(va + vb), 'variant': ['control'] * va + ['treatment'] * vb, 'converted': np.r_[np.arange(va) < ca, np.arange(vb) < cb].astype(int)}).sample(frac=1, random_state=5)
        else:
            out['abtest'] = pd.DataFrame({'variant': ['A (control)', 'B'], 'visitors': [va, vb], 'conversions': [ca, cb]})
        truth['ab_lift'] = lift
        truth['ab_obs'] = (cb / vb) / max(ca / va, 1e-9) - 1
    if p['has_empsurvey']:
        k = int(rng.integers(8, 300))
        sc = rng.choice(11, k, p=rng.dirichlet(np.ones(11)))
        out['empsurvey'] = pd.DataFrame({'score': sc, 'comment': rng.choice(['Good manager', 'Pay is low', 'Too much overtime', '', 'Great team', 'No training'], k)})
        truth['enps'] = round(((sc >= 9).mean() - (sc <= 6).mean()) * 100)
    if p['has_trends']:
        weeks = pd.date_range(end - pd.Timedelta(weeks=int(rng.integers(30, 260))), end, freq='W-SUN')
        out['trends'] = pd.DataFrame({'date': weeks, 'interest': np.clip(50 + 20 * np.sin(np.arange(len(weeks)) / 8) + rng.normal(0, 8, len(weeks)), 0, 100).round()})
    if p['has_competitors'] and s_truth.get('names'):
        names = s_truth['names'][:10]
        rows = [(c, n, round(s_truth['base_price'][i] * rng.uniform(0.8, 1.25), 2), round(s_truth['base_price'][i], 2)) for c in ['Rival One', 'Rival Two', 'Rival Three'][: int(rng.integers(1, 4))] for i, n in enumerate(names)]
        out['competitors'] = pd.DataFrame(rows, columns=['competitor', 'product', 'price', 'our_price'])
    if p['has_custsurvey']:
        k = int(rng.integers(30, 400))
        mid = rng.uniform(50, 500)
        tc = mid * rng.uniform(0.3, 0.6, k)
        out['custsurvey'] = pd.DataFrame({'too_cheap': tc.round(), 'cheap': (tc * rng.uniform(1.2, 1.6, k)).round(), 'expensive': (tc * rng.uniform(1.8, 2.5, k)).round(), 'too_expensive': (tc * rng.uniform(2.6, 3.5, k)).round()})
    return out, truth


# ---------- Messy export ----------


def _header(rng, key: str, style: dict) -> str:
    opts = HEADERS.get(key)
    if not opts:
        base = key.replace('_', ' ').title()
        return base.upper() if style['caps'] else base
    if style['arabic']:
        ar = [o for o in opts if any('؀' <= ch <= 'ۿ' for ch in o)]
        if ar:
            return ar[0]
    en = [o for o in opts if not any('؀' <= ch <= 'ۿ' for ch in o)]
    h = en[int(rng.integers(len(en)))]
    return h.upper() if style['caps'] else h


def _fmt_date(v, style) -> str:
    if pd.isna(v):
        return ''
    v = pd.Timestamp(v)
    t = f' {v:%H:%M}' if style['with_time'] and (v.hour or v.minute) else ''
    f = style['date']
    if f == 'iso':
        return f'{v:%Y-%m-%d}{t}'
    if f == 'dmy':
        return f'{v.day:02d}/{v.month:02d}/{v.year}{t}'
    if f == 'mdy':
        return f'{v.month}/{v.day}/{v.year}{t}'
    if f == 'dot':
        return f'{v.day:02d}.{v.month:02d}.{v.year}'
    return f'{v:%Y-%m-%d}'


def _fmt_num(v, style) -> str:
    if pd.isna(v):
        return ''
    f = style['num']
    x = float(v)
    whole = x == int(x)
    if f == 'plain':
        s = f'{x:.0f}' if whole else f'{x:.2f}'
    elif f == 'comma':
        s = f'{x:,.0f}' if whole else f'{x:,.2f}'
    elif f == 'euro':
        s = (f'{x:,.2f}').replace(',', '_').replace('.', ',').replace('_', '.')
    elif f == 'paren':
        s = f'({abs(x):,.2f})' if x < 0 else f'{x:,.2f}'
    else:  # currency prefix
        s = f'{style["cur"]} {x:,.2f}'
    if style['arabic_digits']:
        s = s.translate(AR_DIGITS)
    return s


def export(rng, kind: str, df: pd.DataFrame, cur: str, mena: bool, xlsx_ok: bool = True) -> File:
    style = {
        'caps': rng.random() < 0.15,
        'arabic': mena and rng.random() < 0.25,
        'date': rng.choice(['iso', 'dmy', 'mdy', 'dot', 'iso'] if not mena else ['iso', 'dmy', 'dmy', 'dot']),
        'with_time': rng.random() < 0.3,
        'num': rng.choice(['plain', 'plain', 'comma', 'euro', 'paren', 'cur']),
        'arabic_digits': mena and rng.random() < 0.08,
        'title_rows': int(rng.choice([0, 0, 0, 1, 2, 3])),
        'total_row': rng.random() < 0.2,
        'extra_col': rng.random() < 0.3,
        'shuffle': rng.random() < 0.4,
        'fmt': rng.choice(['csv', 'csv', 'xlsx', 'xlsx', 'tsv', 'csv-cp1256' if mena else 'csv-bom']) if xlsx_ok else 'csv',
        'cur': cur,
    }
    if style['num'] == 'euro':
        style['fmt'] = 'csv-semicolon' if style['fmt'] != 'xlsx' else 'xlsx'
    df = df.reset_index(drop=True)
    headers = {c: _header(rng, c, style) for c in df.columns}
    # Avoid two columns with the same header.
    seen = set()
    for c, h in list(headers.items()):
        while h in seen:
            h = h + ' 2'
        headers[c] = h
        seen.add(h)
    out = pd.DataFrame()
    for c in df.columns:
        col = df[c]
        if pd.api.types.is_datetime64_any_dtype(col):
            if style['fmt'] == 'xlsx' and rng.random() < 0.5:
                out[headers[c]] = col  # real Excel dates
            else:
                out[headers[c]] = [_fmt_date(v, style) for v in col]
        elif pd.api.types.is_bool_dtype(col):
            out[headers[c]] = np.where(col, rng.choice(['Yes', 'TRUE', '1', 'نعم']) if style['arabic'] else 'Yes', 'No')
        elif pd.api.types.is_numeric_dtype(col) and c not in ('employee_id',):
            if style['fmt'] == 'xlsx' and style['num'] in ('plain', 'comma'):
                out[headers[c]] = col  # real numbers in Excel
            else:
                out[headers[c]] = [_fmt_num(v, style) for v in col]
        else:
            out[headers[c]] = col.astype(object).where(col.notna(), '')
    if style['extra_col']:
        out['Notes'] = rng.choice(['', 'checked', 'ok'], len(out))
    if style['shuffle']:
        out = out[list(rng.permutation(out.columns))]
    if style['total_row'] and len(out):
        tot = {h: '' for h in out.columns}
        tot[out.columns[0]] = 'Total'
        out = pd.concat([out, pd.DataFrame([tot])], ignore_index=True)
    name = rng.choice(KIND_FILES[kind]).replace(' ', '_' if rng.random() < 0.5 else ' ')
    titles = [['Company report'], [f'Exported {pd.Timestamp("2026-10-01"):%d/%m/%Y}'], ['']][: style['title_rows']]
    fmt = style['fmt']
    if fmt == 'xlsx':
        buf = io.BytesIO()
        with pd.ExcelWriter(buf, engine='openpyxl') as w:
            out.to_excel(w, index=False, startrow=style['title_rows'], sheet_name='Data')
            if style['title_rows']:
                ws = w.sheets['Data']
                for i, t in enumerate(titles):
                    ws.cell(i + 1, 1, t[0])
        return File(f'{name}.xlsx', kind, buf.getvalue(), headers, style)
    sep = {'tsv': '\t', 'csv-semicolon': ';'}.get(fmt, ',')
    body = out.to_csv(index=False, sep=sep, lineterminator='\n')
    head = ''.join(t[0] + '\n' for t in titles)
    text = head + body
    if fmt == 'csv-cp1256':
        try:
            data = text.encode('cp1256')
        except UnicodeEncodeError:
            data = text.encode('utf-8')
    elif fmt == 'csv-bom':
        data = text.encode('utf-8-sig')
    else:
        data = text.encode('utf-8')
    return File(f'{name}.{"tsv" if fmt == "tsv" else "csv"}', kind, data, headers, style)


def _edge(rng, edge: str, tables: dict) -> dict:
    """Awkward files real clients send: almost empty, one month, zeros, typo'd years, one customer, empty columns."""
    out = {}
    for kind, df in tables.items():
        df = df.copy()
        dcol = next((c for c in ('date', 'month', 'due_date', 'hire_date') if c in df and pd.api.types.is_datetime64_any_dtype(df[c])), None)
        if edge == 'tiny':
            df = df.head(int(rng.choice([1, 2, 3, 5])))
        elif edge == 'one_month' and dcol:
            df = df[df[dcol] > df[dcol].max() - pd.Timedelta(days=31)]
        elif edge == 'zeros':
            for c in ('amount', 'price', 'spend', 'base', 'salary', 'revenue', 'visitors'):
                if c in df:
                    df.loc[df.sample(frac=0.5, random_state=1).index, c] = 0
        elif edge == 'future' and dcol and len(df):
            idx = df.sample(frac=0.03, random_state=2).index
            df.loc[idx, dcol] = df.loc[idx, dcol] + pd.DateOffset(years=10)
        elif edge == 'single_customer' and 'customer' in df:
            df['customer'] = df['customer'].where(df['customer'].isna(), 'C00001')
        elif edge == 'blank_cols':
            opt = [c for c in df.columns if c not in ('date', 'product', 'amount', 'employee_id', 'party', 'month', 'variant', 'score', 'invoice_no', 'reference', 'branch', 'competitor', 'channel', 'spend', 'role', 'on_hand', 'price', 'cost', 'base', 'revenue', 'interest', 'too_cheap', 'cheap', 'expensive', 'too_expensive', 'due_date', 'customer')]
            if opt:
                df[str(rng.choice(opt))] = np.nan
        if len(df):
            out[kind] = df
    return out


# ---------- A whole client ----------


def make_client(seed: int, scale: float = 1.0) -> Client:
    rng = np.random.default_rng(seed)
    cur = str(rng.choice(CURRENCIES))
    mena = cur in MENA
    biz = str(rng.choice(['shop', 'online', 'b2b', 'oneoff', 'restaurant']))
    months = int(rng.choice([2, 5, 9, 13, 16, 20, 26, 30, 40]))
    end = pd.Timestamp('2026-09-30') + pd.Timedelta(days=int(rng.integers(0, 25)))
    products = int(rng.choice([1, 2, 4, 12, 40, 150]))
    customers = {'shop': int(rng.choice([0, 0, 300, 3000])), 'online': int(rng.choice([150, 2000, 12000])), 'b2b': int(rng.choice([6, 25, 120])), 'oneoff': int(rng.choice([4000, 20000])), 'restaurant': 0}[biz]
    opd = {'shop': rng.uniform(20, 200), 'online': rng.uniform(10, 300), 'b2b': rng.uniform(2, 20), 'oneoff': rng.uniform(5, 60), 'restaurant': rng.uniform(50, 300)}[biz] * scale
    opd = min(opd, 60000 / max(months * 30, 1))  # keep files at most around 60k orders
    weekend = [4, 5] if cur in {'EGP', 'SAR'} else [5, 6]
    staff_n = int(rng.choice([3, 8, 25, 80, 300]))
    p = {
        'seed': seed, 'currency': cur, 'biz': biz, 'months': months, 'end': end, 'products': products, 'customers': customers,
        'orders_per_day': opd, 'branches': int(rng.choice([1, 1, 3, 6])) if biz in ('shop', 'restaurant') else 1, 'avg_price': float(rng.choice([15, 80, 400, 3000, 25000])),
        'max_lines': 1 if biz == 'oneoff' else int(rng.choice([1, 3, 6])), 'qty_mean': float(rng.choice([1, 2, 5, 20])) if biz != 'oneoff' else 1.0,
        'growth': float(rng.uniform(-0.3, 0.5)), 'season_amp': float(rng.choice([0, 0.1, 0.3])), 'peak_month': int(rng.integers(1, 13)),
        'weekend': weekend, 'weekend_effect': float(rng.choice([1.0, 0.6, 1.4])), 'ramadan_effect': float(rng.choice([1.0, 0.7, 1.5])) if mena else 1.0,
        'promo_rate': float(rng.choice([0, 0.05])), 'elasticity': float(rng.uniform(-2.5, -0.3)), 'peak_hour': float(rng.choice([12, 15, 20])),
        'return_rate': float(rng.choice([0, 0.005, 0.02])), 'big_cancel': rng.random() < 0.3, 'postage': biz == 'online' and rng.random() < 0.5,
        'cost_ratio': float(rng.uniform(0.35, 0.8)), 'staff': staff_n, 'pay_gap': float(rng.choice([0, 0, 0.1, 0.2])) if staff_n >= 25 else 0.0, 'attrition': float(rng.uniform(0.05, 0.35)),
        'ghosts': int(rng.choice([0, 1, 2])), 'dup_pay': int(rng.choice([0, 1, 3])), 'ot_spikes': int(rng.choice([0, 2])),
        'suppliers': int(rng.choice([3, 15, 60])), 'ledger_rows': int(rng.choice([30, 300, 3000])), 'dup_ledger': int(rng.choice([0, 2, 6])),
        'has_einv': mena and rng.random() < 0.6, 'missing_books': False, 'has_unpaid': rng.random() < 0.5, 'has_bills': rng.random() < 0.5,
        'has_cost': rng.random() < 0.6, 'has_stock': rng.random() < 0.4, 'has_branches': rng.random() < 0.6, 'has_pnl': rng.random() < 0.4,
        'has_ads': rng.random() < 0.4, 'ads_nc': rng.random() < 0.6, 'ads_rev': rng.random() < 0.5, 'has_abtest': rng.random() < 0.3, 'ab_lift': float(rng.choice([0, 0.05, 0.3])), 'ab_rows': rng.random() < 0.4,
        'has_empsurvey': rng.random() < 0.3, 'has_trends': rng.random() < 0.3, 'has_competitors': rng.random() < 0.3, 'has_custsurvey': rng.random() < 0.3,
    }
    c = Client(seed, p)
    files_present = {k: rng.random() < pr for k, pr in {'sales': 0.85, 'accounts': 0.5, 'people': 0.6}.items()}
    tables: dict[str, pd.DataFrame] = {}
    sales = None
    if files_present['sales']:
        sales, st = _sales(rng, p)
        tables['sales'] = sales
        c.truth['sales'] = {k: v for k, v in st.items() if k not in ('codes', 'names', 'base_price', 'branches')}
    else:
        st = {}
    p['branch_names'] = st.get('branches')
    if files_present['people']:
        staff, pay, pt = _staff_payroll(rng, p)
        tables['staff'], tables['payroll'] = staff, pay
        c.truth['people'] = pt
    if files_present['accounts']:
        at, a_truth = _ledger_bank(rng, p, sales)
        tables.update(at)
        c.truth['accounts'] = a_truth
    small, s_truth = _small_tables(rng, p, st)
    tables.update(small)
    c.truth['small'] = s_truth
    edge = str(rng.choice(['none'] * 7 + ['tiny', 'one_month', 'zeros', 'future', 'single_customer', 'blank_cols']))
    p['edge'] = edge
    if edge != 'none':
        tables = _edge(rng, edge, tables)
        c.truth = {'edge': edge}
    c.tables = tables
    for kind, df in tables.items():
        if df.empty:
            continue
        export_df = df
        if kind == 'sales':
            keep = ['date', 'order_id', 'customer', 'product', 'product_name', 'branch', 'qty', 'price', 'amount', 'promo']
            if p['branches'] == 1:
                keep.remove('branch')
            if not customers:
                keep.remove('customer')
            if rng.random() < 0.3:
                keep.remove('product_name')
            if rng.random() < 0.4:
                keep.remove('promo')
            if rng.random() < 0.3:
                keep.append('cost')
            export_df = df[keep].copy()
            if rng.random() < 0.3:
                export_df = export_df.drop(columns='amount')
            if rng.random() < 0.15 and 'qty' in export_df and 'price' in export_df and 'amount' in export_df:
                export_df = export_df.drop(columns='price')
            if rng.random() < 0.02 and len(export_df):
                export_df = pd.concat([export_df, export_df.sample(frac=0.01, random_state=7)]).sort_values('date')
        elif kind == 'staff':
            export_df = df.copy()
            if rng.random() < 0.3:
                export_df['left'] = export_df['leave_date'].notna()
            if rng.random() < 0.2:
                export_df = export_df.drop(columns='gender')
        elif kind == 'bank' and rng.random() < 0.4:
            export_df = df.assign(debit=(-df['amount']).clip(lower=0).where(lambda v: v > 0), credit=df['amount'].clip(lower=0).where(lambda v: v > 0)).drop(columns='amount')
        big = len(export_df) > 80000
        c.files.append(export(rng, kind, export_df, cur, mena, xlsx_ok=not big))
    return c
