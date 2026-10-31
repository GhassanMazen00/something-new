// The built-in checks: what was tested on a result, what to look at, and what must be fixed before review.

import { useState } from 'react'
import type { CheckT, ReportCheck, ReportT } from '../api'
import { fmtTime } from '../hooks'

const MARK = { pass: '✓', warn: '!', fail: '×' } as const

function Row({ k }: { k: CheckT }) {
  return (
    <li className={`chk chk-${k.status}`}>
      <span className="chk-mark" aria-hidden="true">
        {MARK[k.status]}
      </span>
      <span>
        <b>{k.title}</b>
        <span className="chk-detail">{k.detail}</span>
      </span>
    </li>
  )
}

export function count(checks: CheckT[] = []) {
  return { fail: checks.filter((k) => k.status === 'fail').length, warn: checks.filter((k) => k.status === 'warn').length, pass: checks.filter((k) => k.status === 'pass').length }
}

// Under one service's result: problems first, the passed checks folded away.
export function RunChecks({ checks }: { checks?: CheckT[] }) {
  const [open, setOpen] = useState(false)
  if (!checks) return <p className="checks-line panel">Run again to check this result: it was made before the built-in checks.</p>
  const n = count(checks)
  const shown = open ? checks : checks.filter((k) => k.status !== 'pass')
  return (
    <div className={`checks panel${n.fail ? ' has-fail' : n.warn ? ' has-warn' : ''}`}>
      <div className="spread">
        <h3>
          {n.fail ? `${n.fail} check${n.fail > 1 ? 's' : ''} failed` : n.warn ? `Checked: ${n.warn} thing${n.warn > 1 ? 's' : ''} to look at` : `All ${n.pass} checks passed`}
        </h3>
        <button className="btn btn-sm" type="button" onClick={() => setOpen(!open)}>
          {open ? 'Hide passed checks' : `Show all ${checks.length}`}
        </button>
      </div>
      {shown.length > 0 && (
        <ul className="chk-list">
          {shown.map((k) => (
            <Row key={k.id} k={k} />
          ))}
        </ul>
      )}
      {n.fail > 0 && <p className="faint chk-foot">A failed check stops the report going for review until it is fixed, or until you write down on the report page why it is fine.</p>}
    </div>
  )
}

// The same problem (a data check) shows on every section that uses the file: list it once, with the sections it touches.
function grouped(items: ReportCheck[]) {
  const out: { k: ReportCheck; services: string[]; all: ReportCheck[] }[] = []
  for (const i of items) {
    const same = out.find((g) => g.k.id === i.id && g.k.detail === i.detail && g.k.status === i.status && i.status !== 'fail')
    if (same) {
      same.services.push(i.service ?? 'Report')
      same.all.push(i)
    } else out.push({ k: i, services: [i.service ?? 'Report'], all: [i] })
  }
  return out
}

// On the report page: the gate before review, with a reason box for each failed check.
export function ReportChecks({ r, canEdit, accept }: { r: ReportT; canEdit: boolean; accept: (sectionId: number, checkId: string, reason: string) => Promise<void> }) {
  const c = r.checks
  const fails = c.items.filter((i) => i.status === 'fail')
  const warns = grouped(c.items.filter((i) => i.status === 'warn'))
  return (
    <div className={`report-section panel checks report-checks no-print${c.blocking ? ' has-fail' : c.warnings ? ' has-warn' : ''}`}>
      <div className="spread">
        <h3>Checks before review</h3>
        <span className="row chk-counts">
          <span className="tag green">{c.passed} passed</span>
          {c.warnings > 0 && <span className="tag amber">{c.warnings} to look at</span>}
          {c.blocking > 0 && <span className="tag red">{c.blocking} to fix</span>}
          {c.accepted > 0 && <span className="tag">{c.accepted} accepted with a reason</span>}
        </span>
      </div>
      <p className="muted chk-intro">
        {c.blocking
          ? 'The report can’t go for review or be downloaded until each failed check is fixed (run the service again after fixing the file) or explained.'
          : 'Nothing blocks the report. Read the points below before sending it: the reviewer sees them too.'}
      </p>
      {fails.length > 0 && (
        <ul className="chk-list">
          {fails.map((i) => (
            <li key={`${i.section_id}-${i.id}`} className={`chk chk-fail${i.ack ? ' acked' : ''}`}>
              <span className="chk-mark" aria-hidden="true">
                {i.ack ? '✓' : MARK.fail}
              </span>
              <span>
                <b>
                  {i.service}: {i.title}
                </b>
                <span className="chk-detail">{i.detail}</span>
                {i.ack ? (
                  <span className="chk-ack">
                    Accepted by {i.ack.by}, {fmtTime(i.ack.at)}: “{i.ack.reason}”
                    {canEdit && i.section_id !== null && (
                      <button className="link-btn" type="button" onClick={() => accept(i.section_id!, i.id, '')}>
                        Take back
                      </button>
                    )}
                  </span>
                ) : (
                  canEdit && i.section_id !== null && i.id !== 'rerun' && <AckForm onSave={(reason) => accept(i.section_id!, i.id, reason)} />
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {warns.length > 0 && (
        <ul className="chk-list">
          {warns.map(({ k, services }) => (
            <li key={`${k.section_id}-${k.id}`} className="chk chk-warn">
              <span className="chk-mark" aria-hidden="true">
                !
              </span>
              <span>
                <b>{k.title}</b>
                <span className="chk-detail">{k.detail}</span>
                <span className="chk-where">{services.length > 2 ? `${services.length} sections: ${services.slice(0, 2).join(', ')} and ${services.length - 2} more` : services.join(', ')}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AckForm({ onSave }: { onSave: (reason: string) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [v, setV] = useState('')
  if (!open)
    return (
      <button className="link-btn" type="button" onClick={() => setOpen(true)}>
        It’s fine: write down why
      </button>
    )
  return (
    <span className="ack-form">
      <textarea rows={2} value={v} onChange={(e) => setV(e.target.value)} placeholder="Why this is fine, for the reviewer. For example: checked against the client’s ledger, the large order is real." />
      <span className="row">
        <button className="btn btn-sm btn-primary" type="button" disabled={v.trim().length < 15} onClick={() => onSave(v)}>
          Accept with this reason
        </button>
        <button className="btn btn-sm" type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </span>
    </span>
  )
}
