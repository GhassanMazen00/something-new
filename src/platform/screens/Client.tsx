// One client: overview, files, services, report and activity. The server checks access on every request too.

import { useEffect, useRef, useState } from 'react'
import { navigate } from '../../app/route'
import { setCurrency } from '../../app/lib/format'
import type { Level as L } from '../../app/services/types'
import { icons, Level, LEVEL_TEXT } from '../../app/ui/bits'
import { ResultView } from '../../app/ui/ResultView'
import { api, type ClientT, type ParamT, type Person, type Readiness, type ReportT, type RunT, type ServiceT } from '../api'
import { Shell } from '../App'
import { daysLeft, fmtDate, fmtTime, useAction, useLoad } from '../hooks'
import { useSession } from '../session'
import { ActivityPage } from './Activity'
import { RunChecks } from './Checks'
import { PeopleSelect, SECTORS, STATUS_TONE } from './Clients'
import { FileMapping, FilesTab } from './Files'
import { ReportTab } from './Report'

const LEVELS: L[] = ['high', 'medium', 'low', 'none']
type Services = { kinds: string[]; services: Readiness[] }

const TABS = [
  ['overview', 'Overview'],
  ['files', 'Files'],
  ['services', 'Services'],
  ['report', 'Report'],
  ['activity', 'Activity'],
] as const

export function ClientPage({ id, tab, sub }: { id: number; tab: string; sub?: string }) {
  const { catalog } = useSession()
  const client = useLoad(() => api.get<ClientT>(`/clients/${id}`), [id])
  const c = client.data
  if (c) setCurrency(c.currency)
  if (client.error)
    return (
      <Shell crumbs={<b>No access</b>}>
        <div className="locked panel">
          {icons.lock}
          <h2>You can’t open this client</h2>
          <p className="muted">{client.error}</p>
          <a className="btn" href="#/clients">
            Back to clients
          </a>
        </div>
      </Shell>
    )
  if (!c)
    return (
      <Shell crumbs={<b>Loading…</b>}>
        <div className="empty panel">Loading…</div>
      </Shell>
    )
  const svc = tab === 'service' && sub ? catalog.services.find((s) => s.id === sub) : undefined
  const fileId = tab === 'file' && sub ? Number(sub) : undefined
  const crumbs = (
    <>
      <a href="#/clients">Clients</a>
      <span>/</span>
      {svc || fileId ? (
        <>
          <a href={`#/client/${c.id}/${svc ? 'services' : 'files'}`}>{c.name}</a>
          <span>/</span>
          <b>{svc ? svc.name : 'Check columns'}</b>
        </>
      ) : (
        <b>{c.name}</b>
      )}
    </>
  )
  return (
    <Shell crumbs={crumbs}>
      {svc ? (
        <RunService key={`${c.id}/${svc.id}`} client={c} svc={svc} />
      ) : fileId ? (
        <FileMapping key={fileId} client={c} fileId={fileId} />
      ) : (
        <>
          <ClientHead client={c} />
          <nav className="tabs" aria-label="Client sections">
            {TABS.map(([k, label]) => (
              <a key={k} href={`#/client/${c.id}/${k}`} className={tab === k ? 'on' : undefined} aria-current={tab === k ? 'page' : undefined}>
                {label}
              </a>
            ))}
          </nav>
          {tab === 'files' && <FilesTab client={c} changed={client.reload} />}
          {tab === 'services' && <ServicesTab client={c} />}
          {tab === 'report' && <ReportTab client={c} changed={client.reload} />}
          {tab === 'activity' && <ActivityPage clientId={c.id} />}
          {tab === 'overview' && <Overview client={c} changed={client.reload} />}
        </>
      )}
    </Shell>
  )
}

