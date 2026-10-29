// The workspace: first-run setup, sign-in, then screens by role. Admins manage people and clients, analysts work
// on the clients assigned to them, reviewers approve reports before they go out.

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { navigate, useRoute } from '../app/route'
import { icons, LogoMark } from '../app/ui/bits'
import { api, onSignedOut, type Catalog, type ClientT, type KindT, type Me } from './api'
import { useLoad } from './hooks'
import { ChangePassword, Setup, SignIn } from './screens/Auth'
import { ActivityPage } from './screens/Activity'
import { CatalogPage } from './screens/Catalog'
import { ClientPage } from './screens/Client'
import { ClientsPage } from './screens/Clients'
import { PeoplePage } from './screens/People'
import { SessionCtx, useSession, type Session } from './session'

function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'))
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('clearline:theme', theme)
    } catch {
      // Storage blocked: this visit only.
    }
  }, [theme])
  return [theme, () => setTheme(theme === 'dark' ? 'light' : 'dark')] as const
}

const ROLE = { admin: 'Admin', analyst: 'Analyst', reviewer: 'Reviewer' }
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export function Shell({ crumbs, children }: { crumbs: ReactNode; children: ReactNode }) {
  const route = useRoute()
  const [theme, toggle] = useTheme()
  const { me, signOut } = useSession()
  const clients = useLoad(() => api.get<ClientT[]>('/clients'), [route[0], route[1]])
  const list = clients.data ?? []
  const toReview = list.filter((c) => c.status === 'In review' && (me.role === 'admin' || c.reviewer?.id === me.id)).length
  const mine = me.role === 'analyst' ? list : list.filter((c) => c.analyst?.id === me.id)
  const nav = (href: string, label: string, icon: ReactNode, on: boolean, count?: number) => (
    <a className={`nav-item${on ? ' on' : ''}`} href={href} aria-current={on ? 'page' : undefined}>
      {icon}
      {label}
      {count !== undefined && count > 0 && <span className="count">{count}</span>}
    </a>
  )
  return (
    <div className="shell">
      <aside className="side">
        <a className="brand" href="#/clients">
          <LogoMark />
          <div>
            <b>CLEARLINE</b>
            <small>Workspace</small>
          </div>
        </a>
        {nav('#/clients', me.role === 'analyst' ? 'My clients' : 'Clients', icons.clients, route[0] === 'clients' || route[0] === 'client' || !route[0], list.length)}
        {me.role !== 'analyst' && nav('#/review', 'To review', icons.check, route[0] === 'review', toReview)}
        {nav('#/catalog', 'Services', icons.catalog, route[0] === 'catalog')}
        {me.role === 'admin' && nav('#/people', 'People', icons.people, route[0] === 'people')}
        {nav('#/activity', 'Activity log', icons.log, route[0] === 'activity')}
        {mine.length > 0 && <div className="nav-label">Assigned to you</div>}
        {mine.slice(0, 12).map((c) => (
          <a key={c.id} className={`nav-item${route[0] === 'client' && route[1] === String(c.id) ? ' on' : ''}`} href={`#/client/${c.id}`}>
            <span className="faint">•</span>
            {c.name}
          </a>
        ))}
        <div className="side-foot">
          <strong>On this computer only</strong>
          Client files are encrypted here and deleted on schedule. The AI step is off.
        </div>
      </aside>
      <div className="main">
        <header className="top">
          <nav className="crumbs" aria-label="Breadcrumb">
            {crumbs}
          </nav>
          <div className="top-actions">
            <button className="icon-btn" type="button" onClick={toggle} aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
              {theme === 'dark' ? icons.sun : icons.moon}
            </button>
            <div className="me">
              <span className="avatar">{initials(me.name)}</span>
              <span>
                {me.name}
                <small>{ROLE[me.role]}</small>
              </span>
            </div>
            <button className="icon-btn" type="button" onClick={signOut} aria-label="Sign out" title="Sign out">
              {icons.out}
            </button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}

function Routes() {
  const route = useRoute()
  const { me } = useSession()
  const [section, id, tab, sub] = route
  useEffect(() => {
    if (!route.length) navigate('/clients')
  }, [route.length])
  if (section === 'client' && id) return <ClientPage id={Number(id)} tab={tab ?? 'overview'} sub={sub} />
  if (section === 'catalog')
    return (
      <Shell crumbs={<b>Services</b>}>
        <CatalogPage />
      </Shell>
    )
  if (section === 'people' && me.role === 'admin')
    return (
      <Shell crumbs={<b>People</b>}>
        <PeoplePage />
      </Shell>
    )
  if (section === 'activity')
    return (
      <Shell crumbs={<b>Activity log</b>}>
        <ActivityPage />
      </Shell>
    )
  if (section === 'review')
    return (
      <Shell crumbs={<b>To review</b>}>
        <ClientsPage review />
      </Shell>
    )
  return (
    <Shell crumbs={<b>{me.role === 'analyst' ? 'My clients' : 'Clients'}</b>}>
      <ClientsPage />
    </Shell>
  )
}

type Boot = { state: 'loading' } | { state: 'down'; error: string } | { state: 'setup' } | { state: 'signin' } | { state: 'in'; me: Me }

export default function App() {
  const [boot, setBoot] = useState<Boot>({ state: 'loading' })
  const [extra, setExtra] = useState<{ catalog: Catalog; kinds: KindT[] } | null>(null)
  const start = useCallback(async () => {
    try {
      const s = await api.get<{ needs_setup: boolean }>('/setup')
      if (s.needs_setup) return setBoot({ state: 'setup' })
      const me = await api.get<Me>('/me').catch(() => null)
      if (!me) return setBoot({ state: 'signin' })
      setBoot({ state: 'in', me })
      if (!me.must_change_password) {
        const [catalog, kinds] = await Promise.all([api.get<Catalog>('/catalog'), api.get<KindT[]>('/kinds')])
        setExtra({ catalog, kinds })
      }
    } catch (e) {
      setBoot({ state: 'down', error: (e as Error).message })
    }
  }, [])
  useEffect(() => {
    start()
    return onSignedOut(() => setBoot({ state: 'signin' }))
  }, [start])
  const signOut = useCallback(() => {
    api.post('/logout').finally(() => {
      setExtra(null)
      setBoot({ state: 'signin' })
      navigate('/clients')
    })
  }, [])
  const session = useMemo<Session | null>(() => {
    if (boot.state !== 'in' || !extra) return null
    const labels = new Map(extra.kinds.map((k) => [k.key, k.label]))
    return { me: boot.me, ...extra, kindLabel: (k) => labels.get(k) ?? k, signOut }
  }, [boot, extra, signOut])

  if (boot.state === 'loading') return <div className="boot">Loading…</div>
  if (boot.state === 'down')
    return (
      <main className="signin">
        <div className="signin-card panel">
          <h1>Can’t reach the server</h1>
          <p>{boot.error}</p>
        </div>
      </main>
    )
  if (boot.state === 'setup') return <Setup done={() => setBoot({ state: 'signin' })} />
  if (boot.state === 'signin') return <SignIn done={start} />
  if (boot.me.must_change_password) return <ChangePassword me={boot.me} done={start} />
  if (!session) return <div className="boot">Loading…</div>
  return (
    <SessionCtx.Provider value={session}>
      <Routes />
    </SessionCtx.Provider>
  )
}
