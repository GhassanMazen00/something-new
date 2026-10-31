// The whole site on one page, after the first screen: what we do, the services, a sample report, how files are
// kept safe, how a job runs, questions, and the first step.

import { useEffect, useState, type CSSProperties } from 'react'
import { about, CONTACT, checker, departments, faq, privacy, process, report, servicesSection, type CheckerService, type Lang, type Service } from '../content'
import { openContact } from '../contactEvent'
import { useLang } from '../lang'
import { cta, showcase, steps, ui } from './copy'

const i = (n: number) => ({ '--i': n }) as CSSProperties

// Picking a question in "What we do" opens that department in the services list.
const DEPT_EVENT = 'clearline:dept'

export function Confidence({ level, lang }: { level: string; lang?: Lang }) {
  const { lang: page } = useLang()
  const l = (['high', 'medium', 'low', 'none'].includes(level) ? level : 'none') as keyof typeof process.levels
  const n = { high: 3, medium: 2, low: 1, none: 0 }[l]
  return (
    <span className={`conf conf-${l}`}>
      <span className="pips" aria-hidden="true">
        {[1, 2, 3].map((k) => (
          <i key={k} className={k <= n ? 'on' : undefined} />
        ))}
      </span>
      {process.levels[l][lang ?? page]}
    </span>
  )
}

function SectionHead({ id, title, lead }: { id: string; title: string; lead?: string }) {
  return (
    <div className="sec-head">
      <h2 id={id} data-reveal>
        {title}
      </h2>
      {lead && (
        <p data-reveal style={i(1)}>
          {lead}
        </p>
      )}
    </div>
  )
}

// ---------- What we do ----------

