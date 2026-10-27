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

// The ridge from the logo, drawn wide. Coordinates are in a 1600 x 520 box anchored to the bottom.
const RIDGE =
  'M-40 470 L120 432 L250 398 L360 330 L452 262 L520 302 L572 288 L640 352 L716 262 L770 186 L800 150 L832 186 L888 246 L972 330 L1046 292 L1110 262 L1170 236 L1248 290 L1330 318 L1430 368 L1530 404 L1640 440'
const RIDGE_BACK =
  'M-40 420 L180 356 L340 312 L500 352 L668 270 L800 300 L940 252 L1100 316 L1290 276 L1450 330 L1640 312'

function Ridge() {
  return (
    <svg className="ridge" viewBox="0 0 1600 520" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="r-core" x1="0" x2="1">
          <stop offset="0" stopColor="#3b82f6" stopOpacity="0" />
          <stop offset="0.22" stopColor="#3b82f6" />
          <stop offset="0.5" stopColor="#e0f2fe" />
          <stop offset="0.78" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="r-halo" x1="0" x2="1">
          <stop offset="0" stopColor="#1d4ed8" stopOpacity="0" />
          <stop offset="0.3" stopColor="#2563eb" />
          <stop offset="0.5" stopColor="#60a5fa" />
          <stop offset="0.7" stopColor="#2563eb" />
          <stop offset="1" stopColor="#1d4ed8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="r-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d4ed8" stopOpacity="0.16" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="r-bloom" cx="0.5" cy="1" r="0.55">
          <stop offset="0" stopColor="#2563eb" stopOpacity="0.75" />
          <stop offset="0.45" stopColor="#1e40af" stopOpacity="0.26" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="r-star" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#e0f2fe" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#60a5fa" stopOpacity="0.35" />
          <stop offset="1" stopColor="#60a5fa" stopOpacity="0" />
        </radialGradient>
        <filter id="r-wide" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <filter id="r-near" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <ellipse className="r-bloom" cx="800" cy="560" rx="760" ry="330" fill="url(#r-bloom)" />
      <path className="r-back" d={RIDGE_BACK} />
      <path className="r-fill" d={`${RIDGE} L1640 560 L-40 560 Z`} fill="url(#r-fill)" />
      <path className="r-glow-wide" d={RIDGE} stroke="url(#r-halo)" filter="url(#r-wide)" />
      <path className="r-glow-near" d={RIDGE} stroke="url(#r-halo)" filter="url(#r-near)" />
      <path className="r-core" d={RIDGE} stroke="url(#r-core)" pathLength={1} />
      <circle className="r-star" cx="800" cy="150" r="26" fill="url(#r-star)" />
      <circle className="r-dot" cx="800" cy="150" r="3.2" fill="#fff" />
    </svg>
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
      <div className="wrap methods" data-reveal>
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
    </section>
  )
}
