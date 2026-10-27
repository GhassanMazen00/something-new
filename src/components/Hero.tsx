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

export function Hero() {
  const { t, lang } = useLang()
  const [a, b] = hero.title[lang]
  return (
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden="true">
        <span className="horizon" />
      </div>
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
        <Dashboard />
      </div>
    </section>
  )
}

// Who we are: the first section under the introduction.
export function About() {
  const { t } = useLang()
  return (
    <section id="about" className="section about" aria-labelledby="about-h">
      <div className="wrap about-grid">
        <div className="about-copy">
          <h2 id="about-h" data-reveal>
            {t(about.heading)}
          </h2>
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
          <dl className="stats" data-reveal style={order(3)}>
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
