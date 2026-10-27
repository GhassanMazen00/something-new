import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { Bars, Donut, Line } from '../charts/Charts'
import { CASH } from '../charts/serviceCharts'
import { order, reducedMotion } from '../fx'
import { useLang } from '../lang'
import { samples, samplesSection, type Cell, type Sample } from '../samples'
import { Level } from './Level'

// Made-up monthly sales for the forecast case, EGP millions: 24 months of history, then the forecast.
const HISTORY = [2.71, 2.78, 3.21, 2.86, 2.9, 2.98, 2.94, 3.02, 3.1, 3.05, 3.12, 3.2, 3.18, 3.25, 3.79, 3.38, 3.41, 3.5, 3.44, 3.52, 3.6, 3.55, 3.63, 3.7]
const FC = [3.7, 3.56, 3.62, 4.27, 3.86, 3.96, 4.13]
const FC_LO = [3.7, 3.38, 3.42, 4.02, 3.61, 3.69, 3.84]
const FC_HI = [3.7, 3.74, 3.83, 4.53, 4.11, 4.24, 4.43]

function PriceChart() {
  const { t } = useLang()
  const [rise, setRise] = useState(12)
  const [margin, setMargin] = useState(34)
  const limit = (rise / (margin + rise)) * 100
  const curve = Array.from({ length: 11 }, (_, k) => (((margin + rise) * (1 - k / 20) - margin) / margin) * 100)
  const lo = Math.min(-20, Math.floor(Math.min(...curve) / 10) * 10)
  const hi = Math.max(20, Math.ceil(Math.max(...curve) / 10) * 10)
  const fill = (v: number, min: number, max: number) => ({ '--v': `${((v - min) / (max - min)) * 100}%` }) as CSSProperties
  return (
    <>
      <div className="sliders">
        <label className="slider">
          <span>
            {t({ en: 'Price rise', ar: 'نسبة رفع السعر' })} <strong>{rise}%</strong>
          </span>
          <input type="range" min={1} max={30} value={rise} onChange={(e) => setRise(Number(e.target.value))} style={fill(rise, 1, 30)} />
        </label>
        <label className="slider">
          <span>
            {t({ en: 'Profit margin now', ar: 'هامش الربح الحالي' })} <strong>{margin}%</strong>
          </span>
          <input type="range" min={5} max={60} value={margin} onChange={(e) => setMargin(Number(e.target.value))} style={fill(margin, 5, 60)} />
        </label>
      </div>
      <p className="whatif-line">
        {t({ en: 'Still worth it unless sales fall more than', ar: 'يظل مربحًا ما لم تنخفض المبيعات أكثر من' })} <strong>{Math.round(limit)}%</strong>
      </p>
      <Line
        label="Profit change against sales drop"
        series={[{ values: curve }]}
        min={lo}
        max={hi}
        threshold={{ value: 0, text: 'Break-even' }}
        marks={limit <= 50 ? [{ series: 0, at: limit / 5, value: 0, text: `−${Math.round(limit)}% sales`, tone: 'bad' }] : []}
        xLabels={['0% sales drop', '50%']}
        width={560}
        height={210}
      />
    </>
  )
}

function CaseChart({ id }: { id: Sample['id'] }) {
  if (id === 'forecast')
    return (
      <Line
        label="Monthly sales with a six-month forecast"
        series={[
          { values: HISTORY, area: true },
          { values: FC, start: HISTORY.length - 1, dashed: true },
        ]}
        band={{ start: HISTORY.length - 1, lo: FC_LO, hi: FC_HI }}
        min={2}
        max={4.8}
        marks={[{ series: 1, at: 3, text: 'Ramadan peak' }]}
        xLabels={['Jan 2025', 'Jun 2027']}
        legend={[
          ['main', 'Actual'],
          ['band', 'Forecast range'],
        ]}
        width={560}
        height={230}
      />
    )
  if (id === 'scan')
    return (
      <Bars
        label="First digit of payments, found against Benford's law"
        values={[30.6, 17.2, 12.4, 9.8, 7.6, 6.5, 5.6, 5.0, 7.3]}
        overlay={[30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6]}
        bad={[8]}
        labels={['1', '2', '3', '4', '5', '6', '7', '8', '9']}
        legend={[
          ['soft', 'Found'],
          ['ink', 'Expected'],
          ['bad', 'Too many 9s'],
        ]}
      />
    )
  if (id === 'cash')
    return (
      <Line
        label="Closing cash by week against payroll"
        series={[{ values: CASH, area: true }]}
        threshold={{ value: 180, text: 'Payroll EGP 180k', tone: 'bad' }}
        marks={[{ series: 0, at: 8, text: 'Week 9: EGP 160k', tone: 'bad' }]}
        xLabels={['Week 1', 'Week 13']}
        width={560}
        height={230}
      />
    )
  if (id === 'price') return <PriceChart />
  return (
    <Donut
      label="Customers by group"
      center="18,400"
      sub="customers"
      segments={[
        { label: 'Best', value: 1120, tone: 'main' },
        { label: 'Loyal', value: 4860, tone: 'mid' },
        { label: 'At risk', value: 3950, tone: 'soft' },
        { label: 'Lost', value: 8470, tone: 'grey' },
      ]}
    />
  )
}

