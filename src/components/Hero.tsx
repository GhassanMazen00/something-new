import { useEffect, useRef, useState } from 'react'
import { Bars, HBars, Line } from '../charts/Charts'
import { CASH, SALES, SALES_FC } from '../charts/serviceCharts'
import { about, hero, heroExtra, methods, nav } from '../content'
import { CountUp, order } from '../fx'
import { openContact } from '../contactEvent'
import { useLang } from '../lang'
import { Arrow, Check, pillarIcons } from './Icons'

function Dashboard() {
  const { t } = useLang()
  const c = heroExtra.card
  return (
    <div className="dash glass" data-reveal style={order(4)}>
      <div className="dash-head">
        <div>
          <strong>{t(c.title)}</strong>
          <span>{t({ en: 'Nile Home Furnishings · example company, made-up data', ar: 'نايل هوم للمفروشات · شركة مثال وبيانات افتراضية' })}</span>
        </div>
        <span className="live">
          <span className="dot" /> {t({ en: 'Updated today', ar: 'محدّث اليوم' })}
        </span>
      </div>

      <div className="dash-grid">
        <div className="kpis">
          <div>
            <span className="k">{t({ en: 'Sales, next 6 months', ar: 'المبيعات، 6 أشهر قادمة' })}</span>
            <strong>
              <CountUp to={390} prefix="EGP " />k
            </strong>
            <span className="delta up" dir="ltr">
              +8.4%
            </span>
          </div>
          <div>
            <span className="k">{t(c.found)}</span>
            <strong>
              <CountUp to={37600} prefix="EGP " />
            </strong>
            <span className="delta down">{t({ en: '2 invoices', ar: 'فاتورتان' })}</span>
          </div>
          <div>
            <span className="k">{t(c.runway)}</span>
            <strong>{t(c.week)}</strong>
            <span className="delta down">{t({ en: 'act by 20 Feb', ar: 'تصرّف قبل 20 فبراير' })}</span>
          </div>
          <div>
            <span className="k">{t({ en: 'Forecast error', ar: 'خطأ التوقع' })}</span>
            <strong>4.2%</strong>
            <span className="delta">{t({ en: 'tested on hidden months', ar: 'مختبر على أشهر مخفية' })}</span>
          </div>
        </div>
        <div className="dash-main">
          <span className="chart-title">{t({ en: 'Monthly sales and forecast, EGP thousands', ar: 'المبيعات الشهرية والتوقع، بالألف جنيه' })}</span>
          <Line
            label="Monthly sales with a six-month forecast"
            series={[
              { values: SALES, area: true },
              { values: SALES_FC, start: 11, dashed: true },
            ]}
            band={{ start: 11, lo: SALES_FC.map((v, k) => v - k * 1.6), hi: SALES_FC.map((v, k) => v + k * 1.6) }}
            xLabels={['Jan 2026', 'Jun 2027']}
            width={900}
            height={320}
            legend={[
              ['main', 'Actual'],
              ['band', 'Forecast range'],
            ]}
          />
        </div>
      </div>

      <div className="dash-row">
        <div>
          <span className="chart-title">{t({ en: 'Cash, next 13 weeks', ar: 'السيولة، 13 أسبوعًا قادمة' })}</span>
          <Line label="Cash for 13 weeks against payroll" series={[{ values: CASH, area: true }]} threshold={{ value: 180, text: 'Payroll', tone: 'bad' }} marks={[{ series: 0, at: 8, tone: 'bad' }]} />
        </div>
        <div>
          <span className="chart-title">{t({ en: 'Sales by branch', ar: 'المبيعات حسب الفرع' })}</span>
          <Bars label="Sales by branch" values={[48, 36, 29, 22, 14]} highlight={[0]} labels={['Nasr', 'Maadi', 'Giza', 'Alex', 'Tanta']} />
        </div>
        <div>
          <span className="chart-title">{t({ en: 'Flagged payments', ar: 'الدفعات المُعلّمة' })}</span>
          <HBars
            label="Flagged payments by reason"
            items={[
              { label: 'Paid twice', value: 9, text: '9', tone: 'bad' },
              { label: 'Near limit', value: 7, text: '7' },
              { label: 'Unusual', value: 5, text: '5', tone: 'soft' },
              { label: 'Shared bank', value: 2, text: '2', tone: 'soft' },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

// The ridge from the logo, drawn wide. Points are fractions of the drawing area (x across, y down),
// turned into pixels for the real size of the screen, so the line is never cropped or stretched.
const RIDGE = [
  [-0.03, 0.9], [0.075, 0.83], [0.156, 0.765], [0.225, 0.635], [0.283, 0.504], [0.325, 0.581], [0.358, 0.554],
  [0.4, 0.677], [0.448, 0.504], [0.481, 0.358], [0.5, 0.29], [0.52, 0.358], [0.555, 0.473], [0.608, 0.635],
  [0.654, 0.562], [0.694, 0.504], [0.731, 0.454], [0.78, 0.558], [0.831, 0.612], [0.894, 0.708], [0.956, 0.777], [1.03, 0.846],
]
const BACK = [
  [-0.03, 0.81], [0.113, 0.685], [0.213, 0.6], [0.313, 0.677], [0.418, 0.52], [0.5, 0.577], [0.588, 0.485],
  [0.688, 0.608], [0.806, 0.531], [0.906, 0.635], [1.03, 0.6],
]
const SUMMIT = RIDGE[10]

function useSize<E extends Element>() {
  const ref = useRef<E>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}

function Ridge() {
  const [ref, { w, h }] = useSize<HTMLDivElement>()
  // On narrow screens draw the range wider than the screen and let the sides run off, so the peaks keep their shape.
  const span = Math.max(w, 900)
  const off = (w - span) / 2
  const d = (pts: number[][]) => pts.map(([x, y], n) => `${n ? 'L' : 'M'}${(off + x * span).toFixed(1)} ${(y * h).toFixed(1)}`).join(' ')
  const main = d(RIDGE)
  const back = d(BACK)
  const sx = off + SUMMIT[0] * span
  const sy = SUMMIT[1] * h
  return (
    <div className="ridge" ref={ref} aria-hidden="true">
      {w > 0 && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          <defs>
            <linearGradient id="r-core" x1="0" x2="1">
              <stop offset="0" className="st-edge" stopOpacity="0" />
              <stop offset="0.2" className="st-edge" />
              <stop offset="0.5" className="st-peak" />
              <stop offset="0.8" className="st-edge" />
              <stop offset="1" className="st-edge" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="r-halo" x1="0" x2="1">
              <stop offset="0" className="st-halo" stopOpacity="0" />
              <stop offset="0.3" className="st-halo" />
              <stop offset="0.5" className="st-halo-peak" />
              <stop offset="0.7" className="st-halo" />
              <stop offset="1" className="st-halo" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="r-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" className="st-fill" />
              <stop offset="0.7" className="st-fill" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="r-bloom" cx="0.5" cy="1" r="0.6">
              <stop offset="0" className="st-bloom" />
              <stop offset="0.5" className="st-bloom" stopOpacity="0.25" />
              <stop offset="1" className="st-bloom" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="r-star" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" className="st-peak" />
              <stop offset="0.35" className="st-halo-peak" stopOpacity="0.4" />
              <stop offset="1" className="st-halo-peak" stopOpacity="0" />
            </radialGradient>
            <filter id="r-wide" x="-20%" y="-60%" width="140%" height="220%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
            <filter id="r-near" x="-20%" y="-60%" width="140%" height="220%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
            <filter id="r-spark" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <ellipse className="r-bloom" cx={w / 2} cy={h * 1.08} rx={w * 0.48} ry={h * 0.75} fill="url(#r-bloom)" />
          <path className="r-back" d={back} />
          <path className="r-flow" d={back} pathLength={1} />
          <path className="r-fill" d={`${main} L${off + span * 1.03} ${h} L${off - span * 0.03} ${h} Z`} fill="url(#r-fill)" />
          <path className="r-glow-wide" d={main} stroke="url(#r-halo)" filter="url(#r-wide)" />
          <path className="r-glow-near" d={main} stroke="url(#r-halo)" filter="url(#r-near)" />
          <path className="r-core" d={main} stroke="url(#r-core)" pathLength={1} />
          <path className="r-comet" d={main} pathLength={1} filter="url(#r-spark)" />
          <path className="r-comet late" d={main} pathLength={1} filter="url(#r-spark)" />
          <circle className="r-star" cx={sx} cy={sy} r={26} fill="url(#r-star)" />
          <circle className="r-dot" cx={sx} cy={sy} r={3.2} />
        </svg>
      )}
    </div>
  )
}

function Methods() {
  const { t } = useLang()
  return (
    <div className="hero-methods">
      <span>{t({ en: 'Built on trusted, published methods', ar: 'مبني على طرق موثوقة ومنشورة' })}</span>
      <div className="marquee" dir="ltr">
        <div className="marquee-track" aria-hidden="true">
          {[...methods, ...methods].map((m, k) => (
            <span key={k}>{m}</span>
          ))}
        </div>
        <span className="sr-only">{methods.join(', ')}</span>
      </div>
    </div>
  )
}

export function Hero() {
  const { t, lang } = useLang()
  const [a, b] = hero.title[lang]
  return (
    <section className="hero" id="top">
      <div className="wrap hero-inner">
        <h1 className="hero-title">
          <span className="line" style={order(0)}>
            <span>{a}</span>
          </span>
          <span className="line" style={order(1)}>
            <span className="accent">{b}</span>
          </span>
        </h1>
        <p className="hero-lead" data-reveal style={order(2)}>
          {t(hero.short)}
        </p>
        <div className="hero-cta" data-reveal style={order(3)}>
          <button type="button" className="btn btn-primary" onClick={openContact}>
            {t(nav.book)}
          </button>
          <a className="btn btn-quiet" href="#services">
            {t({ en: 'Explore services', ar: 'استكشف خدماتنا' })} <Arrow />
          </a>
        </div>
      </div>
      <Ridge />
      <Methods />
    </section>
  )
}

// Who we are: the first section under the introduction.
export function About() {
  const { t } = useLang()
  return (
    <section id="about" className="section about" aria-labelledby="about-h">
      <div className="wrap">
        <header className="sec-head wide">
          <h2 id="about-h" data-reveal>
            {t(about.heading)}
          </h2>
          <div>
            <p className="sec-lead" data-reveal style={order(1)}>
              {t(about.text)}
            </p>
            <ul className="about-points" data-reveal style={order(2)}>
              {about.points.map((p) => (
                <li key={p.en}>
                  <span className="tick">
                    <Check />
                  </span>
                  {t(p)}
                </li>
              ))}
            </ul>
          </div>
        </header>

        <Dashboard />

        <ul className="pillars">
          {about.pillars.map((p, n) => (
            <li key={p.title.en} className="pillar glass" data-reveal style={order(n)}>
              <span className="pillar-ico">{pillarIcons[n]}</span>
              <h3>{t(p.title)}</h3>
              <p>{t(p.text)}</p>
              <div className="pillar-stat">
                <strong dir="ltr">{p.stat}</strong>
                <span>{t(p.note)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
