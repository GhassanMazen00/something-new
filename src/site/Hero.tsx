// First screen: the statement on the left, a live piece of a Clearline analysis on the right, and the glowing ridge
// from the logo running under both. The tabs switch between four of the questions we answer most; the panel moves on
// by itself until someone picks one.

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { T } from '../content'
import { openContact } from '../contactEvent'
import { useLang } from '../lang'
import { heroCopy as h, ui } from './copy'
import { Ridge } from './Ridge'

type Tab = 'forecast' | 'twice' | 'cash' | 'leaving'
const TABS: Tab[] = ['forecast', 'twice', 'cash', 'leaving']

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Monthly sales in EGP millions: 18 months that happened, then six forecast with a low and high case.
const ACTUAL = [2.9, 3.1, 3.6, 3.3, 3.0, 2.8, 2.9, 3.2, 3.4, 3.7, 3.5, 3.9, 3.4, 3.6, 4.2, 3.8, 3.5, 3.3]
const POINT = [3.4, 3.7, 4.1, 4.4, 3.9, 3.6]
const SPREAD = [0.15, 0.2, 0.26, 0.31, 0.34, 0.37]

function Forecast() {
  const { t } = useLang()
  const W = 600
  const H = 210
  const all = [...ACTUAL, ...POINT]
  const lo = 2.2
  const hi = 5
  const x = (i: number) => 8 + (i / (all.length - 1)) * (W - 16)
  const y = (v: number) => H - 14 - ((v - lo) / (hi - lo)) * (H - 28)
  const path = (vals: number[], from: number) => vals.map((v, i) => `${i ? 'L' : 'M'}${x(i + from).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const start = ACTUAL.length - 1
  const band =
    POINT.map((v, i) => `${i ? 'L' : 'M'}${x(start + 1 + i).toFixed(1)} ${y(v + SPREAD[i]).toFixed(1)}`).join(' ') +
    POINT.slice()
      .reverse()
      .map((v, j) => {
        const i = POINT.length - 1 - j
        return ` L${x(start + 1 + i).toFixed(1)} ${y(v - SPREAD[i]).toFixed(1)}`
      })
      .join('') +
    ` L${x(start).toFixed(1)} ${y(ACTUAL[start]).toFixed(1)} Z`
  const peak = start + 1 + POINT.indexOf(Math.max(...POINT))
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t({ en: 'Monthly sales with a six-month forecast', ar: 'المبيعات الشهرية مع توقع لستة أشهر' })}>
        {[3, 4, 5].map((v) => (
          <line key={v} className="grid" x1="0" x2={W} y1={y(v)} y2={y(v)} />
        ))}
        <path className="band" d={band} />
        <path className="line draw" d={path(ACTUAL, 0)} pathLength={1} />
        <path className="line fc draw late" d={`M${x(start)} ${y(ACTUAL[start])} ` + path(POINT, start + 1).slice(1).replace(/^/, 'L')} pathLength={1} />
        <circle className="dot pop" cx={x(peak)} cy={y(POINT[peak - start - 1])} r="5" />
      </svg>
      <figcaption>
        <span className="key k-actual">{t(h.forecast.actual)}</span>
        <span className="key k-fc">{t(h.forecast.predicted)}</span>
      </figcaption>
    </figure>
  )
}

function Twice() {
  const { t, lang } = useLang()
  return (
    <table className="flags">
      <thead>
        <tr>
          {h.twice.cols[lang].map((c) => (
            <th key={c}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {h.twice.rows.map((r, i) => (
          <tr key={i} className={i < 2 ? 'hit' : undefined} style={{ ['--i' as string]: i }}>
            <td>{r[0]}</td>
            <td>{r[1]}</td>
            <td className="num">{r[2]}</td>
            <td>{t(r[3])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Thirteen weeks of closing cash, EGP thousands.
const CASH = [1350, 1190, 1060, 980, 820, 690, 470, 210, -90, -212, -140, 60, 240]

function Cash() {
  const { t } = useLang()
  const max = Math.max(...CASH.map(Math.abs))
  const low = -Math.min(...CASH)
  return (
    <figure className="chart">
      <div className="weeks" role="img" aria-label={t({ en: 'Cash at the end of each of the next 13 weeks; it falls below zero in week 9', ar: 'السيولة في نهاية كل أسبوع من الأسابيع الـ13 القادمة، وتنخفض تحت الصفر في الأسبوع 9' })}>
        {CASH.map((v, i) => (
          <div key={i} className="wk" style={{ ['--i' as string]: i, gridTemplateRows: `${max}fr ${low}fr auto` }}>
            <span className="up">{v > 0 && <i style={{ height: `${(v / max) * 100}%` }} />}</span>
            <span className="down">{v < 0 && <i style={{ height: `${(-v / low) * 100}%` }} />}</span>
            <small className={v < 0 ? 'neg' : undefined}>
              {t(h.cash.week)}
              {i + 1}
            </small>
          </div>
        ))}
      </div>
    </figure>
  )
}

function Leaving() {
  const { t } = useLang()
  const max = Math.max(...h.leaving.groups.map((g) => g.v))
  return (
    <ul className="groups">
      {h.leaving.groups.map((g, i) => (
        <li key={i} className={i === 3 ? 'hit' : undefined} style={{ ['--i' as string]: i }}>
          <span>{t(g.k)}</span>
          <span className="bar-track">
            <i style={{ width: `${(g.v / max) * 100}%` }} />
          </span>
          <b className="num">{g.v.toLocaleString('en-US')}</b>
        </li>
      ))}
    </ul>
  )
}

const VIEW = { forecast: Forecast, twice: Twice, cash: Cash, leaving: Leaving }

function Panel() {
  const { t } = useLang()
  const [tab, setTab] = useState<Tab>('forecast')
  const [auto, setAuto] = useState(true)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  useEffect(() => {
    if (!auto || reduced()) return
    const id = window.setTimeout(() => setTab(TABS[(TABS.indexOf(tab) + 1) % TABS.length]), 6500)
    return () => window.clearTimeout(id)
  }, [tab, auto])
  const pick = (next: Tab) => {
    setAuto(false)
    setTab(next)
  }
  const onKey = (e: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 }[e.key]
    if (!step) return
    e.preventDefault()
    const dir = document.documentElement.dir === 'rtl' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') ? -step : step
    const next = TABS[(TABS.indexOf(tab) + dir + TABS.length) % TABS.length]
    pick(next)
    tabs.current[TABS.indexOf(next)]?.focus()
  }
  const data = h[tab]
  const View = VIEW[tab]
  return (
    <div className="panel" data-ui aria-label={t(h.panelLabel)} role="group">
      <div className="tabs" role="tablist" onKeyDown={onKey}>
        {TABS.map((id, i) => (
          <button
            key={id}
            ref={(el) => {
              tabs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls="hero-view"
            tabIndex={tab === id ? 0 : -1}
            onClick={() => pick(id)}
          >
            {t(h.tabs[id])}
            {tab === id && auto && <span className="timer" aria-hidden="true" />}
          </button>
        ))}
      </div>
      <div className="view" id="hero-view" role="tabpanel" aria-labelledby={`tab-${tab}`} key={tab}>
        <dl className="kpis">
          {data.kpis.map((k) => (
            <div key={t(k.k)}>
              <dt>{t(k.k)}</dt>
              <dd className="num">{typeof k.v === 'string' ? k.v : t(k.v as T)}</dd>
            </div>
          ))}
        </dl>
        <View />
        <p className="finding">{t(data.finding)}</p>
      </div>
      <p className="panel-note">{t(ui.example)}</p>
    </div>
  )
}

export function Hero() {
  const { t, lang } = useLang()
  return (
    <section className="hero" id="top">
      <Ridge />
      <div className="hero-text">
        <h1>
          {h.title[lang].map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <p className="lead">{t(h.lead)}</p>
        <div className="actions">
          <button type="button" className="btn" onClick={openContact}>
            {t(ui.book)}
          </button>
          <a className="link" href="#services">
            {t(ui.allServices)}
          </a>
        </div>
      </div>
      <div className="hero-panel">
        <Panel />
      </div>
    </section>
  )
}
