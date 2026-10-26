import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { departments, nav, servicesSection } from '../content'
import { useLang } from '../lang'

const order = (n: number) => ({ '--i': n }) as CSSProperties

// Shown in the order owners think about their business.
const ORDER = ['data', 'marketing', 'sales', 'accounting', 'people', 'market']
const depts = ORDER.map((id) => departments.find((d) => d.id === id)!)

export function Services() {
  const { t, lang } = useLang()
  const [active, setActive] = useState('accounting')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const labels = servicesSection.labels
  const [soft, strong] = servicesSection.heading[lang]

  const onKey = (e: KeyboardEvent, index: number) => {
    const forward = ['ArrowDown', lang === 'ar' ? 'ArrowLeft' : 'ArrowRight']
    const back = ['ArrowUp', lang === 'ar' ? 'ArrowRight' : 'ArrowLeft']
    let next = -1
    if (forward.includes(e.key)) next = (index + 1) % depts.length
    if (back.includes(e.key)) next = (index - 1 + depts.length) % depts.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = depts.length - 1
    if (next < 0) return
    e.preventDefault()
    setActive(depts[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="services" className="services wrap" aria-labelledby="services-h">
      <div className="services-top">
        <h2 id="services-h" className="services-head" data-reveal>
          <span className="soft">{soft}</span> {strong}
        </h2>
        <div className="services-aside">
          <p className="services-intro" data-reveal style={order(1)}>
            {t(servicesSection.intro)}
          </p>
          <a className="button" href="#contact" data-reveal style={order(2)}>
            {t(nav.book)}
          </a>
        </div>
      </div>

      <div className="services-body">
        <div className="dept-tabs" role="tablist" aria-label={t(nav.services)} aria-orientation="vertical">
          {depts.map((d, n) => (
            <button
              key={d.id}
              ref={(el) => {
                tabRefs.current[n] = el
              }}
              type="button"
              role="tab"
              id={`tab-${d.id}`}
              aria-selected={active === d.id}
              aria-controls={`panel-${d.id}`}
              tabIndex={active === d.id ? 0 : -1}
              className="dept-tab"
              onClick={() => setActive(d.id)}
              onKeyDown={(e) => onKey(e, n)}
            >
              <span className="dept-name">{t(d.name)}</span>
              <span className="dept-count">{t(servicesSection.count).replace('{n}', String(d.services.length))}</span>
            </button>
          ))}
        </div>

        <div className="panels">
        {depts.map((d) => (
          <div key={d.id} id={`panel-${d.id}`} role="tabpanel" aria-labelledby={`tab-${d.id}`} hidden={active !== d.id} className="bands" tabIndex={0}>
            {d.services.map((s, n) => (
              <article key={s.name.en} className="band-row" data-reveal style={order(n)}>
                <div>
                  <h3>{t(s.name)}</h3>
                  <p className="get">{t(s.get)}</p>
                  <p className="method">
                    {t(labels.method)}: {t(s.method)}
                  </p>
                </div>
                <div>
                  <span className="label">{t(labels.data)}</span>
                  <p className="value">{t(s.data)}</p>
                </div>
                <div>
                  <span className="label">{t(labels.missing)}</span>
                  <p className="value">{t(s.missing)}</p>
                </div>
              </article>
            ))}
          </div>
        ))}
        </div>
      </div>
    </section>
  )
}
