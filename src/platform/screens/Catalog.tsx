// Everything Clearline offers: 32 services in six departments, with the method behind each.

import { useSession } from '../session'

export function CatalogPage() {
  const { catalog, kindLabel } = useSession()
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Services</h1>
          <p>All 32 services, the method each one runs, and the files it needs. Open a client to run them.</p>
        </div>
      </div>
      {catalog.departments.map((d) => {
        const list = catalog.services.filter((s) => s.dept === d.id)
        return (
          <section key={d.id} className="dept-block">
            <h2>
              {d.name} <span className="faint">· {list.length}</span>
            </h2>
            <div className="cat-grid">
              {list.map((s) => (
                <article key={s.id} id={s.id} className="cat-card panel">
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
                  <div className="m">
                    <small>Full confidence needs</small>
                    {s.needs.high.map((g) => g.map(kindLabel).join(' + ')).join(', or ') || 'Public data'}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )
      })}
    </>
  )
}
