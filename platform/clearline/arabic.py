"""Arabic for the client report: the report's own wording, the engine's labels and sentences, money and dates.

Results are written in English by the engine. This turns them into Arabic at export time, so every result ever run
can be delivered in Arabic without running it again. Sentences are matched as patterns, so they work on any client's
figures and names. Anything with no Arabic yet is left in English and listed, so the analyst sees it before export.

The analyst's own writing (the summary and each section's note) is not machine-translated: it has its own Arabic
fields, written or checked by a person.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Callable

# ---------- Money, numbers and dates ----------

CURRENCY = {
    'EGP': 'جنيه', 'USD': 'دولار', 'SAR': 'ريال', 'AED': 'درهم', 'EUR': 'يورو', 'GBP': 'جنيه إسترليني',
    'KWD': 'دينار كويتي', 'QAR': 'ريال قطري', 'OMR': 'ريال عماني', 'BHD': 'دينار بحريني', 'JOD': 'دينار أردني',
}
SCALE = {'K': 'ألف', 'M': 'مليون', 'B': 'مليار'}
MONTHS = dict(zip(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']))
FULL_MONTHS = dict(zip(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], MONTHS.values()))
DAYS = dict(zip(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد']))

_CUR = '|'.join(CURRENCY)
_MONEY = re.compile(rf'([−-])?\b({_CUR}) ?(\d[\d,]*(?:\.\d+)?)([KMB])?(?![\w])')
_DATE = re.compile(r'\b(\d{1,2}) (' + '|'.join(MONTHS) + r') (\d{4})\b')
_MONTH_YEAR = re.compile(r'\b(' + '|'.join(MONTHS) + r") ('?\d{2}|\d{4})\b")
_FULL_DATE = re.compile(r'\b(\d{1,2}) (' + '|'.join(FULL_MONTHS) + r') (\d{4})\b')
_LATIN_WORD = re.compile(r'[A-Za-z]{3,}')
# Things that stay in Latin letters in an Arabic report: file names, method acronyms, model names.
_KEEP = re.compile(r'\S+\.(?i:xlsx|xls|csv|pdf|txt)\b|\b[A-Z][A-Z0-9/&-]{1,}\b|\b(?:InstaPay|Vodafone|Prophet|Chronos|Meridian|Clearline|Analytics)\b')


def money(s: str) -> str:
    """'EGP 3.66M' → '3.66 مليون جنيه', '−EGP 6,374' → '−6,374 جنيه'."""
    def one(m: re.Match) -> str:
        sign, cur, num, scale = m.group(1) or '', m.group(2), m.group(3), m.group(4)
        return f'{sign}{num} {SCALE[scale] + " " if scale else ""}{CURRENCY[cur]}'
    return _MONEY.sub(one, s)


def dates(s: str) -> str:
    s = _DATE.sub(lambda m: f'{m.group(1)} {MONTHS[m.group(2)]} {m.group(3)}', s)
    s = _FULL_DATE.sub(lambda m: f'{m.group(1)} {FULL_MONTHS[m.group(2)]} {m.group(3)}', s)
    return _MONTH_YEAR.sub(lambda m: f'{MONTHS[m.group(1)]} {m.group(2)}', s)


_DATE_RANGE = re.compile(r'^(\d{1,2} [A-Z][a-z]{2} \d{4}) to (\d{1,2} [A-Z][a-z]{2} \d{4})$')


def plain(s: str) -> str:
    """Money and dates in Arabic; every other word as it was."""
    s = _DATE_RANGE.sub(r'من \1 إلى \2', s)
    return dates(money(s))


def months_word(n: str) -> str:
    try:
        k = int(n.replace(',', ''))
    except ValueError:
        return f'{n} شهر'
    return f'{k} {"أشهر" if 3 <= k <= 10 else "شهرًا" if k > 10 else "شهر" if k == 1 else "شهران"}'


# ---------- Words and fixed sentences ----------

_SITE = json.loads((Path(__file__).with_name('ar_site.json')).read_text(encoding='utf-8'))

WORDS: dict[str, str] = {
    # The report itself
    'Summary': 'الملخص', 'What this report covers': 'ما يغطيه هذا التقرير', 'What we found': 'ما وجدناه',
    'What to do:': 'ما العمل:', 'How sure we are:': 'مدى ثقتنا:', 'How we worked it out': 'كيف توصلنا إلى ذلك',
    'About your data': 'عن بياناتك', 'Findings report': 'تقرير النتائج', 'Analyst': 'المحلل', 'Reviewed by': 'المراجعة',
    'Your question': 'سؤالك', 'Question': 'السؤال', 'What we did': 'ما قمنا به', 'Confidential': 'سري',
    'prepared for': 'أُعدّ لـ', 'High confidence': 'ثقة عالية', 'Medium confidence': 'ثقة متوسطة',
    'Low confidence: a first read': 'ثقة منخفضة: قراءة أولية', 'high': 'عالية', 'medium': 'متوسطة', 'low': 'منخفضة',
    'Section': 'القسم', 'Confidence': 'مستوى الثقة', 'Measure': 'المؤشر', 'Value': 'القيمة', 'Note': 'ملاحظة', 'Period': 'الفترة',
    'Range': 'المدى', 'About your data text': 'حُفظت ملفاتك مشفرة لدينا، وتُحذف بعد 30 يومًا من تسليم هذا التقرير. الأرقام تقديرات مبنية على البيانات التي أرسلتها، وحيث كانت البيانات قليلة يوضح مستوى الثقة ذلك.',
    'Chart failed': '(تعذر رسم هذا الشكل؛ أرقامه موجودة في ملف Excel.)',
    # Common labels
    'Sales': 'المبيعات', 'Orders': 'الطلبات', 'Average order': 'متوسط الطلب', 'Customers': 'العملاء', 'Customer': 'العميل',
    'Average': 'المتوسط', 'Monthly sales': 'المبيعات الشهرية', 'Profit': 'الربح', 'Share': 'النسبة', 'Class': 'الفئة',
    'Product': 'المنتج', 'Product family': 'عائلة المنتج', 'Account': 'الحساب', 'Change': 'التغير', 'File': 'الملف',
    'Type': 'النوع', 'Rows': 'الصفوف', 'Columns': 'الأعمدة', 'Column': 'العمود', 'Group': 'الشريحة', 'Groups': 'الشرائح',
    'Last order': 'آخر طلب', 'Days since': 'أيام منذ آخر طلب', 'Days since last order': 'أيام منذ آخر طلب',
    'Sales, last 12 months': 'المبيعات، آخر 12 شهرًا', 'Customers, last 12 months': 'العملاء، آخر 12 شهرًا',
    # Business snapshot
    'Top product families, in the data': 'أكبر عائلات المنتجات في البيانات', 'Top product families, last 12 months': 'أكبر عائلات المنتجات، آخر 12 شهرًا',
    'Top products, in the data': 'أكبر المنتجات في البيانات', 'Top products, last 12 months': 'أكبر المنتجات، آخر 12 شهرًا',
    'Top customers, last 12 months': 'أكبر العملاء، آخر 12 شهرًا', 'Top customers, in the data': 'أكبر العملاء في البيانات', 'Sales by branch, last 12 months': 'المبيعات حسب الفرع، آخر 12 شهرًا',
    'Keep these in stock first; they carry the business.': 'احرص على توفرها في المخزون قبل غيرها؛ فعليها يقوم النشاط.',
    'Sales are spread across many products: look at the ranking by family before cutting the range.': 'المبيعات موزعة على منتجات كثيرة: راجع الترتيب حسب العائلة قبل تقليص التشكيلة.',
    'See branch benchmarking for a fair comparison by size.': 'راجع مقارنة الفروع لمقارنة عادلة حسب الحجم.',
    # Trends
    'Strongest month': 'أقوى شهر', 'Weakest month': 'أضعف شهر', 'Two weeks before Ramadan': 'الأسبوعان قبل رمضان', 'During Ramadan': 'خلال رمضان',
    'Put the strongest staff and the stock on these days.': 'خصّص أقوى فريق وأكبر مخزون لهذه الأيام.',
    'There is no real weekday pattern: every day sells about the same.': 'لا يوجد نمط واضح لأيام الأسبوع: كل الأيام تبيع تقريبًا بالقدر نفسه.',
    'Order stock and plan campaigns six weeks ahead of Ramadan.': 'اطلب المخزون وخطط للحملات قبل رمضان بستة أسابيع.',
    'Monthly sales and underlying trend': 'المبيعات الشهرية والاتجاه العام', '3-month moving average': 'متوسط متحرك لثلاثة أشهر',
    'STL decomposition': 'تحليل STL', 'Day of the week (100 = average day)': 'يوم الأسبوع (100 = متوسط اليوم)',
    'Month of the year (100 = average)': 'شهر السنة (100 = المتوسط)',
    # Ranking
    'Top 20% of customers bring': 'أكبر 20% من العملاء يحققون',
    'Never let these run out; review their prices first.': 'لا تدعها تنفد أبدًا، وراجع أسعارها قبل غيرها.',
    'Candidates to drop or sell to order only, freeing cash and shelf space.': 'مرشحة للإيقاف أو للبيع عند الطلب فقط، لتوفير السيولة ومساحة الرفوف.',
    'Look after them: a loyalty offer or a named contact.': 'اعتنِ بهم: عرض ولاء أو مسؤول متابعة مخصص.',
    'Sales are well spread across customers.': 'المبيعات موزعة جيدًا على العملاء.', 'Sales are well spread.': 'المبيعات موزعة جيدًا.',
    'Losing one of the top five would hurt: keep a named contact for each.': 'خسارة أحد الخمسة الكبار مؤلمة: خصّص مسؤول متابعة لكل منهم.',
    'Largest customer': 'أكبر عميل', 'Customers by sales, last 12 months': 'العملاء حسب المبيعات، آخر 12 شهرًا',
    'E-invoices carry no products, so customers are ranked instead.': 'الفواتير الإلكترونية لا تذكر المنتجات، لذلك رُتّب العملاء بدلًا منها.',
    # Customer groups
    'Bought more than once': 'اشتروا أكثر من مرة', 'Best customers': 'أفضل العملاء', 'At risk': 'معرّضون للفقد', 'Loyal': 'أوفياء',
    'New or one-time': 'جدد أو لمرة واحدة', 'Need attention': 'يحتاجون اهتمامًا', 'Lost': 'مفقودون',
    'Give them early access and a named contact.': 'امنحهم أولوية في العروض الجديدة ومسؤول متابعة مخصصًا.',
    'Call the largest ones this month, before they are lost: the list is below.': 'اتصل بأكبرهم هذا الشهر قبل أن تفقدهم: القائمة أدناه.',
    'Repeat buying is healthy; protect it.': 'تكرار الشراء في حالة جيدة؛ حافظ عليه.',
    'Most buy once, normal for big purchases: focus on referrals and accessories.': 'أغلبهم يشترون مرة واحدة، وهذا طبيعي في المشتريات الكبيرة: ركّز على الترشيحات والملحقات.',
    'Share of sales by group (%)': 'حصة كل شريحة من المبيعات (%)',
    'Customers at risk: bought regularly, now quiet': 'عملاء معرّضون للفقد: كانوا يشترون بانتظام ثم توقفوا',
    'Customers who need attention': 'عملاء يحتاجون اهتمامًا',
    # Customer balances
    'Owed to you now': 'المستحق لك الآن', 'Owed over 90 days': 'مستحق منذ أكثر من 90 يومًا', 'Usual days to pay': 'متوسط أيام السداد',
    'weighted by amount': 'مرجّح بالمبلغ', 'no payments matched': 'لم تُطابق أي دفعات', 'Customers in credit': 'عملاء لهم رصيد دائن',
    'Start collection calls with the top five.': 'ابدأ مكالمات التحصيل بأكبر خمسة.',
    'Agree a payment plan for each of these, or decide what to write off.': 'اتفق على خطة سداد لكل منها، أو قرّر ما يُشطب.',
    'Usually an opening balance or an invoice missing from the files: check these accounts with the client before treating them as credit.': 'غالبًا بسبب رصيد افتتاحي أو فاتورة غير موجودة في الملفات: راجع هذه الحسابات مع العميل قبل اعتبارها رصيدًا دائنًا.',
    'Check these discounts were approved.': 'تأكد من أن هذه الخصومات معتمدة.', 'Confirm each one has a reason on file.': 'تأكد من وجود سبب مسجل لكل منها.',
    'Confirm with the client what a transfer (ترحيل) means in their system.': 'تأكد مع العميل من معنى «ترحيل» في نظامه.',
    'Payments, discounts and returns were matched to each customer’s oldest unpaid invoices first. Balances are only as complete as the files: an invoice or opening balance missing from them shows as credit.': 'طوبقت الدفعات والخصومات والمرتجعات مع أقدم فواتير غير مسددة لكل عميل أولًا. الأرصدة مكتملة بقدر اكتمال الملفات: أي فاتورة أو رصيد افتتاحي غير موجود فيها يظهر كرصيد دائن.',
    'Who owes the most': 'أكبر المدينين', 'How long the money has been owed': 'عمر المديونية', 'Balances, oldest debt and speed of payment': 'الأرصدة وأقدم دين وسرعة السداد',
    'Owes': 'المستحق', 'Oldest unpaid invoice': 'أقدم فاتورة غير مسددة', 'How customers paid': 'طرق الدفع',
    '0–30 days': '0–30 يومًا', '31–60 days': '31–60 يومًا', '61–90 days': '61–90 يومًا', 'Over 90 days': 'أكثر من 90 يومًا',
    'Not stated': 'غير محدد', 'InstaPay': 'إنستاباي', 'Vodafone Cash': 'فودافون كاش', 'Bank or cheque': 'بنك أو شيك', 'Cash': 'نقدي',
    'Customer balances and collection': 'أرصدة العملاء والتحصيل',
    'Payments matched to the oldest invoices first (FIFO), ageing bands and days to pay': 'مطابقة الدفعات مع أقدم الفواتير أولًا (FIFO)، وأعمار الديون، وأيام السداد',
    'They were left out, so nothing is counted twice.': 'استُبعدت حتى لا يُحسب شيء مرتين.',
    'They were counted as money owed, as chosen.': 'حُسبت كمبالغ مستحقة، كما اخترت.', 'They were counted as paid, as chosen.': 'حُسبت كمدفوعات، كما اخترت.',
    # Churn
    'Active accounts': 'الحسابات النشطة', 'Ordering less than half as much': 'تطلب أقل من نصف المعتاد', 'Sales at stake': 'مبيعات معرّضة للخطر',
    'a year, if they don’t come back': 'سنويًا، إن لم يعودوا',
    'A sales visit this month: ask what changed before a competitor’s terms become habit.': 'زيارة بيعية هذا الشهر: اسأل عمّا تغيّر قبل أن تتحول شروط المنافس إلى عادة.',
    'With few, large customers, each account is watched one by one instead of using a churn model.': 'لأن العملاء قليلون وكبار، يُتابع كل حساب على حدة بدلًا من استخدام نموذج للتسرب.',
    'No account has cut its orders sharply.': 'لم يخفض أي حساب طلباته بشكل حاد.',
    'Accounts whose orders fell most (last 3 months vs the 9 before)': 'الحسابات الأكثر تراجعًا (آخر 3 أشهر مقابل الأشهر التسعة السابقة)',
    'Monthly before': 'شهريًا قبل', 'Monthly now': 'شهريًا الآن',
    'Cohorts: % buying again, months after first order': 'المجموعات: نسبة من عادوا للشراء بعد أول طلب بأشهر',
    # Data health check
    'Health score': 'درجة الجودة', 'Files checked': 'الملفات المفحوصة', 'Rows checked': 'الصفوف المفحوصة', 'Files with problems': 'ملفات بها مشكلات',
    'Every fix is applied automatically and listed under Data cleaning and merging.': 'كل تصحيح يُطبَّق تلقائيًا ويُدرج في خدمة «تنظيف البيانات ودمجها».',
    'File by file': 'ملفًا ملفًا', 'Rows in': 'الصفوف الواردة', 'Clean rows': 'الصفوف السليمة', 'No problems found': 'لا توجد مشكلات',
    'Removed before analysis. Ask the client whether their system posts lines twice.': 'حُذفت قبل التحليل. اسأل العميل إن كان نظامه يسجل السطور مرتين.',
    # Data profile
    'Cells filled': 'الخانات المعبأة', 'Columns with gaps': 'أعمدة بها فراغات', 'Column by column': 'عمودًا عمودًا', 'Holds': 'النوع',
    'Filled': 'المعبأ', 'Different values': 'قيم مختلفة', 'Unusual': 'غير معتاد', 'Number': 'رقم', 'Two values': 'قيمتان',
    'Category': 'فئة', 'Date': 'تاريخ', 'Text': 'نص', 'identifier': 'معرّف',
    'Results using these columns rest on the filled rows only; ask whether blanks mean zero, not asked, or unknown.': 'النتائج المبنية على هذه الأعمدة تعتمد على الصفوف المعبأة فقط؛ اسأل هل الفراغ يعني صفرًا أم لم يُسأل أم غير معروف.',
    'Read every column of the table.': 'قراءة كل أعمدة الجدول.',
    'Look at those rows before using this column in a comparison.': 'راجع هذه الصفوف قبل استخدام العمود في أي مقارنة.',
    'Confirm whether they are repeated entries or genuinely identical cases.': 'تأكد هل هي إدخالات مكررة أم حالات متطابقة فعلًا.',
    'A link, not proof that one causes the other; “What drives an outcome” tests it properly.': 'هذه علاقة وليست دليلًا على أن أحدهما سبب للآخر؛ خدمة «ما الذي يحرك النتيجة» تختبر ذلك بشكل سليم.',
    # File kinds, as the health check names them
    'Sales list': 'قائمة المبيعات', 'Customer payments and movements': 'دفعات العملاء وحركاتهم', 'Customer list': 'قائمة العملاء',
    'Any other table (research, survey, records, measurements)': 'جدول آخر (بحث، استبيان، سجلات، قياسات)',
    'E-invoices': 'الفواتير الإلكترونية', 'Stock list': 'قائمة المخزون', 'Bank statement': 'كشف الحساب البنكي',
}
WORDS = {**_SITE, **WORDS}

# How the engine names products when it counts them: after a number, and as a group.
_WHAT_COUNT = {'product families': 'عائلة منتجات', 'products': 'منتجًا'}
_WHAT_GROUP = {'product families': 'عائلات المنتجات', 'products': 'المنتجات'}
_WHAT_FEW = {'product families': 'عائلات منتجات', 'products': 'منتجات'}


def _discounts(names: str) -> str:
    return re.sub(r'\((\d+%) of their purchases\)', r'(\1 من مشترياته)', names).replace('), ', ')، ')


def _gaps(cols: str) -> str:
    return re.sub(r'\(([\d,]+) blank, (\d+%) filled\)', r'(\1 فارغة، \2 معبأة)', cols).replace('), ', ')، ')


def _profile_summary(s: str) -> str:
    m = re.fullmatch(r'median (.+), (.+) to (.+)', s)
    if m:
        return f'الوسيط {m.group(1)}، من {m.group(2)} إلى {m.group(3)}'
    m = re.fullmatch(r'free text, e\.g\. “(.*)”', s)
    if m:
        return f'نص حر، مثل «{m.group(1)}»'
    return s


# Sentences with figures in them. {} is any text, {n} a number. The Arabic side names the pieces {0}, {1}, ...
# in the order they appear in the English, or is a function that gets them.
PATTERNS: list[tuple[str, str | Callable[..., str]]] = [
    # Business snapshot
    ('Sales, {} to {}', 'المبيعات، من {0} إلى {1}'),
    ('{n} full months of data', lambda n: f'{months_word(n)} كاملة من البيانات'),
    ('{} on the year before', '{0} عن العام السابق'),
    ('Sales grew {} over the last 12 months.', 'نمت المبيعات {0} خلال آخر 12 شهرًا.'),
    ('Sales fell {} over the last 12 months.', 'تراجعت المبيعات {0} خلال آخر 12 شهرًا.'),
    ('Five {} bring {} of sales, led by {}.', lambda w, p, top: f'خمس {_WHAT_FEW.get(w, w)} تحقق {p} من المبيعات، تتصدرها {top}.'),
    ('{} sells the most; {} the least ({} of sales).', '{0} الأعلى مبيعًا، و{1} الأقل ({2} من المبيعات).'),
    ('{n} lines for postage, fees, discounts or manual adjustments count in total sales but not in product rankings.', '{0} سطرًا للشحن أو الرسوم أو الخصومات أو التسويات اليدوية تدخل في إجمالي المبيعات لا في ترتيب المنتجات.'),
    ('{n} order lines cancelled in full within 30 days were left out of sales.', '{0} سطرًا أُلغي بالكامل خلال 30 يومًا استُبعد من المبيعات.'),
    # Trends
    ('{} on an average month', '{0} عن متوسط الشهر'),
    ('{} and {} are the busiest days: {} and {} on an average day.', 'يوما {0} و{1} هما الأكثر بيعًا: {2} و{3} عن متوسط اليوم.'),
    ('Sales change {} in the two weeks before Ramadan and {} during it.', 'تتغير المبيعات بنسبة {0} في الأسبوعين قبل رمضان و{1} خلاله.'),
    ('{} is the strongest month and {} the weakest.', '{0} أقوى شهر، و{1} أضعفها.'),
    ('Trend ({})', 'الاتجاه ({0})'),
    ('Closed on {} (almost no sales): that day is left out of the average day.', 'الإغلاق يوم {0} (مبيعات شبه معدومة): استُبعد هذا اليوم من متوسط اليوم.'),
    ('Closed on {} and {} (almost no sales): those days are left out of the average day.', 'الإغلاق يومي {0} و{1} (مبيعات شبه معدومة): استُبعد هذان اليومان من متوسط اليوم.'),
    ('Accounts whose orders fell most (last 3 months vs the {n} before)', 'الحسابات الأكثر تراجعًا (آخر 3 أشهر مقابل الأشهر الـ{0} السابقة)'),
    # Ranking
    ('A {} (80% of sales)', lambda w: f'{_WHAT_GROUP.get(w, w)} من الفئة A (80% من المبيعات)'),
    ('C {} (last 5%)', lambda w: f'{_WHAT_GROUP.get(w, w)} من الفئة C (آخر 5%)'),
    ('A customers (80% of sales)', 'عملاء الفئة A (80% من المبيعات)'),
    ('{n} of {n}', '{0} من {1}'),
    ('{n} of {n} {} bring 80% of sales.', lambda a, b, w: f'{a} من {b} {_WHAT_COUNT.get(w, w)} تحقق 80% من المبيعات.'),
    ('{n} {} together bring under 5% of sales.', lambda a, w: f'{a} {_WHAT_COUNT.get(w, w)} مجتمعة تحقق أقل من 5% من المبيعات.'),
    ('The top 20% of customers bring {} of sales to known customers.', 'أكبر 20% من العملاء يحققون {0} من مبيعات العملاء المعروفين.'),
    ('The top 20% of customers bring {} of sales to known customers ({} of sales carry no customer).', 'أكبر 20% من العملاء يحققون {0} من مبيعات العملاء المعروفين ({1} من المبيعات بلا اسم عميل).'),
    ('{n} customers bring 80% of sales; the largest alone brings {}.', '{0} عميلًا يحققون 80% من المبيعات؛ وأكبرهم وحده يحقق {1}.'),
    ('{n} product names were grouped into {n} families by their first two words, so the ranking reads clearly.', 'جُمعت {0} من أسماء المنتجات في {1} عائلة حسب أول كلمتين في الاسم، ليسهل قراءة الترتيب.'),
    ('Product families by sales, last 12 months (A · B · C)', 'عائلات المنتجات حسب المبيعات، آخر 12 شهرًا (A · B · C)'),
    ('Products by sales, last 12 months (A · B · C)', 'المنتجات حسب المبيعات، آخر 12 شهرًا (A · B · C)'),
    ('Ranking (top {n})', 'الترتيب (أكبر {0})'),
    # Customer groups
    ('{n} best customers ({}) bring {} of sales.', '{0} من أفضل العملاء ({1}) يحققون {2} من المبيعات.'),
    ('{n} customers who used to buy have gone quiet (no order for {n} days on average); they spent {} before going quiet.', '{0} عميلًا كانوا يشترون ثم توقفوا (بلا طلب منذ {1} يومًا في المتوسط)، وكانوا قد أنفقوا {2} قبل توقفهم.'),
    ('{} of customers bought more than once in the year.', '{0} من العملاء اشتروا أكثر من مرة خلال العام.'),
    # Customer balances
    ('{n} customers', '{0} عميلًا'),
    ('{} of the total', '{0} من الإجمالي'),
    ('{n} days', '{0} يومًا'),
    ('Customers owe {} in all, across {n} customers; the top five hold {} of it.', 'على العملاء {0} إجمالًا، موزعة على {1} عميلًا؛ ويستحق على أكبر خمسة منهم {2}.'),
    ('{} ({}) has been owed for more than 90 days.', '{0} ({1}) مستحقة منذ أكثر من 90 يومًا.'),
    ('Paid invoices took {n} days to pay on average, weighted by amount.', 'استغرق سداد الفواتير المسددة {0} يومًا في المتوسط، مرجّحًا بالمبلغ.'),
    ('Paid invoices took {n} days to pay on average, weighted by amount. At today’s pace the money owed equals about {n} days of credit sales.', 'استغرق سداد الفواتير المسددة {0} يومًا في المتوسط، مرجّحًا بالمبلغ. وبالوتيرة الحالية تعادل المبالغ المستحقة نحو {1} يومًا من المبيعات الآجلة.'),
    ('{n} customers have paid more than they were invoiced in these files ({} in all), led by {} ({}).', '{0} عميلًا دفعوا أكثر مما فُوتر عليهم في هذه الملفات ({1} إجمالًا)، أكبرهم {2} ({3}).'),
    ('Discounts stand out for {}.', lambda names: f'خصومات لافتة لكل من: {_discounts(names)}.'),
    ('{n} payments are negative ({}): refunds or account corrections.', '{0} دفعة بقيمة سالبة ({1}): مرتجعات أو تصحيحات في الحساب.'),
    ('{n} transfers ({}): {} of them equal the same customer’s invoices on the same day, so they look like invoices posted to the account again. {}',
     lambda n, amt, p, rule: f'{n} حركة ترحيل ({amt}): {p} منها تساوي فواتير العميل نفسه في اليوم نفسه، فتبدو كفواتير سُجلت على الحساب مرة أخرى. {WORDS.get(rule, rule)}'),
    ('{n} cash-sale invoices were left out of balances: they are paid on the spot.', '{0} فاتورة بيع نقدي استُبعدت من الأرصدة: لأنها تُدفع فورًا.'),
    ('Balances as of {}, the last date in the files.', 'الأرصدة حتى {0}، آخر تاريخ في الملفات.'),
    # Churn
    ('{n} accounts now order less than half what they used to; {n} have stopped completely.', '{0} حسابًا يطلب الآن أقل من نصف ما كان يطلبه، و{1} منها توقفت تمامًا.'),
    # Data health check
    ('Data quality score: {n} out of 100. The files are in good shape.', 'درجة جودة البيانات: {0} من 100. الملفات في حالة جيدة.'),
    ('Data quality score: {n} out of 100. Several files need attention before results can be trusted fully.', 'درجة جودة البيانات: {0} من 100. بعض الملفات تحتاج مراجعة قبل الاعتماد الكامل على النتائج.'),
    ('{}: {n} rows appear twice.', '{0}: {1} صفًا مكررًا.'),
    ('{n} / 100', '{0} من 100'),
    # What the intake found in each file (shown in the health check's file table)
    ('{n} total row at the bottom left out', 'استُبعد صف إجمالي واحد في أسفل الجدول'),
    ('{n} total rows at the bottom left out', 'استُبعدت {0} صفوف إجمالية في أسفل الجدول'),
    ('{n} values in “{}” couldn’t be read and were left empty', '{0} قيمة في «{1}» تعذرت قراءتها وتُركت فارغة'),
    ('{n} rows missing a required value were set aside', '{0} صفًا ينقصه حقل مطلوب وُضع جانبًا'),
    ('{n} row appears twice; kept, since they may be real double payments (the scans check them)', 'صف واحد مكرر؛ أُبقي عليه لأنه قد يكون دفعة مكررة فعلًا (الفحوصات تراجعه)'),
    ('{n} rows appear twice; kept, since they may be real double payments (the scans check them)', '{0} صفًا مكررًا؛ أُبقي عليها لأنها قد تكون دفعات مكررة فعلًا (الفحوصات تراجعها)'),
    ('{n} row appears twice; the copies were removed', 'صف واحد مكرر؛ حُذفت النسخة الزائدة'),
    ('{n} rows appear twice; the copies were removed', '{0} صفًا مكررًا؛ حُذفت النسخ الزائدة'),
    ('{n} row appears twice; kept, since two identical answers or readings can be real', 'صف واحد مكرر؛ أُبقي عليه لأن الإجابات أو القراءات المتطابقة قد تكون حقيقية'),
    ('{n} rows appear twice; kept, since two identical answers or readings can be real', '{0} صفًا مكررًا؛ أُبقي عليها لأن الإجابات أو القراءات المتطابقة قد تكون حقيقية'),
    ('Empty column “{}” left out', 'استُبعد العمود الفارغ «{0}»'),
    ('{n} values in “{}” weren’t numbers and were left empty', '{0} قيمة في «{1}» ليست أرقامًا فتُركت فارغة'),
    ('{n} values in “{}” weren’t dates and were left empty', '{0} قيمة في «{1}» ليست تواريخ فتُركت فارغة'),
    ('{n} empty rows left out', 'استُبعد {0} صفًا فارغًا'),
    ('{n} invoices listed several products in one cell: split into {n} product lines, each invoice total shared by usual unit prices', '{0} فاتورة ذكرت عدة منتجات في خانة واحدة: قُسّمت إلى {1} سطر منتج، ووُزّع إجمالي كل فاتورة حسب الأسعار المعتادة للوحدة'),
    ('{n} returns or cancellations kept apart from sales', '{0} مرتجعات أو إلغاءات فُصلت عن المبيعات'),
    ('{n} invoice has no invoice number: each kept as its own invoice', 'فاتورة واحدة بلا رقم: احتُفظ بها كفاتورة مستقلة'),
    ('{n} invoices have no invoice number: each kept as its own invoice', '{0} فاتورة بلا رقم: احتُفظ بكل منها كفاتورة مستقلة'),
    ('One row per visitor: totals were added up per version', 'صف لكل زائر: جُمعت الإجماليات لكل نسخة'),
    # Data profile
    ('{n} rows across {n} table{}, {} of cells filled.', lambda r, t, _s, p: f'{r} صفًا في {t} {"جداول" if _s else "جدول"}، و{p} من الخانات معبأة.'),
    ('Columns with gaps: {}.', lambda cols: f'أعمدة بها فراغات: {_gaps(cols)}.'),
    ('{}: share of rows with each column filled in (%)', '{0}: نسبة الصفوف المعبأة في كل عمود (%)'),
    ('share of rows with each column filled in (%)', 'نسبة الصفوف المعبأة في كل عمود (%)'),
    ('{}: column by column', '{0}: عمودًا عمودًا'),
    ('{}: which numbers move together (rank correlation)', '{0}: الأرقام التي تتحرك معًا (ارتباط الرتب)'),
    ('which numbers move together (rank correlation)', 'الأرقام التي تتحرك معًا (ارتباط الرتب)'),
    ('“{}” has {}: check they are real and not typing mistakes.', '«{0}» فيه {1}: تأكد أنها حقيقية وليست أخطاء إدخال.'),
    ('{n} far from the rest', '{0} بعيدة عن البقية'),
    ('“{}” and “{}” move together (rank correlation {}).', '«{0}» و«{1}» يتحركان معًا (ارتباط الرتب {2}).'),
    ('“{}” and “{}” move in opposite directions (rank correlation {}).', '«{0}» و«{1}» يتحركان في اتجاهين متعاكسين (ارتباط الرتب {2}).'),
    ('{n} rows in {} appear twice.', '{0} صفًا في {1} مكررة.'),
    ('median {}, {} to {}', lambda a, b, c: f'الوسيط {a}، من {b} إلى {c}'),
    ('free text, e.g. “{}”', 'نص حر، مثل «{0}»'),
]

_NUMBER = r'[−+-]?\d[\d,]*(?:\.\d+)?%?'


def _compile(en: str) -> re.Pattern:
    out, i = [], 0
    for m in re.finditer(r'\{n?\}', en):
        out.append(re.escape(en[i:m.start()]))
        out.append(f'({_NUMBER})' if m.group(0) == '{n}' else '(.*?)')
        i = m.end()
    out.append(re.escape(en[i:]))
    return re.compile('^' + ''.join(out) + '$', re.S)


_COMPILED = [(_compile(en), ar) for en, ar in PATTERNS]


class Arabic:
    """Turns one report's English into Arabic, keeping a list of what still has no Arabic."""

    def __init__(self) -> None:
        self.missing: list[str] = []

    def piece(self, s: str) -> str:
        """A name or figure inside a sentence: a known word, else money and dates in Arabic, else as it is."""
        s = s.strip() if isinstance(s, str) else s
        return WORDS.get(s) or MONTHS.get(s) or DAYS.get(s) or plain(s)

    def cell(self, s):  # noqa: ANN001
        """A value in a table or on a chart: translated where it can be, never listed as missing (names stay as written)."""
        return self(s, record=False)

    def __call__(self, s, record: bool = True):  # noqa: ANN001
        if not isinstance(s, str) or not s.strip():
            return s
        t = s.strip()
        if t in WORDS:
            return WORDS[t]
        if t in MONTHS:
            return MONTHS[t]
        if t in DAYS:
            return DAYS[t]
        for rx, ar in _COMPILED:
            m = rx.match(t)
            if m:
                parts = [self.piece(g) if g else '' for g in m.groups()]
                if callable(ar):
                    return ar(*parts)
                return ar.format(*parts)
        if ' · ' in t:  # several notes in one cell
            return ' · '.join(self(part, record) for part in t.split(' · '))
        out = plain(t)
        if record and _LATIN_WORD.search(_KEEP.sub(' ', out)) and t not in self.missing:
            self.missing.append(t)
        return out

    def date(self, d) -> str:  # noqa: ANN001
        return f'{d.day} {list(MONTHS.values())[d.month - 1]} {d.year}'


