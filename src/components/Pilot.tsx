import { useState } from 'react'
import { Line } from '../charts/Charts'
import { CONTACT, type T } from '../content'
import { order } from '../fx'
import { useLang } from '../lang'
import { Arrow, Check, Close, contactIcons } from './Icons'

// The free pilot: one analysis at no cost while Clearline proves its work on real files.

type Offer = { id: string; name: T; who: T; send: T[]; get: T[]; first: T }

const OFFERS: Offer[] = [
  {
    id: 'leaks',
    name: { en: 'Find money leaking from your books', ar: 'اكتشف الأموال المتسربة من حساباتك' },
    who: { en: 'For businesses', ar: 'للشركات' },
    send: [
      { en: 'Ledger or accounts export', ar: 'تصدير الدفاتر أو الحسابات' },
      { en: 'Bank statements', ar: 'كشوف البنك' },
      { en: 'E-invoices from the tax portal', ar: 'الفواتير الإلكترونية من منظومة الضرائب' },
    ],
    get: [
      { en: 'Payments made twice, and unusual entries, each with its amount', ar: 'المدفوعات المكررة والقيود غير المعتادة، كل منها بمبلغه' },
      { en: 'Money in the bank that is missing from the books', ar: 'أموال في البنك غير مسجلة في الدفاتر' },
      { en: 'E-invoices that don’t match the books or the bank', ar: 'فواتير إلكترونية لا تطابق الدفاتر أو البنك' },
    ],
    first: { en: 'A typical first finding: one supplier paid twice for the same invoice.', ar: 'نتيجة أولى معتادة: مورد واحد دُفع له مرتين عن الفاتورة نفسها.' },
  },
  {
    id: 'quarter',
    name: { en: 'Know the next quarter', ar: 'اعرف ما ينتظرك في الربع القادم' },
    who: { en: 'For businesses', ar: 'للشركات' },
    send: [
      { en: '12 months or more of sales or e-invoices', ar: 'مبيعات أو فواتير إلكترونية لمدة 12 شهرًا أو أكثر' },
      { en: 'Bank statements', ar: 'كشوف البنك' },
      { en: 'Unpaid invoices, if you track them', ar: 'الفواتير غير المحصّلة، إن كنت تتابعها' },
    ],
    get: [
      { en: 'Expected sales month by month, with a likely range', ar: 'المبيعات المتوقعة شهرًا بشهر، مع نطاق مرجّح' },
      { en: 'The week cash runs short, if it does', ar: 'الأسبوع الذي تنقص فيه السيولة، إن حدث' },
      { en: 'What to order, and when', ar: 'ماذا تطلب، ومتى' },
    ],
    first: { en: 'A typical first finding: cash runs short in week 9, three weeks before the busy season pays.', ar: 'نتيجة أولى معتادة: تنقص السيولة في الأسبوع 9، قبل أن يدرّ الموسم أرباحه بثلاثة أسابيع.' },
  },
  {
    id: 'customers',
    name: { en: 'Understand your customers', ar: 'افهم عملاءك' },
    who: { en: 'For businesses', ar: 'للشركات' },
    send: [{ en: 'A sales list with customer names or phone numbers', ar: 'قائمة مبيعات بأسماء العملاء أو أرقام هواتفهم' }],
    get: [
      { en: 'Your best, loyal and at-risk customers, by name', ar: 'أفضل عملائك والمخلصون منهم والمعرّضون للفقد، بالاسم' },
      { en: 'Who is about to stop buying', ar: 'من على وشك التوقف عن الشراء' },
      { en: 'What each group is worth a year', ar: 'كم تساوي كل مجموعة سنويًا' },
    ],
    first: { en: 'A typical first finding: a fifth of customers bring over half the sales, and some of them have gone quiet.', ar: 'نتيجة أولى معتادة: خُمس العملاء يجلبون أكثر من نصف المبيعات، وبعضهم توقف عن الشراء.' },
  },
  {
    id: 'study',
    name: { en: 'Analyse a study, survey or programme', ar: 'حلّل دراسة أو استبيانًا أو برنامجًا' },
    who: { en: 'For researchers, NGOs, clinics and schools', ar: 'للباحثين والمنظمات والعيادات والمدارس' },
    send: [
      { en: 'Your data table, as Excel or CSV', ar: 'جدول بياناتك بصيغة Excel أو CSV' },
      { en: 'The question you need answered', ar: 'السؤال الذي تريد إجابته' },
    ],
    get: [
      { en: 'The right tests for your question, with effect sizes', ar: 'الاختبارات المناسبة لسؤالك، مع حجم الأثر' },
      { en: 'Findings in plain words, in Arabic or English', ar: 'النتائج بكلمات واضحة، بالعربية أو الإنجليزية' },
      { en: 'A methods paragraph you can use in your report or thesis', ar: 'فقرة منهجية يمكنك استخدامها في تقريرك أو رسالتك' },
    ],
    first: { en: 'A typical first finding: the programme raised income by EGP 250 a month against the comparison villages.', ar: 'نتيجة أولى معتادة: رفع البرنامج الدخل 250 جنيهًا شهريًا مقارنة بقرى المقارنة.' },
  },
]

