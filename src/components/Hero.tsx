import { Bars, Line } from '../charts/Charts'
import { CASH, SALES, SALES_FC } from '../charts/serviceCharts'
import { hero, heroExtra, methods, nav } from '../content'
import { CountUp, order } from '../fx'
import { useLang } from '../lang'
import { Arrow } from './Icons'

function Dashboard() {
  const { t } = useLang()
  const c = heroExtra.card
  return (
    <div className="dash card" data-reveal style={order(2)}>
      <div className="dash-head">
        <div>
          <strong>{t(c.title)}</strong>
          <span>{t({ en: 'Example company · made-up data', ar: 'شركة مثال · بيانات افتراضية' })}</span>
        </div>
        <span className="live">
          <span className="dot" /> {t({ en: 'Updated today', ar: 'محدّث اليوم' })}
        </span>
      </div>
      <div className="kpis">
        <div>
          <span className="k">{t({ en: 'Sales, next 6 months', ar: 'المبيعات، 6 أشهر قادمة' })}</span>
          <strong>
            <CountUp to={390} prefix="EGP " />k
          </strong>
          <span className="delta up" dir="ltr">+8.4%</span>
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
      </div>
      <div className="dash-main">
        <span className="chart-title">{t({ en: 'Monthly sales and forecast (EGP thousands)', ar: 'المبيعات الشهرية والتوقع (بالألف جنيه)' })}</span>
        <Line
          label="Monthly sales with a six-month forecast"
          series={[
            { values: SALES, area: true },
            { values: SALES_FC, start: 11, dashed: true },
          ]}
          band={{ start: 11, lo: SALES_FC.map((v, k) => v - k * 1.6), hi: SALES_FC.map((v, k) => v + k * 1.6) }}
          xLabels={['Jan 2026', 'Jun 2027']}
          width={560}
          height={210}
          legend={[
            ['main', 'Actual'],
            ['band', 'Forecast range'],
          ]}
        />
      </div>
      <div className="dash-row">
        <div>
          <span className="chart-title">{t({ en: 'Cash, 13 weeks', ar: 'السيولة، 13 أسبوعًا' })}</span>
          <Line label="Cash for 13 weeks against payroll" series={[{ values: CASH, area: true }]} threshold={{ value: 180, text: 'Payroll', tone: 'bad' }} marks={[{ series: 0, at: 8, tone: 'bad' }]} />
        </div>
        <div>
          <span className="chart-title">{t({ en: 'Sales by branch', ar: 'المبيعات حسب الفرع' })}</span>
          <Bars label="Sales by branch" values={[48, 36, 29, 22, 14]} highlight={[0]} labels={['Nasr', 'Maadi', 'Giza', 'Alex', 'Tanta']} />
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
              <span className="accent">{b}.</span>
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
        <Dashboard />
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
