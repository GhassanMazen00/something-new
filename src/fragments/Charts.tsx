import { charts } from '../content'
import { useLang } from '../lang'

// Benford's law: the share of amounts starting with each digit 1–9.
const EXPECTED = [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6]
// Example data (4,812 payments). Sums to 100. Digit 9 is high: 6.2% = 298 amounts vs 221 expected.
const FOUND = [29.4, 17.9, 12.1, 9.9, 8.2, 6.4, 5.5, 4.4, 6.2]

export function BenfordChart() {
  const { t } = useLang()
  const W = 300
  const H = 150
  const base = 128
  const y = (v: number) => base - (v / 32) * 112
  const slot = W / 9
  const points = EXPECTED.map((v, i) => `${(slot * i + slot / 2).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  return (
    <div data-ui role="img" aria-label={`${t(charts.benford.title)}. ${t(charts.benford.note)}`}>
      <div className="ui-title">{t(charts.benford.title)}</div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" style={{ direction: 'ltr' }}>
        {FOUND.map((v, i) => (
          <rect
            key={i}
            x={slot * i + slot / 2 - 9}
            y={y(v)}
            width={18}
            height={base - y(v)}
            fill="#38450f"
            opacity={i === 8 ? 1 : 0.32}
          />
        ))}
        <polyline points={points} fill="none" stroke="#38450f" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        {EXPECTED.map((v, i) => (
          <circle key={i} cx={slot * i + slot / 2} cy={y(v)} r={2.6} fill="#38450f" />
        ))}
        <line x1={0} x2={W} y1={base} y2={base} stroke="#38450f" strokeOpacity={0.3} vectorEffect="non-scaling-stroke" />
        {EXPECTED.map((_, i) => (
          <text key={i} x={slot * i + slot / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#5d683a">
            {i + 1}
          </text>
        ))}
      </svg>
      <div className="ui-muted">
        ● {t(charts.benford.expected)} · ▮ {t(charts.benford.found)}. {t(charts.benford.note)}
      </div>
    </div>
  )
}

// 13-week cash forecast in EGP thousands, with a likely range and the payroll line.
const CASH = [640, 590, 610, 520, 470, 430, 360, 250, 160, 210, 300, 340, 380]
const PAYROLL = 180

export function CashChart({ caption = true }: { caption?: boolean }) {
  const { t } = useLang()
  const W = 300
  const H = 150
  const x = (i: number) => 14 + (i * (W - 28)) / 12
  const y = (v: number) => 132 - (v / 720) * 118
  const spread = (i: number) => 14 + i * 7
  const upper = CASH.map((v, i) => `${x(i).toFixed(1)},${y(v + spread(i)).toFixed(1)}`)
  const lower = CASH.map((v, i) => `${x(i).toFixed(1)},${y(Math.max(0, v - spread(i))).toFixed(1)}`).reverse()
  const line = CASH.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  return (
    <div data-ui role="img" aria-label={`${t(charts.cash.title)}. ${t(charts.cash.short)}`}>
      <div className="ui-title">{t(charts.cash.title)}</div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" style={{ direction: 'ltr' }}>
        <polygon points={[...upper, ...lower].join(' ')} fill="#38450f" opacity={0.13} />
        <line x1={0} x2={W} y1={y(PAYROLL)} y2={y(PAYROLL)} stroke="#38450f" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        <path className="cash-line" d={line} pathLength={1} fill="none" stroke="#38450f" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        <circle cx={x(8)} cy={y(CASH[8])} r={4} fill="#38450f" />
        <text x={x(8) + 7} y={y(CASH[8]) + 14} fontSize={10} fontWeight={700} fill="#38450f">
          {t(charts.cash.short)}
        </text>
        <text x={W - 2} y={y(PAYROLL) - 4} textAnchor="end" fontSize={9} fill="#5d683a">
          {t(charts.cash.payroll)} {PAYROLL}
        </text>
        {CASH.map((_, i) => (
          <text key={i} x={x(i)} y={H - 2} textAnchor="middle" fontSize={8} fill="#5d683a">
            {i + 1}
          </text>
        ))}
      </svg>
      {caption && <div className="ui-muted">{t(charts.cash.payroll)} = 180 · P10–P90</div>}
    </div>
  )
}
