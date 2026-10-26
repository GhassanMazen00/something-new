import type { CSSProperties } from 'react'
import { showcase } from '../content'
import { InvoiceRow, type RowState } from '../fragments/Report'
import { useLang } from '../lang'

const order = (n: number) => ({ '--i': n }) as CSSProperties
const STATES: RowState[] = ['file', 'sent', 'checked']

export function Showcase() {
  const { t } = useLang()
  return (
    <section id="showcase" className="showcase wrap" aria-labelledby="showcase-h">
      <div className="show-grid">
        <h2 id="showcase-h" className="show-head" data-reveal>
          {t(showcase.heading)}
        </h2>
        {STATES.map((state, n) => (
          <div key={state} style={{ display: 'contents' }}>
            <p className="show-state" data-reveal style={order(n)}>
              {t(showcase.states[state])}
            </p>
            <div className="show-copy" data-reveal style={order(n + 1)}>
              <InvoiceRow state={state} live={state === 'sent'} />
            </div>
          </div>
        ))}
        <p className="show-note small muted">{t(showcase.example)}</p>
      </div>
    </section>
  )
}