const NOT_SURE: T = { en: 'Not sure yet', ar: 'لست متأكدًا بعد' }

// ---------- First screen ----------

function ReportPreview() {
  const { t } = useLang()
  const rows: { text: T; value: string; tone: 'bad' | 'main' }[] = [
    { text: { en: 'Supplier paid twice', ar: 'مورد دُفع له مرتين' }, value: 'EGP 48,200', tone: 'bad' },
    { text: { en: 'Cash runs short', ar: 'عجز في السيولة' }, value: t({ en: 'Week 9', ar: 'الأسبوع 9' }), tone: 'bad' },
    { text: { en: 'Six products bring', ar: 'ستة منتجات تجلب' }, value: t({ en: '61% of profit', ar: '61% من الربح' }), tone: 'main' },
  ]
  return (
    <figure className="pl-preview card" data-reveal style={order(3)}>
      <figcaption className="pl-preview-head">
        <b>{t({ en: 'What a pilot report looks like', ar: 'كيف يبدو تقرير التجربة' })}</b>
        <span>{t({ en: 'Example with made-up figures', ar: 'مثال بأرقام افتراضية' })}</span>
      </figcaption>
      <ul className="pl-finds">
        {rows.map((r, n) => (
          <li key={n} className={`tone-${r.tone}`} style={order(n + 4)}>
            <span>{t(r.text)}</span>
            <b dir={r.value.startsWith('EGP') ? 'ltr' : undefined}>{r.value}</b>
          </li>
        ))}
      </ul>
      <div className="pl-chart">
        <Line
          label={t({ en: 'Monthly sales with a forecast and its likely range', ar: 'المبيعات الشهرية مع التوقع ونطاقه المرجح' })}
          series={[
            { values: [42, 45, 43, 48, 51, 49, 53, 56, 54, 58, 61, 60], area: true },
            { values: [60, 62, 64, 63, 66, 68, 67], start: 11, dashed: true },
          ]}
          band={{ start: 11, lo: [60, 60, 61, 59, 61, 62, 60], hi: [60, 64, 67, 67, 71, 74, 74] }}
          xLabels={[t({ en: 'Last 12 months', ar: 'آخر 12 شهرًا' }), t({ en: 'Next 6', ar: 'الستة القادمة' })]}
        />
      </div>
      <p className="pl-stamp">
        <Check /> {t({ en: 'Every number checked by your analyst', ar: 'كل رقم راجعه محللك' })}
      </p>
    </figure>
  )
}