# ---------- Numbers the analyst wrote in Arabic, read back for the number check ----------

_AR_DIGITS = str.maketrans('٠١٢٣٤٥٦٧٨٩٫٬', '0123456789.,')
_AR_SCALE = {'ألف': 'K', 'آلاف': 'K', 'مليون': 'M', 'ملايين': 'M', 'مليار': 'B'}
_AR_MONEY = re.compile(r'(\d[\d,]*(?:\.\d+)?)\s*(ألف|آلاف|مليون|ملايين|مليار)?\s*(' + '|'.join(sorted(set(CURRENCY.values()), key=len, reverse=True)) + ')')
_AR_SCALED = re.compile(r'(\d[\d,]*(?:\.\d+)?)\s*(ألف|آلاف|مليون|ملايين|مليار)')


def as_english_figures(text: str, currency: str = 'EGP') -> str:
    """'3.66 مليون جنيه' → 'EGP 3.66M', so Arabic writing goes through the same number check as English."""
    t = (text or '').translate(_AR_DIGITS).replace('٪', '%')
    t = _AR_MONEY.sub(lambda m: f'{currency} {m.group(1)}{_AR_SCALE.get(m.group(2) or "", "")}', t)
    return _AR_SCALED.sub(lambda m: f'{m.group(1)}{_AR_SCALE[m.group(2)]}', t)
