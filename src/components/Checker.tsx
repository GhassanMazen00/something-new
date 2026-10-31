import { useState } from 'react'
import { checker, departments, type CheckerService, type T } from '../content'
import { order } from '../fx'
import { useLang } from '../lang'
import type { Level as L } from '../samples'
import { Check } from './Icons'

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

// What each level means, in one line a client can act on.
const MEANING: Record<L, { title: T; text: T }> = {
  high: { title: { en: 'High', ar: 'عالية' }, text: { en: 'Built on your own data. Act on it.', ar: 'مبنية على بياناتك. اعتمد عليها.' } },
  medium: { title: { en: 'Medium', ar: 'متوسطة' }, text: { en: 'One gap filled with a stand-in, and we say which.', ar: 'فجوة واحدة نسدها ببديل، ونوضح أي بديل.' } },
  low: { title: { en: 'Low', ar: 'منخفضة' }, text: { en: 'Mostly estimates. Read it as a direction.', ar: 'تقديرات في الغالب. اقرأها كاتجاه.' } },
  none: { title: { en: 'Not yet', ar: 'ليس بعد' }, text: { en: 'Needs a file you haven’t ticked.', ar: 'تحتاج ملفًا لم تختره بعد.' } },
}

// The files, in three even groups of four.
const GROUPS: { title: T; ids: string[] }[] = [
  { title: { en: 'Sales', ar: 'المبيعات' }, ids: ['sales', 'einv', 'cost', 'stock'] },
  { title: { en: 'Money', ar: 'المال' }, ids: ['bank', 'ledger', 'unpaid', 'pnl'] },
  { title: { en: 'People and customers', ar: 'الموظفون والعملاء' }, ids: ['payroll', 'staff', 'customers', 'ads'] },
]

function Gauge({ level }: { level: L }) {
  const n = { high: 3, medium: 2, low: 1, none: 0 }[level]
  return (
    <span className={`ck-gauge g-${level}`} aria-hidden="true">
      {[1, 2, 3].map((k) => (
        <i key={k} className={k <= n ? 'on' : undefined} />
      ))}
    </span>
  )
}

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
        <header className="sec-head wide">
          <h2 id="checker-h" data-reveal style={order(1)}>
            {t({ en: 'What can we do', ar: 'ماذا نستطيع أن نفعل' })} <span className="accent">{t({ en: 'with what you have?', ar: 'بما لديك؟' })}</span>
          </h2>
          <p className="sec-lead" data-reveal style={order(2)}>
            {t({ en: 'Tick the files you keep. Each service shows how sure its answer would be.', ar: 'اختر الملفات الموجودة لديك. وكل خدمة توضح مدى ثقة إجابتها.' })}
          </p>
        </header>

        <div className="ck" data-reveal>
          <div className="ck-files">
            {GROUPS.map((g) => (
              <fieldset key={g.title.en} className="ck-group">
                <legend>{t(g.title)}</legend>
                {g.ids.map((id) => {
                  const on = have.has(id)
                  return (
                    <label key={id} className={`ck-file${on ? ' on' : ''}`}>
                      <input type="checkbox" checked={on} onChange={() => toggle(id)} />
                      <span className="box" aria-hidden="true">
                        <Check />
                      </span>
                      {label(id)}
                    </label>
                  )
                })}
              </fieldset>
            ))}
          </div>

          <div className="ck-summary" aria-live="polite">
            <p className="ck-count">
              <strong className="num">{ready}</strong>
              <span>
                {t({ en: 'of', ar: 'من' })} {total} {t({ en: 'services you can get now', ar: 'خدمات متاحة لك الآن' })}
              </span>
            </p>
            <div className="ck-bar" aria-hidden="true">
              {LEVELS.map((l) => (
                <span key={l} className={`seg-${l}`} style={{ flexGrow: count(l), flexBasis: 0 }} />
              ))}
            </div>
          </div>

          <div className="ck-lanes">
            {LEVELS.map((l) => {
              const rows = results.filter((r) => r.level === l)
              return (
                <div key={l} className={`ck-lane lane-${l}`}>
                  <div className="lane-head">
                    <Gauge level={l} />
                    <b>{t(MEANING[l].title)}</b>
                    <span className="lane-n num">{rows.length}</span>
                    <p>{t(MEANING[l].text)}</p>
                  </div>
                  <ul>
                    {rows.map(({ s, need }) => (
                      <li key={s.name.en}>
                        <span className="lane-name">{t(s.name)}</span>
                        <span className="lane-note">
                          {s.publicData
                            ? t(checker.publicNote)
                            : need.length
                              ? `${t({ en: 'Add', ar: 'أضف' })} ${need.map(label).join(' + ')}`
                              : t(departments.find((d) => d.id === s.dept)!.name)}
                        </span>
                      </li>
                    ))}
                    {!rows.length && <li className="lane-empty">{t({ en: 'None', ar: 'لا شيء' })}</li>}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
