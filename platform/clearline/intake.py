"""Intake: read a client's file, recognise what it is, map its columns to standard fields and clean the values.

Every service reads the standard tables this module produces, never the raw files. Real exports differ in
column names, languages, date formats and number formats; all of that is absorbed here.
"""

from __future__ import annotations

import csv
import io
import re
from dataclasses import dataclass, field

import numpy as np
import pandas as pd

# ---------- What each kind of file holds ----------


@dataclass
class Field:
    key: str
    label: str
    type: str  # date, number, text, bool, int
    synonyms: list[str] = field(default_factory=list)
    required: bool = False


@dataclass
class Kind:
    key: str
    label: str
    fields: list[Field]
    # At least one of these groups must be fully mapped, on top of the required fields.
    any_of: list[list[str]] = field(default_factory=list)
    hints: list[str] = field(default_factory=list)  # words in a file name that suggest this kind
    store_as: str | None = None  # read as another kind's table once reshaped


def F(key, label, type_, syn='', required=False):
    return Field(key, label, type_, [s.strip() for s in syn.split('|') if s.strip()], required)


DATE = 'date|day|transaction date|txn date|order date|invoice date|posting date|doc date|value date|تاريخ|التاريخ'
AMOUNT = 'amount|total|value|net amount|gross amount|line total|sum|المبلغ|القيمة|الإجمالي|اجمالي'

