// The home page after the first screen: what we find, the one-page report, how a job runs, three figures, the first step.

import { useState, type CSSProperties } from 'react'
import { CONTACT, process, report, type Lang } from '../content'
import { openContact } from '../contactEvent'
import { useLang } from '../lang'
import { cta, figures, finds, showcase, steps, ui } from './copy'

const i = (n: number) => ({ '--i': n }) as CSSProperties

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

function Finds() {
  const { t } = useLang()
  const [on, setOn] = useState<boolean[]>(() => finds.items.map((_, k) => k < 2))
  const flip = (k: number) => setOn(on.map((v, j) => (j === k ? !v : v)))
  return (
    <section className="finds" aria-labelledby="finds-h">
      <div className="sec-head">
        <h2 id="finds-h" data-reveal>
          {t(finds.heading)}
        </h2>
        <p data-reveal style={i(1)}>
          {t(finds.lead)}
        </p>
      </div>
      <ul>
        {finds.items.map((f, k) => (
          <li key={k} className={on[k] ? 'is-on' : undefined} style={i(k)} data-reveal>
            <div className="find-text">
              <p className="say">{t(f.say)}</p>
              <p className="then" aria-hidden={!on[k]}>
                {t(f.then)}{' '}
                <a href={`./services.html#${f.dept}`} tabIndex={on[k] ? 0 : -1}>
                  {t({ en: 'The services', ar: 'الخدمات' })}
                </a>
              </p>
            </div>
            <button type="button" className="switch" role="switch" aria-checked={on[k]} aria-label={t(f.say)} onClick={() => flip(k)} data-ui>
              <span />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

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

function Showcase() {
  const { t, lang } = useLang()
  const [rl, setRl] = useState<Lang>(lang)
  return (
    <section className="showcase" aria-labelledby="show-h">
      <div className="plate" data-reveal>
        <ReportPage lang={rl} key={rl} />
      </div>
      <div className="show-text">
        <div className="seg" role="radiogroup" aria-label={t(showcase.langNote)}>
          {showcase.langs.map((l) => (
            <button key={l.id} type="button" role="radio" aria-checked={rl === l.id} lang={l.id} onClick={() => setRl(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
        <div>
          <h2 id="show-h" data-reveal>
            {t(showcase.heading)}
          </h2>
          <p data-reveal style={i(1)}>
            {t(showcase.text)}
          </p>
        </div>
        <div className="cells">
          <a className="cell cell-ink" href="./how-it-works.html">
            {t(showcase.sample)}
          </a>
          <button type="button" className="cell" onClick={openContact}>
            {t(ui.book)}
          </button>
        </div>
      </div>
    </section>
  )
}

function Steps() {
  const { t } = useLang()
  return (
    <section className="steps" aria-labelledby="steps-h">
      <h2 id="steps-h" data-reveal>
        {t(steps.heading)}
      </h2>
      <ol className="track" data-ui>
        {steps.items.map((s, k) => (
          <li key={k} style={{ ...i(k), flexGrow: s.weight }} data-reveal>
            <span className="seg-fill">
              <b>{t(s.time)}</b>
            </span>
            <p>{t(s.text)}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Figures() {
  const { t } = useLang()
  return (
    <section className="figures" aria-labelledby="fig-h">
      {figures.items.map((f, k) => (
        <div key={k} className={`tile tile-${k}`} style={i(k)} data-reveal>
          <b>{typeof f.v === 'string' ? f.v : t(f.v)}</b>
          <p>{t(f.k)}</p>
          {k === 2 && (
            <a href="./security.html" className="tile-link">
              {t(figures.more)}
            </a>
          )}
        </div>
      ))}
      <h2 id="fig-h" data-reveal>
        {t(figures.heading)}
      </h2>
    </section>
  )
}

export function Cta() {
  const { t, lang } = useLang()
  const f = cta.form
  const [company, setCompany] = useState('')
  const [need, setNeed] = useState('')
  const [rl, setRl] = useState<Lang>(lang)
  const body =
    `${t(f.company)}: ${company || t(f.companyExample)}\n` + `${t(f.need)} ${need || t(f.needExample)}\n` + `${t(f.lang)}: ${rl === 'ar' ? 'العربية' : 'English'}\n`
  const mail = `mailto:${CONTACT.email}?subject=${encodeURIComponent(t(f.title))}&body=${encodeURIComponent(body)}`
  return (
    <section className="cta" aria-labelledby="cta-h">
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
      </form>
    </section>
  )
}

export function Home() {
  return (
    <>
      <Finds />
      <Showcase />
      <Steps />
      <Figures />
      <Cta />
    </>
  )
}
