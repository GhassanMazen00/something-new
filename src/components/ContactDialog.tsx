import { useEffect, useRef, useState } from 'react'
import { CONTACT, contact, contactDialog } from '../content'
import { CONTACT_EVENT } from '../contactEvent'
import { useLang } from '../lang'
import { Close, contactIcons } from './Icons'

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
  const channels = [
    { key: 'email', label: t(contactDialog.email), value: CONTACT.email, href: mail },
    { key: 'whatsapp', label: t(contactDialog.whatsapp), value: CONTACT.whatsappShown, href: `https://wa.me/${CONTACT.whatsapp}` },
    { key: 'phone', label: t(contactDialog.phone), value: CONTACT.phone, href: `tel:${CONTACT.phoneDial}` },
  ] as const

  return (
    <div className="dialog-scrim" onClick={() => setOpen(false)}>
      <div ref={panel} className="dialog glass" role="dialog" aria-modal="true" aria-labelledby="contact-title" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-head">
          <h2 id="contact-title">{t(contactDialog.title)}</h2>
          <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label={t(contactDialog.close)}>
            <Close />
          </button>
        </div>
        <p className="dialog-lead">{t(contactDialog.lead)}</p>
        <ul className="channels">
          {channels.map((c) => (
            <li key={c.key}>
              <a href={c.href} target={c.key === 'whatsapp' ? '_blank' : undefined} rel={c.key === 'whatsapp' ? 'noopener' : undefined}>
                <span className="ch-ico">{contactIcons[c.key]}</span>
                <span className="ch-text">
                  <small>{c.label}</small>
                  <b dir="ltr">{c.value}</b>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="dialog-note">{t(contactDialog.hours)}</p>
      </div>
    </div>
  )
}
