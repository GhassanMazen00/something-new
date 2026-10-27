import { useState } from 'react'
import { serviceCharts } from '../charts/serviceCharts'
import { process } from '../content'
import { depts } from '../depts'
import { order, useScrollProgress } from '../fx'
import { journeys, stepNotes, stepTitles } from '../journeys'
import { useLang } from '../lang'
import { Check, Lock } from './Icons'
import { Level } from './Level'

export function Process() {
  const { t } = useLang()
  const lineRef = useScrollProgress<HTMLOListElement>()
  const [dept, setDept] = useState('accounting')
  const j = journeys.find((x) => x.dept === dept)!

  const visuals = [
    <figure key="q" className="quote">
      <blockquote>“{t(j.quote)}”</blockquote>
      <figcaption>{t(j.who)}</figcaption>
    </figure>,
    <div key="f" className="send">
      <ul className="files">
        {j.files.map((f, n) => (
          <li key={f} className="file" dir="ltr" style={order(n)}>
            {f}
          </li>
        ))}
      </ul>
      <p className="secure-note">
        <Lock /> {t(stepNotes.transfer)}
      </p>
    </div>,
    <ul key="a" className="checklist">
      {j.analyse.map((a, n) => (
        <li key={a.en} style={order(n)}>
          <span className="tick">
            <Check />
          </span>
          {t(a)}
        </li>
      ))}
      <li className="days">{t(stepNotes.days)}</li>
    </ul>,
    <div key="r" className="results-box">
      <ol>
        {j.results.map((r, n) => (
          <li key={r.en} style={order(n)}>
            <span className="f-n">{n + 1}</span>
            {t(r)}
          </li>
        ))}
      </ol>
      <div className="results-chart">{serviceCharts[j.chart]}</div>
    </div>,
  ]

  return (
    <section id="process" className="section process" aria-labelledby="process-h">
      <div className="wrap">
        <header className="sec-head center">
          <span className="kicker" data-reveal>
            {t(process.heading)}
          </span>
          <h2 id="process-h" data-reveal style={order(1)}>
            {t({ en: 'Four steps.', ar: 'أربع خطوات.' })} <span className="accent">{t({ en: 'One clear page.', ar: 'صفحة واحدة واضحة.' })}</span>
          </h2>
          <p className="sec-lead" data-reveal style={order(2)}>
            {t(stepNotes.pick)}
          </p>
        </header>

        <div className="tabs-wrap" data-reveal>
          <div className="tabs glass" role="radiogroup" aria-label={t(stepNotes.pick)}>
            {depts.map((d) => (
              <button key={d.id} type="button" role="radio" aria-checked={dept === d.id} onClick={() => setDept(d.id)}>
                {t(d.name)}
              </button>
            ))}
          </div>
        </div>

        <ol className="timeline" ref={lineRef}>
          <span className="tl-line" aria-hidden="true">
            <span />
          </span>
          {stepTitles.map((title, n) => (
            <li key={title.en} className="step">
              <span className="step-n" aria-hidden="true">
                0{n + 1}
              </span>
              <div className="step-copy" data-reveal>
                <h3>{t(title)}</h3>
              </div>
              <div className="step-visual glass" key={`${dept}-${n}`}>
                {visuals[n]}
              </div>
            </li>
          ))}
        </ol>

        <div className="legend glass" data-reveal>
          <h3>{t(process.legend.title)}</h3>
          <ul>
            {process.legend.rows.map((row) => (
              <li key={row.level}>
                <Level level={row.level} />
                <span>{t(row.text)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
