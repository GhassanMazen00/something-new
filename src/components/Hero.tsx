import { Bars, HBars, Line } from '../charts/Charts'
import { CASH, SALES, SALES_FC } from '../charts/serviceCharts'
import { about, hero, heroExtra, methods, nav } from '../content'
import { CountUp, order } from '../fx'
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

// The mountain line from the logo, drawn wide: three peaks that read as a chart.
// Points are in a 1600 x 420 box; labels and the summit dot are placed by percentage.
const RIDGE = [
  [0, 352], [120, 322], [230, 296], [330, 238], [430, 172], [500, 214], [560, 200], [620, 262], [700, 182], [760, 112],
  [800, 72], [845, 118], [900, 166], [990, 252], [1060, 216], [1120, 186], [1180, 158], [1260, 214], [1340, 240],
  [1440, 284], [1530, 304], [1600, 322],
]
const BACK = [
  [0, 300], [200, 244], [360, 206], [520, 252], [680, 156], [800, 196], [940, 142], [1100, 212], [1300, 172], [1460, 232], [1600, 214],
]
const line = (pts: number[][]) => pts.map(([x, y], n) => `${n ? 'L' : 'M'}${x},${y}`).join(' ')
const pct = (x: number, y: number) => ({ left: `${(x / 1600) * 100}%`, top: `${(y / 420) * 100}%` })

function Ridge() {
  const { t } = useLang()
  const tags = [
    { at: [430, 172], label: t({ en: 'Sales, next 6 months', ar: 'المبيعات، 6 أشهر قادمة' }), value: '+8.4%', tone: 'up' },
    { at: [800, 72], label: t({ en: 'Peak month', ar: 'شهر الذروة' }), value: t({ en: 'March', ar: 'مارس' }), tone: '' },
    { at: [1180, 158], label: t({ en: 'Paid twice, recovered', ar: 'دُفع مرتين، تم استرداده' }), value: 'EGP 37,600', tone: 'up' },
  ]
  return (
    <div className="ridge" aria-hidden="true">
      <svg className="ridge-glow" viewBox="0 0 1600 420" preserveAspectRatio="none">
        <path d={line(RIDGE)} />
      </svg>
      <svg className="ridge-art" viewBox="0 0 1600 420" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ridgeStroke" x1="0" x2="1">
            <stop offset="0" stopColor="#1d4ed8" stopOpacity="0.2" />
            <stop offset="0.25" stopColor="#3b82f6" />
            <stop offset="0.5" stopColor="#bae6fd" />
            <stop offset="0.75" stopColor="#3b82f6" />
            <stop offset="1" stopColor="#1d4ed8" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="ridgeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1e40af" stopOpacity="0.45" />
            <stop offset="0.55" stopColor="#0b1530" stopOpacity="0.9" />
            <stop offset="1" stopColor="#070c18" />
          </linearGradient>
          <linearGradient id="backFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1e3a8a" stopOpacity="0.18" />
            <stop offset="1" stopColor="#070c18" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="back-fill" d={`${line(BACK)} L1600,420 L0,420 Z`} fill="url(#backFill)" />
        <path className="back-line" d={line(BACK)} />
        <path className="ridge-fill" d={`${line(RIDGE)} L1600,420 L0,420 Z`} fill="url(#ridgeFill)" />
        <path className="ridge-line" d={line(RIDGE)} stroke="url(#ridgeStroke)" pathLength={1} />
      </svg>
      <span className="summit" style={pct(800, 72)} />
      {tags.map((tag, n) => (
        <span key={n} className={`peak-tag n${n}`} style={pct(tag.at[0], tag.at[1])}>
          <small>{tag.label}</small>
          <b className={tag.tone} dir="auto">
            {tag.value}
          </b>
        </span>
      ))}
    </div>
  )
}

export function Hero() {
  const { t, lang } = useLang()
  const [a, b] = hero.title[lang]
  return (
    <section className="hero" id="top">
      <div className="hero-sky" aria-hidden="true" />
      <div className="wrap hero-inner">
        <a className="pill" href="#privacy" data-reveal>
          <span className="pulse" aria-hidden="true" />
          {t(heroExtra.badge)}
        </a>
        <h1 className="hero-title">
          <span className="line" style={order(0)}>
            <span>{a}</span>
          </span>
          <span className="line" style={order(1)}>
            <span className="accent">{b}</span>
          </span>
        </h1>
        <p className="hero-lead" data-reveal style={order(2)}>
          {t(hero.standfirst)}
        </p>
        <div className="hero-cta" data-reveal style={order(3)}>
          <a className="btn btn-primary" href="#contact">
            {t(nav.book)} <Arrow />
          </a>
          <a className="btn btn-ghost" href="#demos">
            {t({ en: 'See sample reports', ar: 'شاهد نماذج التقارير' })}
          </a>
        </div>
        <ul className="hero-facts" data-reveal style={order(4)}>
          <li>
            <b>6</b> {t({ en: 'departments', ar: 'أقسام' })}
          </li>
          <li>
            <b>32</b> {t({ en: 'services', ar: 'خدمة' })}
          </li>
          <li>
            <b>AES-256</b> {t({ en: 'encryption', ar: 'تشفير' })}
          </li>
          <li>
            <b>{t({ en: 'Arabic', ar: 'العربية' })}</b> {t({ en: 'and English', ar: 'والإنجليزية' })}
          </li>
        </ul>
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
