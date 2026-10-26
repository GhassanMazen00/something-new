import { useState } from 'react'
import { checker, departments, process, type CheckerService } from '../content'
import { order } from '../fx'
import { useLang } from '../lang'
import { Check } from './Icons'

type Level = 'high' | 'medium' | 'low' | 'none'

function levelOf(s: CheckerService, have: Set<string>): Level {
  if (s.publicData) return 'high'
  const any = (ways: string[][] = []) => ways.some((w) => w.every((id) => have.has(id)))
  if (any(s.high)) return 'high'
  if (any(s.medium)) return 'medium'
  if (any(s.low)) return 'low'
  return 'none'
}

const WIDTH: Record<Level, number> = { high: 100, medium: 64, low: 32, none: 0 }

export function Checker() {
  const { t } = useLang()
  const [have, setHave] = useState(() => new Set(['einv', 'bank']))
  const toggle = (id: string) => {
    const next = new Set(have)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setHave(next)
  }

  const results = checker.services.map((s) => ({ s, level: levelOf(s, have) }))
  const ready = results.filter((r) => r.level !== 'none').length
  const total = results.length
  const ring = 2 * Math.PI * 52

  return (
    <section id="checker" className="section checker" aria-labelledby="checker-h">
      <div className="wrap">
        <header className="sec-head center">
          <span className="kicker" data-reveal>
            03 · {t({ en: 'What each service needs', ar: 'ما تحتاجه كل خدمة' })}
          </span>
          <h2 id="checker-h" data-reveal style={order(1)}>
            {t(checker.heading)}
          </h2>
          <p className="sec-lead" data-reveal style={order(2)}>
            {t(checker.lead)}
          </p>
        </header>

        <div className="checker-grid">
          <div className="have glass" data-reveal>
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
            <div className="gauge">
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <defs>
                  <linearGradient id="ringGrad" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#a78bfa" />
                    <stop offset="0.5" stopColor="#22d3ee" />
                    <stop offset="1" stopColor="#34d399" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="52" className="ring-bg" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  className="ring"
                  stroke="url(#ringGrad)"
                  strokeDasharray={ring}
                  strokeDashoffset={ring * (1 - ready / total)}
                />
              </svg>
              <div className="gauge-text">
                <strong>{ready}</strong>
                <span>/ {total}</span>
              </div>
              <p>{t(checker.ready).replace('{n}', String(ready)).replace('{total}', String(total))}</p>
            </div>
          </div>

          <ul className="results glass" data-reveal style={order(1)} aria-live="polite">
            {results.map(({ s, level }) => (
              <li key={s.name.en} className={`res lv-${level}`}>
                <div className="res-name">
                  <strong>{t(s.name)}</strong>
                  <span>
                    {t(departments.find((d) => d.id === s.dept)!.name)}
                    {s.publicData ? ` · ${t(checker.publicNote)}` : ''}
                  </span>
                </div>
                <div className="meter" aria-hidden="true">
                  <span style={{ width: `${WIDTH[level]}%` }} />
                </div>
                <span className={`chip ${level}`}>{t(process.levels[level])}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
