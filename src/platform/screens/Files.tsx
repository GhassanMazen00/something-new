// Uploading the client's files and checking how each column was read before any model uses it.

import { useRef, useState, type DragEvent } from 'react'
import { navigate } from '../../app/route'
import { icons } from '../../app/ui/bits'
import { api, type ClientT, type FileT, type Health } from '../api'
import { fmtDate, useAction, useLoad } from '../hooks'
import { useSession } from '../session'

const size = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`)
const ext = (name: string) => (name.split('.').pop() ?? '').toLowerCase()

function HealthLine({ h }: { h: Health }) {
  return (
    <span className={`health ${h.score >= 90 ? 'good' : h.score >= 70 ? 'ok' : 'bad'}`}>
      Health {h.score}/100 · {h.rows_out.toLocaleString('en-US')} clean rows
      {h.from && h.to ? ` · ${fmtDate(h.from)} – ${fmtDate(h.to)}` : ''}
    </span>
  )
}

export function FilesTab({ client, changed }: { client: ClientT; changed: () => void }) {
  const { me } = useSession()
  const files = useLoad(() => api.get<FileT[]>(`/clients/${client.id}/files`), [client.id])
  const a = useAction()
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const canEdit = me.role === 'admin' || client.analyst?.id === me.id
  const list = files.data ?? []
  const waiting = list.filter((f) => !f.ready)

  const upload = async (picked: FileList | File[]) => {
    const arr = [...picked]
    if (!arr.length) return
    const form = new FormData()
    arr.forEach((f) => form.append('files', f))
    const out = await a.run(() => api.upload<FileT[]>(`/clients/${client.id}/files`, form))
    if (out) {
      files.reload()
      changed()
      if (out.length === 1) navigate(`/client/${client.id}/file/${out[0].id}`)
    }
  }
  const drop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    if (canEdit) upload(e.dataTransfer.files)
  }
  const remove = async (f: FileT) => {
    if (!confirm(`Delete ${f.name}? The encrypted copy is destroyed.`)) return
    if (await a.run(() => api.del(`/files/${f.id}`))) {
      files.reload()
      changed()
    }
  }
  return (
    <div className="grid-2">
      <div className="panel pad">
        <div className="panel-title">
          {list.length} file{list.length === 1 ? '' : 's'} · {list.reduce((s, f) => s + f.rows, 0).toLocaleString('en-US')} clean rows
          <span className="tag">Encrypted</span>
        </div>
        {!list.length && <p className="muted">No files yet.</p>}
        <div className="list">
          {list.map((f) => (
            <div key={f.id} className="file">
              <span className={`ext ext-${ext(f.name)}`}>{ext(f.name)}</span>
              <span>
                <b>{f.name}</b>
                <small>
                  {f.kind_label ?? 'Type not set'} · {size(f.size)} · uploaded {fmtDate(f.uploaded_at)}
                </small>
                {f.ready && 'score' in f.health ? <HealthLine h={f.health as Health} /> : <small className="warn">Columns not checked yet: no service uses this file until you confirm them.</small>}
              </span>
              <span className="row" style={{ flexWrap: 'nowrap' }}>
                {canEdit && (
                  <a className={`btn btn-sm${f.ready ? '' : ' btn-primary'}`} href={`#/client/${client.id}/file/${f.id}`}>
                    {f.ready ? 'Columns' : 'Check columns'}
                  </a>
                )}
                {canEdit && (
                  <button className="icon-btn" type="button" title="Delete file" aria-label={`Delete ${f.name}`} onClick={() => remove(f)}>
                    ×
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
        {waiting.length > 1 && canEdit && (
          <p className="hint" style={{ marginTop: 14 }}>
            {waiting.length} files are waiting for their columns to be checked.
          </p>
        )}
      </div>
      <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
        {canEdit && (
          <div
            className={`upload drop${over ? ' over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setOver(true)
            }}
            onDragLeave={() => setOver(false)}
            onDrop={drop}
          >
            {icons.upload}
            <b>{a.busy ? 'Uploading and reading…' : 'Drop the client’s files here'}</b>
            <span>CSV or Excel (.xlsx), as exported from their system. Several at once is fine. Each file is encrypted the moment it arrives.</span>
            <button className="btn btn-sm" type="button" onClick={() => input.current?.click()} disabled={a.busy}>
              Choose files
            </button>
            <input ref={input} type="file" multiple accept=".csv,.txt,.tsv,.xlsx,.xlsm" hidden onChange={(e) => e.target.files && upload(e.target.files)} />
          </div>
        )}
        {a.error && <p className="error">{a.error}</p>}
        <div className="panel pad">
          <div className="panel-title">How files are read</div>
          <p className="muted" style={{ fontSize: '0.86rem' }}>
            The workspace guesses what each file is (sales list, bank statement, payroll…) and which column means what, in English or Arabic. You check it once per file. Dates, Arabic digits, thousands separators and title rows above the header are handled automatically, and the health score lists everything that was fixed.
          </p>
        </div>
      </div>
    </div>
  )
}

export function FileMapping({ client, fileId }: { client: ClientT; fileId: number }) {
  const { kinds } = useSession()
  const [opts, setOpts] = useState<{ kind?: string; sheet?: string; header_row?: number }>({})
  const q = new URLSearchParams(Object.entries(opts).filter(([, v]) => v !== undefined) as [string, string][]).toString()
  const file = useLoad(() => api.get<FileT>(`/files/${fileId}${q ? '?' + q : ''}`), [fileId, q])
  const [mapping, setMapping] = useState<Record<string, string> | null>(null)
  const [dayfirst, setDayfirst] = useState<'auto' | 'yes' | 'no'>('auto')
  const [saved, setSaved] = useState<FileT | null>(null)
  const a = useAction()
  const f = file.data
  const [lastKey, setLastKey] = useState('')
  // A new type, sheet or header row brings new suggestions; start the editor from them.
  if (f && lastKey !== q + f.id) {
    setLastKey(q + f.id)
    setMapping(f.mapping)
    if (!q && f.options.dayfirst !== undefined) setDayfirst(f.options.dayfirst ? 'yes' : 'no')
  }
  if (file.error) return <p className="error">{file.error}</p>
  if (!f || !mapping) return <div className="empty panel">Reading the file…</div>
  const kind = kinds.find((k) => k.key === f.kind) ?? kinds[0]
  const used = new Set(Object.values(mapping).filter(Boolean))
  const cols = f.preview_columns ?? f.columns
  const missing = kind.fields.filter((x) => x.required && !mapping[x.key])
  const anyOk = !kind.any_of.length || kind.any_of.some((g) => g.every((k) => mapping[k]))
  const save = async () => {
    const options: Record<string, unknown> = {}
    if (opts.sheet !== undefined || f.options.sheet) options.sheet = opts.sheet ?? f.options.sheet
    if (opts.header_row !== undefined && opts.header_row >= 0) options.header_row = opts.header_row
    else if (opts.header_row === undefined && f.options.header_row !== undefined) options.header_row = f.options.header_row
    if (dayfirst !== 'auto') options.dayfirst = dayfirst === 'yes'
    const out = await a.run(() => api.put<FileT>(`/files/${f.id}/mapping`, { kind: kind.key, mapping, options }))
    if (out) setSaved(out)
  }
  if (saved) {
    const h = saved.health as Health
    return (
      <div className="panel pad" style={{ maxWidth: 760 }}>
        <div className="panel-title">
          {saved.name} is ready
          <span className="tag green">{saved.kind_label}</span>
        </div>
        <HealthLine h={h} />
        <ul className="issues">
          {h.issues.length ? h.issues.map((x) => <li key={x}>{x}</li>) : <li>No problems found.</li>}
          {h.dayfirst !== undefined && <li>Dates were read as {h.dayfirst ? 'day/month/year' : 'month/day/year'}.</li>}
        </ul>
        <div className="row" style={{ marginTop: 18 }}>
          <a className="btn btn-primary" href={`#/client/${client.id}/files`}>
            Back to files
          </a>
          <a className="btn" href={`#/client/${client.id}/services`}>
            See what can run
          </a>
          <button className="btn" type="button" onClick={() => setSaved(null)}>
            Change columns
          </button>
        </div>
      </div>
    )
  }
  return (
    <>
      <div className="run-head">
        <div>
          <span className="faint" style={{ fontSize: '0.8rem' }}>
            Check columns
          </span>
          <h1>{f.name}</h1>
          <p>
            Confirm what this file is and which column holds what.{' '}
            {f.suggested && !opts.kind && <span className="faint">The workspace guessed “{kinds.find((k) => k.key === f.suggested!.kind)?.label}” ({Math.round(f.suggested.confidence * 100)}% sure).</span>}
          </p>
        </div>
        <button className="btn btn-primary" type="button" onClick={save} disabled={a.busy || !!missing.length || !anyOk}>
          {a.busy ? 'Cleaning the data…' : 'Confirm and clean'}
        </button>
      </div>
      {a.error && <p className="error">{a.error}</p>}
      <div className="mapping-grid">
        <div className="panel pad">
          <div className="form-grid">
            <label className="field">
              This file is a
              <select value={kind.key} onChange={(e) => setOpts({ ...opts, kind: e.target.value })}>
                {kinds.map((k) => (
                  <option key={k.key} value={k.key}>
                    {k.label}
                  </option>
                ))}
              </select>
            </label>
            {(f.options.sheets?.length ?? 0) > 1 && (
              <label className="field">
                Sheet
                <select value={opts.sheet ?? f.options.sheet ?? f.options.sheets![0]} onChange={(e) => setOpts({ ...opts, sheet: e.target.value })}>
                  {f.options.sheets!.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            )}
            <label className="field">
              Header row
              <select value={opts.header_row ?? f.options.header_row ?? -1} onChange={(e) => setOpts({ ...opts, header_row: Number(e.target.value) })}>
                <option value={-1}>Find it automatically</option>
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i} value={i}>
                    Row {i + 1}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Dates are written
              <select value={dayfirst} onChange={(e) => setDayfirst(e.target.value as typeof dayfirst)}>
                <option value="auto">Work it out</option>
                <option value="yes">Day first (31/12/2025)</option>
                <option value="no">Month first (12/31/2025)</option>
              </select>
            </label>
          </div>
          <table className="tbl map-tbl">
            <thead>
              <tr>
                <th>We need</th>
                <th>Column in the file</th>
                <th>First values</th>
              </tr>
            </thead>
            <tbody>
              {kind.fields.map((x) => {
                const col = mapping[x.key] ?? ''
                const i = cols.indexOf(col)
                const sample = i >= 0 ? (f.preview ?? []).slice(0, 3).map((r) => r[i]).filter(Boolean).join(' · ') : ''
                return (
                  <tr key={x.key} className={x.required && !col ? 'need' : undefined}>
                    <td>
                      {x.label}
                      {x.required && <span className="req"> required</span>}
                    </td>
                    <td>
                      <select value={col} onChange={(e) => setMapping({ ...mapping, [x.key]: e.target.value })}>
                        <option value="">{x.required ? 'Choose a column' : 'Not in this file'}</option>
                        {cols.map((c) => (
                          <option key={c} value={c} disabled={used.has(c) && c !== col}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="faint sample">{sample}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {kind.key === 'adswide' && (
            <p className={f.spend_columns?.length ? 'hint' : 'error'}>
              {f.spend_columns?.length
                ? `Spend columns found, one per channel: ${f.spend_columns.join(', ')}. Each becomes a channel.`
                : 'No spend columns found. Name each channel’s column like “TV spend” or “facebook_S”.'}
            </p>
          )}
          {!anyOk && <p className="error">This type also needs one of these sets: {kind.any_of.map((g) => g.map((k) => kind.fields.find((x) => x.key === k)?.label).join(' + ')).join(', or ')}.</p>}
        </div>
        <div className="panel pad preview-panel">
          <div className="panel-title">The file as read · first rows</div>
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  {cols.map((c) => (
                    <th key={c} className={used.has(c) ? 'mapped' : undefined}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(f.preview ?? []).map((r, i) => (
                  <tr key={i}>
                    {r.map((v, j) => (
                      <td key={j} className="nw">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint" style={{ marginTop: 10 }}>
            Highlighted columns are used. Columns not matched are kept in the encrypted original but not used by any model.
          </p>
        </div>
      </div>
    </>
  )
}
