// The frame around the page: a plain bar, the footer, the contact dialog.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BRAND, BRAND_FULL, CONTACT, contact, contactDialog, nav } from '../content'
import { CONTACT_EVENT, openContact } from '../contactEvent'
import { useLang } from '../lang'
import { footerCopy, pages, ui } from './copy'

// The ridge from the logo: three peaks drawn as one line.
export function Mark({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'mark'} viewBox="0 0 36 24" aria-hidden="true">
      <path d="M1.5 21 L9 11.5 L12.5 15 L18 3.5 L23.5 13.5 L26.5 10.5 L34.5 21" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LangSwitch() {
  const { lang, setLang, t } = useLang()
  const next = lang === 'en' ? 'ar' : 'en'
  return (
    <button type="button" className="lang" lang={next} aria-label={t(nav.switchLabel)} onClick={() => setLang(next)}>
      {t(nav.switchTo)}
    </button>
  )
}

// Which section the reader is in, for the menu.
function useActive() {
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      setScrolled(window.scrollY > 8)
      const line = window.innerHeight * 0.35
      let current = ''
      for (const p of pages) {
        const el = document.getElementById(p.id)
        if (el && el.getBoundingClientRect().top <= line) current = p.id
      }
      setActive(current)
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return { active, scrolled }
}

export function Header() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const { active, scrolled } = useActive()
  return (
    <header className={`bar${scrolled ? ' is-scrolled' : ''}`}>
      <a className="brand" href="#top" aria-label={t(ui.home)} dir="ltr">
        <Mark />
        <span>{BRAND}</span>
      </a>
      <nav className={`links${open ? ' is-open' : ''}`} id="site-links" aria-label="Main">
        {pages.map((p) => (
          <a key={p.id} href={p.href} aria-current={active === p.id ? 'true' : undefined} onClick={() => setOpen(false)}>
            {t(p.label)}
          </a>
        ))}
        <LangSwitch />
      </nav>
      <button type="button" className="btn btn-small" onClick={openContact}>
        {t(ui.book)}
      </button>
      <button type="button" className="menu" aria-expanded={open} aria-controls="site-links" onClick={() => setOpen(!open)}>
        {t(open ? nav.close : nav.menu)}
      </button>
    </header>
  )
}

export function Footer() {
  const { t } = useLang()
  return (
    <footer className="foot">
      <div className="foot-top">
        <a className="brand brand-big" href="#top" dir="ltr" aria-label={BRAND_FULL}>
          <Mark />
          <span>{BRAND}</span>
        </a>
        <p>{t({ en: 'Business analysis for small and medium companies, in Arabic and English.', ar: 'تحليل أعمال للشركات الصغيرة والمتوسطة، بالعربية والإنجليزية.' })}</p>
      </div>
      <div className="foot-cols">
        <div>
          <h2>{t(footerCopy.pages)}</h2>
          {pages.map((p) => (
            <a key={p.id} href={p.href}>
              {t(p.label)}
            </a>
          ))}
        </div>
        <div>
          <h2>{t(footerCopy.contact)}</h2>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <a href={`https://wa.me/${CONTACT.whatsapp}`} dir="ltr">
            WhatsApp {CONTACT.whatsappShown}
          </a>
          <p>{t(footerCopy.place)}</p>
        </div>
      </div>
      <div className="foot-end">
        <p>{t({ en: '© 2026 Clearline Analytics. Business analysis, not investment advice. Examples use made-up data.', ar: '© 2026 Clearline Analytics. تحليل أعمال وليس استشارات استثمارية. الأمثلة ببيانات افتراضية.' })}</p>
        <button type="button" className="btn btn-small" onClick={openContact}>
          {t(ui.contact)}
        </button>
      </div>
    </footer>
  )
}

export function ContactDialog() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const back = useRef<Element | null>(null)
  useEffect(() => {
    const show = () => {
      back.current = document.activeElement
      setOpen(true)
    }
    window.addEventListener(CONTACT_EVENT, show)
    return () => window.removeEventListener(CONTACT_EVENT, show)
  }, [])
  useEffect(() => {
    if (!open) return
    panel.current?.querySelector<HTMLElement>('a, button')?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      ;(back.current as HTMLElement | null)?.focus?.()
    }
  }, [open])
  if (!open) return null
  const mail = `mailto:${CONTACT.email}?subject=${encodeURIComponent(t(contact.mailSubject))}&body=${encodeURIComponent(t(contact.mailBody))}`
  const ways = [
    { label: t(contactDialog.email), value: CONTACT.email, href: mail },
    { label: t(contactDialog.whatsapp), value: CONTACT.whatsappShown, href: `https://wa.me/${CONTACT.whatsapp}` },
    { label: t(contactDialog.phone), value: CONTACT.phone, href: `tel:${CONTACT.phoneDial}` },
  ]
  return (
    <div className="dialog-back" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title" ref={panel}>
        <h2 id="dlg-title">{t(contactDialog.title)}</h2>
        <p>{t(contactDialog.lead)}</p>
        <div className="ways">
          {ways.map((w) => (
            <a key={w.label} href={w.href} target={w.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
              <span>{w.label}</span>
              <b dir="ltr">{w.value}</b>
            </a>
          ))}
        </div>
        <p className="small">{t(contactDialog.hours)}</p>
        <button type="button" className="btn btn-quiet" onClick={() => setOpen(false)}>
          {t(contactDialog.close)}
        </button>
      </div>
    </div>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  const { t } = useLang()
  return (
    <>
      <a className="skip" href="#main">
        {t(ui.skip)}
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <ContactDialog />
    </>
  )
}