KINDS: dict[str, Kind] = {
    k.key: k
    for k in [
        Kind(
            'sales',
            'Sales list',
            [
                F('date', 'Date', 'date', DATE + '|invoicedate|sale date', True),
                F('order_id', 'Order or invoice', 'text', 'order|order id|order no|invoice|invoice no|invoiceno|receipt|bill no|transaction id|رقم الفاتورة|الفاتورة|رقم الطلب'),
                F('customer', 'Customer', 'text', 'customer|customer id|customerid|client|buyer|account|phone|العميل|رقم العميل|اسم العميل'),
                F('product', 'Product', 'text', 'product|item|sku|stockcode|stock code|item code|product id|description|product name|الصنف|المنتج|كود الصنف', True),
                F('product_name', 'Product name', 'text', 'description|product name|item name|product description|item description|اسم الصنف|اسم المنتج'),
                F('branch', 'Branch or store', 'text', 'branch|store|shop|location|outlet|country|region|الفرع|المتجر'),
                F('channel', 'Channel', 'text', 'channel|source|platform|القناة'),
                F('qty', 'Quantity', 'number', 'qty|quantity|units|pieces|الكمية|عدد'),
                F('price', 'Unit price', 'number', 'price|unit price|unitprice|selling price|سعر|السعر|سعر الوحدة'),
                F('amount', 'Line total', 'number', AMOUNT + '|sales|revenue|net sales'),
                F('cost', 'Unit cost', 'number', 'cost|unit cost|cogs|cost price|التكلفة'),
                F('promo', 'Promotion', 'bool', 'promo|promotion|on sale|discounted|عرض'),
                F('time', 'Time of day', 'text', 'time|hour|order time|الوقت|الساعة'),
            ],
            any_of=[['price'], ['amount']],
            hints=['sales', 'orders', 'order', 'invoice', 'transactions', 'retail', 'pos', 'مبيعات'],
        ),
        Kind(
            'einv',
            'E-invoices',
            [
                F('invoice_no', 'Invoice number', 'text', 'invoice no|invoice number|internal id|uuid|document number|رقم الفاتورة|رقم المستند', True),
                F('date', 'Date', 'date', DATE + '|issued|date issued', True),
                F('customer', 'Customer', 'text', 'customer|client|receiver|buyer|receiver name|customer name|العميل|المستلم', True),
                F('amount', 'Total', 'number', AMOUNT + '|total amount', True),
            ],
            hints=['einvoice', 'e-invoice', 'eta', 'einv', 'e_invoice'],
        ),
        Kind(
            'bank',
            'Bank statement',
            [
                F('date', 'Date', 'date', DATE, True),
                F('description', 'Description', 'text', 'description|details|narrative|memo|particulars|البيان|الوصف'),
                F('amount', 'Amount (+ in, − out)', 'number', AMOUNT),
                F('debit', 'Money out (debit)', 'number', 'debit|withdrawal|withdrawals|paid out|مدين|سحب'),
                F('credit', 'Money in (credit)', 'number', 'credit|deposit|deposits|paid in|دائن|إيداع|ايداع'),
                F('reference', 'Reference', 'text', 'reference|ref|cheque|check no|transaction id|المرجع'),
                F('balance', 'Balance', 'number', 'balance|running balance|closing balance|الرصيد'),
            ],
            any_of=[['amount'], ['debit'], ['credit']],
            hints=['bank', 'statement', 'كشف'],
        ),
        Kind(
            'ledger',
            'Ledger / books',
            [
                F('entry_id', 'Entry', 'text', 'entry|journal|voucher|je|entry no|رقم القيد'),
                F('date', 'Date', 'date', DATE + '|check date|payment date', True),
                F('account', 'Account', 'text', 'account|gl account|account name|department|الحساب'),
                F('party', 'Supplier or customer', 'text', 'party|vendor|supplier|payee|vendor name|customer|name|المورد|الطرف', True),
                F('amount', 'Amount', 'number', AMOUNT + '|payment amount|debit amount'),
                F('debit', 'Debit', 'number', 'debit|مدين'),
                F('credit', 'Credit', 'number', 'credit|دائن'),
                F('reference', 'Reference', 'text', 'reference|ref|voucher|invoice|check number|document|المرجع'),
            ],
            any_of=[['amount'], ['debit'], ['credit']],
            hints=['ledger', 'journal', 'gl', 'payments', 'vendor', 'expenses', 'دفتر', 'قيود'],
        ),
        Kind(
            'unpaid',
            'Unpaid invoices (receivables)',
            [
                F('reference', 'Invoice', 'text', 'invoice|reference|invoice no|ref|الفاتورة', True),
                F('party', 'Customer', 'text', 'customer|client|party|debtor|العميل', True),
                F('amount', 'Amount due', 'number', AMOUNT + '|balance|outstanding|due', True),
                F('due_date', 'Due date', 'date', 'due|due date|maturity|تاريخ الاستحقاق', True),
            ],
            hints=['receivable', 'ar', 'aging', 'unpaid', 'debtors', 'مديونية'],
        ),
        Kind(
            'bills',
            'Bills to pay (payables)',
            [
                F('reference', 'Bill', 'text', 'bill|reference|invoice|ref|المرجع'),
                F('party', 'Supplier', 'text', 'supplier|vendor|creditor|party|المورد', True),
                F('amount', 'Amount', 'number', AMOUNT + '|balance|outstanding|due', True),
                F('due_date', 'Due date', 'date', 'due|due date|payment date|تاريخ الاستحقاق', True),
            ],
            hints=['payable', 'ap', 'bills', 'creditors', 'دائنون'],
        ),
        Kind(
            'pnl',
            'Profit & loss',
            [
                F('month', 'Month', 'date', 'month|period|date|الشهر|الفترة', True),
                F('revenue', 'Revenue', 'number', 'revenue|sales|income|turnover|الإيرادات|المبيعات', True),
                F('cogs', 'Cost of goods', 'number', 'cogs|cost of goods|cost of sales|تكلفة المبيعات'),
                F('payroll', 'Payroll', 'number', 'payroll|salaries|wages|staff costs|الرواتب|الأجور'),
                F('rent', 'Rent', 'number', 'rent|lease|occupancy|الإيجار'),
                F('marketing', 'Marketing', 'number', 'marketing|advertising|ads|التسويق|الإعلان'),
                F('other', 'Other costs', 'number', 'other|other expenses|admin|general|overheads|مصروفات أخرى'),
            ],
            hints=['pnl', 'p&l', 'profit', 'income statement', 'أرباح'],
        ),
        Kind(
            'cost',
            'Prices & costs',
            [
                F('product', 'Product', 'text', 'product|item|sku|item code|stockcode|description|الصنف|المنتج', True),
                F('price', 'Price', 'number', 'price|selling price|list price|unit price|السعر|سعر البيع|سعر الوحدة', True),
                F('cost', 'Cost', 'number', 'cost|unit cost|cost price|purchase price|التكلفة|سعر الشراء', True),
                F('name', 'Product name', 'text', 'product name|item name|name|description|الاسم|اسم الصنف'),
                F('category', 'Category', 'text', 'category|group|family|department|الفئة|المجموعة'),
                F('imported', 'Imported share', 'number', 'imported|import share|imported %|foreign|مستورد'),
            ],
            hints=['price', 'pricelist', 'cost', 'products', 'catalog', 'أسعار'],
        ),
        Kind(
            'stock',
            'Stock on hand',
            [
                F('product', 'Product', 'text', 'product|item|sku|item code|stockcode|الصنف', True),
                F('on_hand', 'On hand', 'number', 'on hand|onhand|stock|quantity|qty|available|balance|الرصيد|المخزون', True),
                F('lead_days', 'Supplier lead time (days)', 'number', 'lead time|lead|lead days|delivery days|مدة التوريد'),
            ],
            hints=['stock', 'inventory', 'warehouse', 'مخزون'],
        ),
        Kind(
            'ads',
            'Ad spend per channel',
            [
                F('date', 'Week or date', 'date', 'week|date|day|period|month|الأسبوع|التاريخ', True),
                F('channel', 'Channel', 'text', 'channel|platform|media|source|campaign type|القناة', True),
                F('spend', 'Spend', 'number', 'spend|cost|budget|amount|investment|الإنفاق|التكلفة', True),
                F('new_customers', 'New customers', 'number', 'new customers|customers|conversions|acquisitions|leads|signups|عملاء جدد'),
                F('revenue', 'Revenue', 'number', 'revenue|sales|value|الإيرادات'),
            ],
            hints=['ads', 'marketing', 'spend', 'media', 'campaign', 'إعلان'],
        ),
        # Marketing teams often keep one row per week with a spend column per channel. Reshaped to the table above.
        Kind(
            'adswide',
            'Weekly marketing sheet',
            [
                F('date', 'Week or date', 'date', 'week|date|day|period|time|الأسبوع|التاريخ', True),
                F('total_sales', 'Sales that week, all channels', 'number', 'revenue|sales|total sales|turnover|conversions|kpi|المبيعات|الإيرادات'),
                F('unit_value', 'Value per sale (if sales are a count)', 'number', 'revenue per conversion|value per conversion|average order value|aov'),
            ],
            hints=['mmm', 'media mix', 'marketing mix', 'weekly', 'robyn', 'meridian'],
            store_as='ads',
        ),
        Kind(
            'payroll',
            'Payroll',
            [
                F('month', 'Month', 'date', 'month|period|pay date|date|payroll month|الشهر', True),
                F('employee_id', 'Employee ID', 'text', 'employee id|emp id|employee|staff id|id|كود الموظف|رقم الموظف', True),
                F('name', 'Name', 'text', 'name|employee name|full name|الاسم'),
                F('base', 'Base pay', 'number', 'base|basic|salary|base pay|gross|net pay|الراتب|الأساسي', True),
                F('overtime', 'Overtime pay', 'number', 'overtime|ot|extra|إضافي'),
                F('account', 'Bank account', 'text', 'account|iban|bank account|رقم الحساب'),
            ],
            hints=['payroll', 'salaries', 'wages', 'رواتب'],
        ),
        Kind(
            'staff',
            'Staff list',
            [
                F('employee_id', 'Employee ID', 'text', 'employee id|emp id|employeenumber|employee number|id|staff id|كود الموظف', True),
                F('name', 'Name', 'text', 'name|employee name|full name|الاسم'),
                F('role', 'Role', 'text', 'role|job role|jobrole|title|job title|position|department|الوظيفة', True),
                F('gender', 'Gender', 'text', 'gender|sex|النوع|الجنس'),
                F('hire_date', 'Hire date', 'date', 'hire date|hired|start date|date of joining|join date|تاريخ التعيين'),
                F('leave_date', 'Leave date', 'date', 'leave date|termination date|end date|exit date|left on|تاريخ الترك'),
                F('tenure_years', 'Years at company', 'number', 'years at company|yearsatcompany|tenure|years of service|سنوات الخدمة'),
                F('left', 'Has left', 'bool', 'attrition|left|terminated|resigned|exited|ترك'),
                F('salary', 'Monthly salary', 'number', 'salary|monthly income|monthlyincome|monthly salary|pay|الراتب'),
                F('branch', 'Branch or department', 'text', 'branch|store|shop|department|location|site|الفرع|القسم'),
                F('overtime_hours', 'Overtime hours a month', 'number', 'overtime hours|ot hours|overtime|ساعات إضافية'),
            ],
            any_of=[['hire_date'], ['tenure_years']],
            hints=['staff', 'employees', 'hr', 'attrition', 'headcount', 'موظفين'],
        ),
        Kind(
            'branches',
            'Branch details',
            [
                F('branch', 'Branch', 'text', 'branch|store|shop|location|الفرع', True),
                F('area_sqm', 'Area (m²)', 'number', 'area|sqm|m2|size|square meters|المساحة'),
                F('staff', 'Staff', 'number', 'staff|employees|headcount|الموظفين'),
            ],
            hints=['branch', 'stores', 'locations', 'فروع'],
        ),
        Kind(
            'abtest',
            'A/B test results',
            [
                F('variant', 'Version', 'text', 'variant|group|version|arm|landing page|النسخة', True),
                F('visitors', 'Visitors', 'number', 'visitors|users|sessions|impressions|views|الزوار'),
                F('conversions', 'Conversions', 'number', 'conversions|orders|purchases|signups|التحويلات'),
                F('converted', 'Converted (0/1)', 'bool', 'converted|conversion|purchased|clicked'),
            ],
            any_of=[['visitors', 'conversions'], ['converted']],
            hints=['ab', 'a/b', 'experiment', 'test'],
        ),
        Kind(
            'empsurvey',
            'Employee survey',
            [
                F('score', 'Score (0–10)', 'number', 'score|rating|recommend|enps|overall|التقييم', True),
                F('comment', 'Comment', 'text', 'comment|comments|feedback|cons|pros|review|التعليق'),
            ],
            hints=['employee survey', 'engagement', 'enps', 'staff survey', 'استبيان الموظفين'],
        ),
        Kind(
            'trends',
            'Search interest (Google Trends)',
            [
                F('date', 'Week or month', 'date', 'week|month|date|day', True),
                F('interest', 'Interest (0–100)', 'number', 'interest|value|score|egypt|search', True),
            ],
            hints=['trends', 'multitimeline', 'google trends', 'search'],
        ),
        Kind(
            'competitors',
            'Competitor prices',
            [
                F('competitor', 'Competitor', 'text', 'competitor|store|brand|seller|shop|المنافس', True),
                F('product', 'Product', 'text', 'product|item|sku|الصنف|المنتج', True),
                F('price', 'Their price', 'number', 'price|their price|competitor price|السعر|سعر المنافس|سعر الوحدة', True),
                F('our_price', 'Our price', 'number', 'our price|client price|سعرنا'),
                F('complaint', 'What reviews complain about', 'text', 'complaint|issue|theme|review|شكوى'),
            ],
            hints=['competitor', 'competition', 'market prices', 'منافس'],
        ),
        Kind(
            'custsurvey',
            'Customer price survey',
            [
                F('too_cheap', 'Too cheap', 'number', 'too cheap|too_cheap|رخيص جدا', True),
                F('cheap', 'Cheap / a bargain', 'number', 'cheap|bargain|good value|رخيص', True),
                F('expensive', 'Expensive', 'number', 'expensive|getting expensive|غالي', True),
                F('too_expensive', 'Too expensive', 'number', 'too expensive|too_expensive|غالي جدا', True),
            ],
            hints=['price survey', 'van westendorp', 'pricing survey', 'استبيان الأسعار'],
        ),
    ]
}


