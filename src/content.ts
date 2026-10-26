// Every word on the site, in English and Arabic. Edit text here, not in the components.

export type Lang = 'en' | 'ar'
export type T = { en: string; ar: string }

// ⚠️ Replace before launch.
export const CONTACT = {
  email: 'hello@basira.example',
  // International format without "+" or spaces, e.g. "201001234567". Leave empty to hide the WhatsApp link.
  whatsapp: '',
}

export const brand: T = { en: 'Basira', ar: 'بصيرة' }

export const nav = {
  privacy: { en: 'Privacy', ar: 'الخصوصية' },
  services: { en: 'Services', ar: 'الخدمات' },
  process: { en: 'How we work', ar: 'كيف نعمل' },
  faq: { en: 'Questions', ar: 'أسئلة' },
  book: { en: 'Book a free call', ar: 'احجز مكالمة مجانية' },
  switchTo: { en: 'عربي', ar: 'English' },
  switchLabel: { en: 'اقرأ الموقع بالعربية', ar: 'Read this site in English' },
  menu: { en: 'Menu', ar: 'القائمة' },
  close: { en: 'Close', ar: 'إغلاق' },
}

export const hero = {
  title: { en: ['Your numbers', 'explained'], ar: ['أرقامك', 'بوضوح'] },
  standfirst: {
    en: 'We find the errors in your books, forecast what comes next and show what each decision will do. Privacy comes before anything else.',
    ar: 'نكتشف الأخطاء في حساباتك، ونتوقع ما هو قادم، ونوضح أثر كل قرار قبل أن تتخذه. والخصوصية تأتي قبل أي شيء.',
  },
  nilometer: {
    en: 'Roda Nilometer, Cairo, 861. Its river readings set the year’s taxes.',
    ar: 'مقياس النيل بالروضة، القاهرة، 861. قراءاته للنهر كانت تحدد ضرائب العام.',
  },
}

export const privacy = {
  heading: { en: ['Your data', 'stays yours'], ar: ['بياناتك', 'تبقى ملكك'] },
  lead: {
    en: 'Privacy comes before analysis. We ask only for what each service needs, take names out before we look, and delete everything when we’re done.',
    ar: 'الخصوصية تأتي قبل التحليل. نطلب ما تحتاجه كل خدمة فقط، ونحذف الأسماء قبل أن ننظر في أي ملف، ونمسح كل شيء عند الانتهاء.',
  },
  lattice: {
    en: 'Mashrabiya: the Cairo window that lets you see out without being seen.',
    ar: 'المشربية: نافذة القاهرة التي ترى منها دون أن يراك أحد.',
  },
  rulesHeading: { en: 'Our privacy rules', ar: 'قواعد الخصوصية لدينا' },
  rules: [
    {
      title: { en: 'Confidentiality first', ar: 'السرية أولًا' },
      text: {
        en: 'We sign a confidentiality agreement before you send a single file.',
        ar: 'نوقّع معك اتفاقية سرية قبل أن ترسل أي ملف.',
      },
    },
    {
      title: { en: 'Only what’s needed', ar: 'ما يلزم فقط' },
      text: {
        en: 'Every service lists the exact data it needs. We never ask for more.',
        ar: 'كل خدمة تحدد البيانات التي تحتاجها بالضبط، ولا نطلب أكثر من ذلك.',
      },
    },
    {
      title: { en: 'Names out before we look', ar: 'الأسماء تُحذف قبل أن نرى' },
      text: {
        en: 'Our template swaps customer and staff names, phone numbers and IDs for codes on your own computer, before anything is sent.',
        ar: 'قالبنا يستبدل أسماء العملاء والموظفين وأرقام الهواتف والهويات برموز على جهازك أنت، قبل إرسال أي شيء.',
      },
    },
    {
      title: { en: 'Private transfer', ar: 'نقل آمن' },
      text: {
        en: 'Files travel through an encrypted link that expires. Never by WhatsApp or email.',
        ar: 'تنتقل الملفات عبر رابط مشفّر تنتهي صلاحيته، وليس عبر واتساب أو البريد الإلكتروني.',
      },
    },
    {
      title: { en: 'AI that doesn’t learn from you', ar: 'ذكاء اصطناعي لا يتعلّم من بياناتك' },
      text: {
        en: 'We use only paid business AI services that don’t train on your data. Never free chatbots.',
        ar: 'نستخدم فقط خدمات ذكاء اصطناعي مدفوعة للأعمال لا تتدرّب على بياناتك، ولا نستخدم روبوتات المحادثة المجانية أبدًا.',
      },
    },
    {
      title: { en: 'Deleted when done', ar: 'الحذف بعد الانتهاء' },
      text: {
        en: 'Your files are deleted within 30 days of your report, or sooner if you ask, and we confirm it in writing.',
        ar: 'تُحذف ملفاتك خلال 30 يومًا من تسليم التقرير، أو قبل ذلك إن طلبت، ونؤكد لك ذلك كتابيًا.',
      },
    },
    {
      title: { en: 'Never shared, never sold', ar: 'لا مشاركة ولا بيع' },
      text: {
        en: 'Your data is used for your report and nothing else.',
        ar: 'تُستخدم بياناتك لتقريرك فقط، ولا شيء غيره.',
      },
    },
    {
      title: { en: 'Egypt’s data law', ar: 'قانون حماية البيانات' },
      text: {
        en: 'We follow Egypt’s Personal Data Protection Law, No. 151 of 2020.',
        ar: 'نلتزم بقانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020.',
      },
    },
  ],
  siteProof: {
    en: 'This website sets no cookies and loads nothing from other companies.',
    ar: 'هذا الموقع لا يستخدم ملفات تعريف الارتباط ولا يحمّل أي شيء من شركات أخرى.',
  },
}

