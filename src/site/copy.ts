// Words for the redesigned pages, in English and Arabic. Department, privacy, process, report, FAQ and contact text
// still lives in ../content.ts and is shared with the analyst workspace.

import type { T } from '../content'

export type Page = 'home'

// The menu: sections of the one page.
export const pages: { id: string; href: string; label: T }[] = [
  { id: 'services', href: '#services', label: { en: 'Services', ar: 'الخدمات' } },
  { id: 'security', href: '#security', label: { en: 'Security', ar: 'الأمان' } },
  { id: 'process', href: '#process', label: { en: 'How we work', ar: 'كيف نعمل' } },
  { id: 'faq', href: '#faq', label: { en: 'Questions', ar: 'أسئلة' } },
]

export const ui = {
  book: { en: 'Book a free call', ar: 'احجز مكالمة مجانية' },
  contact: { en: 'Contact us', ar: 'تواصل معنا' },
  allServices: { en: 'See all 32 services', ar: 'شاهد الخدمات الـ32' },
  home: { en: 'Clearline home', ar: 'الصفحة الرئيسية' },
  skip: { en: 'Skip to content', ar: 'انتقل إلى المحتوى' },
  example: { en: 'Example with made-up data', ar: 'مثال ببيانات افتراضية' },
}

export const heroCopy = {
  title: { en: ['Your numbers,', 'made clear.'], ar: ['أرقامك،', 'بوضوح تام.'] },
  lead: {
    en: 'Clearline is a business analysis firm in Cairo. Send the files you already keep, and get forecasts, error checks and a plan in plain words, checked by a named analyst.',
    ar: 'Clearline شركة تحليل أعمال في القاهرة. أرسل الملفات الموجودة لديك، واحصل على توقعات وفحص للأخطاء وخطة بكلمات واضحة، يراجعها محلل محدد بالاسم.',
  },
  panelLabel: { en: 'A Clearline analysis', ar: 'تحليل من Clearline' },
  tabs: {
    forecast: { en: 'Sales forecast', ar: 'توقع المبيعات' },
    twice: { en: 'Paid twice', ar: 'دُفع مرتين' },
    cash: { en: 'Cash runway', ar: 'مدى السيولة' },
    leaving: { en: 'Customers leaving', ar: 'عملاء يغادرون' },
  },
  forecast: {
    kpis: [
      { k: { en: 'Next 6 months', ar: 'الأشهر الستة القادمة' }, v: 'EGP 22.4M' },
      { k: { en: 'Likely range', ar: 'المدى المرجّح' }, v: '20.9M – 23.8M' },
      { k: { en: 'Error on held-back months', ar: 'الخطأ على أشهر الاختبار' }, v: '6.4%' },
    ],
    finding: { en: 'March is the peak month: order stock by mid-February.', ar: 'مارس هو شهر الذروة: اطلب المخزون قبل منتصف فبراير.' },
    actual: { en: 'Actual', ar: 'الفعلي' },
    predicted: { en: 'Forecast', ar: 'التوقع' },
  },
  twice: {
    kpis: [
      { k: { en: 'Entries checked', ar: 'قيود تم فحصها' }, v: '3,006' },
      { k: { en: 'Flagged', ar: 'تم رصدها' }, v: '7' },
      { k: { en: 'Paid twice', ar: 'دُفعت مرتين' }, v: 'EGP 37,600' },
    ],
    cols: { en: ['Date', 'Supplier', 'Amount', 'Why'], ar: ['التاريخ', 'المورّد', 'المبلغ', 'السبب'] },
    rows: [
      ['12 Jan', 'S-014', '18,800', { en: 'Same amount, 2 days apart', ar: 'نفس المبلغ بفارق يومين' }],
      ['14 Jan', 'S-014', '18,800', { en: 'Same amount, 2 days apart', ar: 'نفس المبلغ بفارق يومين' }],
      ['3 Feb', 'S-102', '49,000', { en: 'Just under the approval limit', ar: 'أقل بقليل من حد الموافقة' }],
      ['9 Feb', 'S-061', '212,500', { en: 'Ten times this supplier’s usual', ar: 'عشرة أضعاف المعتاد لهذا المورّد' }],
    ] as [string, string, string, T][],
    finding: { en: 'Ask supplier S-014 for a refund of EGP 18,800 this week.', ar: 'اطلب من المورّد S-014 استرداد 18,800 جنيه هذا الأسبوع.' },
  },
  cash: {
    kpis: [
      { k: { en: 'Cash today', ar: 'السيولة اليوم' }, v: 'EGP 1.35M' },
      { k: { en: 'Lowest point', ar: 'أدنى نقطة' }, v: '−EGP 212K' },
      { k: { en: 'Runs short in', ar: 'تنفد في' }, v: { en: 'Week 9', ar: 'الأسبوع 9' } },
    ],
    week: { en: 'W', ar: 'أ' },
    finding: { en: 'Collect three overdue invoices worth EGP 212,000 by 20 February.', ar: 'حصّل ثلاث فواتير متأخرة قيمتها 212,000 جنيه قبل 20 فبراير.' },
  },
  leaving: {
    kpis: [
      { k: { en: 'Customers', ar: 'العملاء' }, v: '4,264' },
      { k: { en: 'Regulars fading', ar: 'عملاء دائمون يبتعدون' }, v: '134' },
      { k: { en: 'They spent last year', ar: 'أنفقوا العام الماضي' }, v: 'EGP 281K' },
    ],
    groups: [
      { k: { en: 'Best customers', ar: 'أفضل العملاء' }, v: 1461 },
      { k: { en: 'Loyal', ar: 'أوفياء' }, v: 559 },
      { k: { en: 'Need attention', ar: 'تحتاج اهتمامًا' }, v: 293 },
      { k: { en: 'Fading regulars', ar: 'دائمون يبتعدون' }, v: 134 },
      { k: { en: 'Gone quiet', ar: 'توقفوا عن الشراء' }, v: 750 },
    ],
    finding: { en: 'Send the 134 fading regulars a personal offer this month.', ar: 'أرسل عرضًا شخصيًا للعملاء الـ134 الذين يبتعدون هذا الشهر.' },
  },
}

