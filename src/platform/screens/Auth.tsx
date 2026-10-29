// First-run setup, sign-in with a password and an authenticator code, and the forced password change.

import { useState, type FormEvent, type ReactNode } from 'react'
import { LogoMark } from '../../app/ui/bits'
import { api, type Me } from '../api'
import { useAction } from '../hooks'

function Card({ title, lead, children, onSubmit }: { title: string; lead: ReactNode; children: ReactNode; onSubmit: (e: FormEvent) => void }) {
  return (
    <main className="signin">
      <form className="signin-card panel" onSubmit={onSubmit}>
        <div className="brand" style={{ padding: 0 }}>
          <LogoMark />
          <div>
            <b>CLEARLINE</b>
            <small>Workspace · staff only</small>
          </div>
        </div>
        <h1>{title}</h1>
        <p>{lead}</p>
        {children}
      </form>
    </main>
  )
}

const PW_RULE = 'At least 10 characters, with upper and lower case letters and a number.'

export function Setup({ done }: { done: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const a = useAction()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (pw !== pw2) return a.setError('The two passwords don’t match.')
    a.run(() => api.post('/setup', { name, email, password: pw })).then((r) => r && done())
  }
  return (
    <Card title="Set up the workspace" lead="Create the first admin account. You’ll add analysts and reviewers after signing in." onSubmit={submit}>
      <label className="field">
        Your name
        <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
      </label>
      <label className="field">
        Work email
        <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="field">
        Password
        <input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} required />
      </label>
      <label className="field">
        Password again
        <input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
      </label>
      <p className="hint">{PW_RULE} Next you’ll scan a code with an authenticator app (Google Authenticator, Microsoft Authenticator or similar).</p>
      {a.error && <p className="error">{a.error}</p>}
      <button className="btn btn-primary" type="submit" disabled={a.busy}>
        Create admin account
      </button>
    </Card>
  )
}

type Step = { step: 'password' } | { step: 'code'; pending: string } | { step: 'enroll'; pending: string; qr: string; secret: string }

export function SignIn({ done }: { done: () => void }) {
  const [s, setS] = useState<Step>({ step: 'password' })
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [code, setCode] = useState('')
  const a = useAction()
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (s.step === 'password') {
      const r = await a.run(() => api.post<Step>('/login', { email, password: pw }))
      if (r) {
        setPw('')
        setS(r)
      }
    } else {
      if (!/^\d{6}$/.test(code)) return a.setError('Enter the 6-digit code from your authenticator app.')
      const r = await a.run(() => api.post('/login/code', { pending: s.pending, code }))
      if (r) done()
      else setCode('')
    }
  }
  const title = s.step === 'password' ? 'Sign in' : s.step === 'enroll' ? 'Set up two-step sign-in' : 'Two-step check'
  const lead =
    s.step === 'password'
      ? 'Analysts see only the clients assigned to them.'
      : s.step === 'enroll'
        ? 'Scan this with an authenticator app on your phone, then enter the 6-digit code it shows. You’ll need the app every time you sign in.'
        : 'Enter the code from your authenticator app.'
  return (
    <Card title={title} lead={lead} onSubmit={submit}>
      {s.step === 'password' ? (
        <>
          <label className="field">
            Work email
            <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </label>
          <label className="field">
            Password
            <input type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required />
          </label>
        </>
      ) : (
        <>
          {s.step === 'enroll' && (
            <>
              <div className="qr" dangerouslySetInnerHTML={{ __html: s.qr }} />
              <details className="hint">
                <summary>Can’t scan? Type this key instead</summary>
                <code className="secret">{s.secret.replace(/(.{4})/g, '$1 ').trim()}</code>
              </details>
            </>
          )}
          <label className="field">
            6-digit code
            <input className="code-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} autoFocus />
          </label>
        </>
      )}
      {a.error && <p className="error">{a.error}</p>}
      <button className="btn btn-primary" type="submit" disabled={a.busy}>
        {s.step === 'password' ? 'Continue' : 'Sign in'}
      </button>
      {s.step !== 'password' && (
        <button className="btn btn-sm link-btn" type="button" onClick={() => setS({ step: 'password' })}>
          Start again
        </button>
      )}
    </Card>
  )
}

export function ChangePassword({ me, done }: { me: Me; done: () => void }) {
  const [cur, setCur] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const a = useAction()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (pw !== pw2) return a.setError('The two new passwords don’t match.')
    a.run(() => api.post('/me/password', { current: cur, new: pw })).then((r) => r && done())
  }
  return (
    <Card title="Choose your own password" lead={`Welcome, ${me.name.split(' ')[0]}. Replace the temporary password the admin gave you.`} onSubmit={submit}>
      <label className="field">
        Temporary password
        <input type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} required autoFocus />
      </label>
      <label className="field">
        New password
        <input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} required />
      </label>
      <label className="field">
        New password again
        <input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
      </label>
      <p className="hint">{PW_RULE}</p>
      {a.error && <p className="error">{a.error}</p>}
      <button className="btn btn-primary" type="submit" disabled={a.busy}>
        Save and continue
      </button>
    </Card>
  )
}