// The scan case runs its checks row by row; the other tables show their results straight away.
function CaseTable({ sample }: { sample: Sample }) {
  const { t } = useLang()
  const cell = (c: Cell) => (typeof c === 'string' ? c : t(c))
  const scan = sample.id === 'scan'
  const rows = sample.table.rows
  const [done, setDone] = useState(scan ? -1 : rows.length)
  const timer = useRef(0)
  useEffect(() => () => window.clearInterval(timer.current), [])
  const run = () => {
    window.clearInterval(timer.current)
    if (reducedMotion()) return setDone(rows.length)
    setDone(0)
    let i = 0
    timer.current = window.setInterval(() => {
      i++
      setDone(i)
      if (i >= rows.length) window.clearInterval(timer.current)
    }, 420)
  }
  const running = scan && done >= 0 && done < rows.length
  return (
    <div className="panel-box">
      <div className="panel-head">
        <span className="chart-title">{t(sample.table.title)}</span>
        {scan && (
          <button type="button" className="btn btn-primary btn-sm" onClick={run} disabled={running}>
            {running ? t({ en: 'Scanning…', ar: 'جارٍ الفحص…' }) : done >= rows.length ? t({ en: 'Run again', ar: 'شغّل مرة أخرى' }) : t({ en: 'Run the scan', ar: 'شغّل الفحص' })}
          </button>
        )}
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {sample.table.cols.map((c, k) => (
                <th key={c.en} className={sample.table.num.includes(k) ? 'n' : undefined}>
                  {t(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={scan && i < done ? 'flagged' : scan && i === done ? 'scanning' : undefined}>
                {r.map((c, k) => (
                  <td key={k} className={sample.table.num.includes(k) ? 'n' : undefined} dir={typeof c === 'string' ? 'ltr' : undefined}>
                    {scan && k === r.length - 1 ? (i < done ? cell(c) : <span className="pending">{t({ en: 'not checked', ar: 'لم يُفحص' })}</span>) : cell(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Demos() {
  const { t, lang } = useLang()
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const [a, b] = samplesSection.heading[lang]
  const l = samplesSection.labels
  const s = samples[active]

  const onKey = (e: KeyboardEvent, n: number) => {
    const fwd = lang === 'ar' ? 'ArrowLeft' : 'ArrowRight'
    const back = lang === 'ar' ? 'ArrowRight' : 'ArrowLeft'
    const next = e.key === fwd ? (n + 1) % samples.length : e.key === back ? (n - 1 + samples.length) % samples.length : -1
    if (next < 0) return
    e.preventDefault()
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <section id="demos" className="section demos" aria-labelledby="demos-h">
      <div className="wrap">
        <header className="sec-head wide">
          <h2 id="demos-h" data-reveal style={order(1)}>
            {a} <span className="accent">{b}</span>
          </h2>
          <p className="sec-lead" data-reveal style={order(2)}>
            {t(samplesSection.lead)}
          </p>
        </header>

        <div className="report-shell glass" data-reveal>
          <div className="report-tabs" role="tablist" aria-label={t(samplesSection.kicker)}>
            {samples.map((x, n) => (
              <button
                key={x.id}
                ref={(el) => {
                  tabs.current[n] = el
                }}
                type="button"
                role="tab"
                id={`case-${x.id}`}
                aria-selected={active === n}
                aria-controls="case-panel"
                tabIndex={active === n ? 0 : -1}
                onClick={() => setActive(n)}
                onKeyDown={(e) => onKey(e, n)}
              >
                <span>{t(x.tab)}</span>
                <small>{t(x.company)}</small>
              </button>
            ))}
          </div>

          <article id="case-panel" role="tabpanel" aria-labelledby={`case-${s.id}`} className="report-doc" key={s.id}>
            <header className="doc-head">
              <div>
                <span className="doc-tag">
                  {t(l.page)} · {t(s.tab)}
                </span>
                <h3>{t(s.company)}</h3>
                <p>{t(s.profile)}</p>
              </div>
              <span className="tag">{t(l.example)}</span>
            </header>

            <div className="doc-brief">
              <div>
                <span className="col-title">{t(l.question)}</span>
                <p className="q">“{t(s.question)}”</p>
              </div>
              <div>
                <span className="col-title">{t(l.data)}</span>
                <ul>
                  {s.data.map((d) => (
                    <li key={d.en}>{t(d)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="col-title">{t(l.method)}</span>
                <p>{t(s.method)}</p>
              </div>
            </div>

            <div className="doc-kpis">
              {s.kpis.map((k, n) => (
                <div key={k.label.en} className="kpi" style={order(n)}>
                  <span>{t(k.label)}</span>
                  <strong dir={typeof k.value === 'string' ? 'ltr' : undefined} className={k.tone}>
                    {typeof k.value === 'string' ? k.value : t(k.value)}
                  </strong>
                  <small>{t(k.note)}</small>
                </div>
              ))}
            </div>

            <div className={`doc-body${s.id === 'scan' || s.id === 'customers' ? ' stacked-body' : ''}`}>
              <div className="panel-box">
                <span className="chart-title">{t(s.chartTitle)}</span>
                <CaseChart id={s.id} />
              </div>
              <CaseTable sample={s} />
            </div>

            <div className="doc-findings">
              <span className="col-title">{t(l.findings)}</span>
              <ol>
                {s.findings.map((f, n) => (
                  <li key={f.text.en} style={order(n)}>
                    <span className="f-n">{n + 1}</span>
                    <div>
                      <p>{t(f.text)}</p>
                      <strong>{t(f.action)}</strong>
                    </div>
                    <Level level={f.level} />
                  </li>
                ))}
              </ol>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
