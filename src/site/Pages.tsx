// The three pages behind the home page: every service, how files are kept safe, and how a job runs.

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { about, checker, departments, faq, privacy, process, servicesSection, type CheckerService } from '../content'
import { useLang } from '../lang'
import { howPage, securityPage, servicesPage } from './copy'
import { Confidence, Cta, ReportPage } from './Home'

const i = (n: number) => ({ '--i': n }) as CSSProperties

function PageHead({ title, lead, children }: { title: string[]; lead: string; children: ReactNode }) {
  return (
    <section className="page-head">
      <div className="ph-text">
        <h1>
          {title.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </h1>
        <p className="lead">{lead}</p>
      </div>
      <div className="stage stage-small">{children}</div>
    </section>
  )
}

// Services per department, drawn as the bars of a small panel.
function DeptBars() {
  const { t } = useLang()
  const max = Math.max(...departments.map((d) => d.services.length))
  return (
    <div className="panel mini" data-ui>
      <p className="mini-title">{t({ en: 'Services by department', ar: 'الخدمات حسب القسم' })}</p>
      <ul className="groups">
        {departments.map((d, k) => (
          <li key={d.id} style={i(k)}>
            <a href={`#${d.id}`}>{t(d.name)}</a>
            <span className="bar-track">
              <i style={{ width: `${(d.services.length / max) * 100}%` }} />
            </span>
            <b className="num">{d.services.length}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Files as they arrive: each one locked the moment it lands.
function Arrivals() {
  const { t } = useLang()
  return (
    <div className="panel mini" data-ui>
      <p className="mini-title">{t({ en: 'Upload, Nile Home Furnishings', ar: 'الرفع، نايل للمفروشات' })}</p>
      <ul className="arrivals">
        {about.files.map((f, k) => (
          <li key={f} style={i(k)}>
            <span className={`ext ext-${f.split('.').pop()}`}>{f.split('.').pop()}</span>
            <span dir="ltr">{f}</span>
            <b>{t(about.encrypted)}</b>
          </li>
        ))}
      </ul>
      <p className="finding">{t({ en: 'Opened only by your named analyst. Deleted 30 days after your report.', ar: 'لا يفتحها إلا محللك المحدد. تُحذف بعد 30 يومًا من تقريرك.' })}</p>
    </div>
  )
}

// The receipt we send when your files arrive.
function Received() {
  const { t } = useLang()
  const r = process.received
  return (
    <div className="panel mini" data-ui>
      <p className="mini-title">{t(r.title)}</p>
      <dl className="receipt">
        {r.lines.map((l, k) => (
          <div key={k} style={i(k)}>
            <dt>{t(l.k)}</dt>
            <dd>{t(l.v)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// ---------- Services ----------

function Departments() {
  const { t, lang } = useLang()
  const fromHash = () => (departments.some((d) => d.id === location.hash.slice(1)) ? location.hash.slice(1) : departments[0].id)
  const [dept, setDept] = useState(fromHash)
  useEffect(() => {
    const on = () => setDept(fromHash())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const d = departments.find((x) => x.id === dept)!
  return (
    <section className="depts" aria-labelledby="dept-h">
      <h2 id="dept-h" className="sr-only">
        {t(d.name)}
      </h2>
      <div className="dept-tabs" role="tablist" aria-label={t({ en: 'Departments', ar: 'الأقسام' })}>
        {departments.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={x.id === dept}
            onClick={() => {
              setDept(x.id)
              history.replaceState(null, '', `#${x.id}`)
            }}
          >
            {t(x.name)} <small>{x.services.length}</small>
          </button>
        ))}
      </div>
      <ul className="svc-list" key={dept}>
        {d.services.map((s, k) => (
          <li key={k} style={i(k)}>
            <h3>{t(s.name)}</h3>
            <p className="svc-get">{t(s.get)}</p>
            <dl>
              <div>
                <dt>{t(servicesSection.labels.method)}</dt>
                <dd>{t(s.method)}</dd>
              </div>
              <div>
                <dt>{t(servicesSection.labels.data)}</dt>
                <dd>{t(s.data)}</dd>
              </div>
              <div>
                <dt>{t(servicesSection.labels.missing)}</dt>
                <dd>{t(s.missing)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      <p className="sr-only" aria-live="polite">
        {lang === 'ar' ? `${d.services.length} خدمات` : `${d.services.length} services`}
      </p>
    </section>
  )
}

function levelOf(s: CheckerService, have: Set<string>) {
  if (s.publicData) return 'high'
  const any = (ways: string[][] = []) => ways.some((w) => w.every((id) => have.has(id)))
  if (any(s.high)) return 'high'
  if (any(s.medium)) return 'medium'
  if (any(s.low)) return 'low'
  return 'none'
}

function Checker() {
  const { t } = useLang()
  const [have, setHave] = useState(() => new Set(['einv', 'bank']))
  const toggle = (id: string) => {
    const next = new Set(have)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setHave(next)
  }
  const rows = checker.services.map((s) => ({ s, l: levelOf(s, have) }))
  const ready = rows.filter((r) => r.l !== 'none').length
  return (
    <section className="checker" aria-labelledby="check-h">
      <div className="check-text">
        <h2 id="check-h" data-reveal>
          {t({ en: 'What can we do with your files?', ar: 'ماذا نفعل بملفاتك؟' })}
        </h2>
        <p data-reveal style={i(1)}>
          {t(checker.lead)}
        </p>
        <fieldset className="files">
          <legend>{t(checker.have)}</legend>
          {checker.items.map((f) => (
            <label key={f.id} className={have.has(f.id) ? 'is-on' : undefined}>
              <input type="checkbox" checked={have.has(f.id)} onChange={() => toggle(f.id)} />
              {t(f.label)}
            </label>
          ))}
        </fieldset>
      </div>
      <div className="check-out" data-ui>
        <p className="check-count" aria-live="polite">
          <b className="num">{ready}</b> {t(checker.ready)} {t(checker.outOf).replace('{total}', String(rows.length))}
        </p>
        <ul>
          {rows.map(({ s, l }, k) => (
            <li key={k} className={`lv-${l}`}>
              <span>{t(s.name)}</span>
              <Confidence level={l} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function WhatYouGet() {
  const { t, lang } = useLang()
  return (
    <section className="back" aria-labelledby="back-h">
      <div className="sample-page" data-reveal>
        <ReportPage lang={lang} />
      </div>
      <div className="back-text">
        <h2 id="back-h" data-reveal>
          {t({ en: 'What you get back', ar: 'ما تحصل عليه' })}
        </h2>
        <p data-reveal style={i(1)}>
          {t({
            en: 'Whichever services you choose, the results arrive as one report that opens with a single page: what we found, what to do, and how sure we are.',
            ar: 'أيًّا كانت الخدمات التي تختارها، تصلك النتائج في تقرير واحد يبدأ بصفحة واحدة: ما وجدناه، وماذا تفعل، ومدى ثقتنا.',
          })}
        </p>
        <a className="link" href="./how-it-works.html" data-reveal style={i(2)}>
          {t({ en: 'How a job runs', ar: 'كيف يسير العمل' })}
        </a>
      </div>
    </section>
  )
}

export function ServicesPage() {
  const { t, lang } = useLang()
  return (
    <>
      <PageHead title={servicesPage.title[lang]} lead={t(servicesPage.lead)}>
        <DeptBars />
      </PageHead>
      <Departments />
      <WhatYouGet />
      <Checker />
      <Cta />
    </>
  )
}

// ---------- Security ----------

function Journey() {
  const { t } = useLang()
  return (
    <section className="journey" aria-labelledby="jr-h">
      <h2 id="jr-h" data-reveal>
        {t(securityPage.journey)}
      </h2>
      <ol className="track track-5" data-ui>
        {privacy.journey.map((s, k) => (
          <li key={k} style={i(k)} data-reveal>
            <span className="seg-fill">
              <b>{t(s.title)}</b>
            </span>
            <p>{t(s.text)}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

// The note we send when your files are gone.
function DeletionNote() {
  const { t } = useLang()
  const rows = [
    [{ en: 'Client', ar: 'العميل' }, { en: 'Nile Home Furnishings', ar: 'نايل للمفروشات' }],
    [{ en: 'Files', ar: 'الملفات' }, { en: '3, and every copy we made', ar: '3، وكل نسخة صنعناها' }],
    [{ en: 'Encryption key', ar: 'مفتاح التشفير' }, { en: 'Destroyed', ar: 'تم إتلافه' }],
    [{ en: 'Deleted on', ar: 'تاريخ الحذف' }, { en: '14 March 2027', ar: '14 مارس 2027' }],
  ]
  return (
    <div className="panel mini letter" data-ui data-reveal style={i(2)}>
      <p className="mini-title">{t({ en: 'Deletion confirmed', ar: 'تأكيد الحذف' })}</p>
      <dl>
        {rows.map(([k, v]) => (
          <div key={k.en}>
            <dt>{t(k)}</dt>
            <dd>{t(v)}</dd>
          </div>
        ))}
      </dl>
      <p className="sign">{t({ en: 'Signed by your analyst. Example with made-up data.', ar: 'بتوقيع محللك. مثال ببيانات افتراضية.' })}</p>
    </div>
  )
}

function Specs() {
  const { t } = useLang()
  return (
    <section className="specs" aria-labelledby="spec-h">
      <h2 id="spec-h" data-reveal>
        {t(privacy.specTitle)}
      </h2>
      <DeletionNote />
      <table data-reveal style={i(1)}>
        <tbody>
          {privacy.specs.map((s) => (
            <tr key={t(s.k)}>
              <th scope="row">{t(s.k)}</th>
              <td>{t(s.v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function Rules() {
  const { t } = useLang()
  return (
    <section className="rules" aria-labelledby="rules-h">
      <h2 id="rules-h" data-reveal>
        {t(securityPage.rules)}
      </h2>
      <ul>
        {privacy.rules.map((r, k) => (
          <li key={k} style={i(k % 2)} data-reveal>
            <h3>{t(r.title)}</h3>
            <p>{t(r.text)}</p>
          </li>
        ))}
      </ul>
      <p className="note">{t(privacy.siteProof)}</p>
    </section>
  )
}

export function SecurityPage() {
  const { t, lang } = useLang()
  return (
    <>
      <PageHead title={securityPage.title[lang]} lead={t(privacy.lead)}>
        <Arrivals />
      </PageHead>
      <Journey />
      <Specs />
      <Rules />
      <Cta />
    </>
  )
}

// ---------- How we work ----------

function Plan() {
  const { t } = useLang()
  const p = process.plan
  return (
    <section className="plan" aria-labelledby="plan-h">
      <div className="plan-text">
        <h2 id="plan-h" data-reveal>
          {t(howPage.plan)}
        </h2>
        <p data-reveal style={i(1)}>
          {t(howPage.planText)}
        </p>
        <blockquote data-reveal style={i(2)}>
          {t(process.steps[0].call)}
        </blockquote>
      </div>
      <div className="plan-table" data-ui data-reveal style={i(1)}>
        <p className="plan-title">{t(p.title)}</p>
        <table>
          <thead>
            <tr>
              <th>{t(p.cols.service)}</th>
              <th>{t(p.cols.from)}</th>
              <th>{t(p.cols.confidence)}</th>
            </tr>
          </thead>
          <tbody>
            {p.rows.map((r) => (
              <tr key={t(r.service)}>
                <td>{t(r.service)}</td>
                <td>{t(r.from)}</td>
                <td>
                  <Confidence level={r.level} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Sample() {
  const { t, lang } = useLang()
  return (
    <section className="sample" aria-labelledby="sample-h">
      <div className="sample-page" data-reveal>
        <ReportPage lang={lang} />
      </div>
      <div className="sample-text">
        <h2 id="sample-h" data-reveal>
          {t(howPage.report)}
        </h2>
        <h3 data-reveal style={i(1)}>
          {t(howPage.levels)}
        </h3>
        <ul className="legend">
          {process.legend.rows.map((r, k) => (
            <li key={r.level} style={i(k + 2)} data-reveal>
              <Confidence level={r.level} />
              <span>{t(r.text)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const TAB_TOPICS = [
  { en: 'Data', ar: 'البيانات' },
  { en: 'Accuracy', ar: 'الدقة' },
  { en: 'Methods', ar: 'الطرق' },
  { en: 'Access', ar: 'الوصول' },
  { en: 'Role', ar: 'دورنا' },
  { en: 'Language', ar: 'اللغة' },
  { en: 'Price', ar: 'السعر' },
]

function Faq() {
  const { t } = useLang()
  const [open, setOpen] = useState(0)
  return (
    <section className="faq" aria-labelledby="faq-h">
      <h2 id="faq-h" data-reveal>
        {t(faq.heading)}
      </h2>
      <div className="drawer">
        {faq.items.map((q, k) => (
          <div key={k} className={`card c-${k % 3}${open === k ? ' is-open' : ''}`} style={i(k)}>
            <span className="tab" aria-hidden="true">
              {t(TAB_TOPICS[k])}
            </span>
            <h3>
              <button type="button" aria-expanded={open === k} aria-controls={`faq-${k}`} onClick={() => setOpen(open === k ? -1 : k)}>
                {t(q.q)}
              </button>
            </h3>
            <div id={`faq-${k}`} className="answer" hidden={open !== k}>
              <p>{t(q.a)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HowPage() {
  const { t, lang } = useLang()
  return (
    <>
      <PageHead title={howPage.title[lang]} lead={t(howPage.lead)}>
        <Received />
      </PageHead>
      <Plan />
      <Sample />
      <Faq />
      <Cta />
    </>
  )
}
