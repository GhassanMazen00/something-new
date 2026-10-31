import { useEffect, useState } from 'react'
import { serviceCharts } from '../charts/serviceCharts'
import { servicesSection, type Service } from '../content'
import { openContact } from '../contactEvent'
import { depts } from '../depts'
import { examples, topServices } from '../examples'
import { order } from '../fx'
import { useLang } from '../lang'
import { Arrow } from './Icons'

const all = depts.flatMap((d) => d.services.map((s) => ({ s, dept: d })))

function ServiceCard({ s, deptName, full }: { s: Service; deptName: string; full?: boolean }) {
  const { t } = useLang()
  const { labels } = servicesSection
  const ex = examples[s.name.en]
  return (
    <article className={`svc card${full ? ' svc-full' : ''}`} data-reveal>
      <div className="svc-top">
        <span className="svc-dept">{deptName}</span>
        <h3>{t(s.name)}</h3>
        <p className="svc-get">{t(s.get)}</p>
      </div>
      <div className="svc-chart">{serviceCharts[s.name.en]}</div>
      {ex && (
        <p className="svc-example">
          <b>{t({ en: 'Example', ar: 'مثال' })}</b>
          {t(ex)}
        </p>
      )}
      <dl className="svc-facts">
        <div>
          <dt>{t(labels.method)}</dt>
          <dd>{t(s.method)}</dd>
        </div>
        {full && (
          <>
            <div>
              <dt>{t(labels.data)}</dt>
              <dd>{t(s.data)}</dd>
            </div>
            <div>
              <dt>{t(labels.missing)}</dt>
              <dd>{t(s.missing)}</dd>
            </div>
          </>
        )}
      </dl>
    </article>
  )
}

// The home page shows six of the most asked-for services and sends the rest to the services page.
export function Services() {
  const { t } = useLang()
  const top = topServices.map((name) => all.find((x) => x.s.name.en === name)!)
  return (
    <section id="services" className="section services" aria-labelledby="services-h">
      <div className="wrap">
        <header className="sec-head wide">
          <h2 id="services-h" data-reveal style={order(1)}>
            {t({ en: 'What we do most.', ar: 'أكثر ما نقدمه.' })} <span className="accent">{t({ en: 'And 26 more.', ar: 'و26 خدمة أخرى.' })}</span>
          </h2>
          <p className="sec-lead" data-reveal style={order(2)}>
            {t({
              en: 'Six of our 32 services, each with the kind of answer it gives. Every one runs on proven methods and is checked by a person.',
              ar: 'ست من خدماتنا الـ32، ومع كل منها نوع الإجابة التي تقدمها. وكلها مبنية على طرق مثبتة ويراجعها شخص.',
            })}
          </p>
        </header>
        <div className="svc-grid">
          {top.map(({ s, dept }) => (
            <ServiceCard key={s.name.en} s={s} deptName={t(dept.name)} />
          ))}
        </div>
        <div className="explore" data-reveal>
          <a className="btn btn-primary btn-lg" href="./services.html">
            {t({ en: 'Explore all 32 services', ar: 'استكشف الخدمات الـ32' })} <Arrow />
          </a>
        </div>
      </div>
    </section>
  )
}

// The services page: every service, department by department, each with an example.
export function AllServices() {
  const { t } = useLang()
  const [active, setActive] = useState(depts[0].id)
  useEffect(() => {
    const on = () => {
      const line = window.innerHeight * 0.3
      let cur = depts[0].id
      for (const d of depts) {
        const el = document.getElementById(d.id)
        if (el && el.getBoundingClientRect().top <= line) cur = d.id
      }
      setActive(cur)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <>
      <section className="section page-top" id="top">
        <div className="wrap">
          <a className="back-link" href="./">
            <Arrow /> {t({ en: 'Back to home', ar: 'العودة للرئيسية' })}
          </a>
          <h1 className="page-title" data-reveal>
            {t({ en: 'All 32 services,', ar: 'كل الخدمات الـ32،' })} <span className="accent">{t({ en: 'explained.', ar: 'بالتفصيل.' })}</span>
          </h1>
          <p className="sec-lead" data-reveal style={order(1)}>
            {t({
              en: 'Each service shows what you get, a worked example, the method behind it, the files it needs and what we do if you don’t have them. Examples use made-up companies.',
              ar: 'كل خدمة توضح ما تحصل عليه، ومثالًا عمليًا، والطريقة وراءها، والملفات التي تحتاجها، وما نفعله إن لم تكن لديك. الأمثلة لشركات افتراضية.',
            })}
          </p>
        </div>
      </section>
      <nav className="dept-nav" aria-label={t({ en: 'Departments', ar: 'الأقسام' })}>
        <div className="wrap">
          {depts.map((d) => (
            <a key={d.id} href={`#${d.id}`} aria-current={active === d.id ? 'location' : undefined}>
              {t(d.name)} <span>{d.services.length}</span>
            </a>
          ))}
        </div>
      </nav>
      {depts.map((d) => (
        <section key={d.id} id={d.id} className="section dept-block" aria-labelledby={`h-${d.id}`}>
          <div className="wrap">
            <h2 id={`h-${d.id}`} className="dept-title" data-reveal>
              {t(d.name)} <span className="muted">{d.services.length}</span>
            </h2>
            <div className="svc-grid svc-grid-full">
              {d.services.map((s) => (
                <ServiceCard key={s.name.en} s={s} deptName={t(d.name)} full />
              ))}
            </div>
          </div>
        </section>
      ))}
      <section className="section page-cta">
        <div className="wrap">
          <div className="page-cta-card card" data-reveal>
            <h2>{t({ en: 'Not sure which you need?', ar: 'لست متأكدًا مما تحتاجه؟' })}</h2>
            <p>{t({ en: 'Tell us your question on a free call and we’ll pick the services that answer it.', ar: 'أخبرنا بسؤالك في مكالمة مجانية وسنختار الخدمات التي تجيب عنه.' })}</p>
            <div className="page-cta-actions">
              <button type="button" className="btn btn-primary" onClick={openContact}>
                {t({ en: 'Book a free call', ar: 'احجز مكالمة مجانية' })}
              </button>
              <a className="btn btn-quiet" href="./#checker">
                {t({ en: 'See what your files allow', ar: 'اعرف ما تتيحه ملفاتك' })} <Arrow />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
