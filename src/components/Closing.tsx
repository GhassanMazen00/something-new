import { useState } from 'react'
import { Line } from '../charts/Charts'
import { brand, CONTACT, contact, faq, footer, nav } from '../content'
import { order } from '../fx'
import { useLang } from '../lang'
import { Arrow, Plus } from './Icons'

export function Faq() {
  const { t } = useLang()
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="section faq" aria-labelledby="faq-h">
      <div className="wrap faq-grid">
        <header className="sec-head">
          <span className="kicker" data-reveal>
            {t(faq.heading)}
          </span>
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
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-h">
      <div className="wrap">
        <div className="cta-card" data-reveal>
          <div className="cta-inner">
            <h2 id="contact-h">
              <span className="accent">{t(contact.question)}</span>
            </h2>
            <p>{t(contact.sentence)}</p>
            <div className="hero-cta center">
              <a className="btn btn-primary" href={mail}>
                {t(nav.book)} <Arrow />
              </a>
              {CONTACT.whatsapp && (
                <a className="btn btn-ghost-light" href={`https://wa.me/${CONTACT.whatsapp}`} rel="noopener">
                  {t(contact.whatsapp)}
                </a>
              )}
              <a className="btn btn-ghost-light" href="#privacy">
                {t(contact.rules)}
              </a>
            </div>
            <a className="cta-mail" href={mail} dir="ltr">
              {CONTACT.email}
            </a>
            <span className="muted">{t(contact.place)}</span>
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
        <div>
          <a className="logo" href="#top">
            <span className="logo-mark" aria-hidden="true" />
            <span>{t(brand)}</span>
          </a>
          <p>{t(footer.about)}</p>
          <p className="muted">{t(footer.place)}</p>
        </div>
        <div>
          <h3>{t(footer.navTitle)}</h3>
          <a href="#privacy">{t(nav.privacy)}</a>
          <a href="#services">{t(nav.services)}</a>
          <a href="#checker">{t(nav.checker)}</a>
          <a href="#demos">{t(nav.demo)}</a>
          <a href="#process">{t(nav.process)}</a>
          <a href="#faq">{t(nav.faq)}</a>
        </div>
        <div>
          <h3>{t(footer.privacyTitle)}</h3>
          <p>{t(footer.privacyText)}</p>
          <h3>{t(footer.contactTitle)}</h3>
          <a href={`mailto:${CONTACT.email}`} dir="ltr" className="break">
            {CONTACT.email}
          </a>
        </div>
      </div>
      <div className="wrap footer-word" aria-hidden="true">
        {t(brand)}
      </div>
      <p className="wrap legal">{t(footer.legal)}</p>
    </footer>
  )
}