function About() {
  const { t } = useLang()
  const pick = (dept: string) => window.dispatchEvent(new CustomEvent(DEPT_EVENT, { detail: dept }))
  return (
    <section className="about" id="about" aria-labelledby="about-h">
      <SectionHead id="about-h" title={t({ en: 'Files in, clear decisions out', ar: 'ملفات تدخل، وقرارات واضحة تخرج' })} lead={t(about.text)} />
      <ol className="three">
        {about.steps.map((s, k) => (
          <li key={k} style={i(k)} data-reveal>
            <h3>{t(s.title)}</h3>
            <p>{t(s.text)}</p>
          </li>
        ))}
      </ol>
      <div className="asks">
        <h3 data-reveal>{t(about.asksTitle)}</h3>
        <ul>
          {about.asks.map((a, k) => (
            <li key={k} style={i(k)} data-reveal>
              <a href="#services" onClick={() => pick(a.dept)}>
                <span>{t(a.q)}</span>
                <small>{t(departments.find((d) => d.id === a.dept)?.name ?? { en: '', ar: '' })}</small>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ---------- Services ----------

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
    <div className="checker">
      <div className="check-text">
        <h3 data-reveal>{t({ en: 'What can we do with your files?', ar: 'ماذا نفعل بملفاتك؟' })}</h3>
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
    </div>
  )
}

function ServiceRow({ s, k }: { s: Service; k: number }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  return (
    <li style={i(k)}>
      <details onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
        <summary>
          <span className="svc-name">{t(s.name)}</span>
          <span className="svc-get">{t(s.get)}</span>
        </summary>
        {open && (
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
        )}
      </details>
    </li>
  )
}

function Services() {
  const { t, lang } = useLang()
  const [dept, setDept] = useState(departments[0].id)
  useEffect(() => {
    const on = (e: Event) => setDept((e as CustomEvent<string>).detail)
    window.addEventListener(DEPT_EVENT, on)
    return () => window.removeEventListener(DEPT_EVENT, on)
  }, [])
  const d = departments.find((x) => x.id === dept)!
  return (
    <section className="services" id="services" aria-labelledby="svc-h">
      <SectionHead id="svc-h" title={servicesSection.heading[lang].join(' ')} lead={t(servicesSection.intro)} />
      <div className="dept-tabs" role="tablist" aria-label={t({ en: 'Departments', ar: 'الأقسام' })}>
        {departments.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={x.id === dept} onClick={() => setDept(x.id)}>
            {t(x.name)} <small>{x.services.length}</small>
          </button>
        ))}
      </div>
      <ul className="svc-list" key={dept} role="tabpanel" aria-label={t(d.name)}>
        {d.services.map((s, k) => (
          <ServiceRow key={k} s={s} k={k} />
        ))}
      </ul>
      <Checker />
    </section>
  )
}

// ---------- A sample report ----------

export function ReportPage({ lang }: { lang: Lang }) {
  return (
    <div className="report" data-ui lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="report-top">
        <b>{report.title[lang]}</b>
        <span>{report.period[lang]}</span>
      </div>
      <ol>
        {report.items.map((it, k) => (
          <li key={k} style={i(k)}>
            <p className="r-find">
              <span>{report.findingLabel[lang]}</span>
              {it.finding[lang]}
            </p>
            <p className="r-act">
              <span>{report.actionLabel[lang]}</span>
              {it.action[lang]}
            </p>
            <Confidence level={it.level} lang={lang} />
          </li>
        ))}
      </ol>
      <p className="report-foot">{report.footer[lang]}</p>
    </div>
  )
}

function Report() {
  const { t, lang } = useLang()
  const [rl, setRl] = useState<Lang>(lang)
  return (
    <section className="showcase" id="report" aria-labelledby="show-h">
      <div className="plate" data-reveal>
        <ReportPage lang={rl} key={rl} />
      </div>
      <div className="show-text">
        <h2 id="show-h" data-reveal>
          {t(showcase.heading)}
        </h2>
        <p data-reveal style={i(1)}>
          {t(showcase.text)}
        </p>
        <div className="seg" role="radiogroup" aria-label={t(showcase.langNote)}>
          {showcase.langs.map((l) => (
            <button key={l.id} type="button" role="radio" aria-checked={rl === l.id} lang={l.id} onClick={() => setRl(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
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

// ---------- Security ----------

function Security() {
  const { t, lang } = useLang()
  return (
    <section className="security" id="security" aria-labelledby="sec-h">
      <SectionHead id="sec-h" title={privacy.heading[lang].join(' ')} lead={t(privacy.lead)} />
      <div className="sec-body">
        <div className="panel mini" data-ui data-reveal>
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
        <table className="specs-table" data-reveal style={i(1)}>
          <caption className="sr-only">{t(privacy.specTitle)}</caption>
          <tbody>
            {privacy.specs.map((s) => (
              <tr key={t(s.k)}>
                <th scope="row">{t(s.k)}</th>
                <td>{t(s.v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">{t(privacy.siteProof)}</p>
    </section>
  )
}

// ---------- How we work ----------

function Process() {
  const { t } = useLang()
  return (
    <section className="process" id="process" aria-labelledby="proc-h">
      <SectionHead id="proc-h" title={t(steps.heading)} />
      <ol className="track" data-ui>
        {steps.items.map((s, k) => (
          <li key={k} style={{ ...i(k), flexGrow: s.weight }} data-reveal>
            <span className="track-bar" />
            <b>{t(s.time)}</b>
            <p>{t(s.text)}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

// ---------- Questions ----------

function Faq() {
  const { t } = useLang()
  const [open, setOpen] = useState(0)
  return (
    <section className="faq" id="faq" aria-labelledby="faq-h">
      <SectionHead id="faq-h" title={t(faq.heading)} />
      <div className="qa">
        {faq.items.map((q, k) => (
          <div key={k} className={open === k ? 'is-open' : undefined} style={i(k)} data-reveal>
            <h3>
              <button type="button" aria-expanded={open === k} aria-controls={`faq-${k}`} onClick={() => setOpen(open === k ? -1 : k)}>
                {t(q.q)}
                <span className="plus" aria-hidden="true" />
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

// ---------- The first step ----------

function Cta() {
  const { t, lang } = useLang()
  const f = cta.form
  const [company, setCompany] = useState('')
  const [need, setNeed] = useState('')
  const [rl, setRl] = useState<Lang>(lang)
  const body =
    `${t(f.company)}: ${company || t(f.companyExample)}\n` + `${t(f.need)} ${need || t(f.needExample)}\n` + `${t(f.lang)}: ${rl === 'ar' ? 'العربية' : 'English'}\n`
  const mail = `mailto:${CONTACT.email}?subject=${encodeURIComponent(t(f.title))}&body=${encodeURIComponent(body)}`
  return (
    <section className="cta" id="contact" aria-labelledby="cta-h">
      <div className="cta-text">
        <h2 id="cta-h" data-reveal>
          {cta.heading[lang].map((l) => (
            <span key={l}>{l}</span>
          ))}
        </h2>
        <p data-reveal style={i(1)}>
          {t(cta.text)}
        </p>
      </div>
      <form className="book" data-ui onSubmit={(e) => (e.preventDefault(), (window.location.href = mail))} data-reveal style={i(2)}>
        <h3>{t(f.title)}</h3>
        <label>
          <span>{t(f.company)}</span>
          <input value={company} placeholder={t(f.companyExample)} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
        </label>
        <label>
          <span>{t(f.need)}</span>
          <input value={need} placeholder={t(f.needExample)} onChange={(e) => setNeed(e.target.value)} />
        </label>
        <fieldset>
          <legend>{t(f.lang)}</legend>
          <div className="seg seg-form">
            {showcase.langs.map((l) => (
              <button key={l.id} type="button" role="radio" aria-checked={rl === l.id} lang={l.id} onClick={() => setRl(l.id)}>
                {l.label}
              </button>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="btn btn-wide">
          {t(f.send)}
        </button>
        <a className="link small" href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer">
          {t(f.or)}
        </a>
        <button type="button" className="link small quiet" onClick={openContact}>
          {t(ui.contact)}
        </button>
      </form>
    </section>
  )
}

export function Home() {
  return (
    <>
      <About />
      <Services />
      <Report />
      <Security />
      <Process />
      <Faq />
      <Cta />
    </>
  )
}