export interface Service {
  name: T
  get: T
  method: T
  data: T
  missing: T
}

export interface Department {
  id: string
  name: T
  services: Service[]
}

export const servicesSection = {
  heading: { en: ['Six departments,', 'one clear report'], ar: ['ستة أقسام،', 'وتقرير واحد واضح'] },
  intro: {
    en: 'Pick the departments you need. Each service names the trusted method behind it, the data it needs, and what we do when you don’t have that data.',
    ar: 'اختر الأقسام التي تحتاجها. كل خدمة تذكر الطريقة الموثوقة التي تقوم عليها، والبيانات التي تحتاجها، وما نفعله إن لم تكن هذه البيانات لديك.',
  },
  count: { en: '{n} services', ar: '{n} خدمات' },
  labels: {
    method: { en: 'Method', ar: 'الطريقة' },
    data: { en: 'Data we need', ar: 'البيانات المطلوبة' },
    missing: { en: 'If you don’t have it', ar: 'إن لم تكن لديك' },
  },
}

const s = (name: T, get: T, method: T, data: T, missing: T): Service => ({ name, get, method, data, missing })

export const departments: Department[] = [
  {
    id: 'data',
    name: { en: 'Data analysis', ar: 'تحليل البيانات' },
    services: [
      s(
        { en: 'Data health check', ar: 'فحص جودة البيانات' },
        { en: 'A score out of 100 and a list of problems: duplicates, gaps, wrong codes', ar: 'درجة من 100 وقائمة بالمشكلات: التكرار والفجوات والرموز الخاطئة' },
        { en: 'Standard data-quality rules', ar: 'قواعد جودة البيانات المعتمدة' },
        { en: 'Whatever files you have', ar: 'أي ملفات لديك' },
        { en: 'Nothing extra: it works on anything you send', ar: 'لا شيء إضافي: يعمل على أي ملف ترسله' },
      ),
      s(
        { en: 'Business snapshot', ar: 'صورة سريعة لنشاطك' },
        { en: 'Trends, plus your best and worst products, customers and branches', ar: 'الاتجاهات، وأفضل وأضعف المنتجات والعملاء والفروع' },
        { en: 'Pareto (80/20) and ABC analysis', ar: 'تحليل باريتو (80/20) وتحليل ABC' },
        { en: 'A sales list: date, product, amount', ar: 'قائمة مبيعات: التاريخ والمنتج والمبلغ' },
        { en: 'E-invoices or till receipts work instead', ar: 'تكفي الفواتير الإلكترونية أو إيصالات نقاط البيع' },
      ),
    ],
  },
  {
    id: 'sales',
    name: { en: 'Sales', ar: 'المبيعات' },
    services: [
      s(
        { en: 'Sales forecast, 3 to 12 months', ar: 'توقع المبيعات من 3 إلى 12 شهرًا' },
        { en: 'Expected sales per month, with a likely, low and high case', ar: 'المبيعات المتوقعة لكل شهر، مع حالة مرجّحة وحالة منخفضة وحالة مرتفعة' },
        { en: 'ETS and ARIMA, Prophet (Meta), Chronos (Amazon)', ar: 'نماذج ETS وARIMA، وProphet من Meta، وChronos من Amazon' },
        { en: 'Two years or more of monthly sales', ar: 'مبيعات شهرية لسنتين أو أكثر' },
        { en: 'One year still works, with wider ranges. No history: we build it from customers × average order × visits', ar: 'سنة واحدة تكفي مع نطاقات أوسع. بلا تاريخ: نبنيه من عدد العملاء × متوسط الطلب × عدد الزيارات' },
      ),
      s(
        { en: 'Price change what-if', ar: 'ماذا لو غيّرنا السعر؟' },
        { en: 'Whether a price change pays off, and the drop in sales it can survive', ar: 'هل يستحق تغيير السعر، وما حجم الانخفاض في المبيعات الذي يتحمّله' },
        { en: 'Break-even formula and price-elasticity regression', ar: 'معادلة التعادل وانحدار مرونة السعر' },
        { en: 'Price and cost per product', ar: 'السعر والتكلفة لكل منتج' },
        { en: 'If prices never changed, we give break-even limits and design a two-week price test', ar: 'إن لم تتغير الأسعار من قبل، نعطيك حدود التعادل ونصمّم اختبار سعر لمدة أسبوعين' },
      ),
      s(
        { en: 'Product and customer ranking', ar: 'ترتيب المنتجات والعملاء' },
        { en: 'The 20% of products and customers that bring 80% of your profit', ar: 'الـ20% من المنتجات والعملاء الذين يحققون 80% من أرباحك' },
        { en: 'ABC / Pareto analysis', ar: 'تحليل ABC / باريتو' },
        { en: 'Sales by product and by customer', ar: 'المبيعات حسب المنتج وحسب العميل' },
        { en: 'Invoices or till data', ar: 'الفواتير أو بيانات نقاط البيع' },
      ),
      s(
        { en: 'Stock reorder plan', ar: 'خطة إعادة طلب المخزون' },
        { en: 'What to order, when, and how much', ar: 'ماذا تطلب، ومتى، وبأي كمية' },
        { en: 'Reorder point with safety stock; Croston for slow sellers', ar: 'نقطة إعادة الطلب مع مخزون أمان، وطريقة Croston للأصناف بطيئة البيع' },
        { en: 'Sales by product, stock on hand, supplier delivery times', ar: 'المبيعات حسب المنتج، والمخزون الحالي، ومدة توريد كل مورّد' },
        { en: 'Delivery times can be your estimate', ar: 'يمكن أن تكون مدد التوريد تقديرًا منك' },
      ),
    ],
  },
  {
    id: 'marketing',
    name: { en: 'Marketing', ar: 'التسويق' },
    services: [
      s(
        { en: 'Customer groups', ar: 'شرائح العملاء' },
        { en: 'Your best, loyal, at-risk and lost customers', ar: 'أفضل عملائك، والأوفياء، والمعرّضون للفقد، والمفقودون' },
        { en: 'RFM analysis: recency, frequency, value', ar: 'تحليل RFM: حداثة الشراء وتكراره وقيمته' },
        { en: 'Orders with customer, date and amount', ar: 'الطلبات مع العميل والتاريخ والمبلغ' },
        { en: 'A phone number or a code can stand in for a customer ID', ar: 'رقم الهاتف أو رمز بديل يمكن أن يحل محل رقم العميل' },
      ),
      s(
        { en: 'Ad channel performance', ar: 'أداء قنوات الإعلان' },
        { en: 'The cost to win a customer, and the payback time, for each channel', ar: 'تكلفة كسب العميل ومدة استرداد التكلفة لكل قناة' },
        { en: 'Acquisition cost, return on ad spend, payback', ar: 'تكلفة الاكتساب، والعائد على الإنفاق الإعلاني، ومدة الاسترداد' },
        { en: 'Ad spend per channel and new customers', ar: 'الإنفاق الإعلاني لكل قناة وعدد العملاء الجدد' },
        { en: 'No tracking? Promo codes, or a “how did you hear about us?” question, for four weeks', ar: 'لا يوجد تتبّع؟ أكواد خصم أو سؤال «كيف عرفت بنا؟» لمدة أربعة أسابيع' },
      ),
      s(
        { en: 'Budget split across channels', ar: 'توزيع ميزانية التسويق' },
        { en: 'Where your next EGP 1,000 should go', ar: 'أين يجب أن تذهب الألف جنيه القادمة' },
        { en: 'Marketing mix modelling (Google Meridian, Meta Robyn)', ar: 'نمذجة المزيج التسويقي (Google Meridian وMeta Robyn)' },
        { en: 'Two to three years of weekly spend per channel', ar: 'الإنفاق الأسبوعي لكل قناة لسنتين إلى ثلاث سنوات' },
        { en: 'This one can’t be replaced, so we run a simple test: pause ads in one area and compare', ar: 'هذه لا بديل لها، لذا نجري اختبارًا بسيطًا: نوقف الإعلانات في منطقة واحدة ونقارن' },
      ),
      s(
        { en: 'Customer value and churn', ar: 'قيمة العميل واحتمال فقده' },
        { en: 'Who is likely to stop buying, and what each customer is worth', ar: 'من يُرجَّح أن يتوقف عن الشراء، وكم يساوي كل عميل' },
        { en: 'Cohort analysis and the BG/NBD model', ar: 'تحليل المجموعات ونموذج BG/NBD' },
        { en: 'Twelve months or more of orders per customer', ar: 'طلبات كل عميل لمدة 12 شهرًا أو أكثر' },
        { en: 'With less history, cohort tables only', ar: 'مع تاريخ أقصر، جداول المجموعات فقط' },
      ),
      s(
        { en: 'A/B test check', ar: 'فحص اختبار A/B' },
        { en: 'Whether version B really won, or it was luck', ar: 'هل فازت النسخة B فعلًا أم أنها مصادفة' },
        { en: 'Standard significance test', ar: 'اختبار الدلالة الإحصائية المعتاد' },
        { en: 'The results of both versions', ar: 'نتائج النسختين' },
        { en: 'We can help you design the test first', ar: 'يمكننا مساعدتك في تصميم الاختبار أولًا' },
      ),
    ],
  },
  {
    id: 'accounting',
    name: { en: 'Accounting & finance', ar: 'المحاسبة والمالية' },
    services: [
      s(
        { en: 'Error and fraud scan', ar: 'فحص الأخطاء والاحتيال' },
        { en: 'A list of suspicious entries for you to review', ar: 'قائمة بالقيود المشبوهة لتراجعها' },
        { en: 'Benford’s law, duplicate checks, outlier detection (Isolation Forest), gaps in invoice numbers', ar: 'قانون بنفورد، وكشف التكرار، وكشف القيم الشاذة (Isolation Forest)، والفجوات في أرقام الفواتير' },
        { en: 'Ledger entries, invoices, bank statements', ar: 'قيود الدفاتر والفواتير وكشوف حساب البنك' },
        { en: 'Invoices and bank statements alone still catch duplicates and mismatches. Benford’s law needs a few hundred entries', ar: 'الفواتير وكشوف البنك وحدها تكشف التكرار وعدم التطابق. قانون بنفورد يحتاج بضع مئات من القيود' },
      ),
      s(
        { en: 'Books, e-invoices and bank, matched', ar: 'مطابقة الدفاتر والفواتير الإلكترونية والبنك' },
        { en: 'Sales that don’t match your tax records or bank deposits', ar: 'المبيعات التي لا تطابق سجلاتك الضريبية أو إيداعات البنك' },
        { en: 'Reconciliation rules', ar: 'قواعد المطابقة' },
        { en: 'E-invoice export, your books, bank statement', ar: 'ملف الفواتير الإلكترونية، ودفاترك، وكشف حساب البنك' },
        { en: 'Any two of the three still work', ar: 'أي اثنين من الثلاثة يكفيان' },
      ),
      s(
        { en: '13-week cash forecast', ar: 'توقع السيولة لـ13 أسبوعًا' },
        { en: 'The week cash runs short, and what to do before it', ar: 'الأسبوع الذي ستنقص فيه السيولة، وما تفعله قبله' },
        { en: 'Direct cash-flow method, the standard used by banks and finance managers', ar: 'طريقة التدفق النقدي المباشر، المعيار الذي تستخدمه البنوك والمديرون الماليون' },
        { en: 'Bank balance, unpaid invoices, bills, payroll dates', ar: 'رصيد البنك، والفواتير غير المحصّلة، والمستحقات، ومواعيد الرواتب' },
        { en: 'No list of unpaid invoices? We estimate from six months of bank statements', ar: 'لا توجد قائمة بالفواتير غير المحصّلة؟ نقدّرها من كشوف البنك لستة أشهر' },
      ),
      s(
        { en: 'Profit projection with what-ifs', ar: 'توقع الأرباح وسيناريوهات «ماذا لو»' },
        { en: 'Profit for the next 12 months under three scenarios', ar: 'الأرباح للأشهر الـ12 القادمة في ثلاثة سيناريوهات' },
        { en: 'Driver-based model with Monte Carlo simulation', ar: 'نموذج قائم على المحرّكات مع محاكاة مونت كارلو' },
        { en: '12 to 24 months of profit and loss', ar: 'قائمة الأرباح والخسائر لمدة 12 إلى 24 شهرًا' },
        { en: 'Missing costs become your estimates, clearly labelled', ar: 'التكاليف الناقصة تصبح تقديرات منك، مع توضيح ذلك' },
      ),
      s(
        { en: 'Break-even', ar: 'نقطة التعادل' },
        { en: 'How much you must sell to cover your costs', ar: 'كم يجب أن تبيع لتغطي تكاليفك' },
        { en: 'Break-even formula', ar: 'معادلة التعادل' },
        { en: 'Fixed costs, cost per unit, price', ar: 'التكاليف الثابتة، وتكلفة الوحدة، والسعر' },
        { en: 'Your estimates', ar: 'تقديراتك' },
      ),
      s(
        { en: 'Exchange rate and inflation impact', ar: 'أثر سعر الصرف والتضخم' },
        { en: 'What the pound at 45, 50 or 55 to the dollar does to your margin', ar: 'ماذا يفعل الجنيه عند 45 أو 50 أو 55 للدولار بهامش ربحك' },
        { en: 'Scenario analysis', ar: 'تحليل السيناريوهات' },
        { en: 'The share of your costs that is imported', ar: 'نسبة تكاليفك المستوردة' },
        { en: 'Your estimate, plus Central Bank data', ar: 'تقديرك، مع بيانات البنك المركزي' },
      ),
    ],
  },
  {
    id: 'people',
    name: { en: 'People', ar: 'الموارد البشرية' },
    services: [
      s(
        { en: 'Staff turnover analysis', ar: 'تحليل دوران الموظفين' },
        { en: 'Who is likely to leave, and what turnover costs you', ar: 'من يُرجَّح أن يترك العمل، وكم يكلّفك ذلك' },
        { en: 'Survival analysis and logistic regression', ar: 'تحليل البقاء والانحدار اللوجستي' },
        { en: 'Staff list with hire date, leave date, role, salary', ar: 'قائمة الموظفين مع تاريخ التعيين وتاريخ الترك والوظيفة والراتب' },
        { en: 'Under about 50 staff: turnover rate and cost only, no prediction', ar: 'أقل من 50 موظفًا تقريبًا: معدل الدوران وتكلفته فقط، دون توقع' },
      ),
      s(
        { en: 'Staffing plan', ar: 'خطة العمالة' },
        { en: 'Staff needed per hour or day, matched to your sales', ar: 'عدد الموظفين المطلوب لكل ساعة أو يوم، حسب مبيعاتك' },
        { en: 'ETS sales forecast with a labour-cost ratio', ar: 'توقع المبيعات بنموذج ETS مع نسبة تكلفة العمالة' },
        { en: 'Sales by hour and work schedules', ar: 'المبيعات بالساعة وجداول العمل' },
        { en: 'Daily sales work, with less detail', ar: 'المبيعات اليومية تكفي، بتفاصيل أقل' },
      ),
      s(
        { en: 'Payroll error scan', ar: 'فحص أخطاء الرواتب' },
        { en: 'Duplicate payments, ghost employees, overtime spikes', ar: 'المدفوعات المكررة، والموظفون الوهميون، والقفزات في العمل الإضافي' },
        { en: 'Rules plus outlier detection', ar: 'قواعد فحص مع كشف القيم الشاذة' },
        { en: 'Payroll records', ar: 'سجلات الرواتب' },
        { en: 'Bank transfers to staff can stand in', ar: 'التحويلات البنكية للموظفين يمكن أن تحل محلها' },
      ),
      s(
        { en: 'Pay fairness check', ar: 'فحص عدالة الأجور' },
        { en: 'Pay gaps by role, tenure and gender', ar: 'فجوات الأجور حسب الوظيفة ومدة الخدمة والنوع' },
        { en: 'Regression analysis', ar: 'تحليل الانحدار' },
        { en: 'Salaries, roles, tenure', ar: 'الرواتب والوظائف ومدد الخدمة' },
        { en: 'Salary bands can replace exact salaries, with wider ranges', ar: 'شرائح الرواتب يمكن أن تحل محل الأرقام الدقيقة، مع نطاقات أوسع' },
      ),
      s(
        { en: 'Employee survey', ar: 'استبيان الموظفين' },
        { en: 'A satisfaction score and the main complaints', ar: 'درجة الرضا وأهم الشكاوى' },
        { en: 'eNPS, with AI reading the written comments', ar: 'مؤشر eNPS، مع قراءة التعليقات المكتوبة بالذكاء الاصطناعي' },
        { en: 'Survey answers', ar: 'إجابات الاستبيان' },
        { en: 'We can design and run the survey for you', ar: 'يمكننا تصميم الاستبيان وتنفيذه لك' },
      ),
    ],
  },
  {
    id: 'market',
    name: { en: 'Market research', ar: 'أبحاث السوق' },
    services: [
      s(
        { en: 'Market size', ar: 'حجم السوق' },
        { en: 'How big your market is, and your share of it', ar: 'كم يبلغ حجم سوقك، وما حصتك منه' },
        { en: 'TAM, SAM and SOM, top-down and bottom-up', ar: 'TAM وSAM وSOM، من الأعلى للأسفل ومن الأسفل للأعلى' },
        { en: 'Mostly public data: CAPMAS, World Bank', ar: 'بيانات عامة في الغالب: الجهاز المركزي للتعبئة العامة والإحصاء والبنك الدولي' },
        { en: 'Public data covers it fully', ar: 'البيانات العامة تكفي تمامًا' },
      ),
      s(
        { en: 'Demand trends', ar: 'اتجاهات الطلب' },
        { en: 'Whether interest is rising or falling, and when it peaks', ar: 'هل الاهتمام في صعود أم هبوط، ومتى يبلغ ذروته' },
        { en: 'Google Trends with time-series models', ar: 'Google Trends مع نماذج السلاسل الزمنية' },
        { en: 'Public data', ar: 'بيانات عامة' },
        { en: 'Nothing needed from you', ar: 'لا نحتاج منك شيئًا' },
      ),
      s(
        { en: 'Competitor check', ar: 'تحليل المنافسين' },
        { en: 'Competitors’ prices, positioning, and what their customers complain about', ar: 'أسعار المنافسين، وتموضعهم، وما يشكو منه عملاؤهم' },
        { en: 'Price comparison, Porter’s five forces, SWOT, AI reading of public reviews', ar: 'مقارنة الأسعار، وقوى بورتر الخمس، وتحليل SWOT، وقراءة المراجعات العامة بالذكاء الاصطناعي' },
        { en: 'Competitor prices and reviews, collected by hand', ar: 'أسعار المنافسين ومراجعاتهم، تُجمع يدويًا' },
        { en: 'We collect what is public', ar: 'نجمع ما هو متاح للعامة' },
      ),
      s(
        { en: 'Customer survey', ar: 'استبيان العملاء' },
        { en: 'What customers want, and what they’ll pay', ar: 'ماذا يريد العملاء، وكم سيدفعون' },
        { en: 'Survey statistics and the Van Westendorp price test', ar: 'إحصاءات الاستبيانات واختبار فان ويستندورب للأسعار' },
        { en: 'Survey answers', ar: 'إجابات الاستبيان' },
        { en: 'We design and run the survey', ar: 'نصمّم الاستبيان وننفّذه' },
      ),
      s(
        { en: 'Market conditions', ar: 'ظروف السوق' },
        { en: 'How inflation, interest rates and the pound affect you', ar: 'كيف يؤثر عليك التضخم وأسعار الفائدة وسعر الجنيه' },
        { en: 'PESTEL analysis with scenarios', ar: 'تحليل PESTEL مع سيناريوهات' },
        { en: 'Central Bank of Egypt, CAPMAS, IMF', ar: 'البنك المركزي المصري، والجهاز المركزي للتعبئة العامة والإحصاء، وصندوق النقد الدولي' },
        { en: 'Public data covers it fully', ar: 'البيانات العامة تكفي تمامًا' },
      ),
    ],
  },
]

