// Everything Clearline offers: 32 services in six departments, with the method behind each.

import { clientsFor } from '../data/clients'
import { readiness } from '../engine'
import { DEPTS, SERVICES } from '../services'
import { me } from '../store'
import { Level } from '../ui/bits'

export function Catalog({ focus }: { focus?: string }) {
  const mine = clientsFor(me()!.id)
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Services</h1>
          <p>All 32 services, the method behind each, and how confidently each can run for your clients with the files they sent.</p>
        </div>
      </div>
      {DEPTS.map((d) => (
        <section key={d.id} className="dept-block">
          <h2>
            {d.name} <span className="faint">· {SERVICES.filter((s) => s.dept === d.id).length}</span>
          </h2>
          <div className="cat-grid">
            {SERVICES.filter((s) => s.dept === d.id).map((s) => (
              <article key={s.id} id={s.id} className="cat-card panel" style={focus === s.id ? { borderColor: 'var(--accent)' } : undefined}>
                <b>{s.name}</b>
                <p>{s.get}</p>
                <div className="m">
                  <small>Method</small>
                  {s.method}
                </div>
                <div className="m">
                  <small>Data</small>
                  {s.data}
                </div>
                <div className="list" style={{ marginTop: 4 }}>
                  {mine.map((c) => (
                    <a key={c.id} className="spread" href={`#/client/${c.id}/service/${s.id}`} style={{ fontSize: '0.8rem' }}>
                      <span className="muted">{c.name}</span>
                      <Level level={readiness(c, s).level} />
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
