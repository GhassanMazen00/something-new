// The client report: sections from chosen runs with the analyst's notes, a summary, review, and Word / Excel / print.

import { useState } from 'react'
import { icons, Level } from '../../app/ui/bits'
import { ResultView } from '../../app/ui/ResultView'
import { api, type ClientT, type ReportT, type Section } from '../api'
import { fmtTime, useAction, useLoad } from '../hooks'
import { useSession } from '../session'
import { count, ReportChecks } from './Checks'

const TODAY = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export function ReportTab({ client, changed }: { client: ClientT; changed: () => void }) {
  const { me } = useSession()
  const rep = useLoad(() => api.get<ReportT>(`/clients/${client.id}/report`), [client.id])
  const a = useAction()
  const [summary, setSummary] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const isAnalyst = me.role === 'admin' || client.analyst?.id === me.id
  const isReviewer = me.role === 'admin' || client.reviewer?.id === me.id
  const locked = ['In review', 'Approved', 'Delivered'].includes(client.status)
  const canEdit = isAnalyst && !locked
  if (rep.error) return <p className="error">{rep.error}</p>
  if (!rep.data) return <div className="empty panel">Loading the report…</div>
  const r = rep.data
  const text = summary ?? r.summary
  const act = async (path: string, body?: object) => {
    if (await a.run(() => api.post(`/clients/${client.id}/report/${path}`, body))) {
      rep.reload()
      changed()
    }
  }
  const saveSummary = async () => {
    if (summary === null || summary === r.summary) return
    if (await a.run(() => api.put(`/clients/${client.id}/report/summary`, { text: summary }))) rep.reload()
  }
  const accept = async (sectionId: number, checkId: string, reason: string) => {
    const out = await a.run(() => api.post<ReportT>(`/sections/${sectionId}/acks`, { check_id: checkId, reason }))
    if (out) rep.setData(out)
  }
  const blocked = r.checks.blocking > 0 && !['Approved', 'Delivered'].includes(client.status)
  const section = async (s: Section, body: object | null) => {
    const out = await a.run(() => (body ? api.patch<ReportT>(`/sections/${s.id}`, body) : api.del<ReportT>(`/sections/${s.id}`)))
    if (out) rep.setData(out)
  }
  if (!r.sections.length)
    return (
      <div className="empty panel">
        No sections yet. Open a service, run it and press <b>Add to report</b>.
        <div style={{ marginTop: 14 }}>
          <a className="btn" href={`#/client/${client.id}/services`}>
            Go to services
          </a>
        </div>
      </div>
    )
  return (
    <div className="report">
      <div className="report-cover panel">
        <div className="spread no-print">
          <span className="tag blue">
            {client.status} · {r.sections.length} sections
          </span>
          <div className="row">
            {blocked ? (
              <span className="faint" style={{ fontSize: '0.8rem' }}>
                Downloads open once the failed checks are fixed or explained
              </span>
            ) : (
              <>
                <a className="btn btn-sm" href={`/api/clients/${client.id}/report.docx`} download>
                  Word
                </a>
                <a className="btn btn-sm" href={`/api/clients/${client.id}/report.xlsx`} download>
                  Excel
                </a>
              </>
            )}
            <button className="btn btn-sm" type="button" onClick={() => window.print()}>
              Print or PDF
            </button>
          </div>
        </div>
        <h2>{client.name}</h2>
        {client.question && (
          <p className="muted" style={{ marginTop: 6 }}>
            “{client.question}”
          </p>
        )}
        <p className="faint" style={{ marginTop: 14, fontSize: '0.8rem' }}>
          Prepared by {client.analyst?.name ?? '—'}
          {client.reviewer ? ` · reviewed by ${client.reviewer.name}` : ''} · {TODAY} · Confidential
        </p>

        <div className="workflow no-print">
          {client.status === 'Changes requested' && client.review_comment && (
            <p className="notice-line">
              <b>Reviewer:</b> {client.review_comment}
            </p>
          )}
          {isAnalyst && !locked && (
            <button className="btn btn-primary btn-sm" type="button" disabled={a.busy || blocked} title={blocked ? 'Fix or explain the failed checks first' : undefined} onClick={() => act('submit')}>
              Send for review{client.reviewer ? ` to ${client.reviewer.name}` : ''}
            </button>
          )}
          {client.status === 'In review' && isReviewer && client.analyst?.id !== me.id && (
            <div className="review-box">
              <textarea rows={2} placeholder="Comment for the analyst (needed when asking for changes)" value={comment} onChange={(e) => setComment(e.target.value)} />
              <div className="row">
                <button className="btn btn-primary btn-sm" type="button" disabled={a.busy} onClick={() => act('review', { approve: true, comment })}>
                  Approve
                </button>
                <button className="btn btn-sm" type="button" disabled={a.busy || !comment.trim()} onClick={() => act('review', { approve: false, comment })}>
                  Ask for changes
                </button>
              </div>
            </div>
          )}
          {client.status === 'In review' && !(isReviewer && client.analyst?.id !== me.id) && <span className="muted">Waiting for {client.reviewer?.name ?? 'a reviewer'}.</span>}
          {client.status === 'Approved' && isAnalyst && (
            <button className="btn btn-primary btn-sm" type="button" disabled={a.busy} onClick={() => act('deliver')}>
              Mark as delivered to the client
            </button>
          )}
          {client.status === 'Delivered' && <span className="muted">Delivered. The client’s files are deleted 30 days after delivery.</span>}
          {a.error && <p className="error">{a.error}</p>}
        </div>
      </div>

      <ReportChecks r={r} canEdit={canEdit} accept={accept} />

      <div className="report-section panel">
        <h3>Summary</h3>
        {canEdit ? (
          <textarea className="summary-edit" rows={5} placeholder="What the client should take away, in plain words. Three or four points work best." value={text} onChange={(e) => setSummary(e.target.value)} onBlur={saveSummary} />
        ) : text ? (
          <p className="pre">{text}</p>
        ) : (
          <p className="muted">No summary written.</p>
        )}
        <div className="ai-box no-print">
          {icons.spark}
          <span>
            <b>Draft the summary with AI</b>
            Reserved for the AI step. It will draft from the findings and numbers on this page only, and the analyst edits every word. Off for now.
          </span>
          <button className="btn btn-sm" type="button" disabled>
            Off
          </button>
        </div>
      </div>

      {r.sections.map((s, i) => (
        <section key={s.id} className="report-section panel">
          <div className="spread" style={{ marginBottom: 6 }}>
            <h3>{s.service.name}</h3>
            <div className="row">
              <Level level={s.run.level} />
              {canEdit && (
                <span className="row no-print" style={{ gap: 4 }}>
                  <button className="icon-btn" type="button" aria-label="Move up" disabled={i === 0 || a.busy} onClick={() => section(s, { position: i - 1 })}>
                    ↑
                  </button>
                  <button className="icon-btn" type="button" aria-label="Move down" disabled={i === r.sections.length - 1 || a.busy} onClick={() => section(s, { position: i + 1 })}>
                    ↓
                  </button>
                  <button className="icon-btn" type="button" aria-label="Remove from report" disabled={a.busy} onClick={() => section(s, null)}>
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
          <p className="faint" style={{ marginBottom: 14, fontSize: '0.8rem' }}>
            Method: {s.service.method} · run {fmtTime(s.run.created_at)}
            <SectionChecks s={s} />
          </p>
          <Note s={s} canEdit={canEdit} save={(note) => section(s, { note })} />
          <ResultView r={s.run.result} />
        </section>
      ))}
      <p className="faint" style={{ margin: '18px 4px', fontSize: '0.78rem' }}>
        Figures in {client.currency}. Every number comes from the models named in each section.
      </p>
    </div>
  )
}

function SectionChecks({ s }: { s: Section }) {
  const c = s.run.result.checks
  if (!c) return <span className="no-print"> · not checked: run again</span>
  const n = count(c)
  const open = c.filter((k) => k.status === 'fail' && !s.acks[k.id]).length
  return (
    <span className={`no-print sec-chk${open ? ' bad' : n.warn ? ' warn' : ''}`}>
      {' · '}
      {open ? `${open} failed check${open > 1 ? 's' : ''}` : `${n.pass} checks passed`}
      {n.warn ? `, ${n.warn} to look at` : ''}
    </span>
  )
}

function Note({ s, canEdit, save }: { s: Section; canEdit: boolean; save: (note: string) => void }) {
  const [v, setV] = useState(s.note)
  if (!canEdit) return s.note ? <p className="analyst-note">{s.note}</p> : null
  return <textarea className="note-edit no-print-empty" rows={2} placeholder="Your note on this section for the client (optional)" value={v} onChange={(e) => setV(e.target.value)} onBlur={() => v !== s.note && save(v)} />
}
