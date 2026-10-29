// Who opened, ran, uploaded or exported what. Each entry is chained to the one before, so edits would show.

import { api, type ActivityT } from '../api'
import { fmtTime, useLoad } from '../hooks'
import { useSession } from '../session'

export function ActivityPage({ clientId }: { clientId?: number }) {
  const { me } = useSession()
  const log = useLoad(() => api.get<ActivityT>(`/activity${clientId ? `?client_id=${clientId}` : ''}`), [clientId])
  return (
    <>
      {!clientId && (
        <div className="page-head">
          <div>
            <h1>Activity log</h1>
            <p>{me.role === 'admin' ? 'Everything that happened, by everyone, newest first.' : 'Everything on your clients, and anything you did yourself, newest first.'}</p>
          </div>
          {log.data?.chain_intact != null && <span className={`tag ${log.data.chain_intact ? 'green' : 'red'}`}>{log.data.chain_intact ? 'Log intact: no entry changed or removed' : 'Warning: the log has been altered'}</span>}
        </div>
      )}
      {log.error && <p className="error">{log.error}</p>}
      <div className="panel pad">
        <ol className="list log">
          {(log.data?.entries ?? []).map((e, i) => (
            <li key={i}>
              <time>{fmtTime(e.at)}</time>
              <span>
                <b style={{ fontWeight: 600 }}>{e.who}</b> · {e.what}
                {!clientId && e.client && <span className="faint"> · {e.client}</span>}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </>
  )
}