function ClientHead({ client }: { client: ClientT }) {
  return (
    <div className="client-head">
      <div>
        <div className="row">
          <span className={`tag ${STATUS_TONE[client.status] ?? ''}`}>{client.status}</span>
          <span className="tag">Analyst: {client.analyst?.name ?? 'not assigned'}</span>
          <span className="tag">Reviewer: {client.reviewer?.name ?? 'not assigned'}</span>
        </div>
        <h1 style={{ marginTop: 10 }}>{client.name}</h1>
        <div className="meta">
          {client.industry && <span>{client.industry}</span>}
          {client.contact && <span>Contact: {client.contact}</span>}
          <span>Opened {fmtDate(client.received_at)}</span>
          <span>Money in {client.currency}</span>
        </div>
      </div>
      <div className="deadline">
        Files deleted automatically
        <b>{daysLeft(client.delete_on)} days</b>
        on {fmtDate(client.delete_on)}
      </div>
    </div>
  )
}

function ReadinessBar({ services }: { services: Readiness[] }) {
  const counts = LEVELS.map((l) => services.filter((s) => s.level === l).length)
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div className="stack" aria-hidden="true">
        {LEVELS.map((l, i) => (counts[i] ? <i key={l} className={`st-${l}`} style={{ flex: counts[i] }} /> : null))}
      </div>
      <div className="legend">
        {LEVELS.map((l, i) => (
          <span key={l}>
            <i className={`st-${l}`} />
            {LEVEL_TEXT[l]} {counts[i]}
          </span>
        ))}
      </div>
    </div>
  )
}

