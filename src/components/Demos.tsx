import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { demos, showcase } from '../content'
import { order, reducedMotion } from '../fx'
import { useLang } from '../lang'
import { Spark } from './Icons'

type Flag = 'ok' | 'dup' | 'gap' | 'odd'
const INVOICES: [string, string, string, Flag][] = [
  ['INV-2287', 'C-0041', '18,400', 'ok'],
  ['INV-2288', 'C-0107', '6,250', 'ok'],
  ['INV-2289', 'C-0215', '11,900', 'ok'],
  ['INV-2290', 'C-0041', '18,400', 'dup'],
  ['INV-2292', 'C-0330', '4,780', 'gap'],
  ['INV-2293', 'C-0118', '19,200', 'odd'],
  ['INV-2294', 'C-0107', '6,100', 'ok'],
]
const STEP = 360

function ErrorScan() {
  const { t } = useLang()
  const s = demos.scan
  const [done, setDone] = useState(-1)
  const [running, setRunning] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearInterval(timer.current), [])

  const run = () => {
    window.clearInterval(timer.current)
    if (reducedMotion()) {
      setDone(INVOICES.length - 1)
      return
    }
    setDone(-1)
    setRunning(true)
    let i = -1
    timer.current = window.setInterval(() => {
      i++
      setDone(i)
      if (i >= INVOICES.length - 1) {
        window.clearInterval(timer.current)
        setRunning(false)
      }
    }, STEP)
  }
  const reset = () => {
    window.clearInterval(timer.current)
    setRunning(false)
    setDone(-1)
  }
  const finished = done >= INVOICES.length - 1 && !running

  return (
    <div className="demo glass spot" data-reveal>
      <div className="demo-head">
        <h3>{t(s.title)}</h3>
        <span className="tag">{t(showcase.example)}</span>
      </div>
      <div className={`scan-table${running ? ' is-running' : ''}`} dir="ltr">
        <div className="st-row st-head">
          <span>{t(showcase.cols.invoice)}</span>
          <span>{t(showcase.cols.customer)}</span>
          <span className="r">EGP</span>
          <span />
        </div>
        {INVOICES.map(([inv, cust, amt, flag], i) => {
          const checked = i <= done
          return (
            <div key={inv} className={`st-row${checked ? ` is-${flag}` : ''}${checked ? ' is-checked' : ''}`}>
              <span>{inv}</span>
              <span>{cust}</span>
              <span className="r">{amt}</span>
              <span className="flag">{checked && <span className={`chip ${flag === 'ok' ? 'high' : 'bad'}`}>{t(s.flags[flag])}</span>}</span>
            </div>
          )
        })}
        {running && <span className="scan-beam" style={{ top: `${((done + 2) / (INVOICES.length + 1)) * 100}%` }} />}
      </div>
      <div className="demo-foot">
        <p className={`demo-result${finished ? ' show' : ''}`} aria-live="polite">
          {finished ? t(s.done) : ''}
        </p>
        {finished ? (
          <button type="button" className="btn btn-glass btn-sm" onClick={reset}>
            {t(s.reset)}
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-sm" onClick={run} disabled={running}>
            <Spark /> {running ? t(s.running) : t(s.run)}
          </button>
        )}
      </div>
    </div>
  )
}

function PriceWhatIf() {
  const { t } = useLang()
  const p = demos.price
  const [rise, setRise] = useState(8)
  const [margin, setMargin] = useState(30)
  const limit = (rise / (margin + rise)) * 100
  const shown = Math.round(limit)

  return (
    <div className="demo glass spot" data-reveal style={order(1)}>
      <div className="demo-head">
        <h3>{t(p.title)}</h3>
        <span className="tag">{t(showcase.example)}</span>
      </div>
      <label className="slider">
        <span>
          {t(p.rise)} <strong>{rise}%</strong>
        </span>
        <input type="range" min={1} max={30} value={rise} onChange={(e) => setRise(Number(e.target.value))} style={{ '--v': `${((rise - 1) / 29) * 100}%` } as CSSProperties} />
      </label>
      <label className="slider">
        <span>
          {t(p.margin)} <strong>{margin}%</strong>
        </span>
        <input type="range" min={5} max={60} value={margin} onChange={(e) => setMargin(Number(e.target.value))} style={{ '--v': `${((margin - 5) / 55) * 100}%` } as CSSProperties} />
      </label>
      <div className="whatif-out">
        <p>{t(p.result)}</p>
        <strong className="big grad-text">{shown}%</strong>
        <div className="zone" aria-hidden="true">
          <span className="safe" style={{ width: `${limit}%` }} />
          <span className="mark" style={{ insetInlineStart: `${limit}%` }} />
        </div>
        <span className="note">{t(p.note)}</span>
      </div>
    </div>
  )
}

export function Demos() {
  const { t, lang } = useLang()
  const [a, b] = demos.heading[lang]
  return (
    <section id="demos" className="section demos" aria-labelledby="demos-h">
      <div className="wrap">
        <header className="sec-head center">
          <span className="kicker" data-reveal>
            04 · {t({ en: 'Live demo', ar: 'عرض حي' })}
          </span>
          <h2 id="demos-h" data-reveal style={order(1)}>
            {a} <span className="grad-text">{b}</span>
          </h2>
          <p className="sec-lead" data-reveal style={order(2)}>
            {t(demos.lead)}
          </p>
        </header>
        <div className="demo-grid">
          <ErrorScan />
          <PriceWhatIf />
        </div>
      </div>
    </section>
  )
}
