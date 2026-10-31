// Sample reports for the "Try it" section. Every company and number here is made up.
import type { T } from './content'

export type Level = 'high' | 'medium' | 'low' | 'none'
export type Cell = string | T

export interface Sample {
  id: 'forecast' | 'scan' | 'cash' | 'price' | 'customers'
  tab: T
  company: T
  profile: T
  question: T
  data: T[]
  method: T
  kpis: { label: T; value: Cell; note: T; tone?: 'good' | 'bad' }[]
  chartTitle: T
  table: { title: T; cols: T[]; rows: Cell[][]; num: number[] }
  findings: { text: T; action: T; level: Level }[]
}

export const samplesSection = {
  kicker: { en: 'Sample reports', ar: 'نماذج تقارير' },
  heading: { en: ['See a real report,', 'before you send a file.'], ar: ['شاهد تقريرًا حقيقيًا', 'قبل أن ترسل أي ملف.'] },
  lead: {
    en: 'Five example reports for made-up companies: the question, the key numbers and what to do next.',
    ar: 'خمسة تقارير نموذجية لشركات افتراضية: السؤال، والأرقام الأساسية، وما يجب فعله بعد ذلك.',
  },

  labels: {
    question: { en: 'The question', ar: 'السؤال' },
    data: { en: 'Data used', ar: 'البيانات المستخدمة' },
    method: { en: 'Method', ar: 'الطريقة' },
    findings: { en: 'Findings and actions', ar: 'النتائج والإجراءات' },
    example: { en: 'Example · made-up company and data', ar: 'مثال · شركة وبيانات افتراضية' },
    page: { en: 'Report', ar: 'تقرير' },
  },
}

