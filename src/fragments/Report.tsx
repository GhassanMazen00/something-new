import { useState } from 'react'
import { charts, process, report, showcase, type T } from '../content'
import { useLang } from '../lang'

type Level = 'high' | 'medium' | 'low' | 'none'

function Chip({ level }: { level: string }) {
  const { t } = useLang()
  const l = level as Level
  return <span className={`ui-chip ${l}`}>{t(process.levels[l])}</span>
}

// Mosaic cell: invoices after the names were coded.
export function AnonTable() {
  const { t } = useLang()
  const rows = [
    ['INV-2287', 'C-0041', '18,400', false],
    ['INV-2291', 'C-0041', '18,400', true],
    ['INV-2295', 'C-0107', '6,250', false],
    ['INV-2298', 'C-0215', '11,900', false],
  ] as const
  return (
    <div data-ui>
      <div className="ui-title">{t(charts.anon.title)}</div>
      <table>
        <thead>
          <tr>
            <th>{t(showcase.cols.invoice)}</th>
            <th>{t(showcase.cols.customer)}</th>
            <th className="num">EGP</th>
            <th aria-label="flag"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([inv, cust, amt, dup]) => (
            <tr key={inv} className={dup ? 'flag' : undefined}>
              <td dir="ltr">{inv}</td>
              <td dir="ltr">{cust}</td>
              <td className="num">{amt}</td>
              <td>{dup ? <strong>{t(charts.anon.duplicate)}</strong> : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Mosaic cell: the top of a report's first page.
export function PageExcerpt() {
  const { t } = useLang()
  return (
    <div data-ui>
      <div className="ui-title">{t(charts.page.title)}</div>
      {report.items.map((item, i) => (
        <div key={i} className="page-line">
          <span>{t(item.finding)}</span>
          <Chip level={item.level} />
        </div>
      ))}
    </div>
  )
}

// Privacy section: what the template changes before a file leaves the client's computer.
export function BeforeAfter() {
  const { t, lang } = useLang()
  const rows: [T, string, string][] = [
    [{ en: 'Customer', ar: 'عميل' }, lang === 'ar' ? 'هاني عادل' : 'Hany Adel', 'C-0041'],
    [{ en: 'Employee', ar: 'موظف' }, lang === 'ar' ? 'منى سمير' : 'Mona Samir', 'E-012'],
    [{ en: 'Phone', ar: 'هاتف' }, '+20 10• ••• ••47', ''],
    [{ en: 'National ID', ar: 'الرقم القومي' }, '29•• •••• ••• 021', ''],
  ]
  return (
    <div data-ui className="anon-ui">
      <div className="anon-grid">
        <span className="ui-title">{t(charts.before)}</span>
        <span />
        <span className="ui-title">{t(charts.after)}</span>
        {rows.map(([label, before, after]) => (
          <div key={label.en} style={{ display: 'contents' }}>
            <span>
              <span className="ui-muted" style={{ display: 'block', fontSize: 12 }}>
                {t(label)}
              </span>
              <span className={after ? undefined : 'gone'} dir="auto">
                {before}
              </span>
            </span>
            <span className="arrow" aria-hidden="true">
              {lang === 'ar' ? '←' : '→'}
            </span>
            <strong dir="ltr" style={{ textAlign: 'start' }}>
              {after || t({ en: 'removed', ar: 'محذوف' })}
            </strong>
          </div>
        ))}
      </div>
    </div>
  )
}

export type RowState = 'file' | 'sent' | 'checked'

// Showcase: one invoice row as it is in the client's file, as we receive it, and after the checks.
export function InvoiceRow({ state, live = false }: { state: RowState; live?: boolean }) {
  const { t } = useLang()
  const [checked, setChecked] = useState(false)
  const shown: RowState = live ? (checked ? 'checked' : 'sent') : state
  return (
    <div data-ui className="row-ui" data-state={shown}>
      <div className="row-grid row-head">
        <span>{t(showcase.cols.invoice)}</span>
        <span>{t(showcase.cols.date)}</span>
        <span>{t(showcase.cols.customer)}</span>
        <span className="num">{t(showcase.cols.amount)}</span>
      </div>
      <div className="row-grid">
        <span dir="ltr" style={{ textAlign: 'start' }}>INV-2291</span>
        <span>{t(showcase.date)}</span>
        <span className={shown === 'file' ? undefined : 'coded'}>
          <bdi>{shown === 'file' ? t(showcase.name) : 'C-0041'}</bdi>
        </span>
        <span className="num">EGP 18,400</span>
      </div>
      {shown === 'sent' && (
        <div className="row-foot">
          <span className="grow ui-muted">{t(showcase.coded)}</span>
          {live && (
            <button type="button" className="ui-button" onClick={() => setChecked(true)}>
              {t(showcase.run)}
            </button>
          )}
        </div>
      )}
      {shown === 'checked' && (
        <div className="row-foot">
          <span className="grow">
            <strong>{t(showcase.finding)}</strong>
          </span>
          <span className="ui-chip high">{t(showcase.confidence)}</span>
          <span className="ui-muted">{t(showcase.review)}</span>
          {live && (
            <button type="button" className="ui-button quiet" onClick={() => setChecked(false)}>
              {t(showcase.again)}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function DataPlan() {
  const { t } = useLang()
  const p = process.plan
  return (
    <div data-ui className="plan-ui">
      <div className="ui-head">
        <span className="ui-title">{t(p.title)}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>{t(p.cols.service)}</th>
            <th>{t(p.cols.from)}</th>
            <th>{t(p.cols.confidence)}</th>
          </tr>
        </thead>
        <tbody>
          {p.rows.map((r) => (
            <tr key={r.service.en}>
              <td>
                <strong>{t(r.service)}</strong>
              </td>
              <td className={r.level === 'none' ? 'ui-muted' : undefined}>{t(r.from)}</td>
              <td>
                <Chip level={r.level} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Received() {
  const { t } = useLang()
  const r = process.received
  return (
    <div data-ui className="recv-ui">
      <div className="ui-head">
        <span className="ui-title">{t(r.title)}</span>
        <span className="ui-chip high">{t({ en: 'Complete', ar: 'مكتمل' })}</span>
      </div>
      <dl>
        {r.lines.map((l) => (
          <div key={l.k.en} style={{ display: 'contents' }}>
            <dt>{t(l.k)}</dt>
            <dd>{t(l.v)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function ReportPage() {
  const { t } = useLang()
  return (
    <div data-ui className="report-ui">
      <div className="ui-head">
        <span className="ui-title">{t(report.title)}</span>
        <span className="ui-muted">{t(report.period)}</span>
      </div>
      {report.items.map((item, i) => (
        <div key={i} className="item">
          <div>
            <span className="k">{t(report.findingLabel)}</span>
            {t(item.finding)}
          </div>
          <div>
            <span className="k">{t(report.actionLabel)}</span>
            <strong>{t(item.action)}</strong>
          </div>
          <div>
            <Chip level={item.level} />
          </div>
        </div>
      ))}
      <div className="ui-foot">{t(report.footer)}</div>
    </div>
  )
}
