// "How we work", one example per department. Made-up companies and numbers.
import type { T } from './content'

export interface Journey {
  dept: string
  quote: T
  who: T
  files: string[]
  analyse: T[]
  results: T[]
  chart: string
}

export const stepTitles: T[] = [
  { en: 'You tell us what you need', ar: 'تخبرنا بما تحتاجه' },
  { en: 'You send the files, encrypted', ar: 'ترسل الملفات مشفّرة' },
  { en: 'We analyse, and a person checks every number', ar: 'نحلّل، ويراجع شخص كل رقم' },
  { en: 'You read one page and decide', ar: 'تقرأ صفحة واحدة وتقرّر' },
]

export const stepTexts: T[] = [
  {
    en: 'A free 20-minute call. You tell us the decision or the worry, and we tell you exactly which data would answer it.',
    ar: 'مكالمة مجانية لمدة 20 دقيقة. تخبرنا بالقرار أو القلق، ونخبرك بالبيانات التي تجيب عنه بالضبط.',
  },
  {
    en: 'Only the files on your data plan, through an encrypted link that expires. The confidentiality agreement is signed first.',
    ar: 'الملفات الموجودة في خطة بياناتك فقط، عبر رابط مشفّر تنتهي صلاحيته. ونوقّع اتفاقية السرية أولًا.',
  },
  {
    en: 'Proven models do the maths, AI drafts the explanation, and an analyst checks every number before it reaches you.',
    ar: 'النماذج المثبتة تقوم بالحسابات، والذكاء الاصطناعي يكتب الشرح، ومحلل يراجع كل رقم قبل أن يصلك.',
  },
  {
    en: 'Findings, actions and a confidence level on the first page. The detail follows for whoever wants it.',
    ar: 'النتائج والإجراءات ومستوى الثقة في الصفحة الأولى. والتفاصيل بعدها لمن يريدها.',
  },
]

export const stepNotes = {
  transfer: { en: 'Encrypted link · expires after download · AES-256 at rest', ar: 'رابط مشفّر · تنتهي صلاحيته بعد التنزيل · تخزين AES-256' },
  days: { en: 'Usually 5 to 10 working days', ar: 'عادة من 5 إلى 10 أيام عمل' },
  pick: { en: 'Pick a department to see an example', ar: 'اختر قسمًا لترى مثالًا' },
}