function PilotHero() {
  const { t } = useLang()
  const wa = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(t({ en: 'Hello Clearline, I’d like to ask about the free pilot analysis.', ar: 'مرحبًا Clearline، أود السؤال عن التحليل التجريبي المجاني.' }))}`
  return (
    <section className="section pl-hero" id="top" aria-labelledby="pl-h">
      <div className="wrap pl-hero-grid">
        <div className="pl-hero-text">
          <h1 id="pl-h" className="pl-title" data-reveal style={order(0)}>
            {t({ en: 'Your first analysis is free', ar: 'تحليلك الأول مجاني' })}
          </h1>
          <p className="pl-lead" data-reveal style={order(1)}>
            {t({
              en: 'We’re opening Clearline to a small group of pilot clients. Send the files you already keep. We analyse them, a person checks every number, and you pay nothing.',
              ar: 'نفتح Clearline لمجموعة صغيرة من عملاء المرحلة التجريبية. أرسل الملفات الموجودة لديك، فنحللها ويراجع شخص كل رقم، ولا تدفع شيئًا.',
            })}
          </p>
          <div className="pl-cta" data-reveal style={order(2)}>
            <a className="btn btn-primary btn-lg" href="#apply">
              {t({ en: 'Apply for a free analysis', ar: 'اطلب تحليلك المجاني' })} <Arrow />
            </a>
            <a className="btn btn-quiet" href={wa} target="_blank" rel="noreferrer">
              {t({ en: 'Ask on WhatsApp', ar: 'اسأل عبر واتساب' })}
            </a>
          </div>
          <ul className="pl-terms" data-reveal style={order(3)}>
            <li>{t({ en: 'No card, no contract', ar: 'بلا بطاقة دفع ولا عقد' })}</li>
            <li>{t({ en: 'A confidentiality agreement comes first', ar: 'اتفاقية السرية أولًا' })}</li>
            <li>{t({ en: 'Files deleted 30 days after your report', ar: 'تُحذف الملفات بعد 30 يومًا من تقريرك' })}</li>
          </ul>
        </div>
        <ReportPreview />
      </div>
    </section>
  )
}

// ---------- Why free ----------

function WhyFree() {
  const { t } = useLang()
  const reasons: { head: T; text: T }[] = [
    {
      head: { en: 'Proof, not promises', ar: 'نتائج لا وعود' },
      text: { en: 'A pilot gives us results we can show, with your permission and without your name.', ar: 'تمنحنا التجربة نتائج يمكن عرضها، بإذنك ودون ذكر اسمك.' },
    },
    {
      head: { en: 'Your feedback shapes the service', ar: 'رأيك يشكّل الخدمة' },
      text: { en: 'What you find useful decides what we improve and build next.', ar: 'ما تجده مفيدًا يحدد ما نطوّره ونبنيه بعد ذلك.' },
    },
    {
      head: { en: 'Full attention', ar: 'اهتمام كامل' },
      text: { en: 'We take a small number of pilot clients at a time, so every report gets a careful second look.', ar: 'نقبل عددًا صغيرًا من العملاء في كل مرة، فيحظى كل تقرير بمراجعة ثانية دقيقة.' },
    },
  ]
  return (
    <section className="section pl-why" aria-labelledby="pl-why-h">
      <div className="wrap pl-why-grid">
        <div>
          <h2 id="pl-why-h" data-reveal>
            {t({ en: 'Why free, and why now', ar: 'لماذا مجانًا، ولماذا الآن' })}
          </h2>
          <p className="pl-statement" data-reveal style={order(1)}>
            {t({
              en: 'We’re new. Before we charge anyone, we want to prove the work on real files, with real people telling us what helped.',
              ar: 'نحن جدد. وقبل أن نتقاضى أي مقابل، نريد أن نثبت عملنا على ملفات حقيقية، مع أشخاص حقيقيين يخبروننا بما أفادهم.',
            })}
          </p>
        </div>
        <ul className="pl-reasons">
          {reasons.map((r, n) => (
            <li key={n} data-reveal style={order(n + 1)}>
              <b>{t(r.head)}</b>
              <span>{t(r.text)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ---------- Choose one ----------

function Choose({ pick, setPick }: { pick: string; setPick: (id: string) => void }) {
  const { t } = useLang()
  const cur = OFFERS.find((o) => o.id === pick) ?? OFFERS[0]
  return (
    <section className="section pl-choose" id="choose" aria-labelledby="pl-choose-h">
      <div className="wrap">
        <header className="sec-head wide">
          <h2 id="pl-choose-h" data-reveal>
            {t({ en: 'Choose one analysis', ar: 'اختر تحليلًا واحدًا' })}
          </h2>
          <p className="sec-lead" data-reveal style={order(1)}>
            {t({ en: 'Pick the question that matters most to you right now. One free analysis per client, ready about a week after your files arrive.', ar: 'اختر السؤال الأهم لك الآن. تحليل مجاني واحد لكل عميل، يكون جاهزًا بعد نحو أسبوع من وصول ملفاتك.' })}
          </p>
        </header>
        <div className="pl-offers" data-reveal>
          <div className="pl-offer-list" role="tablist" aria-orientation="vertical" aria-label={t({ en: 'Analyses', ar: 'التحليلات' })}>
            {OFFERS.map((o) => (
              <button key={o.id} type="button" role="tab" id={`tab-${o.id}`} aria-controls="pl-offer" aria-selected={o.id === cur.id} className="pl-offer-tab" onClick={() => setPick(o.id)}>
                <b>{t(o.name)}</b>
                <span>{t(o.who)}</span>
              </button>
            ))}
          </div>
          <article className="pl-offer card" id="pl-offer" role="tabpanel" aria-labelledby={`tab-${cur.id}`} key={cur.id}>
            <h3>{t(cur.name)}</h3>
            <div className="pl-offer-cols">
              <div>
                <h4>{t({ en: 'You send', ar: 'ترسل' })}</h4>
                <ul>
                  {cur.send.map((x) => (
                    <li key={x.en}>{t(x)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>{t({ en: 'You get', ar: 'تحصل على' })}</h4>
                <ul className="pl-get">
                  {cur.get.map((x) => (
                    <li key={x.en}>
                      <Check /> {t(x)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="pl-first">{t(cur.first)}</p>
            <a className="btn btn-primary" href="#apply">
              {t({ en: 'Apply for this one', ar: 'اطلب هذا التحليل' })} <Arrow />
            </a>
          </article>
        </div>
      </div>
    </section>
  )
}

// ---------- How it works ----------

function HowItWorks() {
  const { t } = useLang()
  const stops: { when: T; text: T }[] = [
    { when: { en: 'Today', ar: 'اليوم' }, text: { en: 'Apply in two minutes. We reply within one working day.', ar: 'قدّم طلبك في دقيقتين، ونرد خلال يوم عمل واحد.' } },
    { when: { en: 'Before any file', ar: 'قبل أي ملف' }, text: { en: 'We sign a confidentiality agreement and send you an encrypted upload link that expires.', ar: 'نوقّع اتفاقية سرية ونرسل لك رابط رفع مشفّرًا تنتهي صلاحيته.' } },
    { when: { en: 'Within a week', ar: 'خلال أسبوع' }, text: { en: 'We analyse your files. Your analyst checks every number before you see it.', ar: 'نحلل ملفاتك، ويراجع محللك كل رقم قبل أن تراه.' } },
    { when: { en: 'After the report', ar: 'بعد التقرير' }, text: { en: 'A 30-minute call to walk you through it, in Arabic or English.', ar: 'مكالمة مدتها 30 دقيقة نشرح فيها التقرير، بالعربية أو الإنجليزية.' } },
  ]
  return (
    <section className="section pl-how" aria-labelledby="pl-how-h">
      <div className="wrap">
        <h2 id="pl-how-h" className="pl-h2" data-reveal>
          {t({ en: 'How the pilot works', ar: 'كيف تسير التجربة' })}
        </h2>
        <ol className="pl-line">
          {stops.map((s, n) => (
            <li key={n} data-reveal style={order(n)}>
              <span className="pl-dot" aria-hidden="true" />
              <b>{t(s.when)}</b>
              <span>{t(s.text)}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// ---------- In return ----------

function InReturn() {
  const { t } = useLang()
  const ask: T[] = [
    { en: 'A 20-minute feedback call after your report', ar: 'مكالمة 20 دقيقة لرأيك بعد التقرير' },
    { en: 'If you’re happy, permission to quote you without your name or company', ar: 'إن كنت راضيًا، إذنك باقتباس رأيك دون ذكر اسمك أو شركتك' },
  ]
  const never: T[] = [
    { en: 'No payment details', ar: 'لا بيانات دفع' },
    { en: 'No contract or automatic subscription', ar: 'لا عقد ولا اشتراك تلقائي' },
    { en: 'No sharing of your data, ever', ar: 'لا مشاركة لبياناتك، أبدًا' },
  ]
  return (
    <section className="section pl-return" aria-labelledby="pl-return-h">
      <div className="wrap pl-return-grid">
        <div>
          <h2 id="pl-return-h" data-reveal>
            {t({ en: 'What we ask in return', ar: 'ما نطلبه في المقابل' })}
          </h2>
          <p className="sec-lead" data-reveal style={order(1)}>
            {t({ en: 'After the pilot, regular pricing applies only if you choose to continue.', ar: 'بعد التجربة، تُطبَّق الأسعار المعتادة فقط إن اخترت الاستمرار.' })}
          </p>
        </div>
        <div className="pl-two" data-reveal style={order(2)}>
          <div className="pl-ask card">
            <h3>{t({ en: 'We ask for', ar: 'نطلب' })}</h3>
            <ul>
              {ask.map((x) => (
                <li key={x.en}>
                  <Check /> {t(x)}
                </li>
              ))}
            </ul>
            <p>{t({ en: 'That’s all.', ar: 'هذا كل شيء.' })}</p>
          </div>
          <div className="pl-never card">
            <h3>{t({ en: 'We never ask for', ar: 'لا نطلب أبدًا' })}</h3>
            <ul>
              {never.map((x) => (
                <li key={x.en}>
                  <Close /> {t(x)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- Questions ----------

function PilotFaq() {
  const { t } = useLang()
  const qs: { q: T; a: T }[] = [
    { q: { en: 'Is it really free?', ar: 'هل هو مجاني فعلًا؟' }, a: { en: 'Yes. The analysis, the report and the call cost nothing, and there is nothing to cancel afterwards.', ar: 'نعم. التحليل والتقرير والمكالمة بلا مقابل، ولا يوجد ما يلزم إلغاؤه بعد ذلك.' } },
    { q: { en: 'Who can apply?', ar: 'من يمكنه التقدم؟' }, a: { en: 'Small and medium businesses in Egypt, and researchers, students, NGOs, clinics and schools working in Arabic or English.', ar: 'الشركات الصغيرة والمتوسطة في مصر، والباحثون والطلاب والمنظمات والعيادات والمدارس التي تعمل بالعربية أو الإنجليزية.' } },
    { q: { en: 'What if my files are messy?', ar: 'ماذا لو كانت ملفاتي غير منظمة؟' }, a: { en: 'That’s normal. Cleaning and matching them is part of the work, and the report lists what was fixed.', ar: 'هذا طبيعي. تنظيفها ومطابقتها جزء من العمل، والتقرير يوضح ما تم إصلاحه.' } },
    { q: { en: 'Are my files safe?', ar: 'هل ملفاتي في أمان؟' }, a: { en: 'They are encrypted on arrival, opened only by your analyst, never shared, and deleted 30 days after your report.', ar: 'تُشفَّر عند وصولها، ولا يفتحها إلا محللك، ولا تُشارك أبدًا، وتُحذف بعد 30 يومًا من تقريرك.' } },
    { q: { en: 'Why only one analysis?', ar: 'لماذا تحليل واحد فقط؟' }, a: { en: 'So we can give each pilot client a full report and a careful review. If it helps, more can follow.', ar: 'حتى نمنح كل عميل تقريرًا كاملًا ومراجعة دقيقة. وإن أفادك، يمكن أن يتبعه المزيد.' } },
    { q: { en: 'How long is the pilot open?', ar: 'إلى متى تستمر التجربة؟' }, a: { en: 'While we have places. We take a small number at a time and reply to every application.', ar: 'ما دامت هناك أماكن. نقبل عددًا صغيرًا في كل مرة ونرد على كل طلب.' } },
  ]
  return (
    <section className="section pl-faq" aria-labelledby="pl-faq-h">
      <div className="wrap">
        <h2 id="pl-faq-h" className="pl-h2" data-reveal>
          {t({ en: 'Questions about the pilot', ar: 'أسئلة عن التجربة' })}
        </h2>
        <dl className="pl-qa">
          {qs.map((x, n) => (
            <div key={n} data-reveal style={order(n % 2)}>
              <dt>{t(x.q)}</dt>
              <dd>{t(x.a)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

// ---------- Apply: the form writes the message as you fill it in ----------

function Apply({ pick, setPick }: { pick: string; setPick: (id: string) => void }) {
  const { t, lang } = useLang()
  const [name, setName] = useState('')
  const [org, setOrg] = useState('')
  const [files, setFiles] = useState<string[]>([])
  const [note, setNote] = useState('')
  const cur = OFFERS.find((o) => o.id === pick) ?? OFFERS[0]
  const toggle = (f: string) => setFiles(files.includes(f) ? files.filter((x) => x !== f) : [...files, f])
  const choose = (id: string) => {
    setPick(id)
    setFiles([])
  }
  const ar = lang === 'ar'
  const lines: (string | false)[] = [
    ar ? 'مرحبًا Clearline،' : 'Hello Clearline,',
    ' ',
    ar ? `أود التقدم للتحليل المجاني: ${t(cur.name)}.` : `I’d like to apply for the free pilot analysis: ${t(cur.name)}.`,
    name && (ar ? `الاسم: ${name}` : `Name: ${name}`),
    org && (ar ? `الشركة أو المؤسسة: ${org}` : `Company or organisation: ${org}`),
    files.length ? (ar ? `ما يمكنني إرساله: ${files.join('، ')}` : `What I can send: ${files.join(', ')}`) : '',
    note && (ar ? `ملاحظات: ${note}` : `Notes: ${note}`),
  ]
  const body = lines
    .filter((x): x is string => typeof x === 'string' && x !== '')
    .join('\n')
  const subject = t({ en: 'Free pilot analysis', ar: 'طلب التحليل التجريبي المجاني' }) + (org ? ` · ${org}` : '')
  const mail = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  const wa = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(body)}`
  const ready = name.trim().length > 1 && org.trim().length > 1
  return (
    <section className="section pl-apply" id="apply" aria-labelledby="pl-apply-h">
      <div className="wrap">
        <header className="sec-head wide">
          <h2 id="pl-apply-h" data-reveal>
            {t({ en: 'Apply for your free analysis', ar: 'اطلب تحليلك المجاني' })}
          </h2>
          <p className="sec-lead" data-reveal style={order(1)}>
            {t({ en: 'Fill this in and send it by email or WhatsApp. We reply within one working day, Sunday to Thursday.', ar: 'املأ هذه البيانات وأرسلها بالبريد أو واتساب. نرد خلال يوم عمل واحد، من الأحد إلى الخميس.' })}
          </p>
        </header>
        <div className="pl-apply-grid" data-reveal>
          <form className="pl-form card" onSubmit={(e) => e.preventDefault()}>
            <div className="pl-row">
              <label className="pl-field">
                <span>{t({ en: 'Your name', ar: 'اسمك' })}</span>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
              </label>
              <label className="pl-field">
                <span>{t({ en: 'Company or organisation', ar: 'الشركة أو المؤسسة' })}</span>
                <input value={org} onChange={(e) => setOrg(e.target.value)} autoComplete="organization" required />
              </label>
            </div>
            <fieldset className="pl-field">
              <legend>{t({ en: 'Which analysis', ar: 'أي تحليل' })}</legend>
              <div className="pl-choices">
                {OFFERS.map((o) => (
                  <label key={o.id} className={`pl-choice${o.id === cur.id ? ' on' : ''}`}>
                    <input type="radio" name="offer" checked={o.id === cur.id} onChange={() => choose(o.id)} />
                    {t(o.name)}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="pl-field">
              <legend>{t({ en: 'What you can send', ar: 'ما يمكنك إرساله' })}</legend>
              <div className="pl-files">
                {[...cur.send.map((x) => t(x)), t(NOT_SURE)].map((f) => (
                  <label key={f} className={`pl-file${files.includes(f) ? ' on' : ''}`}>
                    <input type="checkbox" checked={files.includes(f)} onChange={() => toggle(f)} />
                    <span className="box" aria-hidden="true">
                      <Check />
                    </span>
                    {f}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="pl-field">
              <span>{t({ en: 'Anything we should know (optional)', ar: 'أي شيء يجب أن نعرفه (اختياري)' })}</span>
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t({ en: 'For example: we use Odoo, and the question is why profit fell this year.', ar: 'مثال: نستخدم أودو، والسؤال هو لماذا انخفض الربح هذا العام.' })} />
            </label>
          </form>
          <aside className="pl-message card" aria-live="polite">
            <h3>{t({ en: 'Your message', ar: 'رسالتك' })}</h3>
            <pre className="pl-body">{body}</pre>
            <div className="pl-send">
              <a className={`btn btn-primary${ready ? '' : ' is-off'}`} href={ready ? mail : undefined} aria-disabled={!ready}>
                {contactIcons.email} {t({ en: 'Send by email', ar: 'أرسل بالبريد' })}
              </a>
              <a className={`btn btn-quiet${ready ? '' : ' is-off'}`} href={ready ? wa : undefined} target="_blank" rel="noreferrer" aria-disabled={!ready}>
                {contactIcons.whatsapp} {t({ en: 'Send on WhatsApp', ar: 'أرسل عبر واتساب' })}
              </a>
            </div>
            {!ready && <p className="pl-hint">{t({ en: 'Add your name and company to send.', ar: 'أضف اسمك وشركتك للإرسال.' })}</p>}
            <noscript>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </noscript>
          </aside>
        </div>
      </div>
    </section>
  )
}

export function Pilot() {
  const [pick, setPick] = useState(OFFERS[0].id)
  return (
    <>
      <PilotHero />
      <WhyFree />
      <Choose pick={pick} setPick={setPick} />
      <HowItWorks />
      <InReturn />
      <PilotFaq />
      <Apply pick={pick} setPick={setPick} />
    </>
  )
}