export const showcase = {
  heading: { en: 'What we actually see', ar: 'ما الذي نراه فعلًا' },
  states: {
    file: { en: 'In your file', ar: 'في ملفك' },
    sent: { en: 'Sent to us', ar: 'ما يصلنا' },
    checked: { en: 'Checked', ar: 'بعد الفحص' },
  },
  cols: {
    invoice: { en: 'Invoice', ar: 'الفاتورة' },
    date: { en: 'Date', ar: 'التاريخ' },
    customer: { en: 'Customer', ar: 'العميل' },
    amount: { en: 'Amount', ar: 'المبلغ' },
  },
  name: { en: 'Hany Adel', ar: 'هاني عادل' },
  date: { en: '14 Mar 2026', ar: '14 مارس 2026' },
  coded: { en: 'Name replaced by our template, on your computer', ar: 'استبدل قالبُنا الاسم برمز، على جهازك' },
  run: { en: 'Run checks', ar: 'شغّل الفحص' },
  again: { en: 'Show again', ar: 'اعرض مرة أخرى' },
  finding: {
    en: 'Possible duplicate of INV-2287: same customer, same amount, two days earlier.',
    ar: 'تكرار محتمل للفاتورة INV-2287: نفس العميل ونفس المبلغ قبل يومين.',
  },
  confidence: { en: 'Confidence: High', ar: 'درجة الثقة: عالية' },
  review: { en: 'Goes to a person for review', ar: 'يراجعه شخص قبل التقرير' },
  example: { en: 'Example with made-up data', ar: 'مثال ببيانات افتراضية' },
}