# ---------- Reading files ----------


TOTAL_WORDS = {'total', 'totals', 'grand total', 'sum', 'الإجمالي', 'الاجمالي', 'المجموع', 'إجمالي'}


def _decode(data: bytes) -> str:
    for enc in ('utf-8-sig', 'utf-8', 'cp1256', 'latin-1'):
        try:
            return data.decode(enc)
        except UnicodeDecodeError:
            continue
    return data.decode('latin-1', errors='replace')


def _delimiter(sample: str, low: str) -> str:
    """The separator that splits most lines into the same number of columns; more columns wins a tie, so
    '1.234,50;Cairo' with semicolons isn't mistaken for commas."""
    lines = [ln for ln in sample.splitlines()[:80] if ln.strip()]
    best, best_score = ('\t' if low.endswith('.tsv') else ','), (0.0, 0)
    for d in (',', ';', '\t', '|'):
        counts = [len(r) - 1 for r in csv.reader(lines, delimiter=d)]
        nz = [c for c in counts if c > 0]
        if not nz:
            continue
        mode = max(set(nz), key=nz.count)
        score = (nz.count(mode) / len(lines), mode)
        if score > best_score:
            best, best_score = d, score
    return best


def sheets(name: str, data: bytes) -> list[str]:
    if name.lower().endswith(('.xlsx', '.xlsm')):
        return pd.ExcelFile(io.BytesIO(data), engine='openpyxl').sheet_names
    return []


