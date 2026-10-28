// An analyst's clients, and everything about one client: overview, files, services, report, activity.

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ANALYSTS, CLIENTS, clientsFor } from '../data/clients'
import { KIND_LABEL, type Client, type Kind } from '../data/types'
import { cached, readiness, run, startParams } from '../engine'
import { egp, num } from '../lib/format'
import { DEPTS, SERVICES, serviceById } from '../services'
import type { Level as L, Param, Result, ServiceDef } from '../services/types'
import { log, me, sendForReview, toggleReport, useStore } from '../store'
import { icons, Level, LEVEL_TEXT } from '../ui/bits'
import { ChartView } from '../ui/charts'
import { Findings, Kpis, ResultView } from '../ui/ResultView'
import type { ShellType } from '../App'
import { Activity } from './Activity'

const LEVELS: L[] = ['high', 'medium', 'low', 'none']
const TODAY = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
const daysLeft = (iso: string) => Math.max(0, Math.ceil((Date.parse(iso + 'T23:59:59') - Date.now()) / 864e5))
const fmtDate = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function ReadinessBar({ client }: { client: Client }) {
  const counts = LEVELS.map((l) => SERVICES.filter((s) => readiness(client, s).level === l).length)
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

export function ClientsList() {
  const user = me()!
  const mine = clientsFor(user.id)
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Good to see you, {user.name.split(' ')[0]}</h1>
          <p>Your assigned clients. Other analysts’ clients are not shown and can’t be opened.</p>
        </div>
      </div>
      <div className="client-grid">
        {mine.map((c) => (
          <a key={c.id} className="client-card panel" href={`#/client/${c.id}`}>
            <div className="spread">
              <span className="tag blue">{c.status}</span>
              <span className="faint" style={{ fontSize: '0.78rem' }}>
                Files deleted in {daysLeft(c.deleteOn)} days
              </span>
            </div>
            <div>
              <h3>{c.name}</h3>
              <p className="muted" style={{ fontSize: '0.82rem' }}>
                {c.industry}
              </p>
            </div>
            <p className="q">“{c.question}”</p>
            <ReadinessBar client={c} />
          </a>
        ))}
      </div>
    </>
  )
}

function NoAccess({ name }: { name?: string }) {
  return (
    <div className="locked panel">
      {icons.lock}
      <h2>You don’t have access to this client</h2>
      <p className="muted">{name ? `${name} is assigned to another analyst.` : 'This client doesn’t exist.'} Ask an admin if you need to work on it. This attempt has been logged.</p>
      <a className="btn" href="#/clients">
        Back to my clients
      </a>
    </div>
  )
}

const TABS = [
  ['overview', 'Overview'],
  ['files', 'Files'],
  ['services', 'Services'],
  ['report', 'Report'],
  ['activity', 'Activity'],
] as const

export function ClientPage({ id, tab, sub, Shell }: { id: string; tab: string; sub?: string; Shell: ShellType }) {
  const user = me()!
  const client = CLIENTS.find((c) => c.id === id)
  const allowed = client && client.analyst === user.id
  useEffect(() => {
    if (client && !allowed) log(client.id, `Blocked: ${user.name} tried to open ${client.name}`)
  }, [client, allowed, user.name])
  if (!client || !allowed)
    return (
      <Shell crumbs={<b>No access</b>}>
        <NoAccess name={client?.name} />
      </Shell>
    )
  const svc = tab === 'service' && sub ? serviceById(sub) : undefined
  const crumbs = (
    <>
      <a href="#/clients">My clients</a>
      <span>/</span>
      {svc ? (
        <>
          <a href={`#/client/${client.id}/services`}>{client.name}</a>
          <span>/</span>
          <b>{svc.name}</b>
        </>
      ) : (
        <b>{client.name}</b>
      )}
    </>
  )
  return (
    <Shell crumbs={crumbs}>
      {svc ? (
        <RunService key={`${client.id}/${svc.id}`} client={client} svc={svc} />
      ) : (
        <>
          <ClientHead client={client} />
          <nav className="tabs" aria-label="Client sections">
            {TABS.map(([k, label]) => (
              <a key={k} href={`#/client/${client.id}/${k}`} className={tab === k ? 'on' : undefined} aria-current={tab === k ? 'page' : undefined}>
                {label}
              </a>
            ))}
          </nav>
          {tab === 'files' && <Files client={client} />}
          {tab === 'services' && <Services client={client} />}
          {tab === 'report' && <Report client={client} />}
          {tab === 'activity' && <Activity client={client.id} />}
          {tab === 'overview' && <Overview client={client} />}
        </>
      )}
    </Shell>
  )
}

