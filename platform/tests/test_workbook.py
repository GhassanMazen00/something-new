"""Workbooks from small business systems: several sheets, products packed into one cell, invoices without a number,
opening balances among the invoices, and a customer statement of payments, discounts and returns. Made-up data."""

import io

import pandas as pd

from clearline import engine, intake


def workbook() -> bytes:
    inv = pd.DataFrame({
        'رقم الفاتورة': [101, 102, 103, None, 105, None],
        'التاريخ': ['١ يناير ٢٠٢٦', '5 يناير 2026', '10 فبراير 2026', '1 يناير 2026', '1 مارس 2026', '2 مارس 2026'],
        'العميل': ['شركة النور', 'شركة النور', 'مصنع الأمل', 'مصنع الأمل', 'نقدي', 'شركة النور'],
        'الأصناف': ['سوسته بلاستيك (20) ×100 | سوسته معدن (20) ×50', 'سوسته بلاستيك مقاس 20 ×200', 'سوسته معدن (20) ×100', 'رصيد مرحل سابق ×1', 'سوسته بلاستيك (20) ×10', 'مرتجع نقدا ×1'],
        'الإجمالي': [2000, 2000, 2000, 5000, 100, 300],
    })
    pay = pd.DataFrame({
        'التاريخ': ['20 يناير 2026', '15 مارس 2026', '20 فبراير 2026', '5 يناير 2026'],
        'العميل': ['شركة النور', 'مصنع الأمل', 'مصنع الأمل', 'شركة النور'],
        'النوع': ['دفعة', 'دفعة', 'خصم', 'ترحيل'],
        'المبلغ': [3000, 4000, 200, 2000],
        'الملاحظة': ['فودافون كاش', 'نقدا', 'خصم', 'ترحيل'],
    })
    buf = io.BytesIO()
    with pd.ExcelWriter(buf) as w:
        pd.DataFrame({'المعرّف': [1, 2], 'اسم العميل': ['شركة النور', 'مصنع الأمل']}).to_excel(w, sheet_name='العملاء', index=False)
        inv.to_excel(w, sheet_name='الفواتير', index=False)
        pay.to_excel(w, sheet_name='الدفعات والحركات', index=False)
    return buf.getvalue()


def load(sheet):
    data = workbook()
    raw = intake.read_raw('book.xlsx', data, {'sheet': sheet})
    kind, mapping, _ = intake.suggest_kind(f'book.xlsx {sheet}', raw)
    std, health = intake.standardize(kind, raw, mapping, {})
    return kind, std, health


def test_each_sheet_gets_its_own_type():
    assert intake.sheets('book.xlsx', workbook()) == ['العملاء', 'الفواتير', 'الدفعات والحركات']
    assert load('الفواتير')[0] == 'sales'  # not a bank statement
    assert load('الدفعات والحركات')[0] == 'custledger'


def test_packed_products_split_and_still_add_up():
    _, std, health = load('الفواتير')
    first = std[std['order_id'] == '101']
    assert len(first) == 2 and abs(first['amount'].sum() - 2000) < 0.01  # two lines, same invoice total
    assert set(first['product']) == {'سوسته بلاستيك مقاس 20', 'سوسته معدن مقاس 20'}  # '(20)' and 'مقاس 20' agree
    assert health['unpacked']['invoices'] == 1
    # The two invoices without a number stay separate invoices.
    assert std['order_id'].astype(str).str.startswith('no-number').sum() == 2
    assert std['order_id'][std['order_id'].astype(str).str.startswith('no-number')].nunique() == 2


def test_opening_balances_are_not_sales():
    _, std, _ = load('الفواتير')
    d = engine.build_data({'sales': [std]})
    assert d.sales['amount'].sum() == 2000 + 2000 + 2000 + 100  # the 5,000 carried balance and the 300 return are out
    assert d.carried['value'] == 5000


def test_customer_balances_match_by_hand():
    _, sales, _ = load('الفواتير')
    _, led, _ = load('الدفعات والحركات')
    d = engine.build_data({'sales': [sales], 'custledger': [led]})
    out = engine.run('customer-balances-and-collection', d, {'transfers': 'Leave out'}, {'currency': 'EGP', 'files': []})
    k = {x['label']: x['value'] for x in out['result']['kpis']}
    # النور: 4,000 invoiced − 3,000 paid = 1,000 (the transfer echoes an invoice and is left out; the return line isn't owed).
    # الأمل: 2,000 + 5,000 carried − 4,000 paid − 200 discount = 2,800. Cash sales are left out.
    assert k['Owed to you now'] == 'EGP 3,800'
    assert any('Vodafone Cash' in ch['chart'].get('labels', []) for ch in out['result']['charts'])