export const journeys: Journey[] = [
  {
    dept: 'data',
    quote: { en: 'Our files are a mess and we don’t know what they are telling us.', ar: 'ملفاتنا فوضوية ولا نعرف ماذا تخبرنا.' },
    who: { en: 'Owner, home-goods retailer', ar: 'مالك، متجر أدوات منزلية' },
    files: ['sales_2024-2026.xlsx', 'products.xlsx', 'branches.csv'],
    analyse: [
      { en: 'Data health check: duplicates, gaps and wrong codes', ar: 'فحص جودة البيانات: التكرار والفجوات والرموز الخاطئة' },
      { en: 'Clean and join the files into one table', ar: 'تنظيف الملفات ودمجها في جدول واحد' },
      { en: 'Pareto ranking of products, customers and branches', ar: 'ترتيب باريتو للمنتجات والعملاء والفروع' },
    ],
    results: [
      { en: 'Data health score 87/100, with a list of 14 fixes', ar: 'درجة جودة البيانات 87/100 مع قائمة من 14 إصلاحًا' },
      { en: 'The top 20% of products bring 74% of profit', ar: 'أعلى 20% من المنتجات تحقق 74% من الربح' },
      { en: 'Giza is the fastest-growing branch, +14% this year', ar: 'الجيزة أسرع الفروع نموًا، +14% هذا العام' },
    ],
    chart: 'Business snapshot',
  },
  {
    dept: 'marketing',
    quote: { en: 'We spend EGP 60,000 a month on ads and don’t know what works.', ar: 'ننفق 60,000 جنيه شهريًا على الإعلانات ولا نعرف ما الذي ينجح.' },
    who: { en: 'Marketing lead, online store', ar: 'مسؤول التسويق، متجر إلكتروني' },
    files: ['orders_2025-2026.csv', 'ad_spend_by_channel.xlsx', 'promo_codes.csv'],
    analyse: [
      { en: 'Match each new customer to the channel that brought them', ar: 'ربط كل عميل جديد بالقناة التي جلبته' },
      { en: 'Cost to win a customer and payback time, per channel', ar: 'تكلفة كسب العميل ومدة الاسترداد لكل قناة' },
      { en: 'RFM groups: best, loyal, at risk, lost', ar: 'شرائح RFM: الأفضل والأوفياء والمعرّضون للفقد والمفقودون' },
    ],
    results: [
      { en: 'TikTok wins a customer for EGP 95, Google for EGP 210', ar: 'TikTok يكسب العميل بـ95 جنيهًا، وGoogle بـ210' },
      { en: 'Google customers buy more: payback in 3 months either way', ar: 'عملاء Google يشترون أكثر: الاسترداد خلال 3 أشهر في الحالتين' },
      { en: 'Move EGP 15,000 a month to TikTok and test for 4 weeks', ar: 'حوّل 15,000 جنيه شهريًا إلى TikTok واختبر 4 أسابيع' },
    ],
    chart: 'Ad channel performance',
  },
  {
    dept: 'sales',
    quote: { en: 'We need next year’s sales before we order stock from China.', ar: 'نحتاج مبيعات العام القادم قبل أن نطلب البضاعة من الصين.' },
    who: { en: 'Commercial manager, electronics importer', ar: 'مدير تجاري، مستورد إلكترونيات' },
    files: ['einvoices_2024-2026.xlsx', 'stock_on_hand.xlsx', 'supplier_lead_times.xlsx'],
    analyse: [
      { en: 'Test four forecasting models on the last 6 months, hidden from them', ar: 'اختبار أربعة نماذج توقع على آخر 6 أشهر بعد إخفائها عنها' },
      { en: 'Forecast each product with a likely, low and high case', ar: 'توقع كل منتج بحالة مرجّحة ومنخفضة ومرتفعة' },
      { en: 'Reorder points from lead times and safety stock', ar: 'نقاط إعادة الطلب من مدد التوريد ومخزون الأمان' },
    ],
    results: [
      { en: 'Sales next 12 months: EGP 46.8M likely (±6%)', ar: 'مبيعات 12 شهرًا قادمة: 46.8 مليون جنيه مرجّحة (±6%)' },
      { en: 'Order 18% more for March, by mid-February', ar: 'اطلب 18% أكثر لشهر مارس، قبل منتصف فبراير' },
      { en: '12 products are already below their reorder point', ar: '12 منتجًا أقل من نقطة إعادة الطلب بالفعل' },
    ],
    chart: 'Sales forecast, 3 to 12 months',
  },
  {
    dept: 'accounting',
    quote: { en: 'We think money is leaking somewhere, and cash is always tight.', ar: 'نظن أن هناك تسربًا للأموال في مكان ما، والسيولة دائمًا ضيقة.' },
    who: { en: 'Finance manager, medical distributor', ar: 'مدير مالي، موزع طبي' },
    files: ['general_ledger_2026.xlsx', 'bank_statements_2026.pdf', 'einvoices_2026.xlsx'],
    analyse: [
      { en: 'Benford’s law, duplicate payments and gaps in invoice numbers', ar: 'قانون بنفورد والمدفوعات المكررة والفجوات في أرقام الفواتير' },
      { en: 'Match the books, e-invoices and bank line by line', ar: 'مطابقة الدفاتر والفواتير الإلكترونية والبنك سطرًا بسطر' },
      { en: '13-week cash forecast from real customer payment delays', ar: 'توقع السيولة لـ13 أسبوعًا من تأخر العملاء الفعلي في الدفع' },
    ],
    results: [
      { en: 'Two supplier invoices paid twice: EGP 37,600', ar: 'فاتورتان لمورد دُفعتا مرتين: 37,600 جنيه' },
      { en: 'Cash falls below payroll in week 9', ar: 'السيولة تنخفض عن الرواتب في الأسبوع 9' },
      { en: 'EGP 14,000 of sales missing from the tax records', ar: '14,000 جنيه من المبيعات غير موجودة في السجلات الضريبية' },
    ],
    chart: '13-week cash forecast',
  },
  {
    dept: 'people',
    quote: { en: 'Our sales staff keep leaving and we don’t know why.', ar: 'موظفو المبيعات يتركون العمل باستمرار ولا نعرف السبب.' },
    who: { en: 'HR manager, contact centre', ar: 'مدير الموارد البشرية، مركز اتصال' },
    files: ['staff_list.xlsx', 'payroll_2025-2026.xlsx', 'exit_survey.csv'],
    analyse: [
      { en: 'Turnover by role, tenure and manager', ar: 'معدل الدوران حسب الوظيفة ومدة الخدمة والمدير' },
      { en: 'Payroll scan for duplicates and unusual payments', ar: 'فحص الرواتب بحثًا عن التكرار والمدفوعات غير المعتادة' },
      { en: 'AI groups the exit-survey comments into themes', ar: 'الذكاء الاصطناعي يجمع تعليقات استبيان الخروج في محاور' },
    ],
    results: [
      { en: 'Sales turnover is 28% a year, twice the other teams', ar: 'دوران المبيعات 28% سنويًا، ضعف باقي الفرق' },
      { en: 'Most leave in month 4: the training period is the problem', ar: 'أغلبهم يغادر في الشهر الرابع: فترة التدريب هي المشكلة' },
      { en: 'Each departure costs about EGP 22,000 to replace', ar: 'كل مغادرة تكلّف نحو 22,000 جنيه لتعويضها' },
    ],
    chart: 'Staff turnover analysis',
  },
  {
    dept: 'market',
    quote: { en: 'Is there room for us in Alexandria, and at what price?', ar: 'هل هناك مكان لنا في الإسكندرية، وبأي سعر؟' },
    who: { en: 'Founder, coffee chain', ar: 'مؤسس، سلسلة مقاهٍ' },
    files: ['competitor_prices.xlsx', 'price_survey_312_answers.csv'],
    analyse: [
      { en: 'Market size from CAPMAS and World Bank data', ar: 'حجم السوق من بيانات الجهاز المركزي للإحصاء والبنك الدولي' },
      { en: 'Demand trends and seasonality from Google Trends', ar: 'اتجاهات الطلب والموسمية من Google Trends' },
      { en: 'Price survey with the Van Westendorp test', ar: 'استبيان الأسعار باختبار فان ويستندورب' },
    ],
    results: [
      { en: 'The market you can serve: EGP 1.1 billion a year', ar: 'السوق الذي يمكنك خدمته: 1.1 مليار جنيه سنويًا' },
      { en: 'Interest peaks in Ramadan and in September', ar: 'الاهتمام يبلغ ذروته في رمضان وسبتمبر' },
      { en: 'Best price for a large latte: about EGP 85', ar: 'أفضل سعر للاتيه الكبير: نحو 85 جنيهًا' },
    ],
    chart: 'Market size',
  },
]
