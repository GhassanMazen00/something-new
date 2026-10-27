import { useEffect, useId, useState } from 'react'
import { brand, brandFull, contact, nav, type T } from '../content'
import { DEPT_EVENT, depts } from '../depts'
import { useLang } from '../lang'
import type { Theme } from '../theme'
import { Check, Close, Menu, Moon, sectionIcons, Sun } from './Icons'

const SECTIONS: [string, T][] = [
  ['top', { en: 'Overview', ar: 'نظرة عامة' }],
  ['privacy', nav.privacy],
  ['services', nav.services],
  ['checker', nav.checker],
  ['demos', nav.demo],
  ['process', nav.process],
  ['faq', nav.faq],
  ['contact', { en: 'Contact', ar: 'تواصل' }],
]

const PROMISES: T[] = [
  { en: 'Confidentiality agreement first', ar: 'اتفاقية سرية أولًا' },
  { en: 'Encrypted on arrival, never shared', ar: 'مشفّرة عند الوصول ولا تُشارك' },
  { en: 'Files deleted within 30 days', ar: 'حذف الملفات خلال 30 يومًا' },
]

// Which section is on screen, and how far down the page the reader is.
export function useScrollState() {
  const [active, setActive] = useState('top')
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const line = window.innerHeight * 0.35
      let current = 'top'
      for (const [id] of SECTIONS) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])
  return { active, progress }
}

// A "C" with a clear line running through it, ending in a data point.
export function LogoMark() {
  const id = useId()
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill="none" stroke="#fff" strokeOpacity="0.25" />
      <path d="M21.3 10.7A7.5 7.5 0 1 0 21.3 21.3" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M12.5 16H22" stroke="#fff" strokeOpacity="0.7" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="24.2" cy="16" r="2.3" fill="#fff" />
    </svg>
  )
}

export function Logo() {
  const { t } = useLang()
  return (
    <a className="logo" href="#top" aria-label={t(brandFull)}>
      <LogoMark />
      <span className="logo-text">
        {t(brand)}
        <small>{t({ en: 'Analytics', ar: 'للتحليلات' })}</small>
      </span>
    </a>
  )
}

function ThemeSwitch({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const { t } = useLang()
  return (
    <div className="seg" role="group" aria-label={t({ en: 'Colour theme', ar: 'المظهر' })}>
      <button type="button" aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>
        <Sun /> {t({ en: 'Light', ar: 'فاتح' })}
      </button>
      <button type="button" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>
        <Moon /> {t({ en: 'Dark', ar: 'داكن' })}
      </button>
    </div>
  )
}

function LangSwitch() {
  const { t, lang, setLang } = useLang()
  return (
    <button type="button" className="lang-btn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} aria-label={t(nav.switchLabel)} lang={lang === 'ar' ? 'en' : 'ar'}>
      {t(nav.switchTo)}
    </button>
  )
}

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  theme: Theme
  setTheme: (t: Theme) => void
  active: string
  progress: number
}

export function Sidebar({ open, setOpen, theme, setTheme, active, progress }: Props) {
  const { t } = useLang()

  // Escape closes the drawer on small screens.
  useEffect(() => {
    if (!open) return
    const on = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [open, setOpen])

  const openDept = (id: string) => {
    window.dispatchEvent(new CustomEvent(DEPT_EVENT, { detail: id }))
    setOpen(false)
  }

  return (
    <>
      <div className={`scrim${open ? ' is-open' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside id="side" className={`side${open ? ' is-open' : ''}`} aria-label={t(nav.menu)}>
        <div className="side-head">
          <Logo />
          <button type="button" className="icon-btn side-close" onClick={() => setOpen(false)} aria-label={t(nav.close)}>
            <Close />
          </button>
        </div>

        <div className="side-scroll">
          <div className="side-progress" aria-hidden="true">
            <span>{t({ en: 'Reading progress', ar: 'تقدّم القراءة' })}</span>
            <b>{Math.round(progress * 100)}%</b>
            <i>
              <i style={{ transform: `scaleX(${progress})` }} />
            </i>
          </div>

          <nav aria-label={t({ en: 'On this page', ar: 'في هذه الصفحة' })}>
            <span className="side-label">{t({ en: 'On this page', ar: 'في هذه الصفحة' })}</span>
            <ul className="side-nav">
              {SECTIONS.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setOpen(false)}>
                    {sectionIcons[id]}
                    {t(label)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <span className="side-label">{t({ en: 'Departments', ar: 'الأقسام' })}</span>
            <ul className="side-depts">
              {depts.map((d) => (
                <li key={d.id}>
                  <a href="#services" onClick={() => openDept(d.id)}>
                    <span>{t(d.name)}</span>
                    <b>{d.services.length}</b>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="side-card">
            <strong>{t({ en: 'Our privacy promise', ar: 'وعدنا بالخصوصية' })}</strong>
            <ul>
              {PROMISES.map((p) => (
                <li key={p.en}>
                  <Check />
                  {t(p)}
                </li>
              ))}
            </ul>
            <a href="#privacy" onClick={() => setOpen(false)}>
              {t(contact.rules)}
            </a>
          </div>
        </div>

        <div className="side-foot">
          <a className="btn btn-primary" href="#contact" onClick={() => setOpen(false)}>
            {t(nav.book)}
          </a>
          <div className="side-controls">
            <ThemeSwitch theme={theme} setTheme={setTheme} />
            <LangSwitch />
          </div>
          <span className="side-note">{t({ en: 'Cairo · replies within 1 working day', ar: 'القاهرة · نرد خلال يوم عمل' })}</span>
        </div>
      </aside>
    </>
  )
}

// Shown below the desktop width, where the side menu becomes a drawer.
export function Topbar({ open, setOpen, theme, setTheme, progress }: Omit<Props, 'active'>) {
  const { t } = useLang()
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <Logo />
        <div className="topbar-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? t({ en: 'Switch to light mode', ar: 'الوضع الفاتح' }) : t({ en: 'Switch to dark mode', ar: 'الوضع الداكن' })}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
          <LangSwitch />
          <button type="button" className="icon-btn" aria-expanded={open} aria-controls="side" aria-label={t(nav.menu)} onClick={() => setOpen(true)}>
            <Menu />
          </button>
        </div>
      </div>
      <div className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
    </header>
  )
}