def read_raw(name: str, data: bytes, options: dict | None = None, nrows: int | None = None) -> pd.DataFrame:
    """The file as a table of text cells, with the header row found automatically."""
    options = options or {}
    low = name.lower()
    if low.endswith(('.xlsx', '.xlsm')):
        df = pd.read_excel(io.BytesIO(data), sheet_name=options.get('sheet') or 0, header=None, dtype=object, engine='openpyxl', nrows=None if nrows is None else nrows + 30)
    elif low.endswith('.xls'):
        raise ValueError('Old .xls files aren’t supported. Open it in Excel and save as .xlsx or .csv.')
    elif low.endswith(('.csv', '.txt', '.tsv')):
        text = _decode(data)
        sample = text[:20000]
        delim = _delimiter(sample, low)
        # Rows can have different lengths (title lines above the header), so read them one by one.
        reader = csv.reader(io.StringIO(text), delimiter=delim)
        rows = []
        for i, r in enumerate(reader):
            rows.append(r)
            if nrows is not None and i >= nrows + 30:
                break
        width = max((len(r) for r in rows), default=0)
        df = pd.DataFrame([r + [''] * (width - len(r)) for r in rows], dtype=object)
    else:
        raise ValueError('Upload a .csv or .xlsx file. PDF bank statements will be read once the AI step is switched on.')
    df = df.dropna(how='all').dropna(axis=1, how='all')
    df = df.replace({'': np.nan}).dropna(how='all').dropna(axis=1, how='all')
    if df.empty:
        raise ValueError('The file has no data.')
    header = options.get('header_row')
    if header is None:
        header = _find_header(df)
    cols = [str(c).strip() if pd.notna(c) else f'Column {i + 1}' for i, c in enumerate(df.iloc[header])]
    seen: dict[str, int] = {}
    unique = []
    for c in cols:
        n = seen.get(c, 0)
        unique.append(c if not n else f'{c} ({n + 1})')
        seen[c] = n + 1
    body = df.iloc[header + 1 :].copy()
    body.columns = unique
    body = body.reset_index(drop=True)
    # A total row at the bottom (exports often end with one): only the last few rows are checked.
    tail = body.tail(5)
    hit = tail.apply(lambda col: col.astype(str).str.strip().str.lower().isin(TOTAL_WORDS)).any(axis=1) & (tail.notna().mean(axis=1) < 0.8)
    if hit.any():
        body = body.drop(index=hit[hit].index).reset_index(drop=True)
    body.attrs['totals'] = int(hit.sum())
    return body if nrows is None else body.head(nrows)


