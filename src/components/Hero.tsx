import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { brand, hero, heroExtra, methods, nav, showcase } from '../content'
import { CountUp, order, reducedMotion } from '../fx'
import { useLang } from '../lang'
import { Arrow, Check, Lock } from './Icons'

const LINKS = ['privacy', 'services', 'checker', 'demos', 'process', 'faq'] as const

export function Nav() {
  const { t, lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 24)
      const max = document.documentElement.scrollHeight - window.innerHeight
      barRef.current?.style.setProperty('--p', String(max > 0 ? window.scrollY / max : 0))
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const label = (id: (typeof LINKS)[number]) =>
    t(id === 'demos' ? nav.demo : id === 'checker' ? nav.checker : nav[id])

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="nav-inner glass">
        <a className="logo" href="#top" aria-label={t(brand)}>
          <span className="logo-mark" aria-hidden="true" />
          <span>{t(brand)}</span>
        </a>
        <nav className="nav-links" aria-label={t(nav.menu)}>
          {LINKS.map((id) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
              {label(id)}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <button
            type="button"
            className="lang-btn"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            aria-label={t(nav.switchLabel)}
            lang={lang === 'ar' ? 'en' : 'ar'}
          >
            {t(nav.switchTo)}
          </button>
          <a className="btn btn-primary btn-sm" href="#contact">
            {t(nav.book)}
          </a>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-label={open ? t(nav.close) : t(nav.menu)}
            onClick={() => setOpen(!open)}
          >
            <span />
            <span />
          </button>
        </div>
        <div className="progress" ref={barRef} aria-hidden="true" />
      </div>
    </header>
  )
}

const CASH = [640, 590, 610, 520, 470, 430, 360, 250, 160, 210, 300, 340, 380]
const PAYROLL = 180

function CashChart() {
  const W = 360
  const H = 130
  const x = (i: number) => (i / (CASH.length - 1)) * W
  const y = (v: number) => H - 8 - (v / 700) * (H - 20)
  const line = CASH.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${line} L${W},${H} L0,${H} Z`
  return (
    <svg className="cash" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="cashStroke" x1="0" x2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="0.55" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="cashFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="cash-area" d={area} fill="url(#cashFill)" />
      <line x1="0" x2={W} y1={y(PAYROLL)} y2={y(PAYROLL)} stroke="#fb7185" strokeDasharray="5 5" strokeOpacity="0.7" vectorEffect="non-scaling-stroke" />
      <path className="cash-line" d={line} pathLength={1} fill="none" stroke="url(#cashStroke)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      <circle className="cash-dot" cx={x(8)} cy={y(CASH[8])} r="5" fill="#fb7185" />
    </svg>
  )
}

const ROWS = [
  ['INV-2287', 'C-0041', '18,400', false],
  ['INV-2288', 'C-0107', '6,250', false],
  ['INV-2290', 'C-0041', '18,400', true],
  ['INV-2292', 'C-0330', '4,780', false],
] as const

function HeroCard() {
  const { t } = useLang()
  const c = heroExtra.card
  const tiltRef = useRef<HTMLDivElement>(null)

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || reducedMotion()) return
    const el = tiltRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `rotateY(${px * 12}deg) rotateX(${-py * 10}deg)`
  }
  const onLeave = () => {
    if (tiltRef.current) tiltRef.current.style.transform = ''
  }

  return (
    <div className="hero-visual" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="tilt" ref={tiltRef}>
        <div className="hero-card glass">
          <div className="hc-head">
            <span>{t(c.title)}</span>
            <span className="live">
              <span className="dot" /> LIVE
            </span>
          </div>
          <div className="hc-kpis">
            <div>
              <span className="k">{t(c.found)}</span>
              <strong className="bad">
                <CountUp to={37600} prefix="EGP " />
              </strong>
            </div>
            <div>
              <span className="k">{t(c.runway)}</span>
              <strong className="warn">{t(c.week)}</strong>
            </div>
            <div>
              <span className="k">{t(c.scanned)}</span>
              <strong>
                <CountUp to={4812} />
              </strong>
            </div>
          </div>
          <CashChart />
          <div className="hc-table" dir="ltr">
            <span className="scanbar" aria-hidden="true" />
            {ROWS.map(([inv, cust, amt, dup]) => (
              <div key={inv} className={`hc-row${dup ? ' dup' : ''}`}>
                <span>{inv}</span>
                <span>{cust}</span>
                <span className="r">{amt}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="float-chip glass chip-a">
          <span className="ico ok">
            <Check />
          </span>
          {t(showcase.confidence)}
        </div>
        <div className="float-chip glass chip-b">
          <span className="ico">
            <Lock />
          </span>
          <span dir="ltr">Hany Adel → C-0041</span>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  const { t, lang } = useLang()
  const [a, b] = hero.title[lang]
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <a className="pill" href="#privacy" data-reveal>
            <span className="pulse" aria-hidden="true" />
            {t(heroExtra.badge)}
          </a>
          <h1 className="hero-title">
            <span className="line" style={order(0)}>
              <span>{a}</span>
            </span>
            <span className="line" style={order(1)}>
              <span className="grad-text">{b}.</span>
            </span>
          </h1>
          <p className="hero-lead" data-reveal style={order(2)}>
            {t(hero.standfirst)}
          </p>
          <div className="hero-cta" data-reveal style={order(3)}>
            <a className="btn btn-primary" href="#contact">
              {t(nav.book)} <Arrow />
            </a>
            <a className="btn btn-glass" href="#demos">
              {t(heroExtra.try)}
            </a>
          </div>
          <dl className="stats" data-reveal style={order(4)}>
            {heroExtra.stats.map((s) => (
              <div key={s.label.en}>
                <dt>
                  <CountUp to={s.value} duration={1100} />
                </dt>
                <dd>{t(s.label)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <HeroCard />
      </div>
      <Marquee />
    </section>
  )
}

function Marquee() {
  const items = [...methods, ...methods]
  return (
    <div className="marquee" dir="ltr" aria-label={methods.join(', ')}>
      <div className="marquee-track" aria-hidden="true">
        {items.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
    </div>
  )
}
