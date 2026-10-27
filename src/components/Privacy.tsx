import { privacy } from '../content'
import { order } from '../fx'
import { useLang } from '../lang'
import { ruleIcons } from './Icons'

// Icons for the five journey stages, reusing the rule icons.
const JOURNEY_ICONS = [ruleIcons[0], ruleIcons[3], ruleIcons[2], ruleIcons[4], ruleIcons[5]]

export function Privacy() {
  const { t, lang } = useLang()
  const [a, b] = privacy.heading[lang]
  return (
    <section id="privacy" className="section privacy" aria-labelledby="privacy-h">
      <div className="wrap">
        <div className="privacy-top">
          <header className="sec-head">
            <span className="kicker" data-reveal>
              {t({ en: 'Privacy before anything', ar: 'الخصوصية قبل أي شيء' })}
            </span>
            <h2 id="privacy-h" data-reveal style={order(1)}>
              {a} <span className="accent">{b}</span>
            </h2>
            <p className="sec-lead" data-reveal style={order(2)}>
              {t(privacy.lead)}
            </p>
            <p className="proof" data-reveal style={order(3)}>
              <span className="pulse" aria-hidden="true" />
              {t(privacy.siteProof)}
            </p>
          </header>

          <div className="spec glass" data-reveal style={order(1)}>
            <div className="spec-head">
              <span className="spec-ico">{ruleIcons[2]}</span>
              <h3>{t(privacy.specTitle)}</h3>
            </div>
            <dl>
              {privacy.specs.map((row) => (
                <div key={row.k.en}>
                  <dt>{t(row.k)}</dt>
                  <dd>{t(row.v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <h3 className="sub-head" data-reveal>
          {t(privacy.journeyTitle)}
        </h3>
        <ol className="journey">
          <span className="journey-line" aria-hidden="true">
            <span />
          </span>
          {privacy.journey.map((stage, n) => (
            <li key={stage.title.en} className="stage glass" data-reveal style={order(n)}>
              <span className="stage-ico">{JOURNEY_ICONS[n]}</span>
              <span className="stage-n">0{n + 1}</span>
              <h4>{t(stage.title)}</h4>
              <p>{t(stage.text)}</p>
            </li>
          ))}
        </ol>

        <h3 className="sub-head" data-reveal>
          {t(privacy.rulesHeading)}
        </h3>
        <ul className="rules">
          {privacy.rules.map((rule, n) => (
            <li key={rule.title.en} className="rule glass" data-reveal style={order(n % 4)}>
              <span className="rule-ico">{ruleIcons[n]}</span>
              <h4>{t(rule.title)}</h4>
              <p>{t(rule.text)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