export const process = {
  heading: { en: 'How we work', ar: 'كيف نعمل' },
  steps: [
    {
      say: { en: 'First, tell us what you have.', ar: 'أولًا، أخبرنا بما لديك.' },
      call: {
        en: 'We have two years of e-invoices, our bank statements and a salary sheet. No customer list, no ad tracking.',
        ar: 'عندنا فواتير إلكترونية لسنتين، وكشوف حساب البنك، وملف الرواتب. لا توجد قائمة عملاء ولا تتبّع للإعلانات.',
      },
    },
    {
      say: { en: 'Then send only that, with names taken out.', ar: 'ثم أرسل ما يلزم فقط، بعد حذف الأسماء.' },
      call: { en: 'Confidentiality agreement: signed', ar: 'اتفاقية السرية: موقّعة' },
    },
    {
      say: { en: 'Then read one page and decide.', ar: 'ثم اقرأ صفحة واحدة واتخذ قرارك.' },
      call: { en: 'What should we do this quarter?', ar: 'ماذا نفعل في هذا الربع؟' },
    },
  ],
  plan: {
    title: { en: 'Your data plan', ar: 'خطة بياناتك' },
    cols: {
      service: { en: 'Service', ar: 'الخدمة' },
      from: { en: 'Built from', ar: 'مبنية على' },
      confidence: { en: 'Confidence', ar: 'الثقة' },
    },
    rows: [
      { service: { en: 'Sales forecast', ar: 'توقع المبيعات' }, from: { en: '24 months of e-invoices', ar: 'فواتير إلكترونية لـ24 شهرًا' }, level: 'high' },
      { service: { en: 'Customer groups', ar: 'شرائح العملاء' }, from: { en: 'Phone numbers on e-invoices, in place of a customer list', ar: 'أرقام الهواتف في الفواتير، بدلًا من قائمة العملاء' }, level: 'medium' },
      { service: { en: '13-week cash forecast', ar: 'توقع السيولة لـ13 أسبوعًا' }, from: { en: 'Bank statements', ar: 'كشوف حساب البنك' }, level: 'high' },
      { service: { en: 'Payroll error scan', ar: 'فحص أخطاء الرواتب' }, from: { en: 'Salary sheet', ar: 'ملف الرواتب' }, level: 'high' },
      { service: { en: 'Ad channel performance', ar: 'أداء قنوات الإعلان' }, from: { en: 'Not yet: we suggest promo codes for four weeks', ar: 'ليس بعد: نقترح أكواد خصم لمدة أربعة أسابيع' }, level: 'none' },
    ],
  },
  received: {
    title: { en: 'Received', ar: 'تم الاستلام' },
    lines: [
      { k: { en: 'Files', ar: 'الملفات' }, v: { en: '3', ar: '3' } },
      { k: { en: 'Customer or staff names', ar: 'أسماء عملاء أو موظفين' }, v: { en: '0', ar: '0' } },
      { k: { en: 'Phone numbers', ar: 'أرقام هواتف' }, v: { en: '0', ar: '0' } },
      { k: { en: 'Transfer link', ar: 'رابط النقل' }, v: { en: 'Encrypted, expired after download', ar: 'مشفّر، وانتهت صلاحيته بعد التنزيل' } },
      { k: { en: 'Deletion date', ar: 'موعد الحذف' }, v: { en: '30 days after your report', ar: 'بعد 30 يومًا من تسليم التقرير' } },
    ],
  },
  legend: {
    title: { en: 'Every result is labelled', ar: 'كل نتيجة لها تصنيف' },
    rows: [
      { level: 'high', text: { en: 'Built on your real data.', ar: 'مبنية على بياناتك الفعلية.' } },
      { level: 'medium', text: { en: 'Some data was replaced, and we say what with.', ar: 'استُبدل جزء من البيانات، ونوضح بماذا.' } },
      { level: 'low', text: { en: 'Mostly estimates. Read it as a direction, not a number.', ar: 'تقديرات في الغالب. اقرأها كاتجاه لا كرقم.' } },
    ],
  },
  levels: {
    high: { en: 'High', ar: 'عالية' },
    medium: { en: 'Medium', ar: 'متوسطة' },
    low: { en: 'Low', ar: 'منخفضة' },
    none: { en: 'Not yet', ar: 'ليس بعد' },
  },
}

