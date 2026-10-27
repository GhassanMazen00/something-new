import { useEffect, useId, useRef, useState } from 'react'
import { BRAND, BRAND_FULL, nav, settings, type T } from '../content'
import { openContact } from '../contactEvent'
import { useLang } from '../lang'
import type { Theme } from '../theme'
import { Check, Close, Gear, Menu, Moon, Sun } from './Icons'

const LINKS: [string, T][] = [
  ['about', { en: 'About', ar: 'من نحن' }],
  ['privacy', nav.privacy],
  ['services', nav.services],
  ['demos', { en: 'Sample reports', ar: 'نماذج تقارير' }],
  ['process', nav.process],
  ['faq', nav.faq],
]

// Which section is on screen, and how far down the page the reader is.
export function useScrollState() {
  const [active, setActive] = useState('top')
  const [progress, setProgress] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const line = window.innerHeight * 0.35
      let current = 'top'
      for (const [id] of LINKS) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
      setScrolled(window.scrollY > 16)
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
  return { active, progress, scrolled }
}

// Three peaks drawn as one fine blue line: the same ridge as the introduction.
export function LogoMark() {
  const id = useId()
  return (
    <svg className="logo-mark" viewBox="0 0 36 24" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#3b82f6" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#bfdbfe" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path d="M1.5 21 L9 11.5 L12.5 15 L18 3.5 L23.5 13.5 L26.5 10.5 L34.5 21" fill="none" stroke={`url(#${id})`} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="3.5" r="1.6" fill="#fff" />
    </svg>
  )
}

export function Logo() {
  return (
    <a className="logo" href="#top" aria-label={BRAND_FULL} dir="ltr">
      <LogoMark />
      <span className="logo-text">{BRAND}</span>
    </a>
  )
}

const LANGS = [
  { id: 'en', name: 'English' },
  { id: 'ar', name: 'العربية' },
] as const

function Settings({ theme, setTheme }: Props) {
  const { t, lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="settings" ref={box}>
      <button type="button" className="icon-btn" aria-expanded={open} aria-controls="settings-panel" aria-label={t(settings.title)} onClick={() => setOpen(!open)}>
        <Gear />
      </button>
      {open && (
        <div id="settings-panel" className="settings-panel glass" role="group" aria-label={t(settings.title)}>
          <span className="set-label">{t(settings.language)}</span>
          <div className="set-list">
            {LANGS.map((l) => (
              <button key={l.id} type="button" lang={l.id} aria-pressed={lang === l.id} onClick={() => setLang(l.id)}>
                {l.name}
                {lang === l.id && <Check />}
              </button>
            ))}
          </div>
          <span className="set-label">{t(settings.appearance)}</span>
          <div className="seg">
            <button type="button" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>
              <Moon /> {t(settings.dark)}
            </button>
            <button type="button" aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>
              <Sun /> {t(settings.light)}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface Props {
  theme: Theme
  setTheme: (t: Theme) => void
}

export function Header({ theme, setTheme }: Props) {
  const { t } = useLang()
  const { active, progress, scrolled } = useScrollState()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const on = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [open])

  return (
    <header className={`header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="wrap header-inner">
        <Logo />
        <nav id="site-nav" className="header-links" aria-label={t(nav.menu)}>
          {LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setOpen(false)}>
              {t(label)}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <Settings theme={theme} setTheme={setTheme} />
          <button type="button" className="btn btn-primary btn-sm header-cta" onClick={openContact}>
            {t(nav.book)}
          </button>
          <button type="button" className="icon-btn menu-btn" aria-expanded={open} aria-controls="site-nav" aria-label={open ? t(nav.close) : t(nav.menu)} onClick={() => setOpen(!open)}>
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>
      <div className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
    </header>
  )
}
