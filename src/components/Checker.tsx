import { useState } from 'react'
import { checker, departments, type CheckerService } from '../content'
import { order } from '../fx'
import { useLang } from '../lang'
import type { Level as L } from '../samples'
import { Check } from './Icons'
import { Level } from './Level'

function levelOf(s: CheckerService, have: Set<string>): L {
  if (s.publicData) return 'high'
  const any = (ways: string[][] = []) => ways.some((w) => w.every((id) => have.has(id)))
  if (any(s.high)) return 'high'
  if (any(s.medium)) return 'medium'
  if (any(s.low)) return 'low'
  return 'none'
}

// The files still missing for full confidence, using the way that needs the fewest extra files.
function missing(s: CheckerService, have: Set<string>) {
  if (s.publicData || !s.high.length) return []
  return s.high.map((w) => w.filter((id) => !have.has(id))).sort((a, b) => a.length - b.length)[0]
}

const LEVELS: L[] = ['high', 'medium', 'low', 'none']

export function Checker() {
  const { t } = useLang()
  const [have, setHave] = useState(() => new Set(['einv', 'bank']))
  const toggle = (id: string) => {
    const next = new Set(have)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setHave(next)
  }
  const label = (id: string) => t(checker.items.find((i) => i.id === id)!.label)

  const results = checker.services.map((s) => ({ s, level: levelOf(s, have), need: missing(s, have) }))
  const count = (l: L) => results.filter((r) => r.level === l).length
  const total = results.length
  const ready = total - count('none')

  return (
    <section id="checker" className="section checker" aria-labelledby="checker-h">
      <div className="wrap">
        <header className="sec-head center">
          <span className="kicker" data-reveal>
            {t({ en: 'What each service needs', ar: 'ما تحتاجه كل خدمة' })}
          </span>
          <h2 id="checker-h" data-reveal style={order(1)}>
            {t(checker.heading)}
          </h2>
          <p className="sec-lead" data-reveal style={order(2)}>
            {t(checker.lead)}
          </p>
        </header>

        <div className="checker-panel glass" data-reveal>
          <div className="checker-files">
            <span className="col-title">{t(checker.have)}</span>
            <div className="have-chips">
              {checker.items.map((item) => {
                const on = have.has(item.id)
                return (
                  <button key={item.id} type="button" className={`have-chip${on ? ' on' : ''}`} aria-pressed={on} onClick={() => toggle(item.id)}>
                    <span className="box">{on && <Check />}</span>
                    {t(item.label)}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="checker-summary" aria-live="polite">
            <div className="summary-num">
              <strong>{ready}</strong>
              <span>{t(checker.outOf).replace('{total}', String(total))}</span>
              <p>{t(checker.ready)}</p>
            </div>
            <div className="summary-bar">
              <div className="stack" aria-hidden="true">
                {LEVELS.map((l) => (
                  <span key={l} className={`seg-${l}`} style={{ flexGrow: count(l), flexBasis: 0 }} />
                ))}
              </div>
              <ul className="summary-legend">
                {LEVELS.map((l) => (
                  <li key={l}>
                    <Level level={l} text={t(checker.levels[l])} />
                    <b>{count(l)}</b>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <ul className="svc-tiles">
          {results.map(({ s, level, need }, n) => (
            <li key={s.name.en} className={`tile glass tl-${level}`} data-reveal style={order(n % 4)}>
              <span className="tile-dept">{t(departments.find((d) => d.id === s.dept)!.name)}</span>
              <strong className="tile-name">{t(s.name)}</strong>
              <Level level={level} text={t(checker.levels[level])} />
              <span className="tile-need">
                {s.publicData
                  ? t(checker.publicNote)
                  : need.length
                    ? `${t(checker.add)} ${need.map(label).join(' + ')}`
                    : t({ en: 'You have everything needed', ar: 'لديك كل ما يلزم' })}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
