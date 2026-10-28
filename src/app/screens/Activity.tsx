// Who opened, ran or exported what. In production this log lives in the database and can't be edited.

import { CLIENTS, clientsFor } from '../data/clients'
import { me, useStore } from '../store'

const when = (t: number) => new Date(t).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export function Activity({ client }: { client?: string }) {
  const store = useStore()
  const mine = new Set(clientsFor(me()!.id).map((c) => c.id))
  const user = me()!
  // Your clients' history, plus anything you did yourself (including blocked attempts on other clients).
  const rows = store.log.filter((e) => (client ? e.client === client : !e.client || mine.has(e.client) || e.who === user.name)).sort((a, b) => b.t - a.t)
  return (
    <>
      {!client && (
        <div className="page-head">
          <div>
            <h1>Activity log</h1>
            <p>Everything that happened on your clients, newest first. Admins see the same log for every analyst.</p>
          </div>
        </div>
      )}
      <div className="panel pad">
        <ol className="list log">
          {rows.map((e, i) => (
            <li key={i}>
              <time>{when(e.t)}</time>
              <span>
                <b style={{ fontWeight: 600 }}>{e.who}</b> · {e.what}
                {!client && e.client && <span className="faint"> · {CLIENTS.find((c) => c.id === e.client)?.name}</span>}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </>
  )
}
