import { useEffect, useRef, useState } from 'react'
import { about, hero, heroExtra, methods, nav } from '../content'
import { CountUp, order } from '../fx'
import { openContact } from '../contactEvent'
import { useLang } from '../lang'
import { Arrow, Check, Lock } from './Icons'
import { Level } from './Level'

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

// Mini visuals for the three steps in About.
const HIST = [62, 58, 66, 61, 70, 68, 76, 72, 80]
const FORE = [80, 84, 82, 90, 88]
const px = (n: number) => 8 + n * 19
const py = (v: number) => 100 - (v - 52) * 1.9

function FilesVisual() {
  const { t } = useLang()
  return (
    <div className="ab-vis ab-files" aria-hidden="true">
      {about.files.map((f) => (
        <span key={f} className="ab-file" dir="ltr">
          <i className={`ext ext-${f.split('.')[1]}`}>{f.split('.')[1]}</i>
          {f}
          <Lock />
        </span>
      ))}
      <span className="ab-note">{t(about.encrypted)}</span>
    </div>
  )
}

function ChartVisual() {
  const { t } = useLang()
  const hist = HIST.map((v, n) => `${n ? 'L' : 'M'}${px(n)} ${py(v)}`).join(' ')
  const last = HIST.length - 1
  const fore = [HIST[last], ...FORE].map((v, n) => `${n ? 'L' : 'M'}${px(last + n)} ${py(v)}`).join(' ')
  const up = [HIST[last], ...FORE].map((v, n) => `${px(last + n)} ${py(v + n * 2.6)}`)
  const lo = [HIST[last], ...FORE].map((v, n) => `${px(last + n)} ${py(v - n * 2.6)}`).reverse()
  return (
    <div className="ab-vis ab-chart" aria-hidden="true">
      <span className="ab-cap">{t(about.forecast)}</span>
      <svg viewBox="0 0 270 112" preserveAspectRatio="none">
        <path className="ab-band" d={`M${up.join(' L')} L${lo.join(' L')} Z`} />
        <path className="ab-hist" d={hist} />
        <path className="ab-fore" d={fore} />
        <circle className="ab-now" cx={px(last)} cy={py(HIST[last])} r={3.5} />
      </svg>
      <span className="ab-note ok">
        <Check /> {t(about.checked)}
      </span>
    </div>
  )
}

function ReportVisual() {
  const { t } = useLang()
  return (
    <div className="ab-vis ab-report" aria-hidden="true">
      {about.findings.map((f) => (
        <div key={f.text.en} className="ab-find">
          <strong>{t(f.text)}</strong>
          <Level level={f.level} />
        </div>
      ))}
    </div>
  )
}

const VISUALS = [FilesVisual, ChartVisual, ReportVisual]

// Who we are: the first section under the introduction.
export function About() {
  const { t, lang } = useLang()
  const [a, b] = about.heading[lang]
  return (
    <section id="about" className="section about" aria-labelledby="about-h">
      <div className="wrap">
        <header className="sec-head wide">
          <h2 id="about-h" data-reveal>
            {a} <span className="accent">{b}</span>
          </h2>
          <p className="sec-lead" data-reveal style={order(1)}>
            {t({ en: 'A business analysis firm in Cairo for small and medium companies.', ar: 'شركة تحليل أعمال في القاهرة للشركات الصغيرة والمتوسطة.' })}
          </p>
        </header>

        <ol className="ab-steps">
          {about.steps.map((s, n) => {
            const Vis = VISUALS[n]
            return (
              <li key={s.title.en} className="ab-step glass" data-reveal style={order(n)}>
                <Vis />
                <div className="ab-copy">
                  <span className="ab-n">{String(n + 1).padStart(2, '0')}</span>
                  <h3>{t(s.title)}</h3>
                  <p>{t(s.text)}</p>
                </div>
              </li>
            )
          })}
        </ol>

        <ul className="ab-stats">
          {heroExtra.stats.map((x, n) => (
            <li key={x.label.en} data-reveal style={order(n)}>
              <strong>
                {x.value === 256 ? 'AES-' : ''}
                <CountUp to={x.value} />
              </strong>
              <span>{t(x.label)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
