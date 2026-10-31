// The frame every page shares: a plain bar, the closing footer with the wordmark built from blocks, the contact dialog.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BRAND, BRAND_FULL, CONTACT, contact, contactDialog, nav } from '../content'
import { CONTACT_EVENT, openContact } from '../contactEvent'
import { useLang } from '../lang'
import { footerCopy, pages, ui, type Page } from './copy'

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

export function Header({ page }: { page: Page }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`bar${scrolled ? ' is-scrolled' : ''}`}>
      <a className="brand" href="./" aria-label={t(ui.home)} dir="ltr">
        <Mark />
        <span>{BRAND}</span>
      </a>
      <nav className={`links${open ? ' is-open' : ''}`} id="site-links" aria-label="Main">
        {pages.map((p) => (
          <a key={p.id} href={p.href} aria-current={page === p.id ? 'page' : undefined}>
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
  const letters = BRAND.toUpperCase().split('')
  const heights = [100, 74, 88, 66, 96, 80, 70, 92, 84]
  return (
    <footer className="foot">
      <div className="blocks" dir="ltr" aria-label={BRAND_FULL} role="img">
        {letters.map((c, i) => (
          <span key={i} style={{ height: `${heights[i % heights.length]}%`, ['--i' as string]: i }} data-reveal>
            {c}
          </span>
        ))}
      </div>
      <div className="foot-cols">
        <div>
          <h2>{t(footerCopy.pages)}</h2>
          <a href="./">{BRAND}</a>
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

export function Shell({ page, children }: { page: Page; children: ReactNode }) {
  const { t } = useLang()
  return (
    <>
      <a className="skip" href="#main">
        {t(ui.skip)}
      </a>
      <Header page={page} />
      <main id="main">{children}</main>
      <Footer />
      <ContactDialog />
    </>
  )
}
