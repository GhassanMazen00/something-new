import { useState } from 'react'
import { HBars } from '../charts/Charts'
import { anonymizer, privacy } from '../content'
import { order, Scramble } from '../fx'
import { useLang } from '../lang'
import { Lock, ruleIcons } from './Icons'

// Same name, same code: a small stable hash, like the template's lookup key.
function code(name: string) {
  const clean = name.trim().toLowerCase()
  if (!clean) return 'C-0000'
  let h = 5381
  for (const ch of clean) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0
  return `C-${String((h % 9000) + 1000)}`
}

function Anonymizer() {
  const { t, lang } = useLang()
  const d = anonymizer.defaults
  const [name, setName] = useState(lang === 'ar' ? d.nameAr : d.name)
  const [phone, setPhone] = useState(d.phone)
  const [id, setId] = useState(d.id)
  const [amount, setAmount] = useState(d.amount)
  const f = anonymizer.fields

  const rows = [
    { key: 'name', label: f.name, value: name, set: setName, out: code(name), kind: 'coded' },
    { key: 'phone', label: f.phone, value: phone, set: setPhone, out: t(anonymizer.removed), kind: 'gone' },
    { key: 'id', label: f.id, value: id, set: setId, out: t(anonymizer.removed), kind: 'gone' },
    { key: 'amount', label: f.amount, value: amount, set: setAmount, out: amount || '0', kind: 'kept' },
  ] as const

  return (
    <div className="anon card" data-reveal style={order(1)}>
      <div className="anon-head">
        <span className="badge-ico">
          <Lock />
        </span>
        <div>
          <h3>{t(anonymizer.title)}</h3>
          <p>{t(anonymizer.lead)}</p>
        </div>
      </div>
      <div className="anon-cols">
        <span className="col-title">{t(anonymizer.yourFile)}</span>
        <span />
        <span className="col-title">{t(anonymizer.weGet)}</span>
        {rows.map((r) => (
          <div key={r.key} className="anon-row">
            <label className="field">
              <span>{t(r.label)}</span>
              <input value={r.value} onChange={(e) => r.set(e.target.value)} dir="auto" spellCheck={false} />
            </label>
            <span className="anon-arrow" aria-hidden="true">
              <span />
            </span>
            <div className={`out ${r.kind}`} aria-live="polite">
              {r.kind === 'coded' && <Scramble text={r.out} />}
              {r.kind === 'gone' && (
                <>
                  <s dir="ltr">{r.value}</s>
                  <em>{r.out}</em>
                </>
              )}
              {r.kind === 'kept' && (
                <>
                  <span dir="ltr">{r.out}</span>
                  <em>{t(anonymizer.kept)}</em>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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
            <div className="mini card" data-reveal style={order(3)}>
              <span className="chart-title">{t({ en: 'What leaves your computer, in a typical job', ar: 'ما يخرج من جهازك في مهمة معتادة' })}</span>
              <HBars
                label="Columns in a typical file, columns we ask for, and personal columns we receive"
                max={24}
                items={[
                  { label: 'In your file', value: 24, text: '24 columns', tone: 'soft' },
                  { label: 'We ask for', value: 7, text: '7 columns' },
                  { label: 'Personal data', value: 0, text: '0 columns', tone: 'ink' },
                ]}
              />
            </div>
            <p className="proof" data-reveal style={order(4)}>
              <span className="pulse" aria-hidden="true" />
              {t(privacy.siteProof)}
            </p>
          </header>
          <Anonymizer />
        </div>

        <h3 className="sub-head" data-reveal>
          {t(privacy.rulesHeading)}
        </h3>
        <ul className="rules">
          {privacy.rules.map((rule, n) => (
            <li key={rule.title.en} className="rule" data-reveal style={order(n % 4)}>
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