def _find_header(df: pd.DataFrame) -> int:
    """The first row that looks like column names: mostly filled and mostly words, not numbers."""
    width = df.shape[1]
    for i in range(min(15, len(df))):
        row = df.iloc[i]
        filled = row.notna().sum()
        if filled < max(2, width * 0.5):
            continue
        words = sum(1 for v in row if isinstance(v, str) and not _looks_number(v))
        if words >= filled * 0.6:
            return i
    return 0


# ---------- Cleaning values ----------

_AR_DIGITS = str.maketrans('٠١٢٣٤٥٦٧٨٩٫٬', '0123456789.,')


def _looks_number(v) -> bool:
    try:
        float(str(v).replace(',', ''))
        return True
    except ValueError:
        return False


def to_number(s: pd.Series) -> pd.Series:
    if pd.api.types.is_numeric_dtype(s):
        return pd.to_numeric(s, errors='coerce')
    t = s.astype(str).str.translate(_AR_DIGITS).str.strip()
    neg = t.str.match(r'^\(.*\)$') | t.str.endswith('-')
    sci = t.str.fullmatch(r'-?\d+(\.\d+)?[eE][+-]?\d+')
    t = t.str.replace(r'[^\d.,\-]', '', regex=True).where(~sci, t)
    # 1.234,56 (European) vs 1,234.56: if the last separator is a comma followed by 1-2 digits, it is the decimal mark.
    euro = t.str.match(r'^-?\d{1,3}(\.\d{3})+(,\d{1,2})?$') | t.str.match(r'^-?\d+,\d{1,2}$')
    t = t.where(~euro, t.str.replace('.', '', regex=False).str.replace(',', '.', regex=False))
    t = t.str.replace(',', '', regex=False).str.rstrip('-')
    out = pd.to_numeric(t, errors='coerce')
    return out.where(~neg, -out.abs())


def to_bool(s: pd.Series) -> pd.Series:
    if pd.api.types.is_numeric_dtype(s) or to_number(s.dropna().astype(str)).isin([0, 1]).mean() > 0.9:
        n = to_number(s)
        return n.map(lambda v: True if v == 1 else False if v == 0 else None)
    t = s.astype(str).str.strip().str.lower()
    yes = {'1', 'true', 'yes', 'y', 't', 'نعم', 'left', 'terminated', 'converted', '1.0'}
    no = {'0', 'false', 'no', 'n', 'f', 'لا', 'stayed', 'active', '0.0'}
    return t.map(lambda v: True if v in yes else False if v in no else None)


def to_date(s: pd.Series, dayfirst: bool | None = None) -> tuple[pd.Series, bool]:
    """Dates from text, Excel serial numbers or real dates. Tries day-first and month-first; keeps the one that parses best."""
    if pd.api.types.is_datetime64_any_dtype(s):
        return s, bool(dayfirst)
    if pd.api.types.is_numeric_dtype(s) or s.dropna().astype(str).str.fullmatch(r'\d{5}(\.\d+)?').mean() > 0.9:
        n = pd.to_numeric(s, errors='coerce')
        if n.dropna().between(20000, 70000).mean() > 0.9:
            return pd.to_datetime(n, unit='D', origin='1899-12-30', errors='coerce'), bool(dayfirst)
    t = s.astype(str).str.translate(_AR_DIGITS).str.strip()
    t = t.where(~t.isin(['', 'nan', 'NaT', 'None']))
    # Weeks like "2024-W05" become the Monday of that week.
    if t.dropna().str.fullmatch(r'\d{4}-?W\d{1,2}').mean() > 0.9:
        return pd.to_datetime(t.str.replace(r'(\d{4})-?W(\d{1,2})', r'\1-W\2-1', regex=True), format='%G-W%V-%u', errors='coerce'), bool(dayfirst)
    # Numeric dates like 5/22/2011 or 22.05.2011: settle the order from values that only fit one way, then apply that
    # order to every row. (Letting the parser decide row by row silently swaps day and month where both would fit.)
    parts = t.str.extract(r'^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})(.*)$')
    if parts[0].notna().mean() > 0.9 * max(t.notna().mean(), 1e-9):
        a, b = pd.to_numeric(parts[0], errors='coerce'), pd.to_numeric(parts[1], errors='coerce')
        if dayfirst is None:
            day_votes, month_votes = int((a > 12).sum()), int((b > 12).sum())
            dayfirst = day_votes >= month_votes  # no evidence either way: day first, as in the region
        day, month = (a, b) if dayfirst else (b, a)
        year = pd.to_numeric(parts[2], errors='coerce')
        year = year.where(year >= 100, year + 2000)
        iso = year.astype('Int64').astype(str) + '-' + month.astype('Int64').astype(str).str.zfill(2) + '-' + day.astype('Int64').astype(str).str.zfill(2) + parts[3].fillna('')
        iso = iso.where(parts[0].notna())
        with np.errstate(all='ignore'):
            parsed = pd.to_datetime(iso, errors='coerce', format='mixed')
        return parsed, bool(dayfirst)
    options = [dayfirst] if dayfirst is not None else [True, False]
    best = None
    for df_ in options:
        with np.errstate(all='ignore'):
            try:
                parsed = pd.to_datetime(t, dayfirst=df_, errors='coerce', format='mixed')
            except (ValueError, TypeError):
                parsed = pd.to_datetime(t, dayfirst=df_, errors='coerce')
        score = parsed.notna().mean() - (parsed > pd.Timestamp.now() + pd.Timedelta(days=400)).mean()
        if best is None or score > best[0]:
            best = (score, parsed, df_)
    return best[1], bool(best[2])


