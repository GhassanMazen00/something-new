// Every word on the site, in English and Arabic. Edit text here, not in the components.

export type Lang = 'en' | 'ar'
export type T = { en: string; ar: string }

// Replace all three before launch: these are placeholders.
export const CONTACT = {
  email: 'hello@clearline.example',
  // WhatsApp in international format without "+" or spaces.
  whatsapp: '201000000000',
  whatsappShown: '+20 100 000 0000',
  // Phone as it should be shown, and as it should be dialled.
  phone: '+20 100 000 0000',
  phoneDial: '+201000000000',
}

// The name is never translated.
export const BRAND = 'Clearline'
export const BRAND_FULL = 'Clearline Analytics'

export const nav = {
  privacy: { en: 'Privacy', ar: 'الخصوصية' },
  services: { en: 'Services', ar: 'الخدمات' },
  process: { en: 'How we work', ar: 'كيف نعمل' },
  demo: { en: 'Try it', ar: 'جرّب' },
  checker: { en: 'Your data', ar: 'بياناتك' },
  faq: { en: 'Questions', ar: 'أسئلة' },
  book: { en: 'Contact us', ar: 'تواصل معنا' },
  switchTo: { en: 'عربي', ar: 'English' },
  switchLabel: { en: 'اقرأ الموقع بالعربية', ar: 'Read this site in English' },
  menu: { en: 'Menu', ar: 'القائمة' },
  close: { en: 'Close', ar: 'إغلاق' },
}

export const hero = {
  title: { en: ['Clarity for every', 'business decision'], ar: ['وضوح في كل', 'قرار تجاري'] },
  short: {
    en: 'Business analysis and forecasting, built on proven models.',
    ar: 'تحليل الأعمال والتوقعات، مبني على نماذج مثبتة.',
  },
  standfirst: {
    en: 'Clearline Analytics is a business analysis firm in Cairo. We find the errors in your books, forecast what comes next and show what each decision will do, using proven statistical models and AI, with your files encrypted from start to finish.',
    ar: 'Clearline Analytics شركة تحليل أعمال في القاهرة. نكتشف الأخطاء في حساباتك، ونتوقع ما هو قادم، ونوضح أثر كل قرار، باستخدام نماذج إحصائية مثبتة والذكاء الاصطناعي، مع تشفير ملفاتك من البداية إلى النهاية.',
  },
}

export const about = {
  heading: { en: 'We are the data department you never had time to build.', ar: 'نحن قسم البيانات الذي لم يتسع وقتك لبنائه.' },
  text: {
    en: 'Most small and medium companies hold years of sales, accounting and staff data that nobody has time to read. We read it for you with the methods banks, auditors and large retailers rely on, and hand you one clear page of findings and actions.',
    ar: 'معظم الشركات الصغيرة والمتوسطة لديها سنوات من بيانات المبيعات والحسابات والموظفين لا يجد أحد وقتًا لقراءتها. نقرؤها لك بالطرق التي تعتمد عليها البنوك والمراجعون وكبار تجار التجزئة، ونسلّمك صفحة واحدة واضحة بالنتائج والإجراءات.',
  },
  points: [
    { en: 'Fixed price per report, agreed after a free call', ar: 'سعر ثابت لكل تقرير، نتفق عليه بعد مكالمة مجانية' },
    { en: 'Reports in Arabic, English or both', ar: 'تقارير بالعربية أو الإنجليزية أو كلتيهما' },
    { en: 'Every number checked by a person', ar: 'كل رقم يراجعه شخص' },
  ],
  pillars: [
    {
      title: { en: 'Find errors', ar: 'اكتشاف الأخطاء' },
      text: { en: 'Duplicate payments, missing sales, unusual entries and payroll mistakes.', ar: 'المدفوعات المكررة، والمبيعات المفقودة، والقيود غير المعتادة، وأخطاء الرواتب.' },
      stat: 'EGP 37,600',
      note: { en: 'paid twice, found in one scan', ar: 'دُفعت مرتين، اكتُشفت في فحص واحد' },
    },
    {
      title: { en: 'Forecast', ar: 'التوقع' },
      text: { en: 'Sales, cash and profit, each with a likely, low and high case.', ar: 'المبيعات والسيولة والأرباح، لكل منها حالة مرجّحة ومنخفضة ومرتفعة.' },
      stat: '4.2%',
      note: { en: 'average error on hidden months', ar: 'متوسط الخطأ في الأشهر المخفية' },
    },
    {
      title: { en: 'Decide', ar: 'اتخاذ القرار' },
      text: { en: 'Prices, budgets, branches and hiring, tested before you commit.', ar: 'الأسعار والميزانيات والفروع والتوظيف، تُختبر قبل أن تلتزم.' },
      stat: '26%',
      note: { en: 'sales drop a price rise can survive', ar: 'انخفاض المبيعات الذي يتحمّله رفع السعر' },
    },
    {
      title: { en: 'Protect', ar: 'الحماية' },
      text: { en: 'Encrypted files, one named analyst, deleted 30 days after your report.', ar: 'ملفات مشفّرة، ومحلل واحد محدد، وحذف بعد 30 يومًا من التقرير.' },
      stat: 'AES-256',
      note: { en: 'encryption at rest', ar: 'تشفير أثناء التخزين' },
    },
  ],
}

