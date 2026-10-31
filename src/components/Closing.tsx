import { useEffect, useState, type ReactNode } from 'react'
import { CONTACT, contact, faq, footer, privacy, report, type T } from '../content'
import { order, reducedMotion } from '../fx'
import { useLang } from '../lang'
import { Check, Close, contactIcons, Lock } from './Icons'
import { Logo } from './Header'

// ---------- Questions: each answer comes with a small moving picture of it ----------

function StandIns() {
  const { t } = useLang()
  const rows: [T, T][] = [
    [{ en: 'Sales report', ar: 'تقرير المبيعات' }, { en: 'E-invoices', ar: 'الفواتير الإلكترونية' }],
    [{ en: 'Customer ID', ar: 'رقم العميل' }, { en: 'Phone number on invoices', ar: 'رقم الهاتف في الفواتير' }],
    [{ en: 'Market figures', ar: 'أرقام السوق' }, { en: 'CAPMAS and Central Bank data', ar: 'بيانات الجهاز المركزي والبنك المركزي' }],
  ]
  return (
    <div className="qv qv-swap">
      {rows.map(([from, to], n) => (
        <div key={n} className="swap-row" style={order(n)}>
          <span className="swap-from">
            <Close /> {t(from)}
          </span>
          <span className="swap-arrow" aria-hidden="true" />
          <span className="swap-to">
            <Check /> {t(to)}
          </span>
        </div>
      ))}
    </div>
  )
}

function Journey() {
  const { t } = useLang()
  return (
    <div className="qv qv-journey">
      <div className="jr-line" aria-hidden="true">
        <span className="jr-dot" />
      </div>
      <ol>
        {privacy.journey.map((s, n) => (
          <li key={n} style={order(n)}>
            <span className="jr-node">
              <Lock />
            </span>
            <b>{t(s.title)}</b>
          </li>
        ))}
      </ol>
    </div>
  )
}