export const report = {
  title: { en: 'Your report, page 1', ar: 'تقريرك، الصفحة الأولى' },
  period: { en: 'Q1 2027', ar: 'الربع الأول 2027' },
  findingLabel: { en: 'Finding', ar: 'ما وجدناه' },
  actionLabel: { en: 'Do this', ar: 'افعل هذا' },
  items: [
    {
      finding: { en: 'Cash falls below payroll in week 9 (1 Mar).', ar: 'السيولة تنخفض عن قيمة الرواتب في الأسبوع التاسع (1 مارس).' },
      action: { en: 'Collect three overdue invoices worth EGP 212,000 by 20 Feb.', ar: 'حصّل ثلاث فواتير متأخرة قيمتها 212,000 جنيه قبل 20 فبراير.' },
      level: 'high',
    },
    {
      finding: { en: 'Two supplier invoices were paid twice: EGP 37,600.', ar: 'فاتورتان لمورّد دُفعتا مرتين: 37,600 جنيه.' },
      action: { en: 'Ask supplier S-014 for a refund this week.', ar: 'اطلب استرداد المبلغ من المورّد S-014 هذا الأسبوع.' },
      level: 'high',
    },
    {
      finding: { en: 'An 8% price rise on group B pays off unless sales fall more than 21%.', ar: 'رفع أسعار المجموعة B بنسبة 8% مربح ما لم تنخفض المبيعات أكثر من 21%.' },
      action: { en: 'Raise group B prices from 1 Feb and review in March.', ar: 'ارفع أسعار المجموعة B من 1 فبراير وراجع النتيجة في مارس.' },
      level: 'medium',
    },
  ],
  footer: { en: 'Example with made-up data · Checked by a person', ar: 'مثال ببيانات افتراضية · راجعه شخص' },
}

