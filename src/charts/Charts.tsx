import type { CSSProperties, ReactNode } from 'react'
import { useInView } from '../fx'

// Small animated SVG charts. Each one draws itself the first time it scrolls into view.
// Colours come from CSS classes (see "Charts" in styles.css) so they follow the theme.

const W = 320
const H = 150
const PAD = { l: 10, r: 10, t: 14, b: 22 }
const IW = W - PAD.l - PAD.r
const IH = H - PAD.t - PAD.b

const i = (n: number) => ({ '--i': n }) as CSSProperties

function Frame({ children, label, width = W, height = H, legend }: { children: ReactNode; label: string; width?: number; height?: number; legend?: [string, string][] }) {
  const [ref, seen] = useInView<HTMLDivElement>()
  return (
    <figure ref={ref} className={`chart${seen ? ' is-drawn' : ''}`}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        {children}
      </svg>
      {legend && (
        <figcaption className="legend-row">
          {legend.map(([tone, text]) => (
            <span key={text}>
              <i className={`sw ${tone}`} />
              {text}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  )
}

function Grid({ rows = 3, w = W, h = H }: { rows?: number; w?: number; h?: number }) {
  const ih = h - PAD.t - PAD.b
  return (
    <g className="grid-lines">
      {Array.from({ length: rows + 1 }, (_, n) => {
        const y = PAD.t + (ih / rows) * n
        return <line key={n} x1={PAD.l} x2={w - PAD.r} y1={y} y2={y} />
      })}
    </g>
  )
}

const path = (pts: [number, number][]) => pts.map(([x, y], n) => `${n ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

// ---------- Line ----------
export interface Series {
  values: number[]
  start?: number
  tone?: 'main' | 'soft' | 'ink' | 'bad'
  dashed?: boolean
  area?: boolean
}

export function Line({
  label,
  series,
  band,
  min = 0,
  max,
  threshold,
  marks = [],
  xLabels,
  legend,
  width = W,
  height = H,
}: {
  label: string
  series: Series[]
  band?: { lo: number[]; hi: number[]; start: number }
  min?: number
  max?: number
  threshold?: { value: number; text: string; tone?: 'ink' | 'bad' }
  marks?: { series: number; at: number; value?: number; text?: string; tone?: 'main' | 'bad' }[]
  xLabels?: [string, string]
  legend?: [string, string][]
  width?: number
  height?: number
}) {
  const IW = width - PAD.l - PAD.r
  const IH = height - PAD.t - PAD.b
  const n = Math.max(...series.map((s) => (s.start ?? 0) + s.values.length), band ? band.start + band.lo.length : 0)
  const top = max ?? Math.max(...series.flatMap((s) => s.values), ...(band?.hi ?? [])) * 1.1
  const x = (k: number) => PAD.l + (k / (n - 1)) * IW
  const y = (v: number) => PAD.t + IH - ((v - min) / (top - min)) * IH
  const pts = (s: Series) => s.values.map((v, k) => [x((s.start ?? 0) + k), y(v)] as [number, number])

  return (
    <Frame label={label} legend={legend} width={width} height={height}>
      <Grid w={width} h={height} />
      {band && (
        <path
          className="band fade"
          d={`${path(band.hi.map((v, k) => [x(band.start + k), y(v)]))} L${[...band.lo]
            .map((v, k) => [x(band.start + k), y(v)] as [number, number])
            .reverse()
            .map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`)
            .join(' L')} Z`}
        />
      )}
      {series.map(
        (s, k) =>
          s.area && (
            <path
              key={`a${k}`}
              className={`area fade ${s.tone ?? 'main'}`}
              d={`${path(pts(s))} L${x((s.start ?? 0) + s.values.length - 1)},${PAD.t + IH} L${x(s.start ?? 0)},${PAD.t + IH} Z`}
            />
          ),
      )}
      {threshold && (
        <g className={`threshold fade ${threshold.tone ?? 'ink'}`}>
          <line x1={PAD.l} x2={width - PAD.r} y1={y(threshold.value)} y2={y(threshold.value)} />
          <text x={PAD.l + 2} y={y(threshold.value) - 5}>
            {threshold.text}
          </text>
        </g>
      )}
      {series.map((s, k) => (
        <path
          key={k}
          className={`ln ${s.tone ?? 'main'}${s.dashed ? ' dashed' : ''}`}
          d={path(pts(s))}
          pathLength={1}
          style={i(k)}
        />
      ))}
      {marks.map((m, k) => {
        const s = series[m.series]
        const px = x((s.start ?? 0) + m.at)
        const py = y(m.value ?? s.values[Math.round(m.at)])
        return (
          <g key={k} className={`mark pop ${m.tone ?? 'main'}`} style={i(k)}>
            <circle cx={px} cy={py} r={4.5} />
            {m.text && (
              <text x={px > width - 90 ? px - 8 : px + 8} y={py - 8} textAnchor={px > width - 90 ? 'end' : 'start'}>
                {m.text}
              </text>
            )}
          </g>
        )
      })}
      {xLabels && (
        <g className="axis">
          <text x={PAD.l} y={height - 6}>
            {xLabels[0]}
          </text>
          <text x={width - PAD.r} y={height - 6} textAnchor="end">
            {xLabels[1]}
          </text>
        </g>
      )}
    </Frame>
  )
}

// ---------- Vertical bars ----------
export function Bars({
  label,
  values,
  highlight = [],
  bad = [],
  labels,
  overlay,
  cumulative,
  threshold,
  legend,
}: {
  label: string
  values: number[]
  highlight?: number[]
  bad?: number[]
  labels?: string[]
  overlay?: number[]
  cumulative?: boolean
  threshold?: { value: number; text: string }
  legend?: [string, string][]
}) {
  const total = values.reduce((a, b) => a + b, 0)
  const top = Math.max(...values, ...(overlay ?? [])) * 1.12
  const slot = IW / values.length
  const bw = Math.min(26, slot * 0.62)
  const y = (v: number) => PAD.t + IH - (v / top) * IH
  const cum = values.reduce<number[]>((acc, v) => [...acc, (acc.at(-1) ?? 0) + (v / total) * 100], [])
  const yc = (p: number) => PAD.t + IH - (p / 100) * IH
  const cx = (k: number) => PAD.l + slot * k + slot / 2

  return (
    <Frame label={label} legend={legend}>
      <Grid />
      {values.map((v, k) => (
        <rect
          key={k}
          className={`bar ${bad.includes(k) ? 'bad' : highlight.includes(k) ? 'main' : highlight.length || bad.length ? 'soft' : 'main'}`}
          x={cx(k) - bw / 2}
          y={y(v)}
          width={bw}
          height={PAD.t + IH - y(v)}
          rx={3}
          style={i(k)}
        />
      ))}
      {overlay && (
        <>
          <path className="ln ink" d={path(overlay.map((v, k) => [cx(k), y(v)]))} pathLength={1} style={i(2)} />
          {overlay.map((v, k) => (
            <circle key={k} className="dot ink pop" cx={cx(k)} cy={y(v)} r={3} style={i(k)} />
          ))}
        </>
      )}
      {cumulative && (
        <>
          <line className="threshold fade ink" x1={PAD.l} x2={W - PAD.r} y1={yc(80)} y2={yc(80)} />
          <text className="threshold-text fade" x={W - PAD.r} y={yc(80) - 5} textAnchor="end">
            80%
          </text>
          <path className="ln ink" d={path(cum.map((p, k) => [cx(k), yc(p)]))} pathLength={1} style={i(2)} />
        </>
      )}
      {threshold && (
        <g className="threshold fade ink">
          <line x1={PAD.l} x2={W - PAD.r} y1={y(threshold.value)} y2={y(threshold.value)} />
          <text x={W - PAD.r} y={y(threshold.value) - 5} textAnchor="end">
            {threshold.text}
          </text>
        </g>
      )}
      {labels && (
        <g className="axis">
          {labels.map((l, k) => (
            <text key={k} x={cx(k)} y={H - 6} textAnchor="middle">
              {l}
            </text>
          ))}
        </g>
      )}
    </Frame>
  )
}

// ---------- Grouped bars (two series side by side) ----------
export function Grouped({ label, pairs, bad = [], labels, legend }: { label: string; pairs: [number, number][]; bad?: number[]; labels: string[]; legend: [string, string][] }) {
  const top = Math.max(...pairs.flat()) * 1.12
  const slot = IW / pairs.length
  const bw = Math.min(14, slot * 0.3)
  const y = (v: number) => PAD.t + IH - (v / top) * IH
  return (
    <Frame label={label} legend={legend}>
      <Grid />
      {pairs.map(([a, b], k) => {
        const c = PAD.l + slot * k + slot / 2
        return (
          <g key={k}>
            <rect className="bar main" x={c - bw - 1} y={y(a)} width={bw} height={PAD.t + IH - y(a)} rx={2} style={i(k)} />
            <rect className={`bar ${bad.includes(k) ? 'bad' : 'soft'}`} x={c + 1} y={y(b)} width={bw} height={PAD.t + IH - y(b)} rx={2} style={i(k + 1)} />
          </g>
        )
      })}
      <g className="axis">
        {labels.map((l, k) => (
          <text key={k} x={PAD.l + slot * k + slot / 2} y={H - 6} textAnchor="middle">
            {l}
          </text>
        ))}
      </g>
    </Frame>
  )
}

// ---------- Horizontal bars ----------
export function HBars({ label, items, max }: { label: string; items: { label: string; value: number; text?: string; tone?: 'main' | 'soft' | 'bad' | 'ink' }[]; max?: number }) {
  const rowH = 26
  const height = items.length * rowH + 8
  const top = max ?? Math.max(...items.map((d) => d.value))
  const x0 = 96
  const bw = W - x0 - 78
  return (
    <Frame label={label} height={height}>
      {items.map((d, k) => {
        const yy = 6 + k * rowH
        return (
          <g key={d.label}>
            <text className="hb-label" x={0} y={yy + 13}>
              {d.label}
            </text>
            <rect className="track" x={x0} y={yy + 3} width={bw} height={14} rx={3} />
            <rect className={`hbar ${d.tone ?? 'main'}`} x={x0} y={yy + 3} width={Math.max(2, (d.value / top) * bw)} height={14} rx={3} style={i(k)} />
            <text className="hb-value fade" x={W} y={yy + 14} textAnchor="end">
              {d.text ?? d.value}
            </text>
          </g>
        )
      })}
    </Frame>
  )
}

// ---------- Donut ----------
export function Donut({ label, segments, center, sub }: { label: string; segments: { label: string; value: number; tone: string }[]; center: string; sub: string }) {
  const [ref, seen] = useInView<HTMLDivElement>()
  const total = segments.reduce((a, s) => a + s.value, 0)
  const starts = segments.map((_, k) => segments.slice(0, k).reduce((a, s) => a + (s.value / total) * 100, 0))
  return (
    <figure ref={ref} className={`chart donut${seen ? ' is-drawn' : ''}`}>
      <svg viewBox="0 0 120 120" role="img" aria-label={label}>
        <circle className="donut-track" cx={60} cy={60} r={46} />
        {segments.map((s, k) => {
          const len = (s.value / total) * 100
          const start = starts[k]
          return (
            <circle
              key={s.label}
              className={`donut-seg ${s.tone}`}
              cx={60}
              cy={60}
              r={46}
              pathLength={100}
              style={{ strokeDasharray: seen ? `${Math.max(0, len - 1)} ${100 - len + 1}` : '0 100', strokeDashoffset: -start, transitionDelay: `${k * 120}ms` }}
            />
          )
        })}
        <text x={60} y={60} textAnchor="middle" className="donut-big">
          {center}
        </text>
        <text x={60} y={76} textAnchor="middle" className="donut-sub">
          {sub}
        </text>
      </svg>
      <figcaption className="legend-col">
        {segments.map((s) => (
          <span key={s.label}>
            <i className={`sw ${s.tone}`} />
            {s.label}
            <b>{Math.round((s.value / total) * 100)}%</b>
          </span>
        ))}
      </figcaption>
    </figure>
  )
}

// ---------- Gauge (score out of 100) ----------
export function Gauge({ label, value, text }: { label: string; value: number; text: string }) {
  const [ref, seen] = useInView<HTMLDivElement>()
  return (
    <figure ref={ref} className={`chart gauge-chart${seen ? ' is-drawn' : ''}`}>
      <svg viewBox="0 0 200 118" role="img" aria-label={label}>
        <path className="gauge-track" d="M20,105 A80,80 0 0 1 180,105" pathLength={100} />
        <path className="gauge-val" d="M20,105 A80,80 0 0 1 180,105" pathLength={100} style={{ strokeDasharray: `${seen ? value : 0} 100` }} />
        <text x={100} y={92} textAnchor="middle" className="gauge-num">
          {value}
        </text>
        <text x={100} y={112} textAnchor="middle" className="donut-sub">
          {text}
        </text>
      </svg>
    </figure>
  )
}

// ---------- Scatter ----------
export function Scatter({ label, points, outliers = [], fit, legend }: { label: string; points: [number, number][]; outliers?: number[]; fit?: boolean; legend?: [string, string][] }) {
  const mx = Math.max(...points.map((p) => p[0])) * 1.08
  const my = Math.max(...points.map((p) => p[1])) * 1.1
  const x = (v: number) => PAD.l + (v / mx) * IW
  const y = (v: number) => PAD.t + IH - (v / my) * IH
  // Least-squares line for the fit.
  const n = points.length
  const sx = points.reduce((a, p) => a + p[0], 0)
  const sy = points.reduce((a, p) => a + p[1], 0)
  const sxy = points.reduce((a, p) => a + p[0] * p[1], 0)
  const sxx = points.reduce((a, p) => a + p[0] * p[0], 0)
  const b = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  const a = (sy - b * sx) / n
  return (
    <Frame label={label} legend={legend}>
      <Grid />
      {fit && <path className="ln ink dashed" d={path([[x(0), y(a)], [x(mx), y(a + b * mx)]])} pathLength={1} />}
      {points.map(([px, py], k) => (
        <circle key={k} className={`dot pop ${outliers.includes(k) ? 'bad big' : 'main'}`} cx={x(px)} cy={y(py)} r={outliers.includes(k) ? 5 : 3.5} style={i(k % 12)} />
      ))}
    </Frame>
  )
}

// ---------- Nested circles (TAM / SAM / SOM) ----------
export function Nested({ label, rings }: { label: string; rings: { name: string; value: string }[] }) {
  const [ref, seen] = useInView<HTMLDivElement>()
  const r = [64, 42, 20]
  return (
    <figure ref={ref} className={`chart nested${seen ? ' is-drawn' : ''}`}>
      <svg viewBox="0 0 320 150" role="img" aria-label={label}>
        {rings.map((ring, k) => (
          <g key={ring.name} className="ring-g" style={i(k)}>
            <circle className={`nest n${k}`} cx={86} cy={140 - r[k]} r={r[k]} />
            <line className="leader fade" x1={86 + r[k] * 0.7} y1={140 - r[k] - r[k] * 0.7} x2={180} y2={26 + k * 44} />
            <text x={186} y={26 + k * 44} className="nest-name fade">
              {ring.name}
            </text>
            <text x={186} y={42 + k * 44} className="nest-val fade">
              {ring.value}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  )
}

// ---------- One stacked bar ----------
export function Stacked({ label, segments, headline, sub }: { label: string; segments: { label: string; value: number; tone: string }[]; headline: string; sub: string }) {
  const [ref, seen] = useInView<HTMLDivElement>()
  const total = segments.reduce((a, s) => a + s.value, 0)
  return (
    <figure ref={ref} className={`chart stacked${seen ? ' is-drawn' : ''}`} aria-label={label}>
      <div className="stacked-head">
        <strong>{headline}</strong>
        <span>{sub}</span>
      </div>
      <div className="stacked-bar">
        {segments.map((s, k) => (
          <span key={s.label} className={s.tone} style={{ width: seen ? `${(s.value / total) * 100}%` : '0%', transitionDelay: `${k * 150}ms` }} />
        ))}
      </div>
      <figcaption className="legend-row">
        {segments.map((s) => (
          <span key={s.label}>
            <i className={`sw ${s.tone}`} />
            {s.label} {s.value}%
          </span>
        ))}
      </figcaption>
    </figure>
  )
}

// ---------- Two bell curves (A/B test) ----------
export function Bells({ label, a, b, legend }: { label: string; a: number; b: number; legend: [string, string][] }) {
  const sd = 0.06
  const xs = Array.from({ length: 61 }, (_, k) => 0.2 + k * 0.009)
  const pdf = (v: number, m: number) => Math.exp(-((v - m) ** 2) / (2 * sd * sd))
  const x = (v: number) => PAD.l + ((v - 0.2) / 0.54) * IW
  const y = (v: number) => PAD.t + IH - v * IH * 0.92
  const curve = (m: number) => `${path(xs.map((v) => [x(v), y(pdf(v, m))]))} L${x(xs.at(-1)!)},${y(0)} L${x(xs[0])},${y(0)} Z`
  return (
    <Frame label={label} legend={legend}>
      <line className="base" x1={PAD.l} x2={W - PAD.r} y1={y(0)} y2={y(0)} />
      <path className="bell soft fade" d={curve(a)} />
      <path className="bell main fade" d={curve(b)} style={i(3)} />
      <path className="ln ink" d={path(xs.map((v) => [x(v), y(pdf(v, a))]))} pathLength={1} />
      <path className="ln main" d={path(xs.map((v) => [x(v), y(pdf(v, b))]))} pathLength={1} style={i(1)} />
    </Frame>
  )
}