function ClientHead({ client }: { client: Client }) {
  return (
    <div className="client-head">
      <div>
        <div className="row">
          <span className="tag blue">{client.status}</span>
          <span className="tag">Analyst: {ANALYSTS.find((a) => a.id === client.analyst)!.name}</span>
        </div>
        <h1 style={{ marginTop: 10 }}>{client.name}</h1>
        <div className="meta">
          <span>{client.industry}</span>
          <span>Contact: {client.contact}</span>
          <span>Files received {fmtDate(client.received)}</span>
        </div>
      </div>
      <div className="deadline">
        Files deleted automatically
        <b>{daysLeft(client.deleteOn)} days</b>
        on {fmtDate(client.deleteOn)}
      </div>
    </div>
  )
}

function Overview({ client }: { client: Client }) {
  const store = useStore()
  const inReport = store.report[client.id] ?? []
  return (
    <div className="grid-2">
      <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
        <div className="panel pad">
          <div className="panel-title">The client’s question</div>
          <p className="question">“{client.question}”</p>
        </div>
        <div className="panel pad">
          <div className="panel-title">
            Start with these
            <a className="btn btn-sm" href={`#/client/${client.id}/services`}>
              All 32 services
            </a>
          </div>
          <div className="list">
            {client.focus.map((sid) => {
              const s = serviceById(sid)!
              const r = readiness(client, s)
              return (
                <a key={sid} className="suggest" href={`#/client/${client.id}/service/${sid}`}>
                  <span>
                    <b>{s.name}</b>
                    <br />
                    <span className="muted" style={{ fontSize: '0.82rem' }}>
                      {s.get}
                    </span>
                  </span>
                  <Level level={r.level} />
                </a>
              )
            })}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
        <div className="panel pad">
          <div className="panel-title">What these files allow</div>
          <ReadinessBar client={client} />
        </div>
        <div className="panel pad">
          <div className="panel-title">
            Report
            <a className="btn btn-sm" href={`#/client/${client.id}/report`}>
              Open
            </a>
          </div>
          <p className="muted">{inReport.length ? `${inReport.length} sections added. ${store.sent[client.id] ? 'Sent to the reviewer.' : 'Not sent for review yet.'}` : 'Nothing added yet. Run a service and press “Add to report”.'}</p>
        </div>
        <div className="panel pad">
          <div className="panel-title">Privacy</div>
          <div className="list muted" style={{ fontSize: '0.84rem' }}>
            <span>Files encrypted at rest (AES-256); opened only inside this workspace.</span>
            <span>Names and phone numbers replaced with codes before any AI step.</span>
            <span>Every open, run and export is written to the activity log.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Intake: how each column of each file was understood. In production Claude proposes this and the analyst confirms.
const FIELD: Record<string, string> = {
  date: 'date',
  invoice: 'order id',
  order: 'order id',
  'invoice no.': 'order id',
  entry: 'entry id',
  customer: 'customer',
  'customer id': 'customer',
  party: 'counterparty',
  'item code': 'product',
  sku: 'product',
  item: 'product',
  product: 'product',
  branch: 'branch',
  channel: 'channel',
  qty: 'quantity',
  'unit price': 'price',
  price: 'price',
  'unit cost': 'cost',
  cost: 'cost',
  total: 'amount',
  amount: 'amount',
  hour: 'time',
  month: 'month',
  week: 'week',
  spend: 'spend',
  'employee id': 'employee',
  employee: 'employee',
  id: 'employee',
  name: 'name (coded)',
  salary: 'salary',
  base: 'salary',
  overtime: 'overtime',
  gender: 'gender',
  role: 'role',
}
function Files({ client }: { client: Client }) {
  const ds = client.data()
  const files = client.files(ds)
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({})
  return (
    <div className="grid-2">
      <div className="panel pad">
        <div className="panel-title">
          {files.length} files · {num(files.reduce((a, f) => a + f.rows, 0))} rows
          <span className="tag">Encrypted</span>
        </div>
        <div className="list">
          {files.map((f) => {
            const ext = f.name.split('.').pop()!
            return (
              <div key={f.name}>
                <div className="file">
                  <span className={`ext ext-${ext}`}>{ext}</span>
                  <span>
                    <b>{f.name}</b>
                    <small>
                      {KIND_LABEL[f.kind]} · {num(f.rows)} rows · uploaded {fmtDate(f.uploaded)}
                    </small>
                  </span>
                  {confirmed[f.name] ? (
                    <span className="level lv-high">Confirmed</span>
                  ) : (
                    <button
                      className="btn btn-sm"
                      type="button"
                      onClick={() => {
                        setConfirmed({ ...confirmed, [f.name]: true })
                        log(client.id, `Confirmed column mapping for ${f.name}`)
                      }}
                    >
                      Confirm mapping
                    </button>
                  )}
                </div>
                <div className="mapping">
                  {f.cols.map((c) => {
                    const to = FIELD[c.toLowerCase()] ?? FIELD[c.toLowerCase().split(' ')[0]]
                    return (
                      <span key={c} className="map">
                        {c} <span className="faint">→</span> <em>{to ?? 'kept as is'}</em>
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
        <div className="upload">
          {icons.upload}
          <b>Request more files</b>
          <span>The client gets a new encrypted link that expires after one download.</span>
          <button className="btn btn-sm" type="button" disabled>
            Send link (needs server)
          </button>
        </div>
        <div className="panel pad">
          <div className="panel-title">Intake</div>
          <p className="muted" style={{ fontSize: '0.86rem' }}>
            Each column is mapped to a standard field so every service can read it. Here the mapping comes from simple rules. With the server connected, Claude reads each file, proposes the mapping and flags anything odd. The analyst confirms it before any analysis runs.
          </p>
        </div>
        <div className="panel pad">
          <div className="panel-title">Missing for full confidence</div>
          <MissingFiles client={client} />
        </div>
      </div>
    </div>
  )
}

function MissingFiles({ client }: { client: Client }) {
  const counts = new Map<Kind, number>()
  for (const s of SERVICES) {
    const r = readiness(client, s)
    if (r.level !== 'high') for (const k of r.missing) counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  const list = [...counts].sort((a, b) => b[1] - a[1])
  if (!list.length) return <p className="muted">Nothing: every service can run at full confidence.</p>
  return (
    <div className="list">
      {list.map(([k, n]) => (
        <div key={k} className="spread">
          <span>{KIND_LABEL[k]}</span>
          <span className="muted" style={{ fontSize: '0.82rem' }}>
            lifts {n} service{n > 1 ? 's' : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

function Services({ client }: { client: Client }) {
  return (
    <>
      {DEPTS.map((d) => (
        <section key={d.id} className="dept-block">
          <h2>{d.name}</h2>
          <div className="svc-rows">
            {SERVICES.filter((s) => s.dept === d.id).map((s) => {
              const r = readiness(client, s)
              const off = r.level === 'none'
              return (
                <a key={s.id} className={`svc-row${off ? ' off' : ''}`} href={`#/client/${client.id}/service/${s.id}`}>
                  <b>{s.name}</b>
                  <span className="get">{s.get}</span>
                  <Level level={r.level} />
                  <span className="go">{off ? 'See what’s needed' : 'Run'} →</span>
                </a>
              )
            })}
          </div>
        </section>
      ))}
    </>
  )
}

function ParamControl({ p, value, onChange }: { p: Param; value: number; onChange: (v: number) => void }) {
  const show = p.format === 'pct' ? `${value > 0 ? '+' : ''}${value}%` : p.format === 'egp-rate' ? `EGP ${value}` : num(value, p.step < 1 ? 2 : 0)
  return (
    <label className="param">
      <span className="spread">
        {p.label}
        <b>{show}</b>
      </span>
      <input type="range" min={p.min} max={p.max} step={p.step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}

function RunService({ client, svc }: { client: Client; svc: ServiceDef }) {
  const store = useStore()
  const r = readiness(client, svc)
  const [p, setP] = useState(() => startParams(client, svc))
  const [fresh, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const inReport = (store.report[client.id] ?? []).includes(svc.id)
  // A result already computed for these settings shows at once; otherwise the effect below runs the models.
  const result = cached(client, svc, p) ?? fresh
  useEffect(() => {
    if (r.level === 'none' || cached(client, svc, p)) return
    // Let the "Running" state paint before heavy models block the page.
    const t = setTimeout(() => {
      try {
        setResult(run(client, svc, p))
        log(client.id, `Ran “${svc.name}”`)
      } catch (e) {
        setError((e as Error).message)
      }
    }, 30)
    return () => clearTimeout(t)
  }, [client, svc, p, r.level])
  return (
    <>
      <div className="run-head">
        <div>
          <span className="faint" style={{ fontSize: '0.8rem' }}>
            {DEPTS.find((d) => d.id === svc.dept)!.name}
          </span>
          <h1>{svc.name}</h1>
          <p>{svc.get}</p>
          <div className="row" style={{ marginTop: 10 }}>
            <Level level={r.level} />
            {r.why && <span className="muted" style={{ fontSize: '0.8rem' }}>{r.why}</span>}
          </div>
        </div>
        {r.level !== 'none' && (
          <button className={`btn${inReport ? '' : ' btn-primary'}`} type="button" onClick={() => toggleReport(client.id, svc.id, svc.name)}>
            {inReport ? 'In the report ✓' : 'Add to report'}
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
          <small>{svc.preview ? 'In this preview' : 'If data is missing'}</small>
          {svc.preview ?? svc.missing}
        </div>
      </div>
      {r.level === 'none' ? (
        <div className="needs panel">
          <h2>This needs data the client hasn’t sent</h2>
          <p className="muted">
            Needed: {r.missing.map((k) => KIND_LABEL[k]).join(' + ') || 'see method'}. If they don’t have it: {svc.missing}
          </p>
          <a className="btn" href={`#/client/${client.id}/files`}>
            Request files
          </a>
        </div>
      ) : (
        <>
          {svc.params && (
            <div className="params panel">
              {svc.params.map((x) => (
                <ParamControl key={x.key} p={x} value={p[x.key]} onChange={(v) => setP({ ...p, [x.key]: v })} />
              ))}
            </div>
          )}
          {error ? <p className="error">The model failed: {error}</p> : result ? <ResultView r={result} /> : <div className="empty panel">Running the models…</div>}
        </>
      )}
    </>
  )
}

function Report({ client }: { client: Client }) {
  const store = useStore()
  const user = me()!
  const ids = store.report[client.id]
  const sections = useMemo(
    () =>
      (ids ?? [])
        .map((id) => serviceById(id)!)
        .map((s) => ({ s, r: run(client, s, startParams(client, s)), level: readiness(client, s).level })),
    [ids, client],
  )
  if (!sections.length)
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
  const sent = store.sent[client.id]
  return (
    <div className="report">
      <div className="report-cover panel">
        <div className="spread">
          <span className="tag blue">Draft · {sections.length} sections</span>
          <div className="row">
            <button
              className="btn btn-sm"
              type="button"
              onClick={() => {
                log(client.id, 'Exported the report draft as PDF')
                window.print()
              }}
            >
              Export PDF
            </button>
            <button className="btn btn-sm btn-primary" type="button" disabled={sent} onClick={() => sendForReview(client.id)}>
              {sent ? 'Sent for review ✓' : 'Send for review'}
            </button>
          </div>
        </div>
        <h2>{client.name}</h2>
        <p className="muted" style={{ marginTop: 6 }}>
          “{client.question}”
        </p>
        <p className="faint" style={{ marginTop: 14, fontSize: '0.8rem' }}>
          Prepared by {user.name} · {TODAY} · Confidential
        </p>
        <div className="ai-box">
          {icons.spark}
          <span>
            <b>Write the summary with Claude</b>
            Claude drafts the opening summary and the Arabic version from these findings and numbers only. The analyst edits and approves every word. Switches on with the secure server.
          </span>
          <button className="btn btn-sm" type="button" disabled>
            Draft with Claude
          </button>
        </div>
      </div>
      <div className="report-section panel">
        <h3>Summary</h3>
        <ul className="summary-list">
          {sections.map(({ s, r }) => (
            <li key={s.id}>
              <span>
                <b style={{ fontWeight: 500 }}>{s.name}.</b> {r.findings[0]?.text} {r.findings[0]?.action && <span className="muted">{r.findings[0].action}</span>}
              </span>
              <Level level={r.findings[0]?.level ?? 'medium'} />
            </li>
          ))}
        </ul>
      </div>
      {sections.map(({ s, r, level }) => (
        <ReportSection key={s.id} title={s.name} level={level} method={s.method}>
          <Kpis kpis={r.kpis.slice(0, 4)} />
          {r.charts[0] && (
            <div className="panel pad" style={{ marginBottom: 14 }}>
              <div className="panel-title">{r.charts[0].title}</div>
              <ChartView chart={r.charts[0].chart} />
            </div>
          )}
          <Findings r={r} />
        </ReportSection>
      ))}
      <p className="faint" style={{ margin: '18px 4px', fontSize: '0.78rem' }}>
        Figures in {egp(1).replace(' 1', '')}. Every number comes from the models listed in each section; none is written by AI.
      </p>
    </div>
  )
}

function ReportSection({ title, level, method, children }: { title: string; level: L; method: string; children: ReactNode }) {
  return (
    <section className="report-section panel">
      <div className="spread" style={{ marginBottom: 14 }}>
        <h3>{title}</h3>
        <Level level={level} />
      </div>
      <p className="faint" style={{ marginTop: -8, marginBottom: 14, fontSize: '0.8rem' }}>
        Method: {method}
      </p>
      {children}
    </section>
  )
}
