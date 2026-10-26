import type { CSSProperties } from 'react'
import { privacy } from '../content'
import { Mashrabiya } from '../fragments/Drawings'
import { BeforeAfter } from '../fragments/Report'
import { useLang } from '../lang'

const order = (n: number) => ({ '--i': n }) as CSSProperties

export function Privacy() {
  const { t, lang } = useLang()
  const [first, second] = privacy.heading[lang]
  return (
    <>
      <section id="privacy" className="privacy" aria-labelledby="privacy-h">
        <div className="privacy-grid wrap">
          <h2 id="privacy-h" className="privacy-head" data-reveal>
            <span className="h-line">{first}</span>
            <span className="h-line indent">{second}</span>
          </h2>
          <p className="privacy-lead" data-reveal style={order(1)}>
            {t(privacy.lead)}
          </p>
          <figure className="lattice" data-reveal style={order(2)}>
            <Mashrabiya />
            <figcaption className="small muted">{t(privacy.lattice)}</figcaption>
          </figure>
          <div className="privacy-small" data-reveal style={order(1)}>
            <BeforeAfter />
          </div>
        </div>
      </section>

      <section className="rules on-field" aria-labelledby="rules-h">
        <div className="wrap rules-inner">
          <h2 id="rules-h" className="rules-head" data-reveal>
            {t(privacy.rulesHeading)}
          </h2>
          <ul className="rules-list">
            {privacy.rules.map((rule, n) => (
              <li key={rule.title.en} data-reveal style={order(n % 2)}>
                <h3>{t(rule.title)}</h3>
                <p>{t(rule.text)}</p>
              </li>
            ))}
          </ul>
          <p className="rules-proof" data-reveal>
            {t(privacy.siteProof)}
          </p>
        </div>
      </section>
    </>
  )
}