# ---------- Recognising columns ----------


def _norm(s: str) -> str:
    s = str(s).lower().replace('_', ' ').replace('-', ' ').replace('.', ' ')
    s = re.sub(r'[^\w\s؀-ۿ%/&]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def _score(header: str, syn: str) -> float:
    h, s = _norm(header), _norm(syn)
    if not h or not s:
        return 0
    if h == s or h.replace(' ', '') == s.replace(' ', ''):
        return 1.0
    hw, sw = set(h.split()), set(s.split())
    if sw <= hw:
        return max(0.6, 0.85 - 0.05 * (len(hw) - len(sw)))
    if len(s) >= 4 and s in h:
        return 0.7
    overlap = len(hw & sw) / max(len(sw), 1)
    return 0.6 * overlap if overlap >= 0.5 else 0


def _type_fit(f: Field, values: pd.Series) -> float:
    v = values.dropna().head(200)
    if v.empty:
        return 0.65  # nothing to check yet (e.g. nobody has left): the header decides
    if f.type == 'number':
        return to_number(v).notna().mean()
    if f.type == 'date':
        parsed, _ = to_date(v)
        return parsed.notna().mean()
    if f.type == 'bool':
        return to_bool(v).notna().mean()
    return 1.0


def suggest_mapping(kind: str, df: pd.DataFrame) -> dict[str, str]:
    """Best column for each field: name similarity first, checked against what the values look like."""
    k = KINDS[kind]
    cands: list[tuple[float, str, str]] = []
    for f in k.fields:
        for col in df.columns:
            name = max([_score(col, f.key.replace('_', ' '))] + [_score(col, s) for s in f.synonyms])
            if name < 0.5:
                continue
            fit = _type_fit(f, df[col])
            if fit < 0.6:
                continue
            cands.append((name * (0.7 + 0.3 * fit), f.key, col))
    cands.sort(reverse=True)
    mapping: dict[str, str] = {}
    used: set[str] = set()
    for _, key, col in cands:
        if key in mapping or col in used:
            continue
        mapping[key] = col
        used.add(col)
    # A date-like column for a required date field, if names didn't find one.
    for f in k.fields:
        if f.required and f.type == 'date' and f.key not in mapping:
            for col in df.columns:
                if col not in used and _type_fit(f, df[col]) > 0.9:
                    mapping[f.key] = col
                    used.add(col)
                    break
    # One column naming the product: it is the product, not just its name.
    if kind == 'sales' and 'product' not in mapping and 'product_name' in mapping:
        mapping['product'] = mapping.pop('product_name')
    return mapping


SPEND_COL = re.compile(r'(^|[_\s\-])(spend|cost|budget|investment)s?$|_s$', re.I)


def wide_spend_columns(df: pd.DataFrame, mapping: dict[str, str] | None = None) -> list[str]:
    """Columns of a weekly marketing sheet that hold one channel's spend: 'TV spend', 'facebook_S', 'Channel0_spend'."""
    taken = set((mapping or {}).values())
    return [c for c in df.columns if c not in taken and SPEND_COL.search(str(c).strip()) and to_number(df[c]).notna().mean() >= 0.5]


def channel_name(col: str) -> str:
    name = re.sub(r'([_\s\-]?(spend|cost|budget|investment)s?|_s)$', '', str(col).strip(), flags=re.I).strip(' _-')
    name = (name or str(col)).replace('_', ' ').strip()
    return name.upper() if len(name) <= 3 else name[0].upper() + name[1:]


def _melt_wide(df: pd.DataFrame, out: pd.DataFrame, mapping: dict[str, str], health: dict) -> pd.DataFrame:
    cols = wide_spend_columns(df, mapping)
    if not cols:
        raise ValueError('No spend columns found. Name each channel’s column like “TV spend” or “facebook_S”.')
    total = out['total_sales'] if 'total_sales' in out else pd.Series(np.nan, index=out.index)
    if 'unit_value' in out:
        total = total * out['unit_value'].fillna(1)
    parts = [pd.DataFrame({'date': out['date'], 'channel': channel_name(c), 'spend': to_number(df[c]).fillna(0).values, 'total_sales': total.values}) for c in cols]
    health['channels'] = [channel_name(c) for c in cols]
    long = pd.concat(parts, ignore_index=True)
    long['new_customers'] = np.nan
    long['revenue'] = np.nan
    return long


def mapping_problems(kind: str, mapping: dict[str, str]) -> list[str]:
    k = KINDS[kind]
    probs = [f'Choose a column for “{f.label}”.' for f in k.fields if f.required and not mapping.get(f.key)]
    if k.any_of and not any(all(mapping.get(x) for x in group) for group in k.any_of):
        labels = {f.key: f.label for f in k.fields}
        probs.append('Choose a column for ' + ' or '.join('“' + ' + '.join(labels[x] for x in g) + '”' for g in k.any_of) + '.')
    return probs


def suggest_kind(name: str, df: pd.DataFrame) -> tuple[str, dict[str, str], float]:
    """The most likely kind for this file, with its mapping and a 0–1 confidence."""
    best = ('sales', {}, -1.0)
    low = name.lower()
    for key, k in KINDS.items():
        m = suggest_mapping(key, df)
        req = [f for f in k.fields if f.required]
        covered = sum(1 for f in req if f.key in m) / max(len(req), 1)
        groups_ok = not k.any_of or any(all(x in m for x in g) for g in k.any_of)
        extra = sum(1 for f in k.fields if not f.required and f.key in m) / max(len(k.fields), 1)
        score = covered * (1 if groups_ok else 0.6) + 0.3 * extra + (0.25 if any(h in low for h in k.hints) else 0)
        if key == 'adswide':
            score = score if len(wide_spend_columns(df, m)) >= 2 else 0
        elif key == 'ads' and len(wide_spend_columns(df)) >= 2 and 'channel' not in m:
            score *= 0.5
        if score > best[2]:
            best = (key, m, score)
    return best[0], best[1], min(1.0, max(0.0, best[2] / 1.3))


# ---------- Building the standard table ----------


# Files where two identical rows can be a real event (paid twice), so repeats are kept for the scans to judge.
MONEY_KINDS = {'payroll', 'bank', 'ledger', 'einv', 'bills', 'unpaid'}


def standardize(kind: str, df: pd.DataFrame, mapping: dict[str, str], options: dict | None = None) -> tuple[pd.DataFrame, dict]:
    """Returns the clean standard table and a health report of what was fixed or set aside."""
    options = options or {}
    k = KINDS[kind]
    totals = int(df.attrs.get('totals', 0))
    out = pd.DataFrame(index=df.index)
    bad: dict[str, int] = {}
    dayfirst = options.get('dayfirst')
    for f in k.fields:
        col = mapping.get(f.key)
        if not col or col not in df.columns:
            continue
        raw = df[col]
        if f.type == 'number':
            v = to_number(raw)
        elif f.type == 'date':
            v, used = to_date(raw, dayfirst)
            options.setdefault('dayfirst_used', used)
        elif f.type == 'bool':
            v = to_bool(raw)
        else:
            v = raw.astype(str).str.strip().where(raw.notna())
            v = v.where(~v.isin(['', 'nan', 'None', 'NULL', 'null']))
        unreadable = int((raw.notna() & pd.isna(v)).sum())
        if unreadable:
            bad[f.label] = unreadable
        out[f.key] = v
    health: dict = {'rows_in': int(len(df)), 'issues': []}
    if totals:
        health['issues'].append(f'{totals} total row{"s" if totals > 1 else ""} at the bottom left out')
    for label, n in bad.items():
        health['issues'].append(f'{n:,} values in “{label}” couldn’t be read and were left empty')
    if kind == 'adswide':
        out = _melt_wide(df, out, mapping, health)
        health['rows_in'] = int(len(out))
    out = _shape(kind, out, health)
    req = [f.key for f in k.fields if f.required and f.key in out]
    before = len(out)
    out = out.dropna(subset=req)
    if before - len(out):
        health['issues'].append(f'{before - len(out):,} rows missing a required value were set aside')
    dupes = int(out.duplicated().sum())
    if dupes and kind in MONEY_KINDS:
        health['issues'].append(f'{dupes:,} rows appear twice; kept, since they may be real double payments (the scans check them)')
        health['repeats'] = dupes
    elif dupes and kind not in ('empsurvey', 'custsurvey', 'abtest'):
        health['issues'].append(f'{dupes:,} rows appear twice; the copies were removed')
        health['duplicates'] = dupes
        out = out.drop_duplicates()
    health['rows_out'] = int(len(out))
    date_col = next((f.key for f in k.fields if f.type == 'date' and f.key in out and f.required), None)
    if date_col and len(out):
        health['from'] = out[date_col].min().date().isoformat()
        health['to'] = out[date_col].max().date().isoformat()
    kept = health.get('grouped', health['rows_out']) / max(health['rows_in'], 1)
    grouped_note = 1 if 'grouped' in health else 0  # adding up per version isn't a problem with the file
    health['score'] = int(max(30, min(100, round(100 * kept - 2 * (len(health['issues']) - grouped_note) + (2 if len(health['issues']) == grouped_note else 0)))))
    if 'dayfirst_used' in options:
        health['dayfirst'] = options['dayfirst_used']
    return out.reset_index(drop=True), health


def _shape(kind: str, out: pd.DataFrame, health: dict) -> pd.DataFrame:
    """Kind-specific fixes: derive missing values, split returns, combine debit and credit."""
    if kind == 'sales':
        if 'qty' not in out:
            out['qty'] = 1.0
        out['qty'] = out['qty'].fillna(1.0)
        if 'price' not in out and 'amount' in out:
            out['price'] = (out['amount'] / out['qty'].replace(0, np.nan)).abs()
        if 'amount' not in out:
            out['amount'] = out['price'] * out['qty']
        out['amount'] = out['amount'].fillna(out['price'] * out['qty'])
        returns = (out['qty'] < 0) | (out['amount'] < 0)
        if returns.any():
            health['issues'].append(f'{int(returns.sum()):,} returns or cancellations kept apart from sales')
            health['returns'] = int(returns.sum())
        out['is_return'] = returns
        for c in ('order_id', 'customer', 'branch', 'channel'):
            if c not in out:
                out[c] = None
        if out['order_id'].isna().all():
            out['order_id'] = out['date'].astype(str) + '-' + out.index.astype(str)
        out['promo'] = out['promo'].fillna(False).astype(bool) if 'promo' in out else False
        if 'time' in out:
            out['hour'] = pd.to_numeric(out['time'].astype(str).str.extract(r'^\s*(\d{1,2})')[0], errors='coerce')
            out = out.drop(columns=['time'])
        else:
            out['hour'] = out['date'].dt.hour.where(out['date'].dt.hour + out['date'].dt.minute > 0) if out['date'].dt.hour.any() else np.nan
    if kind in ('bank', 'ledger'):
        zero = pd.Series(0.0, index=out.index)
        debit = out['debit'].fillna(0) if 'debit' in out else zero
        credit = out['credit'].fillna(0) if 'credit' in out else zero
        # Bank: money in is positive, money out negative. Ledger: the size of each entry.
        split = credit - debit if kind == 'bank' else debit.abs() + credit.abs()
        out['amount'] = out['amount'].fillna(split) if 'amount' in out else split
        out = out.drop(columns=[c for c in ('debit', 'credit') if c in out])
        for c in ('description', 'reference', 'account', 'entry_id'):
            if c not in out and (kind == 'bank') == (c in ('description', 'reference')) or (c == 'reference' and c not in out):
                out[c] = None
    if kind == 'staff':
        if 'left' in out and 'leave_date' not in out:
            out['leave_date'] = pd.NaT
        out['left'] = out['left'].fillna(False).astype(bool) if 'left' in out else out.get('leave_date', pd.Series(pd.NaT, index=out.index)).notna()
        if 'tenure_years' not in out:
            end = out['leave_date'].fillna(pd.Timestamp.now()) if 'leave_date' in out else pd.Timestamp.now()
            out['tenure_years'] = (end - out['hire_date']).dt.days / 365.25
        for c in ('gender', 'salary', 'branch', 'overtime_hours', 'name', 'hire_date', 'leave_date'):
            if c not in out:
                out[c] = np.nan if c in ('salary', 'overtime_hours') else None
        out['gender'] = out['gender'].astype(str).str.strip().str.upper().str[0].map({'F': 'F', 'M': 'M', 'W': 'F', 'أ': 'F', 'ذ': 'M'}).where(out['gender'].notna())
    if kind == 'abtest' and 'converted' in out and 'visitors' not in out:
        g = out.groupby('variant')['converted']
        visitors = out.dropna(subset=['variant'])
        out = pd.DataFrame({'variant': g.size().index, 'visitors': g.size().values, 'conversions': g.sum().values})
        health['issues'].append('One row per visitor: totals were added up per version')
        health['grouped'] = int(len(visitors))  # rows kept before adding up, for the health score
    if kind == 'cost' and 'imported' in out:
        imp = out['imported']
        out['imported'] = np.where(imp > 1, imp / 100, imp)
    if kind == 'payroll':
        out['overtime'] = out['overtime'].fillna(0) if 'overtime' in out else 0.0
        if 'name' not in out:
            out['name'] = None
        if 'account' not in out:
            out['account'] = None
    if kind == 'ads':
        for c in ('new_customers', 'revenue'):
            if c not in out:
                out[c] = np.nan
    return out


def preview(df: pd.DataFrame, n: int = 8) -> list[list[str]]:
    return [[('' if pd.isna(v) else str(v))[:40] for v in row] for row in df.head(n).itertuples(index=False)]


def describe_kinds() -> list[dict]:
    return [
        {'key': k.key, 'label': k.label, 'any_of': k.any_of, 'fields': [{'key': f.key, 'label': f.label, 'type': f.type, 'required': f.required} for f in k.fields]}
        for k in KINDS.values()
    ]
