// Charts drawn in plain SVG at the container's real width, so text never stretches.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { egp, num, short } from '../lib/format'
import type { Chart, Format, Tone } from '../services/types'

function useWidth<E extends HTMLElement>() {
  const ref = useRef<E>(null)
  const [w, setW] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

const fmtAxis = (v: number, f?: Format) => (f === 'pct' ? `${Math.round(v)}%` : short(v))
const fmtFull = (v: number, f?: Format) => (f === 'money' ? egp(v) : f === 'pct' ? `${v.toFixed(1)}%` : num(v, Math.abs(v) < 10 && v !== 0 ? 1 : 0))

function niceTicks(lo: number, hi: number, n = 4) {
  const span = hi - lo || 1
  const step0 = span / n
  const mag = 10 ** Math.floor(Math.log10(step0))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= step0) ?? step0
  const start = Math.floor(lo / step) * step
  const ticks: number[] = []
  for (let v = start; v <= hi + step * 0.5; v += step) ticks.push(v)
  return ticks
}

function Legend({ items }: { items: { name: string; tone: Tone; dashed?: boolean; box?: boolean }[] }) {
  if (items.length < 2) return null
  return (
    <div className="chart-legend">
      {items.map((it) => (
        <span key={it.name} className={`t-${it.tone}`}>
          <i className={it.dashed ? 'dashed' : it.box ? 'box' : undefined} />
          {it.name}
        </span>
      ))}
    </div>
  )
}