const ACT = [42, 45, 43, 48, 51, 49, 53, 56, 54, 58, 61, 60]
const FC = [60, 62, 64, 63, 66, 68]
function Accuracy() {
  const { t } = useLang()
  const W = 420
  const H = 150
  const all = [...ACT, ...FC]
  const x = (i: number) => 6 + (i / (all.length - 1)) * (W - 12)
  const y = (v: number) => H - 10 - ((v - 36) / 38) * (H - 20)
  const line = (vals: number[], from: number) => vals.map((v, i) => `${i ? 'L' : 'M'}${x(i + from).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const s = ACT.length - 1
  const up = FC.map((v, i) => `${x(s + 1 + i)} ${y(v + 1.4 * (i + 1))}`)
  const lo = FC.map((v, i) => `${x(s + 1 + i)} ${y(v - 1.4 * (i + 1))}`).reverse()
  return (
    <div className="qv qv-chart">
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <path className="qc-band" d={`M${x(s)} ${y(ACT[s])} L${up.join(' L')} L${lo.join(' L')} Z`} />
        <path className="qc-line" d={line(ACT, 0)} pathLength={1} />
        <path className="qc-fc" d={`M${x(s)} ${y(ACT[s])} L` + line(FC, s + 1).slice(1)} pathLength={1} />
      </svg>
      <div className="qc-keys">
        <span className="k-a">{t({ en: 'Actual', ar: 'الفعلي' })}</span>
        <span className="k-f">{t({ en: 'Likely', ar: 'المرجّح' })}</span>
        <span className="k-b">{t({ en: 'Low to high', ar: 'من المنخفض للمرتفع' })}</span>
      </div>
      <p className="qv-note">{t({ en: 'Tested on your own past year: 6.4% average error.', ar: 'مختبرة على عامك الماضي: متوسط خطأ 6.4%.' })}</p>
    </div>
  )
}

function Contest() {
  const { t } = useLang()
  const rows = [
    { k: 'Ramadan regression', v: 6.4 },
    { k: 'ARIMA', v: 8.4 },
    { k: 'ETS', v: 9.1 },
    { k: 'Theta', v: 11.2 },
  ]
  return (
    <div className="qv qv-bars">
      <p className="qv-cap">{t({ en: 'Which method wins on your data (error on months it hadn’t seen)', ar: 'أي طريقة تفوز على بياناتك (الخطأ على أشهر لم ترها)' })}</p>
      {rows.map((r, n) => (
        <div key={r.k} className={`hb${n === 0 ? ' win' : ''}`} style={order(n)}>
          <span dir="ltr">{r.k}</span>
          <span className="hb-track">
            <i style={{ width: `${(r.v / 12) * 100}%` }} />
          </span>
          <b className="num">{r.v}%</b>
        </div>
      ))}
    </div>
  )
}

function Exports() {
  const { t } = useLang()
  const files = [
    ['xlsx', 'sales_2025.xlsx'],
    ['csv', 'einvoices.csv'],
    ['pdf', 'bank_statement.pdf'],
  ]
  return (
    <div className="qv qv-files">
      <div className="fl-files">
        {files.map(([ext, name], n) => (
          <span key={name} className="fl-file" style={order(n)} dir="ltr">
            <i className={`ext ext-${ext}`}>{ext}</i>
            {name}
          </span>
        ))}
      </div>
      <div className="fl-no">
        <Lock />
        <span>{t({ en: 'No logins, no passwords, no access to your systems', ar: 'لا حسابات ولا كلمات مرور ولا دخول إلى أنظمتك' })}</span>
      </div>
    </div>
  )
}

function Roles() {
  const { t } = useLang()
  const yes: T[] = [
    { en: 'Find errors and leaks', ar: 'اكتشاف الأخطاء والتسرب' },
    { en: 'Forecast and test decisions', ar: 'التوقع واختبار القرارات' },
    { en: 'Explain your numbers', ar: 'شرح أرقامك' },
  ]
  const no: T[] = [
    { en: 'Certify financial statements', ar: 'اعتماد القوائم المالية' },
    { en: 'Give investment advice', ar: 'تقديم استشارات استثمارية' },
  ]
  return (
    <div className="qv qv-roles">
      <ul className="r-yes">
        {yes.map((x, n) => (
          <li key={n} style={order(n)}>
            <Check /> {t(x)}
          </li>
        ))}
      </ul>
      <ul className="r-no">
        {no.map((x, n) => (
          <li key={n} style={order(n + 3)}>
            <Close /> {t(x)}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Languages() {
  const [l, setL] = useState<'en' | 'ar'>('en')
  useEffect(() => {
    if (reducedMotion()) return
    const id = window.setInterval(() => setL((v) => (v === 'en' ? 'ar' : 'en')), 2600)
    return () => window.clearInterval(id)
  }, [])
  const it = report.items[0]
  return (
    <div className="qv qv-lang">
      <div className="lang-page" key={l} lang={l} dir={l === 'ar' ? 'rtl' : 'ltr'}>
        <b>{report.title[l]}</b>
        <p>{it.finding[l]}</p>
        <p className="act">{it.action[l]}</p>
      </div>
      <div className="lang-pill" aria-hidden="true">
        <span className={l === 'en' ? 'on' : undefined}>English</span>
        <span className={l === 'ar' ? 'on' : undefined}>العربية</span>
      </div>
    </div>
  )
}

function Price() {
  const { t } = useLang()
  const steps: [T, number][] = [
    [{ en: '1 service', ar: 'خدمة واحدة' }, 34],
    [{ en: '3 services', ar: '3 خدمات' }, 62],
    [{ en: '6 services', ar: '6 خدمات' }, 92],
  ]
  return (
    <div className="qv qv-price">
      <div className="pr-bars">
        {steps.map(([k, h], n) => (
          <div key={n} className="pr-col" style={order(n)}>
            <span className="pr-bar" style={{ height: `${h}%` }} />
            <small>{t(k)}</small>
          </div>
        ))}
      </div>
      <ul className="pr-points">
        <li>
          <Check /> {t({ en: 'One fixed price per report', ar: 'سعر ثابت لكل تقرير' })}
        </li>
        <li>
          <Check /> {t({ en: 'Agreed after a free call', ar: 'نتفق عليه بعد مكالمة مجانية' })}
        </li>
        <li>
          <Close /> {t({ en: 'No hourly billing', ar: 'لا محاسبة بالساعة' })}
        </li>
      </ul>
    </div>
  )
}

const SAFE = {
  q: { en: 'Are my files safe with you?', ar: 'هل ملفاتي في أمان معكم؟' },
  a: {
    en: 'Yes. A confidentiality agreement comes first, files travel through an encrypted link that expires, only your named analyst can open them, and they are deleted within 30 days of your report.',
    ar: 'نعم. نبدأ باتفاقية سرية، وتنتقل الملفات عبر رابط مشفّر تنتهي صلاحيته، ولا يفتحها إلا محللك المحدد، وتُحذف خلال 30 يومًا من تقريرك.',
  },
}

// The questions in the order people ask them, each with its picture.
const QUESTIONS: { q: T; a: T; Vis: () => ReactNode }[] = [
  { ...faq.items[0], Vis: StandIns },
  { ...SAFE, Vis: Journey },
  { ...faq.items[1], Vis: Accuracy },
  { ...faq.items[2], Vis: Contest },
  { ...faq.items[3], Vis: Exports },
  { ...faq.items[4], Vis: Roles },
  { ...faq.items[5], Vis: Languages },
  { ...faq.items[6], Vis: Price },
]

export function Faq() {
  const { t } = useLang()
  const [open, setOpen] = useState(0)
  const cur = QUESTIONS[open]
  return (
    <section id="faq" className="section faq" aria-labelledby="faq-h">
      <div className="wrap">
        <header className="sec-head wide">
          <h2 id="faq-h" data-reveal style={order(1)}>
            {t({ en: 'Good questions.', ar: 'أسئلة في محلها.' })} <span className="accent">{t({ en: 'Clear answers.', ar: 'وإجابات واضحة.' })}</span>
          </h2>
        </header>
        <div className="faq-board" data-reveal>
          <div className="faq-qs" role="tablist" aria-orientation="vertical">
            {QUESTIONS.map((item, n) => (
              <button
                key={item.q.en}
                type="button"
                role="tab"
                id={`q-${n}`}
                aria-selected={open === n}
                aria-controls="faq-answer"
                className="faq-q"
                onClick={() => setOpen(n)}
              >
                {t(item.q)}
              </button>
            ))}
          </div>
          <div className="faq-a card" id="faq-answer" role="tabpanel" aria-labelledby={`q-${open}`} key={open}>
            <h3>{t(cur.q)}</h3>
            <p>{t(cur.a)}</p>
            <cur.Vis />
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- Contact: three ways ----------

export function Contact() {
  const { t } = useLang()
  const [slot, setSlot] = useState<'morning' | 'afternoon'>('morning')
  const slots: Record<typeof slot, T> = {
    morning: { en: 'Morning, 9–12', ar: 'صباحًا، 9–12' },
    afternoon: { en: 'Afternoon, 12–6', ar: 'بعد الظهر، 12–6' },
  }
  const callMail = `mailto:${CONTACT.email}?subject=${encodeURIComponent(t({ en: 'Book a free call', ar: 'حجز مكالمة مجانية' }))}&body=${encodeURIComponent(
    t({ en: 'Hello Clearline,\n\nWe’d like a free call.\nOur company: \nBest time: ', ar: 'مرحبًا Clearline،\n\nنريد مكالمة مجانية.\nشركتنا: \nأفضل وقت: ' }) + t(slots[slot]) + '\n',
  )}`
  const mail = `mailto:${CONTACT.email}?subject=${encodeURIComponent(t(contact.mailSubject))}&body=${encodeURIComponent(t(contact.mailBody))}`
  const wa = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(t({ en: 'Hello Clearline, I’d like to know more about your analysis.', ar: 'مرحبًا Clearline، أريد معرفة المزيد عن خدمات التحليل.' }))}`
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-h">
      <div className="wrap">
        <header className="sec-head wide">
          <h2 id="contact-h" data-reveal style={order(1)}>
            {t({ en: 'Talk to us.', ar: 'تحدث إلينا.' })} <span className="accent">{t({ en: 'Your way.', ar: 'بالطريقة التي تناسبك.' })}</span>
          </h2>
          <p className="sec-lead" data-reveal style={order(2)}>
            {t({ en: 'We reply within one working day. Sunday to Thursday, 9:00 to 18:00, Cairo time.', ar: 'نرد خلال يوم عمل واحد. من الأحد إلى الخميس، 9:00 إلى 18:00 بتوقيت القاهرة.' })}
          </p>
        </header>
        <div className="ways3">
          <div className="way card way-call" data-reveal style={order(0)}>
            <span className="way-ico">{contactIcons.phone}</span>
            <h3>{t({ en: 'Book a free call', ar: 'احجز مكالمة مجانية' })}</h3>
            <p>{t({ en: '30 minutes about your files and your question. No cost, no commitment.', ar: '30 دقيقة عن ملفاتك وسؤالك. بلا تكلفة ولا التزام.' })}</p>
            <div className="slots" role="radiogroup" aria-label={t({ en: 'Best time', ar: 'أفضل وقت' })}>
              {(Object.keys(slots) as (typeof slot)[]).map((k) => (
                <button key={k} type="button" role="radio" aria-checked={slot === k} onClick={() => setSlot(k)}>
                  {t(slots[k])}
                </button>
              ))}
            </div>
            <a className="btn btn-primary" href={callMail}>
              {t({ en: 'Request the call', ar: 'اطلب المكالمة' })}
            </a>
          </div>
          <div className="way card" data-reveal style={order(1)}>
            <span className="way-ico">{contactIcons.email}</span>
            <h3>{t({ en: 'Email us', ar: 'راسلنا بالبريد' })}</h3>
            <p>{t({ en: 'Describe the error you suspect or the decision you’re weighing.', ar: 'صف الخطأ الذي تشك فيه أو القرار الذي تفكر فيه.' })}</p>
            <b className="way-value" dir="ltr">
              {CONTACT.email.split('@')[0]}@<wbr />
              {CONTACT.email.split('@')[1]}
            </b>
            <a className="btn btn-ghost" href={mail}>
              {t({ en: 'Write an email', ar: 'اكتب رسالة' })}
            </a>
          </div>
          <div className="way card" data-reveal style={order(2)}>
            <span className="way-ico">{contactIcons.whatsapp}</span>
            <h3>{t({ en: 'WhatsApp', ar: 'واتساب' })}</h3>
            <p>{t({ en: 'A quick question? Message us. Never send your files here; we’ll share an encrypted link.', ar: 'سؤال سريع؟ راسلنا. لا ترسل ملفاتك هنا؛ سنرسل لك رابطًا مشفّرًا.' })}</p>
            <b className="way-value" dir="ltr">
              {CONTACT.whatsappShown}
            </b>
            <a className="btn btn-ghost" href={wa} target="_blank" rel="noopener">
              {t({ en: 'Open WhatsApp', ar: 'افتح واتساب' })}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- Footer: one short band ----------

export function Footer({ home = true }: { home?: boolean }) {
  const { t } = useLang()
  const base = home ? '' : './'
  const links: [string, T][] = [
    ['#about', { en: 'About', ar: 'من نحن' }],
    ['#services', { en: 'Services', ar: 'الخدمات' }],
    ['#checker', { en: 'Your files', ar: 'ملفاتك' }],
    ['#faq', { en: 'Questions', ar: 'أسئلة' }],
    ['#contact', { en: 'Contact', ar: 'تواصل' }],
  ]
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Logo href={home ? '#top' : './'} />
          <p>
            {t(footer.about)} · {t(footer.place)}
          </p>
        </div>
        <nav className="footer-links" aria-label={t(footer.navTitle)}>
          {links.map(([h, l]) => (
            <a key={h} href={base + h}>
              {t(l)}
            </a>
          ))}
        </nav>
      </div>
      <div className="wrap legal">
        <span>{t(footer.legal)}</span>
        <span>{t(footer.privacyText)}</span>
      </div>
    </footer>
  )
}