export const privacy = {
  heading: { en: ['Your files are', 'safe with us'], ar: ['ملفاتك', 'في أمان معنا'] },
  lead: {
    en: 'You send your files as they are. We encrypt them the moment they arrive, only the analyst on your project can open them, and they are never shared with anyone. When your report is done, they are deleted.',
    ar: 'ترسل ملفاتك كما هي. نشفّرها لحظة وصولها، ولا يفتحها إلا المحلل المسؤول عن مشروعك، ولا نشاركها مع أي جهة. وعند تسليم التقرير تُحذف.',
  },
  journeyTitle: { en: 'How your files travel', ar: 'رحلة ملفاتك' },
  journey: [
    {
      title: { en: 'Agreement signed', ar: 'توقيع الاتفاقية' },
      text: { en: 'A confidentiality agreement is signed before you send anything.', ar: 'نوقّع اتفاقية سرية قبل أن ترسل أي شيء.' },
    },
    {
      title: { en: 'Encrypted upload', ar: 'رفع مشفّر' },
      text: { en: 'A private link that expires. Never WhatsApp or email.', ar: 'رابط خاص تنتهي صلاحيته. لا واتساب ولا بريد إلكتروني.' },
    },
    {
      title: { en: 'Encrypted storage', ar: 'تخزين مشفّر' },
      text: { en: 'Locked with AES-256. One named analyst holds the key.', ar: 'مقفلة بتشفير AES-256. مفتاحها مع محلل واحد محدد.' },
    },
    {
      title: { en: 'Analysis', ar: 'التحليل' },
      text: { en: 'On our secured machines. Business AI that never trains on your data.', ar: 'على أجهزتنا المؤمّنة. ذكاء اصطناعي للأعمال لا يتدرّب على بياناتك.' },
    },
    {
      title: { en: 'Deleted', ar: 'الحذف' },
      text: { en: 'Within 30 days of your report, confirmed in writing.', ar: 'خلال 30 يومًا من التقرير، مع تأكيد مكتوب.' },
    },
  ],
  specTitle: { en: 'Security at a glance', ar: 'الأمان باختصار' },
  specs: [
    { k: { en: 'In transit', ar: 'أثناء النقل' }, v: { en: 'TLS 1.3 encrypted link, expires after download', ar: 'رابط مشفّر TLS 1.3، تنتهي صلاحيته بعد التنزيل' } },
    { k: { en: 'At rest', ar: 'أثناء التخزين' }, v: { en: 'AES-256 encryption', ar: 'تشفير AES-256' } },
    { k: { en: 'Who can open it', ar: 'من يستطيع فتحها' }, v: { en: 'One named analyst', ar: 'محلل واحد محدد بالاسم' } },
    { k: { en: 'Shared with', ar: 'تُشارك مع' }, v: { en: 'No one. Never sold', ar: 'لا أحد. ولا تُباع أبدًا' } },
    { k: { en: 'Kept for', ar: 'مدة الاحتفاظ' }, v: { en: '30 days after your report', ar: '30 يومًا بعد التقرير' } },
    { k: { en: 'Law', ar: 'القانون' }, v: { en: 'Egypt PDPL No. 151 of 2020', ar: 'قانون حماية البيانات رقم 151 لسنة 2020' } },
  ],
  rulesHeading: { en: 'Our privacy rules', ar: 'قواعد الخصوصية لدينا' },
  rules: [
    {
      title: { en: 'Confidentiality first', ar: 'السرية أولًا' },
      text: { en: 'We sign a confidentiality agreement before you send a single file.', ar: 'نوقّع معك اتفاقية سرية قبل أن ترسل أي ملف.' },
    },
    {
      title: { en: 'Only what’s needed', ar: 'ما يلزم فقط' },
      text: { en: 'Every service lists the exact data it needs. We never ask for more.', ar: 'كل خدمة تحدد البيانات التي تحتاجها بالضبط، ولا نطلب أكثر من ذلك.' },
    },
    {
      title: { en: 'Encrypted, always', ar: 'مشفّرة دائمًا' },
      text: { en: 'Your files are encrypted on the way to us and while we hold them.', ar: 'ملفاتك مشفّرة أثناء وصولها إلينا وطوال فترة احتفاظنا بها.' },
    },
    {
      title: { en: 'Private transfer', ar: 'نقل آمن' },
      text: { en: 'Files travel through an encrypted link that expires. Never by WhatsApp or email.', ar: 'تنتقل الملفات عبر رابط مشفّر تنتهي صلاحيته، وليس عبر واتساب أو البريد الإلكتروني.' },
    },
    {
      title: { en: 'AI that doesn’t learn from you', ar: 'ذكاء اصطناعي لا يتعلّم من بياناتك' },
      text: { en: 'We use only paid business AI services that don’t train on your data. Never free chatbots.', ar: 'نستخدم فقط خدمات ذكاء اصطناعي مدفوعة للأعمال لا تتدرّب على بياناتك، ولا نستخدم روبوتات المحادثة المجانية أبدًا.' },
    },
    {
      title: { en: 'Deleted when done', ar: 'الحذف بعد الانتهاء' },
      text: { en: 'Your files are deleted within 30 days of your report, or sooner if you ask, and we confirm it in writing.', ar: 'تُحذف ملفاتك خلال 30 يومًا من تسليم التقرير، أو قبل ذلك إن طلبت، ونؤكد لك ذلك كتابيًا.' },
    },
    {
      title: { en: 'Never shared, never sold', ar: 'لا مشاركة ولا بيع' },
      text: { en: 'Your data is used for your report and nothing else.', ar: 'تُستخدم بياناتك لتقريرك فقط، ولا شيء غيره.' },
    },
    {
      title: { en: 'Egypt’s data law', ar: 'قانون حماية البيانات' },
      text: { en: 'We follow Egypt’s Personal Data Protection Law, No. 151 of 2020.', ar: 'نلتزم بقانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020.' },
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
      s(
        { en: 'Data cleaning and merging', ar: 'تنظيف البيانات ودمجها' },
        { en: 'One clean, trusted table built from your scattered files', ar: 'جدول واحد نظيف وموثوق من ملفاتك المتفرقة' },
        { en: 'Standard cleaning rules, duplicate removal and fuzzy matching of names and codes', ar: 'قواعد التنظيف المعتادة، وحذف التكرار، والمطابقة التقريبية للأسماء والرموز' },
        { en: 'Any Excel, CSV or system exports you have', ar: 'أي ملفات Excel أو CSV أو تصديرات من أنظمتك' },
        { en: 'Nothing extra: we work with what you send', ar: 'لا شيء إضافي: نعمل بما ترسله' },
      ),
      s(
        { en: 'KPI dashboard', ar: 'لوحة مؤشرات الأداء' },
        { en: 'Your key numbers on one screen, refreshed every month', ar: 'أرقامك الأساسية في شاشة واحدة، تتحدث كل شهر' },
        { en: 'KPI design with Power BI or Looker Studio', ar: 'تصميم مؤشرات الأداء باستخدام Power BI أو Looker Studio' },
        { en: 'Monthly sales, costs and any targets you track', ar: 'المبيعات والتكاليف الشهرية وأي أهداف تتابعها' },
        { en: 'Missing targets: we suggest them from your own history', ar: 'إن لم تكن هناك أهداف: نقترحها من تاريخك' },
      ),
      s(
        { en: 'Trends and seasonality', ar: 'الاتجاهات والموسمية' },
        { en: 'What really changes by month, weekday and season, with the noise taken out', ar: 'ما الذي يتغير فعلًا حسب الشهر واليوم والموسم، بعد إزالة التذبذب' },
        { en: 'Seasonal decomposition (STL) and moving averages', ar: 'التحليل الموسمي (STL) والمتوسطات المتحركة' },
        { en: 'At least 12 months of daily or weekly sales', ar: 'مبيعات يومية أو أسبوعية لمدة 12 شهرًا على الأقل' },
        { en: 'Under 12 months: weekday and monthly patterns only', ar: 'أقل من 12 شهرًا: أنماط الأيام والأشهر فقط' },
      ),
      s(
        { en: 'Driver analysis', ar: 'تحليل المحرّكات' },
        { en: 'Which factors move your sales or costs the most, and by how much', ar: 'أي العوامل تحرّك مبيعاتك أو تكاليفك أكثر، وبأي قدر' },
        { en: 'Multiple regression with SHAP values', ar: 'الانحدار المتعدد مع قيم SHAP' },
        { en: 'Sales plus the factors you think matter: price, promotions, branch, season', ar: 'المبيعات مع العوامل التي تراها مؤثرة: السعر والعروض والفرع والموسم' },
        { en: 'Missing factors: we add public ones such as holidays and inflation', ar: 'عوامل ناقصة: نضيف عوامل عامة مثل الإجازات والتضخم' },
      ),
      s(
        { en: 'Branch and product benchmarking', ar: 'مقارنة الفروع والمنتجات' },
        { en: 'Which branches and products under- or over-perform, compared fairly', ar: 'أي الفروع والمنتجات أداؤها أقل أو أعلى من المتوقع، بمقارنة عادلة' },
        { en: 'Indexed comparison per square metre, per staff member and per customer', ar: 'مقارنة نسبية لكل متر مربع ولكل موظف ولكل عميل' },
        { en: 'Sales by branch or product, plus size and staff numbers', ar: 'المبيعات حسب الفرع أو المنتج، مع المساحة وعدد الموظفين' },
        { en: 'Without size or staff data: sales and growth only', ar: 'بدون بيانات المساحة أو الموظفين: المبيعات والنمو فقط' },
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
      say: { en: 'Then send only that, through an encrypted link.', ar: 'ثم أرسل ما يلزم فقط، عبر رابط مشفّر.' },
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
      { k: { en: 'Storage', ar: 'التخزين' }, v: { en: 'Encrypted, AES-256', ar: 'مشفّر، AES-256' } },
      { k: { en: 'Access', ar: 'الوصول' }, v: { en: 'One named analyst', ar: 'محلل واحد محدد' } },
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
    en: 'Hello Clearline,\n\nOur company: \nWhat we’d like help with: \nA good time to call: \n',
    ar: 'مرحبًا Clearline،\n\nشركتنا: \nما نحتاج المساعدة فيه: \nوقت مناسب للاتصال: \n',
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
    en: '© 2026 Clearline Analytics. Business analysis, not investment advice. Examples on this page use made-up data.',
    ar: '© 2026 Clearline Analytics. تحليل أعمال وليس استشارات استثمارية. الأمثلة في هذه الصفحة ببيانات افتراضية.',
  },
}

export const meta = {
  title: { en: 'Clearline Analytics · Clarity for every business decision', ar: 'Clearline Analytics · وضوح في كل قرار تجاري' },
  description: {
    en: 'Clearline Analytics finds errors in your books, forecasts what comes next and shows what each decision will do, across sales, marketing, accounting, people and market research. Privacy first.',
    ar: 'Clearline Analytics تكتشف الأخطاء في حساباتك، وتتوقع ما هو قادم، وتوضح أثر كل قرار، في المبيعات والتسويق والمحاسبة والموارد البشرية وأبحاث السوق. الخصوصية أولًا.',
  },
}

// ---- Interactive parts ----

export const heroExtra = {
  badge: { en: 'Encrypted · never shared · deleted after 30 days', ar: 'مشفّرة · لا تُشارك · تُحذف بعد 30 يومًا' },
  try: { en: 'Try the live demo', ar: 'جرّب العرض الحي' },
  stats: [
    { value: 6, suffix: '', label: { en: 'departments', ar: 'أقسام' } },
    { value: 32, suffix: '', label: { en: 'services', ar: 'خدمة' } },
    { value: 256, suffix: '', label: { en: 'bit encryption', ar: 'بت تشفير' } },
    { value: 30, suffix: '', label: { en: 'days, then deleted', ar: 'يومًا ثم الحذف' } },
  ],
  card: {
    title: { en: 'Live report preview', ar: 'معاينة حية للتقرير' },
    found: { en: 'Paid twice', ar: 'دُفع مرتين' },
    runway: { en: 'Cash short', ar: 'عجز السيولة' },
    week: { en: 'Week 9', ar: 'الأسبوع 9' },
    scanned: { en: 'Entries scanned', ar: 'قيود تم فحصها' },
  },
}

export const methods = [
  'ETS', 'ARIMA', 'Prophet', 'Chronos', 'Benford’s law', 'Isolation Forest', 'RFM', 'BG/NBD',
  'Monte Carlo', 'Pareto 80/20', 'Van Westendorp', 'PESTEL', 'Google Meridian', 'Meta Robyn', 'eNPS', 'Survival analysis',
]

export interface CheckerService {
  name: T
  dept: string
  // Each inner list is one way to get there: all items in it are needed.
  high: string[][]
  medium: string[][]
  low?: string[][]
  publicData?: boolean
}

export const checker = {
  heading: { en: 'What can we do with what you have?', ar: 'ماذا نستطيع أن نفعل بما لديك؟' },
  lead: {
    en: 'Tick the files you have. See which services you can get, and how sure each one would be. Missing data often has a stand-in.',
    ar: 'اختر الملفات الموجودة لديك، وشاهد الخدمات المتاحة ومدى دقة كل منها. البيانات الناقصة غالبًا لها بديل.',
  },
  have: { en: 'I have…', ar: 'لديّ…' },
  ready: { en: 'services you can get now', ar: 'خدمات متاحة لك الآن' },
  outOf: { en: 'of {total}', ar: 'من {total}' },
  add: { en: 'Add for full confidence:', ar: 'أضف لثقة كاملة:' },
  levels: {
    high: { en: 'Full confidence', ar: 'ثقة كاملة' },
    medium: { en: 'Partial · we substitute', ar: 'جزئية · نستخدم بديلًا' },
    low: { en: 'Estimates only', ar: 'تقديرات فقط' },
    none: { en: 'Needs data', ar: 'تحتاج بيانات' },
  },
  none: { en: 'Pick a file to start', ar: 'اختر ملفًا للبدء' },
  publicNote: { en: 'Uses public data', ar: 'تعتمد على بيانات عامة' },
  items: [
    { id: 'sales', label: { en: 'Sales list', ar: 'قائمة المبيعات' } },
    { id: 'einv', label: { en: 'E-invoices', ar: 'الفواتير الإلكترونية' } },
    { id: 'bank', label: { en: 'Bank statements', ar: 'كشوف البنك' } },
    { id: 'ledger', label: { en: 'Ledger / books', ar: 'الدفاتر' } },
    { id: 'unpaid', label: { en: 'Unpaid invoices', ar: 'الفواتير غير المحصّلة' } },
    { id: 'pnl', label: { en: 'Profit & loss', ar: 'الأرباح والخسائر' } },
    { id: 'cost', label: { en: 'Prices & costs', ar: 'الأسعار والتكاليف' } },
    { id: 'stock', label: { en: 'Stock on hand', ar: 'المخزون الحالي' } },
    { id: 'ads', label: { en: 'Ad spend per channel', ar: 'الإنفاق الإعلاني لكل قناة' } },
    { id: 'payroll', label: { en: 'Payroll', ar: 'الرواتب' } },
    { id: 'staff', label: { en: 'Staff list', ar: 'قائمة الموظفين' } },
  ],
  services: [
    { name: { en: 'Sales forecast', ar: 'توقع المبيعات' }, dept: 'sales', high: [['sales'], ['einv']], medium: [['bank']] },
    { name: { en: 'Price change what-if', ar: 'ماذا لو غيّرنا السعر؟' }, dept: 'sales', high: [['cost', 'sales'], ['cost', 'einv']], medium: [['cost']] },
    { name: { en: 'Stock reorder plan', ar: 'خطة إعادة طلب المخزون' }, dept: 'sales', high: [['stock', 'sales'], ['stock', 'einv']], medium: [['sales'], ['einv']] },
    { name: { en: 'Customer groups', ar: 'شرائح العملاء' }, dept: 'marketing', high: [['sales']], medium: [['einv']] },
    { name: { en: 'Ad channel performance', ar: 'أداء قنوات الإعلان' }, dept: 'marketing', high: [['ads', 'sales'], ['ads', 'einv']], medium: [['ads']] },
    { name: { en: 'Error and fraud scan', ar: 'فحص الأخطاء والاحتيال' }, dept: 'accounting', high: [['ledger', 'bank']], medium: [['einv', 'bank'], ['ledger']], low: [['einv'], ['bank']] },
    { name: { en: 'Books, e-invoices and bank, matched', ar: 'مطابقة الدفاتر والفواتير والبنك' }, dept: 'accounting', high: [['ledger', 'einv', 'bank']], medium: [['ledger', 'einv'], ['ledger', 'bank'], ['einv', 'bank']] },
    { name: { en: '13-week cash forecast', ar: 'توقع السيولة لـ13 أسبوعًا' }, dept: 'accounting', high: [['bank', 'unpaid']], medium: [['bank']] },
    { name: { en: 'Profit projection', ar: 'توقع الأرباح' }, dept: 'accounting', high: [['pnl']], medium: [['ledger'], ['sales', 'cost']], low: [['bank']] },
    { name: { en: 'Payroll error scan', ar: 'فحص أخطاء الرواتب' }, dept: 'people', high: [['payroll']], medium: [['bank']] },
    { name: { en: 'Staff turnover', ar: 'تحليل دوران الموظفين' }, dept: 'people', high: [['staff']], medium: [['payroll']] },
    { name: { en: 'Market size & demand trends', ar: 'حجم السوق واتجاهات الطلب' }, dept: 'market', high: [], medium: [], publicData: true },
  ] as CheckerService[],
}

export const contactDialog = {
  title: { en: 'Contact us', ar: 'تواصل معنا' },
  lead: { en: 'Pick whatever suits you. We reply within one working day.', ar: 'اختر ما يناسبك. نرد خلال يوم عمل واحد.' },
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  whatsapp: { en: 'WhatsApp', ar: 'واتساب' },
  phone: { en: 'Phone', ar: 'الهاتف' },
  hours: { en: 'Sunday to Thursday, 9:00 to 18:00, Cairo time', ar: 'من الأحد إلى الخميس، 9:00 إلى 18:00 بتوقيت القاهرة' },
  close: { en: 'Close', ar: 'إغلاق' },
}

export const settings = {
  title: { en: 'Settings', ar: 'الإعدادات' },
  language: { en: 'Language', ar: 'اللغة' },
  appearance: { en: 'Appearance', ar: 'المظهر' },
  dark: { en: 'Dark', ar: 'داكن' },
  light: { en: 'Light', ar: 'فاتح' },
}
