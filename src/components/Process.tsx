import { Line } from '../charts/Charts'
import { CASH } from '../charts/serviceCharts'
import { process, report } from '../content'
import { order, useScrollProgress } from '../fx'
import { useLang } from '../lang'

const FILES = ['einvoices_2025-2026.xlsx', 'bank_statements_2026.pdf', 'salaries_coded.xlsx']

function Chip({ level }: { level: string }) {
  const { t } = useLang()
  return <span className={`chip ${level}`}>{t(process.levels[level as 'high' | 'medium' | 'low' | 'none'])}</span>
}

function DataPlan() {
  const { t } = useLang()
  const p = process.plan
  return (
    <div className="panel">
      <span className="col-title">{t(p.title)}</span>
      {p.rows.map((r) => (
        <div key={r.service.en} className="plan-row">
          <div>
            <strong>{t(r.service)}</strong>
            <span>{t(r.from)}</span>
          </div>
          <Chip level={r.level} />
        </div>
      ))}
    </div>
  )
}

function Received() {
  const { t } = useLang()
  const r = process.received
  return (
    <div className="panel">
      <div className="files">
        {FILES.map((f) => (
          <span key={f} className="file" dir="ltr">
            {f}
          </span>
        ))}
      </div>
      <span className="col-title">
        {t(r.title)} <Chip level="high" />
      </span>
      <dl className="recv">
        {r.lines.map((l) => (
          <div key={l.k.en}>
            <dt>{t(l.k)}</dt>
            <dd>{t(l.v)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function ReportPage() {
  const { t } = useLang()
  return (
    <div className="panel report">
      <div className="report-head">
        <span className="col-title">{t(report.title)}</span>
        <span className="muted">{t(report.period)}</span>
      </div>
      {report.items.map((item, i) => (
        <div key={i} className="report-item">
          <span className="ri-n">{i + 1}</span>
          <div>
            <p>{t(item.finding)}</p>
            <strong>{t(item.action)}</strong>
          </div>
          <Chip level={item.level} />
        </div>
      ))}
      <div className="report-chart">
        <Line label="Cash for 13 weeks against payroll" series={[{ values: CASH, area: true }]} threshold={{ value: 180, text: 'Payroll', tone: 'bad' }} marks={[{ series: 0, at: 8, text: 'Week 9', tone: 'bad' }]} />
      </div>
      <span className="muted small">{t(report.footer)}</span>
    </div>
  )
}

const VISUALS = [DataPlan, Received, ReportPage]

export function Process() {
  const { t } = useLang()
  const lineRef = useScrollProgress<HTMLOListElement>()
  return (
    <section id="process" className="section process" aria-labelledby="process-h">
      <div className="wrap">
        <header className="sec-head center">
          <span className="kicker" data-reveal>
            {t(process.heading)}
          </span>
          <h2 id="process-h" data-reveal style={order(1)}>
            {t({ en: 'Three steps.', ar: 'ثلاث خطوات.' })} <span className="accent">{t({ en: 'One page.', ar: 'صفحة واحدة.' })}</span>
          </h2>
        </header>

        <ol className="timeline" ref={lineRef}>
          <span className="tl-line" aria-hidden="true">
            <span />
          </span>
          {process.steps.map((step, n) => {
            const Visual = VISUALS[n]
            return (
              <li key={step.say.en} className="step">
                <span className="step-n" aria-hidden="true">
                  0{n + 1}
                </span>
                <div className="step-copy" data-reveal>
                  <h3>{t(step.say)}</h3>
                  <p className="bubble">{n === 1 ? t(step.call) : `“${t(step.call)}”`}</p>
                </div>
                <div className="step-visual card" data-reveal style={order(1)}>
                  <Visual />
                </div>
              </li>
            )
          })}
        </ol>

        <div className="legend card" data-reveal>
          <h3>{t(process.legend.title)}</h3>
          <ul>
            {process.legend.rows.map((row) => (
              <li key={row.level}>
                <Chip level={row.level} />
                <span>{t(row.text)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