export const charts = {
  benford: {
    title: { en: 'First digit of 4,812 payments', ar: 'الرقم الأول في 4,812 دفعة' },
    expected: { en: 'Expected (Benford’s law)', ar: 'المتوقع (قانون بنفورد)' },
    found: { en: 'Found', ar: 'الفعلي' },
    note: { en: '77 more amounts start with 9 than expected', ar: '77 مبلغًا إضافيًا تبدأ بالرقم 9' },
  },
  cash: {
    title: { en: 'Cash, next 13 weeks (EGP thousands)', ar: 'السيولة خلال 13 أسبوعًا (بالألف جنيه)' },
    payroll: { en: 'Payroll', ar: 'الرواتب' },
    short: { en: 'Week 9: short', ar: 'الأسبوع 9: عجز' },
  },
  anon: {
    title: { en: 'Invoices, names coded', ar: 'الفواتير بعد ترميز الأسماء' },
    duplicate: { en: 'Duplicate?', ar: 'تكرار؟' },
  },
  page: {
    title: { en: 'Page 1 · three findings', ar: 'الصفحة 1 · ثلاث نتائج' },
  },
  before: { en: 'Before', ar: 'قبل' },
  after: { en: 'After', ar: 'بعد' },
}

export const faq = {
  heading: { en: 'Questions', ar: 'أسئلة' },
  items: [
    {
      q: { en: 'What if we’re missing some data?', ar: 'ماذا لو كانت بعض البيانات ناقصة؟' },
      a: {
        en: 'Usually that’s fine. We swap in another record that tells the same story (e-invoices instead of a sales report, a phone number instead of a customer ID), use public data such as CAPMAS and Central Bank figures, or use your own estimates, clearly marked. A few things can’t be replaced: we can’t check entries we can’t see, and we can’t say which ad channel brought sales without spend per channel. Then we suggest a short test instead.',
        ar: 'غالبًا لا مشكلة. نستخدم سجلًا آخر يحكي القصة نفسها (الفواتير الإلكترونية بدل تقرير المبيعات، ورقم الهاتف بدل رقم العميل)، أو بيانات عامة مثل أرقام الجهاز المركزي للتعبئة العامة والإحصاء والبنك المركزي، أو تقديراتك أنت مع توضيح ذلك. بعض الأشياء لا بديل لها: لا يمكننا فحص قيود لا نراها، ولا معرفة أي قناة إعلانية جلبت المبيعات دون الإنفاق على كل قناة. وعندها نقترح اختبارًا قصيرًا بدلًا من ذلك.',
      },
    },
    {
      q: { en: 'How accurate are the reports?', ar: 'ما مدى دقة التقارير؟' },
      a: {
        en: 'Every calculation is exact, and a person checks every number before it reaches you. Forecasts are never certain, so each one comes as a likely, low and high case, and we show how well the method would have predicted your own past year. Every result carries a label: High (your real data), Medium (some data replaced) or Low (mostly estimates).',
        ar: 'كل حساب دقيق، ويراجع شخصٌ كل رقم قبل أن يصلك. التوقعات ليست مؤكدة أبدًا، لذا يأتي كل توقع بحالة مرجّحة ومنخفضة ومرتفعة، ونوضح مدى دقة الطريقة لو طُبّقت على عامك الماضي. وكل نتيجة تحمل تصنيفًا: عالية (بياناتك الفعلية)، أو متوسطة (استُبدل جزء من البيانات)، أو منخفضة (تقديرات في الغالب).',
      },
    },
    {
      q: { en: 'Which methods do you use?', ar: 'ما الطرق التي تستخدمونها؟' },
      a: {
        en: 'Well-known, published methods: ETS and ARIMA forecasting (the family behind Excel’s forecast function), Prophet from Meta and Chronos from Amazon, Benford’s law and the outlier tests auditors use, RFM and cohort analysis, break-even and Monte Carlo simulation. AI cleans messy files and writes the explanation. It never makes up a number.',
        ar: 'طرق معروفة ومنشورة: نماذج ETS وARIMA للتوقع (العائلة التي تعتمد عليها دالة التوقع في Excel)، وProphet من Meta، وChronos من Amazon، وقانون بنفورد واختبارات القيم الشاذة التي يستخدمها المراجعون، وتحليل RFM والمجموعات، ونقطة التعادل ومحاكاة مونت كارلو. الذكاء الاصطناعي ينظّم الملفات ويكتب الشرح، ولا يخترع أي رقم.',
      },
    },
    {
      q: { en: 'Do you need access to our systems?', ar: 'هل تحتاجون الدخول إلى أنظمتنا؟' },
      a: {
        en: 'No. Excel or CSV exports are enough: an e-invoice export, a bank statement, a sales sheet. We never ask for passwords.',
        ar: 'لا. تكفي ملفات Excel أو CSV: ملف الفواتير الإلكترونية، وكشف حساب البنك، وملف المبيعات. ولا نطلب كلمات مرور أبدًا.',
      },
    },
    {
      q: { en: 'Are you accountants or financial advisers?', ar: 'هل أنتم محاسبون أو مستشارون ماليون؟' },
      a: {
        en: 'We are business analysts. We don’t certify financial statements and we don’t give investment advice. When a report needs an accountant’s signature, for a bank loan for example, we work with a registered accountant.',
        ar: 'نحن محللو أعمال. لا نعتمد القوائم المالية ولا نقدّم استشارات استثمارية. وعندما يحتاج التقرير توقيع محاسب، لقرض بنكي مثلًا، نعمل مع محاسب مقيّد.',
      },
    },
    {
      q: { en: 'Which languages?', ar: 'بأي لغة؟' },
      a: {
        en: 'Every report comes in Arabic, English, or both.',
        ar: 'كل تقرير متاح بالعربية أو الإنجليزية أو بكلتيهما.',
      },
    },
    {
      q: { en: 'What does it cost?', ar: 'كم التكلفة؟' },
      a: {
        en: 'Each report has a fixed price, agreed after a free call, based on the services you choose. We don’t bill by the hour.',
        ar: 'لكل تقرير سعر ثابت نتفق عليه بعد مكالمة مجانية، حسب الخدمات التي تختارها. ولا نحاسب بالساعة.',
      },
    },
  ],
}