export const showcase = {
  heading: { en: 'One page, read in five minutes', ar: 'صفحة واحدة تقرؤها في خمس دقائق' },
  text: {
    en: 'Every report opens with one page: what we found, what to do, and how sure we are. The detail and every chart follow behind it.',
    ar: 'يبدأ كل تقرير بصفحة واحدة: ما وجدناه، وماذا تفعل، ومدى ثقتنا. والتفاصيل وكل الرسوم البيانية تأتي بعدها.',
  },
  langs: [
    { id: 'en', label: 'English' },
    { id: 'ar', label: 'العربية' },
  ] as const,
  langNote: { en: 'Your report, in the language you read best.', ar: 'تقريرك باللغة التي تفضّلها.' },
  sample: { en: 'See how a job runs', ar: 'شاهد مراحل العمل' },
}

export const steps = {
  heading: { en: 'From files to answers', ar: 'من الملفات إلى الإجابات' },
  items: [
    { time: { en: '30 minutes', ar: '30 دقيقة' }, weight: 1, text: { en: 'First, a free call about your files and your question.', ar: 'أولًا، مكالمة مجانية عن ملفاتك وسؤالك.' } },
    { time: { en: 'Same day', ar: 'في اليوم نفسه' }, weight: 1.2, text: { en: 'Then you send them through an encrypted link.', ar: 'ثم ترسلها عبر رابط مشفّر.' } },
    { time: { en: 'About two weeks', ar: 'نحو أسبوعين' }, weight: 5, text: { en: 'Then tested models run and your analyst checks every number.', ar: 'ثم تعمل النماذج المختبرة ويراجع محللك كل رقم.' } },
    { time: { en: 'One call', ar: 'مكالمة واحدة' }, weight: 1.6, text: { en: 'Finally, your report and a call to walk through it.', ar: 'وأخيرًا، تقريرك ومكالمة لشرحه.' } },
  ],
}

export const cta = {
  heading: { en: ['Start with', 'one call'], ar: ['ابدأ', 'بمكالمة واحدة'] },
  text: {
    en: 'Tell us what you’d like to know. We reply within one working day, and the first call is free.',
    ar: 'أخبرنا بما تريد معرفته. نرد خلال يوم عمل واحد، والمكالمة الأولى مجانية.',
  },
  form: {
    title: { en: 'Book a free call', ar: 'احجز مكالمة مجانية' },
    company: { en: 'Company', ar: 'الشركة' },
    companyExample: { en: 'Nile Home Furnishings', ar: 'نايل للمفروشات' },
    need: { en: 'What would you like to know?', ar: 'ماذا تريد أن تعرف؟' },
    needExample: { en: 'Why profit fell while sales grew', ar: 'لماذا انخفض الربح رغم نمو المبيعات' },
    lang: { en: 'Report in', ar: 'لغة التقرير' },
    send: { en: 'Send by email', ar: 'أرسل بالبريد' },
    or: { en: 'or message us on WhatsApp', ar: 'أو راسلنا على واتساب' },
  },
}

export const footerCopy = {
  pages: { en: 'Pages', ar: 'الصفحات' },
  contact: { en: 'Contact', ar: 'تواصل' },
  place: { en: 'Cairo, Egypt · Sunday to Thursday, 9:00–18:00', ar: 'القاهرة، مصر · الأحد إلى الخميس، 9:00–18:00' },
}
