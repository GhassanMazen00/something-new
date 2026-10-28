// One service's result: key numbers, charts, findings with confidence, and notes.

import type { Result } from '../services/types'
import { Level } from './bits'
import { ChartView } from './charts'

export function Kpis({ kpis }: { kpis: Result['kpis'] }) {
  return (
    <div className="kpis">
      {kpis.map((k) => (
        <div key={k.label} className={`kpi panel${k.tone ? ' ' + k.tone : ''}${k.value.length > 16 ? ' long' : ''}`}>
          <small>{k.label}</small>
          <strong>{k.value}</strong>
          {k.note && <span>{k.note}</span>}
        </div>
      ))}
    </div>
  )
}

export function Findings({ r }: { r: Result }) {
  return (
    <div className="findings panel pad">
      <div className="panel-title">Findings and actions</div>
      <ol>
        {r.findings.map((f) => (
          <li key={f.text}>
            <div>
              <p>{f.text}</p>
              {f.action && <em>{f.action}</em>}
              <Level level={f.level} />
            </div>
          </li>
        ))}
      </ol>
      {r.accuracy && (
        <p className="note">
          <b>Accuracy check.</b> {r.accuracy}
        </p>
      )}
      {r.notes?.map((n) => (
        <p key={n} className="note">
          {n}
        </p>
      ))}
    </div>
  )
}

export function ResultView({ r }: { r: Result }) {
  // Wide tables need the full width: findings go above them instead of beside.
  const stacked = r.charts.some((c) => c.chart.type === 'table' && c.chart.columns.length > 5)
  return (
    <>
      <Kpis kpis={r.kpis} />
      <div className={`results${stacked ? ' stacked' : ''}`}>
        <div className="charts">
          {r.charts.map((c) => (
            <div key={c.title} className={`panel pad${c.wide || r.charts.length === 1 ? ' wide' : ''}`}>
              <div className="panel-title">{c.title}</div>
              <ChartView chart={c.chart} />
            </div>
          ))}
        </div>
        <Findings r={r} />
      </div>
    </>
  )
}