export const contact = {
  sentence: {
    en: 'Tell us about an error you suspect, a decision you’re weighing, or numbers you’d like explained.',
    ar: 'حدّثنا عن خطأ تشك فيه، أو قرار تفكّر فيه، أو أرقام تريد أن تفهمها.',
  },
  question: { en: 'Ready for a free first call?', ar: 'جاهز لمكالمة أولى مجانية؟' },
  whatsapp: { en: 'Message us on WhatsApp', ar: 'راسلنا على واتساب' },
  rules: { en: 'Read our privacy rules', ar: 'اقرأ قواعد الخصوصية' },
  place: { en: 'Cairo, Egypt · We reply within one working day', ar: 'القاهرة، مصر · نرد خلال يوم عمل واحد' },
  mailSubject: { en: 'Free first call', ar: 'مكالمة أولى مجانية' },
  mailBody: {
    en: 'Hello Basira,\n\nOur company: \nWhat we’d like help with: \nA good time to call: \n',
    ar: 'مرحبًا بصيرة،\n\nشركتنا: \nما نحتاج المساعدة فيه: \nوقت مناسب للاتصال: \n',
  },
  gauge: { en: 'Nilometer gauge', ar: 'مقياس النيل' },
}

export const footer = {
  about: { en: 'Business analysis for small and medium companies', ar: 'تحليل أعمال للشركات الصغيرة والمتوسطة' },
  place: { en: 'Cairo, Egypt', ar: 'القاهرة، مصر' },
  navTitle: { en: 'On this page', ar: 'في هذه الصفحة' },
  contactTitle: { en: 'Contact', ar: 'تواصل' },
  privacyTitle: { en: 'Privacy', ar: 'الخصوصية' },
  privacyText: {
    en: 'No cookies, no trackers. Your files are deleted within 30 days of your report.',
    ar: 'لا ملفات تعريف ارتباط ولا تتبّع. تُحذف ملفاتك خلال 30 يومًا من تسليم التقرير.',
  },
  legal: {
    en: '© 2026 Basira. Business analysis, not investment advice. Examples on this page use made-up data.',
    ar: '© 2026 بصيرة. تحليل أعمال وليس استشارات استثمارية. الأمثلة في هذه الصفحة ببيانات افتراضية.',
  },
}

export const meta = {
  title: { en: 'Basira · Your numbers, explained', ar: 'بصيرة · أرقامك بوضوح' },
  description: {
    en: 'Basira finds errors in your books, forecasts what comes next and shows what each decision will do, across sales, marketing, accounting, people and market research. Privacy first.',
    ar: 'بصيرة تكتشف الأخطاء في حساباتك، وتتوقع ما هو قادم، وتوضح أثر كل قرار، في المبيعات والتسويق والمحاسبة والموارد البشرية وأبحاث السوق. الخصوصية أولًا.',
  },
}
