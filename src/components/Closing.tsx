import { useState } from 'react'
import { Line } from '../charts/Charts'
import { CONTACT, contact, contactDialog, faq, footer, nav } from '../content'
import { order } from '../fx'
import { useLang } from '../lang'
import { contactIcons, Plus } from './Icons'
import { Logo } from './Header'

export function Faq() {
  const { t } = useLang()
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="section faq" aria-labelledby="faq-h">
      <div className="wrap faq-grid">
        <header className="sec-head">
          <h2 id="faq-h" data-reveal style={order(1)}>
            {t({ en: 'Good questions.', ar: 'أسئلة في محلها.' })} <span className="accent">{t({ en: 'Straight answers.', ar: 'وإجابات واضحة.' })}</span>
          </h2>
          <div className="mini card" data-reveal style={order(2)}>
            <span className="chart-title">{t({ en: 'How we prove accuracy: last year, forecast blind', ar: 'كيف نثبت الدقة: العام الماضي، بتوقع أعمى' })}</span>
            <Line
              label="Actual sales against a forecast made without seeing them"
              series={[
                { values: [40, 43, 41, 46, 49, 47, 51, 54, 52, 56, 59, 58] },
                { values: [41, 42, 43, 45, 47, 48, 50, 52, 53, 55, 57, 59], tone: 'ink', dashed: true },
              ]}
              min={30}
              max={65}
              xLabels={['Jan', 'Dec']}
              legend={[
                ['main', 'Actual'],
                ['ink', 'Our forecast · 3.1% average error'],
              ]}
            />
          </div>
        </header>
        <div className="faq-list">
          {faq.items.map((item, n) => {
            const isOpen = open === n
            return (
              <div key={item.q.en} className={`qa card${isOpen ? ' is-open' : ''}`} data-reveal style={order(n % 3)}>
                <h3>
                  <button type="button" aria-expanded={isOpen} aria-controls={`qa-${n}`} id={`q-${n}`} onClick={() => setOpen(isOpen ? -1 : n)}>
                    <span>{t(item.q)}</span>
                    <span className="qa-ico">
                      <Plus />
                    </span>
                  </button>
                </h3>
                <div className="qa-body" id={`qa-${n}`} role="region" aria-labelledby={`q-${n}`}>
                  <div>
                    <p>{t(item.a)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function Contact() {
  const { t } = useLang()
  const mail = `mailto:${CONTACT.email}?subject=${encodeURIComponent(t(contact.mailSubject))}&body=${encodeURIComponent(t(contact.mailBody))}`
  const channels = [
    { key: 'email', label: t(contactDialog.email), value: CONTACT.email, href: mail },
    { key: 'whatsapp', label: t(contactDialog.whatsapp), value: CONTACT.whatsappShown, href: `https://wa.me/${CONTACT.whatsapp}` },
    { key: 'phone', label: t(contactDialog.phone), value: CONTACT.phone, href: `tel:${CONTACT.phoneDial}` },
  ] as const
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-h">
      <div className="wrap">
        <div className="cta-card" data-reveal>
          <div className="cta-inner">
            <h2 id="contact-h">{t(contactDialog.title)}</h2>
            <p>{t(contact.sentence)}</p>
            <ul className="channels wide">
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
            <span className="muted">{t(contactDialog.hours)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const { t } = useLang()
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>
            {t(footer.about)} · {t(footer.place)}
          </p>
        </div>
        <nav className="footer-links" aria-label={t(footer.navTitle)}>
          <a href="#privacy">{t(nav.privacy)}</a>
          <a href="#services">{t(nav.services)}</a>
          <a href="#process">{t(nav.process)}</a>
          <a href="#faq">{t(nav.faq)}</a>
          <a href={`mailto:${CONTACT.email}`} dir="ltr" className="break">
            {CONTACT.email}
          </a>
        </nav>
      </div>
      <div className="wrap legal">
        <span>{t(footer.legal)}</span>
        <span>{t(footer.privacyText)}</span>
      </div>
    </footer>
  )
}
