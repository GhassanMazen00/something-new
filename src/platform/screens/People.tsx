// Admin: add analysts and reviewers, change roles, switch accounts off, reset passwords and two-step sign-in.

import { useState, type FormEvent } from 'react'
import { api, type Person, type Role } from '../api'
import { useAction, useLoad } from '../hooks'
import { useSession } from '../session'

const ROLES: [Role, string][] = [
  ['analyst', 'Analyst'],
  ['reviewer', 'Reviewer'],
  ['admin', 'Admin'],
]

export function PeoplePage() {
  const { me } = useSession()
  const people = useLoad(() => api.get<Person[]>('/users'), [])
  const a = useAction()
  const [f, setF] = useState({ name: '', email: '', role: 'analyst' as Role })
  const [issued, setIssued] = useState<{ name: string; email: string; password: string } | null>(null)
  const add = async (e: FormEvent) => {
    e.preventDefault()
    const out = await a.run(() => api.post<Person>('/users', f))
    if (out) {
      setIssued({ name: out.name, email: out.email!, password: out.temp_password! })
      setF({ name: '', email: '', role: 'analyst' })
      people.reload()
    }
  }
  const patch = async (p: Person, body: object) => {
    const out = await a.run(() => api.patch<Person>(`/users/${p.id}`, body))
    if (out?.temp_password) setIssued({ name: out.name, email: out.email!, password: out.temp_password })
    if (out) people.reload()
  }
  return (
    <>
      <div className="page-head">
        <div>
          <h1>People</h1>
          <p>Everyone who can sign in. Analysts work on the clients you assign them; reviewers approve reports before they go out.</p>
        </div>
      </div>
      {issued && (
        <div className="panel pad notice">
          <div className="panel-title">
            Give {issued.name} these details in person
            <button className="btn btn-sm" type="button" onClick={() => setIssued(null)}>
              Done
            </button>
          </div>
          <p>
            Email <code>{issued.email}</code> · temporary password <code className="secret">{issued.password}</code>
          </p>
          <p className="hint">This password is shown once. At first sign-in they choose their own and set up the authenticator app.</p>
        </div>
      )}
      <div className="grid-2">
        <div className="panel pad">
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Two-step</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(people.data ?? []).map((p) => (
                  <tr key={p.id} className={p.active ? undefined : 'off'}>
                    <td>
                      <b style={{ fontWeight: 600 }}>{p.name}</b>
                      <br />
                      <span className="faint">{p.email}</span>
                    </td>
                    <td>
                      <select className="mini" value={p.role} disabled={p.id === me.id || a.busy} onChange={(e) => patch(p, { role: e.target.value })}>
                        {ROLES.map(([k, l]) => (
                          <option key={k} value={k}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="nw">{p.two_step ? 'Set up' : <span className="faint">Not yet</span>}</td>
                    <td className="r">
                      {p.id !== me.id && (
                        <span className="row" style={{ justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                          <button className="btn btn-sm" type="button" disabled={a.busy} onClick={() => confirm(`Reset ${p.name}’s password and two-step sign-in?`) && patch(p, { reset: true })}>
                            Reset
                          </button>
                          <button className="btn btn-sm" type="button" disabled={a.busy} onClick={() => patch(p, { active: !p.active })}>
                            {p.active ? 'Switch off' : 'Switch on'}
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <form className="panel pad" onSubmit={add} style={{ alignSelf: 'start' }}>
          <div className="panel-title">Add someone</div>
          <label className="field">
            Name
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
          </label>
          <label className="field">
            Work email
            <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
          </label>
          <label className="field">
            Role
            <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}>
              {ROLES.map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          {a.error && <p className="error">{a.error}</p>}
          <button className="btn btn-primary" type="submit" disabled={a.busy} style={{ marginTop: 16 }}>
            Add and create a temporary password
          </button>
        </form>
      </div>
    </>
  )
}