function LineChart({ c }: { c: Extract<Chart, { type: 'line' }> }) {
  const [ref, w] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const h = 240
  const pad = { l: 48, r: 14, t: 18, b: 26 }
  const vals = [...c.series.flatMap((s) => s.values), ...(c.band ? [...c.band.lo, ...c.band.hi] : [])].filter((v): v is number => v !== null && isFinite(v))
  let lo = Math.min(...vals)
  let hi = Math.max(...vals)
  if (c.zero) lo = Math.min(0, lo)
  const ticks = niceTicks(lo, hi)
  lo = Math.min(lo, ticks[0])
  hi = Math.max(hi, ticks[ticks.length - 1])
  const n = c.x.length
  const X = (i: number) => pad.l + (i / Math.max(1, n - 1)) * (w - pad.l - pad.r)
  const Y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo || 1)) * (h - pad.t - pad.b)
  const path = (vs: (number | null)[]) => {
    let d = ''
    let pen = false
    vs.forEach((v, i) => {
      if (v === null || !isFinite(v)) {
        pen = false
        return
      }
      d += `${pen ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`
      pen = true
    })
    return d
  }
  const band = c.band
    ? (() => {
        const idx = c.band.lo.map((v, i) => (v !== null && c.band!.hi[i] !== null ? i : -1)).filter((i) => i >= 0)
        if (!idx.length) return ''
        return `M${idx.map((i) => `${X(i)} ${Y(c.band!.hi[i]!)}`).join(' L')} L${[...idx].reverse().map((i) => `${X(i)} ${Y(c.band!.lo[i]!)}`).join(' L')} Z`
      })()
    : ''
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor((w - 60) / 70))))
  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
    const i = Math.round(((e.clientX - r.left - pad.l) / (w - pad.l - pad.r)) * (n - 1))
    setHover(i >= 0 && i < n ? i : null)
  }
  return (
    <div className="chart" ref={ref}>
      <Legend items={[...c.series.map((s) => ({ name: s.name, tone: s.tone ?? 'accent', dashed: s.dashed })), ...(c.band ? [{ name: c.band.name, tone: 'accent' as Tone, box: true }] : [])]} />
      {w > 0 && (
        <svg width={w} height={h} onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label={c.series.map((s) => s.name).join(', ')}>
          <g className="grid">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.l} x2={w - pad.r} y1={Y(t)} y2={Y(t)} />
                <text x={pad.l - 8} y={Y(t) + 4} textAnchor="end">
                  {fmtAxis(t, c.format)}
                </text>
              </g>
            ))}
          </g>
          {lo < 0 && hi > 0 && <line className="zero" x1={pad.l} x2={w - pad.r} y1={Y(0)} y2={Y(0)} />}
          {c.x.map((x, i) =>
            i % every === 0 ? (
              <text key={i} x={X(i)} y={h - 6} textAnchor="middle">
                {x}
              </text>
            ) : null,
          )}
          {band && <path className="band" d={band} />}
          {c.series.map((s) => (
            <path key={s.name} className={`series t-${s.tone ?? 'accent'}${s.dashed ? ' dashed' : ''}`} d={path(s.values)} />
          ))}
          {c.marks?.map((m) =>
            m.index >= 0 && m.index < n ? (
              <g key={m.label + m.index} className={`mark t-${m.tone ?? 'amber'}`}>
                <line x1={X(m.index)} x2={X(m.index)} y1={pad.t} y2={h - pad.b} />
                <text x={Math.min(w - pad.r - 4, Math.max(pad.l + 4, X(m.index)))} y={pad.t - 6} textAnchor="middle">
                  {m.label}
                </text>
              </g>
            ) : null,
          )}
          {hover !== null && <line x1={X(hover)} x2={X(hover)} y1={pad.t} y2={h - pad.b} stroke="var(--line-2)" />}
          {hover !== null &&
            c.series.map((s) => {
              const v = s.values[hover]
              return v !== null && isFinite(v) ? <circle key={s.name} cx={X(hover)} cy={Y(v)} r={3.5} className={`t-${s.tone ?? 'accent'}`} fill="var(--c)" /> : null
            })}
        </svg>
      )}
      {hover !== null && (
        <div className="tip" style={{ left: Math.min(w - 80, Math.max(80, X(hover))), top: pad.t + 6 }}>
          <b>{c.x[hover]}</b>
          {c.series.map((s) =>
            s.values[hover] !== null ? (
              <div key={s.name}>
                {s.name} <span>{fmtFull(s.values[hover] as number, c.format)}</span>
              </div>
            ) : null,
          )}
          {c.band && c.band.lo[hover] !== null && (
            <div>
              {c.band.name}{' '}
              <span>
                {fmtFull(c.band.lo[hover] as number, c.format)} – {fmtFull(c.band.hi[hover] as number, c.format)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BarChart({ c }: { c: Extract<Chart, { type: 'bars' }> }) {
  const [ref, w] = useWidth<HTMLDivElement>()
  const n = c.labels.length
  const extra = c.extra
  const all = [...c.values, ...(extra?.values ?? []), ...(c.ref ? [c.ref.value] : []), 0]
  const lo = Math.min(...all)
  const hi = Math.max(...all) * 1.08
  const tone = (i: number) => c.tones?.[i] ?? 'accent'
  if (c.horizontal) {
    const row = extra ? 34 : 28
    const labelW = Math.min(200, Math.max(90, Math.max(...c.labels.map((l) => l.length)) * 6.6))
    const h = n * row + 10
    const X = (v: number) => labelW + 10 + ((v - lo) / (hi - lo || 1)) * (w - labelW - 70)
    return (
      <div className="chart" ref={ref}>
        <Legend items={extra ? [{ name: 'Now', tone: 'accent' }, { name: extra.name, tone: 'muted' }] : []} />
        {w > 0 && (
          <svg width={w} height={h} role="img" aria-label={c.labels.join(', ')}>
            {c.labels.map((l, i) => {
              const y = i * row + 4
              const v = c.values[i]
              const bh = extra ? 11 : 16
              return (
                <g key={l}>
                  <text x={labelW} y={y + 13} textAnchor="end">
                    {l.length > 30 ? l.slice(0, 29) + '…' : l}
                  </text>
                  <rect className={`bar t-${tone(i)}`} x={Math.min(X(0), X(v))} y={y + 2} width={Math.max(1.5, Math.abs(X(v) - X(0)))} height={bh} rx={3} />
                  {extra && <rect className="bar extra" x={Math.min(X(0), X(extra.values[i]))} y={y + 15} width={Math.max(1.5, Math.abs(X(extra.values[i]) - X(0)))} height={bh} rx={3} />}
                  <text x={Math.max(X(0), X(v)) + 6} y={y + 14} style={{ fill: 'var(--ink-2)' }}>
                    {fmtFull(v, c.format)}
                  </text>
                </g>
              )
            })}
            {lo < 0 && <line className="zero" x1={X(0)} x2={X(0)} y1={0} y2={h} />}
            {c.ref && <line className="ref" x1={X(c.ref.value)} x2={X(c.ref.value)} y1={0} y2={h} />}
          </svg>
        )}
      </div>
    )
  }
  const h = 230
  const pad = { l: 44, r: 8, t: 14, b: 30 }
  const ticks = niceTicks(Math.min(0, lo), hi)
  const top = Math.max(hi, ticks[ticks.length - 1])
  const bottom = Math.min(0, ticks[0])
  const Y = (v: number) => pad.t + (1 - (v - bottom) / (top - bottom || 1)) * (h - pad.t - pad.b)
  const slot = (w - pad.l - pad.r) / Math.max(1, n)
  const bw = Math.min(46, slot * (extra ? 0.36 : 0.62))
  const rotate = slot < 56 || Math.max(...c.labels.map((l) => Math.min(18, l.length))) * 6.4 > slot - 6
  return (
    <div className="chart" ref={ref}>
      <Legend items={extra ? [{ name: 'Actual', tone: 'accent' }, { name: extra.name, tone: 'muted' }] : c.ref ? [] : []} />
      {w > 0 && (
        <svg width={w} height={h + (rotate ? 40 : 0)} role="img" aria-label={c.labels.join(', ')}>
          <g className="grid">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.l} x2={w - pad.r} y1={Y(t)} y2={Y(t)} />
                <text x={pad.l - 8} y={Y(t) + 4} textAnchor="end">
                  {fmtAxis(t, c.format)}
                </text>
              </g>
            ))}
          </g>
          {c.labels.map((l, i) => {
            const cx = pad.l + slot * (i + 0.5)
            const v = c.values[i]
            return (
              <g key={l + i}>
                <rect className={`bar t-${tone(i)}`} x={extra ? cx - bw - 1 : cx - bw / 2} y={Math.min(Y(v), Y(0))} width={bw} height={Math.max(1, Math.abs(Y(v) - Y(0)))} rx={3}>
                  <title>{`${l}: ${fmtFull(v, c.format)}`}</title>
                </rect>
                {extra && (
                  <rect className="bar extra" x={cx + 1} y={Math.min(Y(extra.values[i]), Y(0))} width={bw} height={Math.max(1, Math.abs(Y(extra.values[i]) - Y(0)))} rx={3}>
                    <title>{`${extra.name}: ${fmtFull(extra.values[i], c.format)}`}</title>
                  </rect>
                )}
                <text x={cx} y={h - 12} textAnchor={rotate ? 'end' : 'middle'} transform={rotate ? `rotate(-35 ${cx} ${h - 12})` : undefined}>
                  {l.length > 18 ? l.slice(0, 17) + '…' : l}
                </text>
              </g>
            )
          })}
          {c.ref && (
            <g>
              <line className="ref" x1={pad.l} x2={w - pad.r} y1={Y(c.ref.value)} y2={Y(c.ref.value)} />
              <text x={w - pad.r} y={Y(c.ref.value) - 5} textAnchor="end">
                {c.ref.label}
              </text>
            </g>
          )}
        </svg>
      )}
    </div>
  )
}

function Table({ c }: { c: Extract<Chart, { type: 'table' }> }) {
  return (
    <div className="table-wrap">
      <table className="tbl">
        <thead>
          <tr>
            {c.columns.map((h, i) => (
              <th key={h} className={c.numeric?.[i] ? 'r' : undefined}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {c.rows.map((r, i) => (
            <tr key={i} className={c.tones?.[i] ? `t-${c.tones[i]}` : undefined}>
              {r.map((v, j) => (
                <td key={j} className={c.numeric?.[j] ? 'r' : typeof v === 'string' && v.length <= 12 && !v.includes(' ') ? 'nw' : undefined}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Heatmap({ c }: { c: Extract<Chart, { type: 'heatmap' }> }) {
  const max = Math.max(...c.values.flat(), 1e-9)
  return (
    <div className="heat" style={{ gridTemplateColumns: `minmax(56px, auto) repeat(${c.cols.length}, minmax(0, 1fr))` }}>
      <span />
      {c.cols.map((col) => (
        <span key={col} className="col">
          {col}
        </span>
      ))}
      {c.rows.map((row, i) => (
        <Row key={row} label={row}>
          {c.values[i].map((v, j) => (
            <span key={j} className="cell" style={{ background: v ? `color-mix(in srgb, var(--accent) ${Math.round(12 + (v / max) * 70)}%, transparent)` : 'var(--inner)', color: v / max > 0.55 ? '#fff' : 'var(--ink-2)' }}>
              {v ? (c.format === 'pct' ? `${v.toFixed(v < 10 ? 1 : 0)}%` : num(v)) : ''}
            </span>
          ))}
        </Row>
      ))}
    </div>
  )
}
const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <>
    <span className="lab">{label}</span>
    {children}
  </>
)

export function ChartView({ chart }: { chart: Chart }) {
  if (chart.type === 'line') return <LineChart c={chart} />
  if (chart.type === 'bars') return <BarChart c={chart} />
  if (chart.type === 'table') return <Table c={chart} />
  return <Heatmap c={chart} />
}
