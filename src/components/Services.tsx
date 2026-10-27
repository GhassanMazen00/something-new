import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { serviceCharts } from '../charts/serviceCharts'
import { nav, servicesSection } from '../content'
import { DEPT_EVENT, depts } from '../depts'
import { order } from '../fx'
import { useLang } from '../lang'


export function Services() {
  const { t, lang } = useLang()
  const [active, setActive] = useState('accounting')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const { labels } = servicesSection
  const [soft, strong] = servicesSection.heading[lang]
  const dept = depts.find((d) => d.id === active)!

  // The side menu's department links open the matching tab.
  useEffect(() => {
    const on = (e: Event) => setActive((e as CustomEvent<string>).detail)
    window.addEventListener(DEPT_EVENT, on)
    return () => window.removeEventListener(DEPT_EVENT, on)
  }, [])

  const onKey = (e: KeyboardEvent, n: number) => {
    const back = lang === 'ar' ? 'ArrowRight' : 'ArrowLeft'
    const fwd = lang === 'ar' ? 'ArrowLeft' : 'ArrowRight'
    let next = -1
    if (e.key === fwd) next = (n + 1) % depts.length
    else if (e.key === back) next = (n - 1 + depts.length) % depts.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = depts.length - 1
    if (next < 0) return
    e.preventDefault()
    setActive(depts[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="services" className="section services" aria-labelledby="services-h">
      <div className="wrap">
        <header className="sec-head wide">
          <h2 id="services-h" data-reveal style={order(1)}>
            {soft} <span className="accent">{strong}</span>
          </h2>
          <p className="sec-lead" data-reveal style={order(2)}>
            {t(servicesSection.intro)}
          </p>
        </header>

        <div className="tabs-wrap" data-reveal>
          <div className="tabs" role="tablist" aria-label={t(nav.services)}>
            {depts.map((d, n) => (
              <button
                key={d.id}
                ref={(el) => {
                  tabRefs.current[n] = el
                }}
                id={`tab-${d.id}`}
                role="tab"
                type="button"
                aria-selected={active === d.id}
                aria-controls="dept-panel"
                tabIndex={active === d.id ? 0 : -1}
                onClick={() => setActive(d.id)}
                onKeyDown={(e) => onKey(e, n)}
              >
                {t(d.name)}
                <span className="tab-count">{d.services.length}</span>
              </button>
            ))}
          </div>
        </div>

        <div id="dept-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="svc-grid" key={active}>
          {dept.services.map((s, n) => (
            <article key={s.name.en} className="svc card" style={order(n)}>
              <div className="svc-top">
                <span className="svc-n">{String(n + 1).padStart(2, '0')}</span>
                <h3>{t(s.name)}</h3>
                <p className="svc-get">{t(s.get)}</p>
              </div>
              <div className="svc-chart">{serviceCharts[s.name.en]}</div>
              <dl className="svc-facts">
                <div>
                  <dt>{t(labels.method)}</dt>
                  <dd>{t(s.method)}</dd>
                </div>
                <div>
                  <dt>{t(labels.data)}</dt>
                  <dd>{t(s.data)}</dd>
                </div>
                <div className="alt">
                  <dt>{t(labels.missing)}</dt>
                  <dd>{t(s.missing)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