export const samples: Sample[] = [
  {
    id: 'forecast',
    tab: { en: 'Sales forecast', ar: 'توقع المبيعات' },
    company: { en: 'Nile Home Furnishings', ar: 'نايل هوم للمفروشات' },
    profile: { en: 'Furniture retail · 6 branches · Cairo and Giza', ar: 'تجزئة أثاث · 6 فروع · القاهرة والجيزة' },
    question: {
      en: 'How much will we sell in the next six months, and is now the time to open a seventh branch?',
      ar: 'كم سنبيع في الأشهر الستة القادمة، وهل هذا هو الوقت المناسب لافتتاح فرع سابع؟',
    },
    data: [
      { en: '30 months of e-invoices (148,200 lines)', ar: 'فواتير إلكترونية لمدة 30 شهرًا (148,200 سطر)' },
      { en: 'Branch list with opening dates', ar: 'قائمة الفروع وتواريخ افتتاحها' },
      { en: 'Public: CPI inflation, CAPMAS', ar: 'بيانات عامة: التضخم من الجهاز المركزي للإحصاء' },
    ],
    method: {
      en: 'Four models (ETS, ARIMA, Prophet, Chronos) tested on the last 6 months, hidden from them. ETS was most accurate and produced the forecast.',
      ar: 'اختبرنا أربعة نماذج (ETS وARIMA وProphet وChronos) على آخر 6 أشهر بعد إخفائها عنها. كان ETS الأدق فاعتمدناه للتوقع.',
    },
    kpis: [
      { label: { en: 'Sales, next 6 months', ar: 'المبيعات، 6 أشهر قادمة' }, value: 'EGP 23.4M', note: { en: '+9.1% on last year', ar: '+9.1% عن العام الماضي' }, tone: 'good' },
      { label: { en: 'Error on hidden months', ar: 'الخطأ في الأشهر المخفية' }, value: '4.2%', note: { en: 'average monthly error', ar: 'متوسط الخطأ الشهري' } },
      { label: { en: 'Peak month', ar: 'شهر الذروة' }, value: { en: 'March', ar: 'مارس' }, note: { en: 'Ramadan: +18% on February', ar: 'رمضان: +18% عن فبراير' } },
      { label: { en: 'Likely range', ar: 'النطاق المرجّح' }, value: '±6%', note: { en: '80% of outcomes fall inside', ar: '80% من النتائج داخله' } },
    ],
    chartTitle: { en: 'Monthly sales and forecast, EGP millions', ar: 'المبيعات الشهرية والتوقع، بالمليون جنيه' },
    table: {
      title: { en: 'Forecast by month, EGP millions', ar: 'التوقع حسب الشهر، بالمليون جنيه' },
      cols: [
        { en: 'Month', ar: 'الشهر' },
        { en: 'Low', ar: 'منخفض' },
        { en: 'Likely', ar: 'مرجّح' },
        { en: 'High', ar: 'مرتفع' },
      ],
      rows: [
        [{ en: 'Jan 2027', ar: 'يناير 2027' }, '3.38', '3.56', '3.74'],
        [{ en: 'Feb 2027', ar: 'فبراير 2027' }, '3.42', '3.62', '3.83'],
        [{ en: 'Mar 2027', ar: 'مارس 2027' }, '4.02', '4.27', '4.53'],
        [{ en: 'Apr 2027', ar: 'أبريل 2027' }, '3.61', '3.86', '4.11'],
        [{ en: 'May 2027', ar: 'مايو 2027' }, '3.69', '3.96', '4.24'],
        [{ en: 'Jun 2027', ar: 'يونيو 2027' }, '3.84', '4.13', '4.43'],
      ],
      num: [1, 2, 3],
    },
    findings: [
      {
        text: { en: 'March needs about 18% more stock than February.', ar: 'مارس يحتاج مخزونًا أكثر بنحو 18% من فبراير.' },
        action: { en: 'Place March orders by 10 February.', ar: 'اطلب مخزون مارس قبل 10 فبراير.' },
        level: 'high',
      },
      {
        text: { en: 'The Maadi branch has fallen for three quarters in a row (−11%).', ar: 'فرع المعادي يتراجع للربع الثالث على التوالي (−11%).' },
        action: { en: 'Review Maadi before committing to a new branch.', ar: 'راجع فرع المعادي قبل الالتزام بفرع جديد.' },
        level: 'high',
      },
      {
        text: { en: 'A seventh branch would break even in about 14 months if it sells like the Nasr City branch.', ar: 'الفرع السابع يصل إلى التعادل خلال 14 شهرًا تقريبًا إذا باع مثل فرع مدينة نصر.' },
        action: { en: 'Treat as a direction: rent and staff costs are your estimates.', ar: 'اعتبره اتجاهًا: تكاليف الإيجار والعمالة تقديراتك أنت.' },
        level: 'low',
      },
    ],
  },
  {
    id: 'scan',
    tab: { en: 'Error and fraud scan', ar: 'فحص الأخطاء والاحتيال' },
    company: { en: 'Delta Medical Supplies', ar: 'دلتا للمستلزمات الطبية' },
    profile: { en: 'Medical distributor · 2,900 supplier payments a year', ar: 'موزع طبي · 2,900 دفعة للموردين سنويًا' },
    question: {
      en: 'Our margins fell 3 points this year with no clear reason. Is money leaking from our payments?',
      ar: 'انخفض هامشنا 3 نقاط هذا العام دون سبب واضح. هل تتسرّب أموال من مدفوعاتنا؟',
    },
    data: [
      { en: 'General ledger, 2025 to 2026 (4,812 payments)', ar: 'دفتر الأستاذ العام 2025 إلى 2026 (4,812 دفعة)' },
      { en: 'Supplier invoices and master list', ar: 'فواتير الموردين وقائمتهم الرئيسية' },
      { en: 'Bank statements, 24 months', ar: 'كشوف البنك لمدة 24 شهرًا' },
    ],
    method: {
      en: 'Duplicate and near-duplicate checks, gaps in invoice numbers, Benford’s law on first digits, Isolation Forest for unusual amounts, and a supplier bank-account match.',
      ar: 'فحص التكرار والتكرار القريب، والفجوات في أرقام الفواتير، وقانون بنفورد على الأرقام الأولى، وIsolation Forest للمبالغ غير المعتادة، ومطابقة حسابات الموردين البنكية.',
    },
    kpis: [
      { label: { en: 'Payments scanned', ar: 'دفعات تم فحصها' }, value: '4,812', note: { en: '24 months', ar: '24 شهرًا' } },
      { label: { en: 'Flagged for review', ar: 'مُعلّمة للمراجعة' }, value: '23', note: { en: '0.5% of payments', ar: '0.5% من الدفعات' } },
      { label: { en: 'Confirmed losses', ar: 'خسائر مؤكدة' }, value: 'EGP 186,200', note: { en: '9 payments, after your review', ar: '9 دفعات بعد مراجعتكم' }, tone: 'bad' },
      { label: { en: 'Recoverable', ar: 'قابلة للاسترداد' }, value: 'EGP 151,400', note: { en: 'duplicates and overcharges', ar: 'تكرارات وزيادات في الأسعار' }, tone: 'good' },
    ],
    chartTitle: { en: 'First digit of 4,812 payments against Benford’s law', ar: 'الرقم الأول في 4,812 دفعة مقارنة بقانون بنفورد' },
    table: {
      title: { en: 'Flagged payments (top 6 of 23)', ar: 'الدفعات المُعلّمة (أعلى 6 من 23)' },
      cols: [
        { en: 'Payment', ar: 'الدفعة' },
        { en: 'Supplier', ar: 'المورّد' },
        { en: 'EGP', ar: 'جنيه' },
        { en: 'Reason', ar: 'السبب' },
      ],
      rows: [
        ['PAY-8812', 'S-014', '18,800', { en: 'Paid twice, 2 days apart', ar: 'مدفوعة مرتين بفارق يومين' }],
        ['PAY-8819', 'S-014', '18,800', { en: 'Paid twice, 2 days apart', ar: 'مدفوعة مرتين بفارق يومين' }],
        ['PAY-9034', 'S-221', '49,900', { en: 'Just under the 50,000 approval limit', ar: 'أقل بقليل من حد الموافقة 50,000' }],
        ['PAY-9035', 'S-221', '49,750', { en: 'Same supplier, same day, split?', ar: 'نفس المورد ونفس اليوم، تقسيم؟' }],
        ['PAY-9310', 'S-307', '96,000', { en: '6× this supplier’s usual amount', ar: '6 أضعاف المعتاد لهذا المورد' }],
        ['PAY-9502', 'S-412', '12,300', { en: 'Bank account shared with S-118', ar: 'حساب بنكي مشترك مع S-118' }],
      ],
      num: [2],
    },
    findings: [
      {
        text: { en: 'Two invoices from supplier S-014 were paid twice: EGP 37,600.', ar: 'فاتورتان من المورد S-014 دُفعتا مرتين: 37,600 جنيه.' },
        action: { en: 'Request a refund this week.', ar: 'اطلب الاسترداد هذا الأسبوع.' },
        level: 'high',
      },
      {
        text: { en: '41 payments sit just under the EGP 50,000 approval limit, twice the normal rate.', ar: '41 دفعة أقل بقليل من حد الموافقة 50,000 جنيه، ضعف المعدل الطبيعي.' },
        action: { en: 'Require a second signature above EGP 40,000 for three months.', ar: 'اشترط توقيعًا ثانيًا فوق 40,000 جنيه لمدة ثلاثة أشهر.' },
        level: 'medium',
      },
      {
        text: { en: 'Three suppliers are paid into the same bank account.', ar: 'ثلاثة موردين تُحوّل مدفوعاتهم إلى الحساب البنكي نفسه.' },
        action: { en: 'Freeze payments to them until verified.', ar: 'أوقف المدفوعات لهم حتى التحقق.' },
        level: 'high',
      },
    ],
  },
  {
    id: 'cash',
    tab: { en: '13-week cash', ar: 'السيولة 13 أسبوعًا' },
    company: { en: 'Sphinx Logistics', ar: 'سفنكس للخدمات اللوجستية' },
    profile: { en: 'Trucking and warehousing · 140 staff', ar: 'نقل وتخزين · 140 موظفًا' },
    question: {
      en: 'We are profitable on paper but always short of cash. When will it get tight, and what can we do?',
      ar: 'نحن رابحون على الورق لكن السيولة دائمًا ناقصة. متى ستضيق، وماذا نفعل؟',
    },
    data: [
      { en: 'Bank statements, 12 months', ar: 'كشوف البنك لمدة 12 شهرًا' },
      { en: 'Unpaid customer invoices (63)', ar: 'فواتير العملاء غير المحصّلة (63)' },
      { en: 'Supplier bills and payroll dates', ar: 'فواتير الموردين ومواعيد الرواتب' },
    ],
    method: {
      en: 'Direct cash-flow forecast, week by week, using each customer’s real payment delay from the last 12 months instead of the due date.',
      ar: 'توقع تدفق نقدي مباشر أسبوعًا بأسبوع، باستخدام متوسط تأخر كل عميل الفعلي في الدفع خلال 12 شهرًا بدلًا من تاريخ الاستحقاق.',
    },
    kpis: [
      { label: { en: 'Cash today', ar: 'السيولة اليوم' }, value: 'EGP 640k', note: { en: 'all accounts', ar: 'كل الحسابات' } },
      { label: { en: 'Lowest point', ar: 'أدنى نقطة' }, value: 'EGP 160k', note: { en: 'week 9, 1 March', ar: 'الأسبوع 9، 1 مارس' }, tone: 'bad' },
      { label: { en: 'Payroll due', ar: 'الرواتب المستحقة' }, value: 'EGP 180k', note: { en: 'every 4 weeks', ar: 'كل 4 أسابيع' } },
      { label: { en: 'Average customer delay', ar: 'متوسط تأخر العملاء' }, value: { en: '38 days', ar: '38 يومًا' }, note: { en: 'terms say 30', ar: 'الشروط تقول 30' } },
    ],
    chartTitle: { en: 'Closing cash by week, EGP thousands', ar: 'السيولة في نهاية كل أسبوع، بالألف جنيه' },
    table: {
      title: { en: 'Weeks 7 to 11, EGP thousands', ar: 'الأسابيع 7 إلى 11، بالألف جنيه' },
      cols: [
        { en: 'Week', ar: 'الأسبوع' },
        { en: 'In', ar: 'داخل' },
        { en: 'Out', ar: 'خارج' },
        { en: 'Closing', ar: 'الرصيد' },
      ],
      rows: [
        ['7', '210', '280', '360'],
        ['8', '140', '250', '250'],
        ['9', '160', '250', '160'],
        ['10', '230', '180', '210'],
        ['11', '260', '170', '300'],
      ],
      num: [1, 2, 3],
    },
    findings: [
      {
        text: { en: 'Cash falls below payroll in week 9 (1 March).', ar: 'السيولة تنخفض عن قيمة الرواتب في الأسبوع 9 (1 مارس).' },
        action: { en: 'Collect three overdue invoices worth EGP 212,000 by 20 February.', ar: 'حصّل ثلاث فواتير متأخرة قيمتها 212,000 جنيه قبل 20 فبراير.' },
        level: 'high',
      },
      {
        text: { en: 'The fuel supplier is paid in week 8, three weeks earlier than its terms require.', ar: 'مورد الوقود يُدفع له في الأسبوع 8، قبل موعد الاستحقاق بثلاثة أسابيع.' },
        action: { en: 'Pay on terms in week 11.', ar: 'ادفع في موعد الاستحقاق في الأسبوع 11.' },
        level: 'high',
      },
      {
        text: { en: 'Two customers make up 44% of what is owed to you.', ar: 'عميلان يمثلان 44% من المستحقات لك.' },
        action: { en: 'Arrange a EGP 300,000 overdraft as a backup.', ar: 'رتّب حد سحب على المكشوف بقيمة 300,000 جنيه كاحتياط.' },
        level: 'medium',
      },
    ],
  },
  {
    id: 'price',
    tab: { en: 'Price change', ar: 'تغيير السعر' },
    company: { en: 'Koshary Corner', ar: 'ركن الكشري' },
    profile: { en: 'Restaurant group · 4 outlets · Alexandria', ar: 'مجموعة مطاعم · 4 فروع · الإسكندرية' },
    question: {
      en: 'Our costs went up 22%. How much can we raise prices, and on which dishes, without losing money?',
      ar: 'ارتفعت تكاليفنا 22%. كم نستطيع رفع الأسعار، وعلى أي أطباق، دون أن نخسر؟',
    },
    data: [
      { en: 'Till receipts, 18 months (412,000 orders)', ar: 'إيصالات نقاط البيع لمدة 18 شهرًا (412,000 طلب)' },
      { en: 'Recipe costs per dish', ar: 'تكلفة كل طبق' },
      { en: 'Two past price changes', ar: 'تغييران سابقان في الأسعار' },
    ],
    method: {
      en: 'Break-even formula per dish, and price elasticity measured from the two past price changes. Try the sliders: the chart and table update.',
      ar: 'معادلة التعادل لكل طبق، ومرونة السعر مقاسة من تغييرين سابقين في الأسعار. جرّب المؤشرات: الرسم والجدول يتحدثان.',
    },
    kpis: [
      { label: { en: 'Cost increase', ar: 'زيادة التكلفة' }, value: '+22%', note: { en: 'since January', ar: 'منذ يناير' }, tone: 'bad' },
      { label: { en: 'Customers lost per 10% rise', ar: 'عملاء نفقدهم لكل 10% رفع' }, value: '6%', note: { en: 'measured, not guessed', ar: 'مقاس وليس تخمينًا' } },
      { label: { en: 'Suggested average rise', ar: 'متوسط الرفع المقترح' }, value: '11%', note: { en: 'varies by dish', ar: 'يختلف حسب الطبق' } },
      { label: { en: 'Profit after the rise', ar: 'الربح بعد الرفع' }, value: '+7.8%', note: { en: 'vs today', ar: 'مقارنة باليوم' }, tone: 'good' },
    ],
    chartTitle: { en: 'Profit change as sales fall', ar: 'تغيّر الربح مع انخفاض المبيعات' },
    table: {
      title: { en: 'By dish', ar: 'حسب الطبق' },
      cols: [
        { en: 'Dish', ar: 'الطبق' },
        { en: 'Price', ar: 'السعر' },
        { en: 'Margin', ar: 'الهامش' },
        { en: 'Raise', ar: 'الرفع' },
      ],
      rows: [
        [{ en: 'Koshary, large', ar: 'كشري كبير' }, '75', '34%', '+12%'],
        [{ en: 'Koshary, medium', ar: 'كشري وسط' }, '55', '31%', '+10%'],
        [{ en: 'Rice pudding', ar: 'أرز باللبن' }, '35', '52%', '+5%'],
        [{ en: 'Hawawshi', ar: 'حواوشي' }, '60', '22%', '+15%'],
        [{ en: 'Soft drinks', ar: 'مشروبات غازية' }, '20', '41%', '0%'],
      ],
      num: [1, 2, 3],
    },
    findings: [
      {
        text: { en: 'Large koshary can rise 12%: sales would have to fall 26% before profit drops.', ar: 'الكشري الكبير يتحمّل رفع 12%: يجب أن تنخفض المبيعات 26% قبل أن يقل الربح.' },
        action: { en: 'Raise from 1 February.', ar: 'ارفع السعر من 1 فبراير.' },
        level: 'high',
      },
      {
        text: { en: 'Hawawshi now earns 22%, the lowest margin on the menu.', ar: 'الحواوشي يحقق الآن 22%، أقل هامش في القائمة.' },
        action: { en: 'Raise 15% or move it to a smaller portion.', ar: 'ارفع 15% أو قلّل حجم الحصة.' },
        level: 'medium',
      },
      {
        text: { en: 'Soft drinks bring people in; competitors charge the same.', ar: 'المشروبات تجذب الزبائن، والمنافسون بنفس السعر.' },
        action: { en: 'Keep the price as it is.', ar: 'أبقِ السعر كما هو.' },
        level: 'medium',
      },
    ],
  },
  {
    id: 'customers',
    tab: { en: 'Customer groups', ar: 'شرائح العملاء' },
    company: { en: 'Lotus Beauty', ar: 'لوتس بيوتي' },
    profile: { en: 'Online beauty store · 18,400 customers', ar: 'متجر تجميل إلكتروني · 18,400 عميل' },
    question: {
      en: 'We spend on ads to win new customers. Are we losing the ones we already have?',
      ar: 'ننفق على الإعلانات لكسب عملاء جدد. هل نخسر العملاء الذين لدينا بالفعل؟',
    },
    data: [
      { en: 'Orders with customer, date and amount, 24 months', ar: 'الطلبات مع العميل والتاريخ والمبلغ لمدة 24 شهرًا' },
      { en: 'Ad spend per month', ar: 'الإنفاق الإعلاني الشهري' },
    ],
    method: {
      en: 'RFM analysis (how recently, how often, how much) to sort customers into groups, and the BG/NBD model to estimate who is about to stop buying.',
      ar: 'تحليل RFM (حداثة الشراء وتكراره وقيمته) لتقسيم العملاء، ونموذج BG/NBD لتقدير من هو على وشك التوقف عن الشراء.',
    },
    kpis: [
      { label: { en: 'Customers', ar: 'العملاء' }, value: '18,400', note: { en: 'bought at least once', ar: 'اشتروا مرة واحدة على الأقل' } },
      { label: { en: 'Buy again', ar: 'يعيدون الشراء' }, value: '31%', note: { en: 'industry norm 35 to 40%', ar: 'المعتاد في القطاع 35 إلى 40%' }, tone: 'bad' },
      { label: { en: 'Revenue at risk', ar: 'إيراد معرّض للخطر' }, value: 'EGP 1.9M', note: { en: '“at risk” group, 12 months', ar: 'شريحة المعرّضين للفقد، 12 شهرًا' }, tone: 'bad' },
      { label: { en: 'Cost to win one customer', ar: 'تكلفة كسب عميل' }, value: 'EGP 140', note: { en: 'vs EGP 35 to win one back', ar: 'مقابل 35 جنيهًا لاستعادة عميل' } },
    ],
    chartTitle: { en: 'Customers by group', ar: 'العملاء حسب الشريحة' },
    table: {
      title: { en: 'Groups and what to do', ar: 'الشرائح وما يجب فعله' },
      cols: [
        { en: 'Group', ar: 'الشريحة' },
        { en: 'Customers', ar: 'العملاء' },
        { en: 'Revenue', ar: 'الإيراد' },
        { en: 'Do this', ar: 'افعل هذا' },
      ],
      rows: [
        [{ en: 'Best', ar: 'الأفضل' }, '1,120', '38%', { en: 'Early access, no discounts', ar: 'وصول مبكر دون خصومات' }],
        [{ en: 'Loyal', ar: 'الأوفياء' }, '4,860', '33%', { en: 'Bundle offers', ar: 'عروض مجمّعة' }],
        [{ en: 'At risk', ar: 'معرّضون للفقد' }, '3,950', '19%', { en: 'Win-back message now', ar: 'رسالة استعادة الآن' }],
        [{ en: 'Lost', ar: 'مفقودون' }, '8,470', '10%', { en: 'One last offer, then stop', ar: 'عرض أخير ثم توقف' }],
      ],
      num: [1, 2],
    },
    findings: [
      {
        text: { en: '3,950 good customers have not bought for 4 to 8 months.', ar: '3,950 عميلًا جيدًا لم يشتروا منذ 4 إلى 8 أشهر.' },
        action: { en: 'Send a win-back offer this month: about EGP 35 per customer.', ar: 'أرسل عرض استعادة هذا الشهر: نحو 35 جنيهًا لكل عميل.' },
        level: 'high',
      },
      {
        text: { en: '1,120 customers bring 38% of revenue and buy at full price.', ar: '1,120 عميلًا يحققون 38% من الإيراد ويشترون بالسعر الكامل.' },
        action: { en: 'Stop sending them discount codes.', ar: 'توقف عن إرسال أكواد الخصم لهم.' },
        level: 'high',
      },
      {
        text: { en: 'Shifting 20% of the ad budget to win-backs would add about EGP 410,000 a year.', ar: 'تحويل 20% من ميزانية الإعلانات لاستعادة العملاء يضيف نحو 410,000 جنيه سنويًا.' },
        action: { en: 'Test it for 8 weeks and compare.', ar: 'اختبره لمدة 8 أسابيع وقارن.' },
        level: 'medium',
      },
    ],
  },
]
