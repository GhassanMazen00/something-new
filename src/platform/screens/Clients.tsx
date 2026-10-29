// The client list. Admins see every client and add new ones; analysts and reviewers see the clients assigned to them.

import { useState, type FormEvent } from 'react'
import { navigate } from '../../app/route'
import { api, type ClientT, type Person } from '../api'
import { daysLeft, useAction, useLoad } from '../hooks'
import { useSession } from '../session'

export const STATUS_TONE: Record<string, string> = {
  Intake: '',
  Analysing: 'blue',
  'In review': 'amber',
  'Changes requested': 'orange',
  Approved: 'green',
  Delivered: 'green',
}

export const SECTORS = [
  ['general', 'General'],
  ['retail', 'Retail and shops'],
  ['ecommerce', 'Online shop'],
  ['restaurants', 'Restaurants and cafés'],
  ['distribution', 'Wholesale and distribution'],
  ['medical', 'Medical and pharmacy'],
  ['manufacturing', 'Manufacturing'],
  ['services', 'Professional services'],
] as const

export function ClientsPage({ review }: { review?: boolean }) {
  const { me } = useSession()
  const { data, error, reload } = useLoad(() => api.get<ClientT[]>('/clients'), [])
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState('')
  let list = data ?? []
  if (review) list = list.filter((c) => c.status === 'In review' && (me.role === 'admin' || c.reviewer?.id === me.id))
  if (filter) list = list.filter((c) => (c.name + ' ' + c.industry + ' ' + (c.analyst?.name ?? '')).toLowerCase().includes(filter.toLowerCase()))
  const title = review ? 'Reports to review' : me.role === 'admin' ? 'Clients' : `Good to see you, ${me.name.split(' ')[0]}`
  const lead = review
    ? 'Reports the analysts have sent for review. Approve them, or send them back with a comment.'
    : me.role === 'admin'
      ? 'Every client, who works on it, and when its files are deleted.'
      : 'Your assigned clients. Other analysts’ clients are not shown and can’t be opened.'
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <p>{lead}</p>
        </div>
        <div className="row">
          {(data?.length ?? 0) > 6 && <input className="search" placeholder="Search clients" value={filter} onChange={(e) => setFilter(e.target.value)} />}
          {me.role === 'admin' && !review && (
            <button className="btn btn-primary" type="button" onClick={() => setAdding(true)}>
              New client
            </button>
          )}
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {adding && (
        <NewClient
          close={() => setAdding(false)}
          created={(c) => {
            reload()
            navigate(`/client/${c.id}/files`)
          }}
        />
      )}
      {data && !list.length && !adding && (
        <div className="empty panel">
          {review
            ? 'Nothing waiting for review.'
            : me.role === 'admin'
              ? 'No clients yet. Press “New client” to add the first one, then upload their files.'
              : 'No clients are assigned to you yet. An admin assigns them.'}
        </div>
      )}
      <div className="client-grid">
        {list.map((c) => (
          <a key={c.id} className="client-card panel" href={`#/client/${c.id}${review ? '/report' : ''}`}>
            <div className="spread">
              <span className={`tag ${STATUS_TONE[c.status] ?? ''}`}>{c.status}</span>
              <span className="faint" style={{ fontSize: '0.78rem' }}>
                Files deleted in {daysLeft(c.delete_on)} days
              </span>
            </div>
            <div>
              <h3>{c.name}</h3>
              <p className="muted" style={{ fontSize: '0.82rem' }}>
                {c.industry || SECTORS.find(([k]) => k === c.sector)?.[1]} · {c.files} file{c.files === 1 ? '' : 's'} · {c.currency}
              </p>
            </div>
            {c.question && <p className="q">“{c.question}”</p>}
            <div className="faint" style={{ fontSize: '0.78rem' }}>
              Analyst: {c.analyst?.name ?? 'not assigned'} · Reviewer: {c.reviewer?.name ?? 'not assigned'}
            </div>
          </a>
        ))}
      </div>
    </>
  )
}

export function PeopleSelect({ label, role, value, onChange, people }: { label: string; role: string; value: number | null; onChange: (v: number | null) => void; people: Person[] }) {
  return (
    <label className="field">
      {label}
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}>
        <option value="">Not assigned</option>
        {people
          .filter((p) => p.active !== false && (p.role === role || p.role === 'admin'))
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.role === 'admin' ? ' (admin)' : ''}
            </option>
          ))}
      </select>
    </label>
  )
}

function NewClient({ close, created }: { close: () => void; created: (c: ClientT) => void }) {
  const people = useLoad(() => api.get<Person[]>('/users'), [])
  const [f, setF] = useState({ name: '', industry: '', sector: 'general', contact: '', question: '', currency: 'EGP', analyst_id: null as number | null, reviewer_id: null as number | null })
  const a = useAction()
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const submit = (e: FormEvent) => {
    e.preventDefault()
    a.run(() => api.post<ClientT>('/clients', f)).then((c) => c && created(c))
  }
  return (
    <form className="panel pad form-panel" onSubmit={submit}>
      <div className="panel-title">New client</div>
      <div className="form-grid">
        <label className="field">
          Company name
          <input value={f.name} onChange={set('name')} required autoFocus />
        </label>
        <label className="field">
          What they do
          <input value={f.industry} onChange={set('industry')} placeholder="e.g. Furniture shops, 6 branches" />
        </label>
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
          <input value={f.currency} onChange={set('currency')} maxLength={3} placeholder="EGP" />
        </label>
        <label className="field">
          Contact
          <input value={f.contact} onChange={set('contact')} placeholder="Name and role" />
        </label>
        <PeopleSelect label="Analyst" role="analyst" value={f.analyst_id} onChange={(v) => setF({ ...f, analyst_id: v })} people={people.data ?? []} />
        <PeopleSelect label="Reviewer" role="reviewer" value={f.reviewer_id} onChange={(v) => setF({ ...f, reviewer_id: v })} people={people.data ?? []} />
        <label className="field span-2">
          Their question, in their words
          <textarea value={f.question} onChange={set('question')} rows={2} placeholder="e.g. Why did profit fall this year when sales went up?" />
        </label>
      </div>
      {a.error && <p className="error">{a.error}</p>}
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn btn-primary" type="submit" disabled={a.busy}>
          Create client
        </button>
        <button className="btn" type="button" onClick={close}>
          Cancel
        </button>
      </div>
    </form>
  )
}