function Overview({ client, changed }: { client: ClientT; changed: () => void }) {
  const { me, catalog, kindLabel } = useSession()
  const svcs = useLoad(() => api.get<Services>(`/clients/${client.id}/services`), [client.id, client.files])
  const report = useLoad(() => api.get<ReportT>(`/clients/${client.id}/report`), [client.id])
  const list = svcs.data?.services ?? []
  const byId = new Map(catalog.services.map((s) => [s.id, s]))
  const ready = list.filter((s) => s.level !== 'none')
  const missing = new Map<string, number>()
  for (const s of list) if (s.level !== 'high') for (const k of s.missing) missing.set(k, (missing.get(k) ?? 0) + 1)
  return (
    <div className="grid-2">
      <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
        {client.question && (
          <div className="panel pad">
            <div className="panel-title">The client’s question</div>
            <p className="question">“{client.question}”</p>
          </div>
        )}
        {client.review_comment && client.status === 'Changes requested' && (
          <div className="panel pad notice">
            <div className="panel-title">The reviewer asked for changes</div>
            <p>{client.review_comment}</p>
          </div>
        )}
        <div className="panel pad">
          <div className="panel-title">
            {client.files ? `${ready.length} of 32 services can run` : 'Start here'}
            <a className="btn btn-sm" href={`#/client/${client.id}/${client.files ? 'services' : 'files'}`}>
              {client.files ? 'All services' : 'Upload files'}
            </a>
          </div>
          {client.files ? (
            <div className="list">
              {ready
                .filter((s) => s.level === 'high')
                .slice(0, 8)
                .map((s) => (
                  <a key={s.id} className="suggest" href={`#/client/${client.id}/service/${s.id}`}>
                    <span>
                      <b>{byId.get(s.id)?.name}</b>
                      <br />
                      <span className="muted" style={{ fontSize: '0.82rem' }}>
                        {byId.get(s.id)?.get}
                      </span>
                    </span>
                    {s.last_run ? <span className="tag">Run {fmtTime(s.last_run.at)}</span> : <Level level={s.level} />}
                  </a>
                ))}
            </div>
          ) : (
            <p className="muted">Upload the client’s files (CSV or Excel), check how the columns were read, and the services that the files allow will open up.</p>
          )}
        </div>
      </div>
      <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
        <div className="panel pad">
          <div className="panel-title">What these files allow</div>
          <ReadinessBar services={list} />
          {missing.size > 0 && (
            <>
              <p className="faint" style={{ margin: '16px 0 8px', fontSize: '0.8rem' }}>
                Files that would lift more services to full confidence:
              </p>
              <div className="list">
                {[...missing]
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([k, n]) => (
                    <div key={k} className="spread">
                      <span>{kindLabel(k)}</span>
                      <span className="muted" style={{ fontSize: '0.82rem' }}>
                        lifts {n} service{n > 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
        <div className="panel pad">
          <div className="panel-title">
            Report
            <a className="btn btn-sm" href={`#/client/${client.id}/report`}>
              Open
            </a>
          </div>
          <p className="muted">{report.data?.sections.length ? `${report.data.sections.length} sections · ${client.status}` : 'Nothing added yet. Run a service and press “Add to report”.'}</p>
        </div>
        {me.role === 'admin' ? <AdminBox client={client} changed={changed} /> : <EditDetails client={client} changed={changed} />}
      </div>
    </div>
  )
}

function EditDetails({ client, changed }: { client: ClientT; changed: () => void }) {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: client.name, industry: client.industry, sector: client.sector, contact: client.contact, question: client.question, currency: client.currency, calendar: client.calendar })
  const a = useAction()
  const { me } = useSession()
  if (me.role !== 'admin' && client.analyst?.id !== me.id) return null
  if (!open)
    return (
      <button className="btn btn-sm" type="button" onClick={() => setOpen(true)} style={{ justifySelf: 'start' }}>
        Edit client details
      </button>
    )
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  return (
    <form
      className="panel pad"
      onSubmit={(e) => {
        e.preventDefault()
        a.run(() => api.patch(`/clients/${client.id}`, f)).then((r) => {
          if (r) {
            setOpen(false)
            changed()
          }
        })
      }}
    >
      <div className="panel-title">Client details</div>
      <label className="field">
        Company name
        <input value={f.name} onChange={set('name')} required />
      </label>
      <label className="field">
        What they do
        <input value={f.industry} onChange={set('industry')} />
      </label>
      <div className="form-grid">
        <label className="field">
          Sector
          <select value={f.sector} onChange={set('sector')}>
            {SECTORS.map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Currency
          <input value={f.currency} onChange={set('currency')} maxLength={3} />
        </label>
      </div>
      <label className="field">
        Calendar the sales follow
        <select value={f.calendar} onChange={set('calendar')}>
          <option value="auto">From the currency</option>
          <option value="mena">Ramadan, weekend Fri–Sat (Egypt, Saudi Arabia…)</option>
          <option value="gulf">Ramadan, weekend Sat–Sun (UAE, Morocco…)</option>
          <option value="other">No Ramadan effect, weekend Sat–Sun</option>
        </select>
      </label>
      <label className="field">
        Contact
        <input value={f.contact} onChange={set('contact')} />
      </label>
      <label className="field">
        Their question
        <textarea value={f.question} onChange={set('question')} rows={2} />
      </label>
      {a.error && <p className="error">{a.error}</p>}
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary btn-sm" type="submit" disabled={a.busy}>
          Save
        </button>
        <button className="btn btn-sm" type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function AdminBox({ client, changed }: { client: ClientT; changed: () => void }) {
  const people = useLoad(() => api.get<Person[]>('/users'), [])
  const a = useAction()
  const [confirm, setConfirm] = useState('')
  const patch = (body: object) => a.run(() => api.patch(`/clients/${client.id}`, body)).then((r) => r && changed())
  return (
    <>
      <div className="panel pad">
        <div className="panel-title">Admin</div>
        <div className="form-grid">
          <PeopleSelect label="Analyst" role="analyst" value={client.analyst?.id ?? null} onChange={(v) => patch({ analyst_id: v })} people={people.data ?? []} />
          <PeopleSelect label="Reviewer" role="reviewer" value={client.reviewer?.id ?? null} onChange={(v) => patch({ reviewer_id: v })} people={people.data ?? []} />
        </div>
        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn btn-sm" type="button" onClick={() => patch({ extend_days: 14 })} disabled={a.busy}>
            Keep files 14 days longer
          </button>
        </div>
        <details className="danger" style={{ marginTop: 16 }}>
          <summary>Delete this client now</summary>
          <p className="muted" style={{ fontSize: '0.84rem', margin: '8px 0' }}>
            Destroys the client’s encryption key, files, results and report. This can’t be undone. Type the client’s name to confirm.
          </p>
          <div className="row">
            <input className="search" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={client.name} />
            <button
              className="btn btn-sm btn-danger"
              type="button"
              disabled={confirm.trim() !== client.name || a.busy}
              onClick={() => a.run(() => api.del(`/clients/${client.id}`)).then((r) => r && navigate('/clients'))}
            >
              Delete everything
            </button>
          </div>
        </details>
        {a.error && <p className="error">{a.error}</p>}
      </div>
      <EditDetails client={client} changed={changed} />
    </>
  )
}

function ServicesTab({ client }: { client: ClientT }) {
  const { catalog } = useSession()
  const svcs = useLoad(() => api.get<Services>(`/clients/${client.id}/services`), [client.id])
  const r = new Map((svcs.data?.services ?? []).map((s) => [s.id, s]))
  if (svcs.error) return <p className="error">{svcs.error}</p>
  if (!svcs.data) return <div className="empty panel">Checking what the files allow…</div>
  return (
    <>
      {catalog.departments.map((d) => (
        <section key={d.id} className="dept-block">
          <h2>{d.name}</h2>
          <div className="svc-rows">
            {catalog.services
              .filter((s) => s.dept === d.id)
              .map((s) => {
                const x = r.get(s.id)!
                const off = x.level === 'none'
                return (
                  <a key={s.id} className={`svc-row${off ? ' off' : ''}`} href={`#/client/${client.id}/service/${s.id}`}>
                    <b>{s.name}</b>
                    <span className="get">{x.why && !off ? x.why : s.get}</span>
                    <Level level={x.level} />
                    <span className="go">{off ? 'See what’s needed' : x.last_run ? 'Open' : 'Run'} →</span>
                  </a>
                )
              })}
          </div>
        </section>
      ))}
    </>
  )
}

function ParamControl({ p, value, currency, onChange }: { p: ParamT; value: number; currency: string; onChange: (v: number) => void }) {
  const n = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: p.step < 1 ? 2 : 0 })
  const show = p.format === 'pct' ? `${value > 0 ? '+' : ''}${n(value)}%` : p.format === 'share' ? `${n(value)}%` : p.format === 'money' ? `${currency} ${n(value)}` : p.format === 'rate' ? `${n(value)} per $` : n(value)
  const span = p.max - p.min
  // Money inputs (an opening balance, a market size) can be far outside a slider's reach: type them.
  if (p.format === 'money' || span / p.step > 2000)
    return (
      <label className="param">
        <span className="spread">
          {p.label}
          <b>{show}</b>
        </span>
        <input className="num-input" type="number" step={p.step} value={value} onChange={(e) => e.target.value !== '' && onChange(Number(e.target.value))} />
      </label>
    )
  return (
    <label className="param">
      <span className="spread">
        {p.label}
        <b>{show}</b>
      </span>
      <input type="range" min={p.min} max={p.max} step={p.step} value={Math.min(p.max, Math.max(p.min, value))} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}

function RunService({ client, svc }: { client: ClientT; svc: ServiceT }) {
  const { catalog, kindLabel, me } = useSession()
  const svcs = useLoad(() => api.get<Services>(`/clients/${client.id}/services`), [client.id])
  const runs = useLoad(() => api.get<RunT[]>(`/clients/${client.id}/runs?service_id=${svc.id}`), [client.id, svc.id])
  const report = useLoad(() => api.get<ReportT>(`/clients/${client.id}/report`), [client.id])
  const r = svcs.data?.services.find((s) => s.id === svc.id)
  const [p, setP] = useState<Record<string, number> | null>(null)
  const [current, setCurrent] = useState<RunT | null>(null)
  const [failure, setFailure] = useState('')
  const a = useAction()
  const canEdit = me.role === 'admin' || client.analyst?.id === me.id
  const latest = current ?? runs.data?.[0] ?? null
  const params = p ?? latest?.params ?? r?.params ?? {}
  const dirty = !!latest && svc.params.some((x) => params[x.key] !== latest.params[x.key])
  const inReport = report.data?.sections.find((s) => s.run.service_id === svc.id)

  const run = async () => {
    setFailure('')
    const out = await a.run(() => api.post<RunT & { error?: string }>(`/clients/${client.id}/runs`, { service_id: svc.id, params }))
    if (!out) return
    if (out.error) return setFailure(out.error)
    setCurrent(out)
    setP(null)
    svcs.reload()
  }
  // Open straight on a result: the last one, or a fresh run if this service hasn't been run yet.
  const autoRan = useRef(false)
  const autoRun = canEdit && !!r && r.level !== 'none' && !!runs.data && !runs.data.length
  useEffect(() => {
    if (autoRun && !autoRan.current) {
      autoRan.current = true
      run()
    }
  })

  const addToReport = async () => {
    if (!latest) return
    const out = await a.run(() => api.post(`/clients/${client.id}/report/sections`, { run_id: latest.id }))
    if (out) report.reload()
  }
  const reportIsLatest = inReport && latest && inReport.run.id === latest.id
  if (!r) return <div className="empty panel">{svcs.error || 'Loading…'}</div>
  return (
    <>
      <div className="run-head">
        <div>
          <span className="faint" style={{ fontSize: '0.8rem' }}>
            {catalog.departments.find((d) => d.id === svc.dept)?.name}
          </span>
          <h1>{svc.name}</h1>
          <p>{svc.get}</p>
          <div className="row" style={{ marginTop: 10 }}>
            <Level level={latest?.level ?? r.level} />
            {r.why && <span className="muted" style={{ fontSize: '0.8rem' }}>{r.why}</span>}
          </div>
        </div>
        {r.level !== 'none' && canEdit && latest && (
          <button className={`btn${reportIsLatest ? '' : ' btn-primary'}`} type="button" onClick={addToReport} disabled={!!reportIsLatest || a.busy || dirty}>
            {reportIsLatest ? 'In the report ✓' : inReport ? 'Update the report with this run' : 'Add to report'}
          </button>
        )}
      </div>
      <div className="method panel pad">
        <div>
          <small>Method</small>
          {svc.method}
        </div>
        <div>
          <small>Data used</small>
          {svc.data}
        </div>
        <div>
          <small>{svc.preview ? 'How it runs' : 'If data is missing'}</small>
          {svc.preview ?? svc.missing}
        </div>
      </div>
      {r.level === 'none' ? (
        <div className="needs panel">
          <h2>This needs data the client hasn’t sent</h2>
          <p className="muted">
            {r.why ?? `Needed: ${r.missing.map(kindLabel).join(' + ') || 'see the method'}.`} If they don’t have it: {svc.missing}
          </p>
          <a className="btn" href={`#/client/${client.id}/files`}>
            Go to files
          </a>
        </div>
      ) : (
        <>
          {(svc.params.length > 0 || canEdit) && (
            <div className="params panel">
              {svc.params.map((x) => (
                <ParamControl key={x.key} p={x} value={params[x.key] ?? x.value} currency={client.currency} onChange={(v) => setP({ ...params, [x.key]: v })} />
              ))}
              {canEdit && (
                <div className="run-bar">
                  <button className={`btn${dirty || !latest ? ' btn-primary' : ''}`} type="button" onClick={run} disabled={a.busy}>
                    {a.busy ? 'Running the models…' : latest ? (dirty ? 'Run with these settings' : 'Run again') : 'Run'}
                  </button>
                  {latest && (
                    <span className="faint" style={{ fontSize: '0.78rem' }}>
                      Result from {fmtTime(latest.created_at)} · {(latest.ms / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
          {a.error && <p className="error">{a.error}</p>}
          {failure && (
            <div className="needs panel">
              <h2>This couldn’t run on these files</h2>
              <p className="muted">{failure}</p>
            </div>
          )}
          {latest && <RunChecks checks={latest.result.checks} />}
          {latest ? <ResultView r={latest.result} /> : !failure && <div className="empty panel">{a.busy || canEdit ? 'Running the models…' : 'No result yet. The analyst runs it.'}</div>}
        </>
      )}
    </>
  )
}
