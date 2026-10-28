// Workspace shell: sign-in, navigation and routes.

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ANALYSTS, clientsFor } from './data/clients'
import { navigate, useRoute } from './route'
import { me, signIn, signOut, useStore } from './store'
import { icons, LogoMark } from './ui/bits'
import { Activity } from './screens/Activity'
import { Catalog } from './screens/Catalog'
import { ClientPage, ClientsList } from './screens/Clients'

// Starts from the page's theme (a saved choice, the host's setting, or the system's) and lets the analyst flip it.
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

function SignIn() {
  const [step, setStep] = useState<'password' | 'code'>('password')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const account = ANALYSTS.find((a) => email.trim().toLowerCase().startsWith(a.id))
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    if (step === 'password') {
      if (!account || pw.length < 4) return setErr('That email and password don’t match an account.')
      setStep('code')
    } else {
      if (!/^\d{6}$/.test(code)) return setErr('Enter the 6-digit code from your authenticator app.')
      signIn(account!.id)
    }
  }
  const fill = (id: string) => {
    setEmail(`${id}@clearline.example`)
    setPw('demo-password')
    setStep('password')
  }
  return (
    <main className="signin">
      <form className="signin-card panel" onSubmit={submit}>
        <div className="brand" style={{ padding: 0 }}>
          <LogoMark />
          <div>
            <b>CLEARLINE</b>
            <small>Workspace · staff only</small>
          </div>
        </div>
        <h1>{step === 'password' ? 'Sign in' : 'Two-step check'}</h1>
        <p>{step === 'password' ? 'Analysts see only the clients assigned to them.' : `Enter the code from your authenticator app for ${email}.`}</p>
        {step === 'password' ? (
          <>
            <label className="field">
              Work email
              <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="field">
              Password
              <input type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required />
            </label>
          </>
        ) : (
          <label className="field">
            6-digit code
            <input className="code-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} autoFocus />
          </label>
        )}
        {err && <p className="error">{err}</p>}
        <button className="btn btn-primary" type="submit">
          {step === 'password' ? 'Continue' : 'Sign in'}
        </button>
        <div className="demo-accounts">
          Demo accounts (any 6 digits for the code):
          <div>
            {ANALYSTS.map((a) => (
              <button key={a.id} type="button" className="btn btn-sm" onClick={() => fill(a.id)}>
                {a.name}
              </button>
            ))}
          </div>
        </div>
      </form>
    </main>
  )
}

function Shell({ crumbs, children }: { crumbs: ReactNode; children: ReactNode }) {
  const route = useRoute()
  const [theme, toggle] = useTheme()
  const user = me()!
  const mine = clientsFor(user.id)
  const nav = (href: string, label: string, icon: ReactNode, on: boolean, count?: number) => (
    <a className={`nav-item${on ? ' on' : ''}`} href={href} aria-current={on ? 'page' : undefined}>
      {icon}
      {label}
      {count !== undefined && <span className="count">{count}</span>}
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
        {nav('#/clients', 'My clients', icons.clients, route[0] === 'clients' || route[0] === 'client' || !route[0], mine.length)}
        {nav('#/catalog', 'Services', icons.catalog, route[0] === 'catalog', 32)}
        {nav('#/activity', 'Activity log', icons.log, route[0] === 'activity')}
        <div className="nav-label">Assigned to you</div>
        {mine.map((c) => (
          <a key={c.id} className={`nav-item${route[1] === c.id ? ' on' : ''}`} href={`#/client/${c.id}`}>
            <span className="faint">•</span>
            {c.name}
          </a>
        ))}
        <div className="side-foot">
          <strong>Sample data only</strong>
          The three clients are made-up companies. Real client files never enter this preview.
        </div>
      </aside>
      <div className="main">
        <header className="top">
          <nav className="crumbs" aria-label="Breadcrumb">
            {crumbs}
          </nav>
          <div className="top-actions">
            <span className="tag demo">Demo</span>
            <button className="icon-btn" type="button" onClick={toggle} aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
              {theme === 'dark' ? icons.sun : icons.moon}
            </button>
            <div className="me">
              <span className="avatar">{user.initials}</span>
              <span>
                {user.name}
                <small>{user.role}</small>
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

export default function App() {
  useStore()
  const route = useRoute()
  const user = me()
  useEffect(() => {
    if (user && !route.length) navigate('/clients')
  }, [user, route.length])
  if (!user) return <SignIn />
  const [section, id, tab, sub] = route
  if (section === 'client' && id) {
    return <ClientPage id={id} tab={tab ?? 'overview'} sub={sub} Shell={Shell} />
  }
  if (section === 'catalog')
    return (
      <Shell crumbs={<b>Services</b>}>
        <Catalog focus={id} />
      </Shell>
    )
  if (section === 'activity')
    return (
      <Shell crumbs={<b>Activity log</b>}>
        <Activity />
      </Shell>
    )
  return (
    <Shell crumbs={<b>My clients</b>}>
      <ClientsList />
    </Shell>
  )
}

export type ShellType = typeof Shell
