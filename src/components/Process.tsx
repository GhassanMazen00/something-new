import type { CSSProperties } from 'react'
import { process } from '../content'
import { DataPlan, Received, ReportPage } from '../fragments/Report'
import { useLang } from '../lang'

const order = (n: number) => ({ '--i': n }) as CSSProperties
const FILES = ['einvoices_2025-2026.xlsx', 'bank_statements_2026.pdf', 'salaries_coded.xlsx']

export function Process() {
  const { t } = useLang()
  const [first, second, third] = process.steps
  return (
    <section id="process" className="process wrap" aria-labelledby="process-h">
      <div className="process-inner">
      <div className="process-col">
        <h2 id="process-h" className="process-head" data-reveal>
          {t(process.heading)}
        </h2>
        <ol className="exchanges">
          <li className="exchange">
            <p className="exchange-say" data-reveal>
              {t(first.say)}
            </p>
            <p className="call" data-reveal style={order(1)}>
              “{t(first.call)}”
            </p>
            <div className="response" data-reveal style={order(2)}>
              <DataPlan />
            </div>
          </li>
          <li className="exchange">
            <p className="exchange-say" data-reveal>
              {t(second.say)}
            </p>
            <div className="call files" data-reveal style={order(1)}>
              {FILES.map((f) => (
                <span key={f} dir="ltr" style={{ textAlign: 'start' }}>
                  {f}
                </span>
              ))}
              <span className="tick">{t(second.call)}</span>
            </div>
            <div className="response" data-reveal style={order(2)}>
              <Received />
            </div>
          </li>
          <li className="exchange">
            <p className="exchange-say" data-reveal>
              {t(third.say)}
            </p>
            <p className="call" data-reveal style={order(1)}>
              “{t(third.call)}”
            </p>
            <div className="response wide" data-reveal style={order(2)}>
              <ReportPage />
            </div>
          </li>
        </ol>
      </div>
      <aside className="legend" data-reveal aria-labelledby="legend-h">
        <h3 id="legend-h">{t(process.legend.title)}</h3>
        <dl>
          {process.legend.rows.map((row) => (
            <div key={row.level} className={`lv-${row.level}`}>
              <dt>
                <span>{t(process.levels[row.level as 'high' | 'medium' | 'low'])}</span>
              </dt>
              <dd>{t(row.text)}</dd>
            </div>
          ))}
        </dl>
      </aside>
      </div>
    </section>
  )
}
