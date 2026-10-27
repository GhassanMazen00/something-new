import { useEffect, useId, useState } from 'react'
import { brand, brandFull, nav, type T } from '../content'
import { useLang } from '../lang'
import type { Theme } from '../theme'
import { Close, Menu, Moon, Sun } from './Icons'

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

// Three peaks drawn as one blue line, with a point on the summit: a mountain and a chart at once.
export function LogoMark() {
  const id = useId()
  return (
    <svg className="logo-mark" viewBox="0 0 40 32" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="0.5" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <path
        d="M2 26 L11 15 L15.5 20 L20 6 L25 17 L29 12.5 L38 26"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="6" r="2.4" fill="#fff" />
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

function LangSwitch() {
  const { t, lang, setLang } = useLang()
  return (
    <button type="button" className="lang-btn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} aria-label={t(nav.switchLabel)} lang={lang === 'ar' ? 'en' : 'ar'}>
      {t(nav.switchTo)}
    </button>
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
          <button
            type="button"
            className="icon-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? t({ en: 'Switch to light mode', ar: 'الوضع الفاتح' }) : t({ en: 'Switch to dark mode', ar: 'الوضع الداكن' })}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
          <LangSwitch />
          <a className="btn btn-primary btn-sm header-cta" href="#contact">
            {t(nav.book)}
          </a>
          <button type="button" className="icon-btn menu-btn" aria-expanded={open} aria-controls="site-nav" aria-label={open ? t(nav.close) : t(nav.menu)} onClick={() => setOpen(!open)}>
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>
      <div className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
    </header>
  )
}
