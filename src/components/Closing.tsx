import type { CSSProperties } from 'react'
import { CONTACT, brand, contact, faq, footer, nav } from '../content'
import { Nilometer } from '../fragments/Drawings'
import { useLang } from '../lang'

const order = (n: number) => ({ '--i': n }) as CSSProperties

export function Faq() {
  const { t } = useLang()
  return (
    <section id="faq" className="faq" aria-labelledby="faq-h">
      <div className="faq-title wrap">
        <h2 id="faq-h" data-reveal>
          {t(faq.heading)}
        </h2>
      </div>
      {faq.items.map((item) => (
        <div key={item.q.en} className="faq-band wrap">
          <h3 data-reveal>{t(item.q)}</h3>
          <p data-reveal style={order(1)}>
            {t(item.a)}
          </p>
        </div>
      ))}
    </section>
  )
}

function mailto(lang: 'en' | 'ar') {
  const subject = encodeURIComponent(contact.mailSubject[lang])
  const body = encodeURIComponent(contact.mailBody[lang])
  return `mailto:${CONTACT.email}?subject=${subject}&body=${body}`
}

export function Contact() {
  const { t, lang } = useLang()
  return (
    <section id="contact" className="contact wrap" aria-labelledby="contact-h">
      <p className="contact-sentence" data-reveal>
        {t(contact.sentence)}
      </p>
      <div className="contact-gauge" role="img" aria-label={t(contact.gauge)} data-reveal style={order(1)}>
        <Nilometer marks={false} />
      </div>
      <div className="contact-links" data-reveal style={order(2)}>
        <h2 id="contact-h">{t(contact.question)}</h2>
        <ul>
          <li>
            <a className="link-plain" href={mailto(lang)} dir="ltr">
              {CONTACT.email}
            </a>
          </li>
          <li>
            {CONTACT.whatsapp ? (
              <a className="link-plain" href={`https://wa.me/${CONTACT.whatsapp}`} rel="noopener">
                {t(contact.whatsapp)}
              </a>
            ) : (
              <a className="link-plain" href="#privacy">
                {t(contact.rules)}
              </a>
            )}
          </li>
        </ul>
        <p className="place small muted">{t(contact.place)}</p>
      </div>
    </section>
  )
}

export function Footer() {
  const { t, lang } = useLang()
  const word = t(brand)
  return (
    <footer className="footer">
      <div className="footer-cols">
        <div>
          <h2>{word}</h2>
          <p>{t(footer.about)}</p>
          <p>{t(footer.place)}</p>
        </div>
        <div>
          <h2>{t(footer.navTitle)}</h2>
          <ul>
            <li>
              <a className="link" href="#privacy">
                {t(nav.privacy)}
              </a>
            </li>
            <li>
              <a className="link" href="#services">
                {t(nav.services)}
              </a>
            </li>
            <li>
              <a className="link" href="#process">
                {t(nav.process)}
              </a>
            </li>
            <li>
              <a className="link" href="#faq">
                {t(nav.faq)}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2>{t(footer.contactTitle)}</h2>
          <ul>
            <li>
              <a className="link" href={mailto(lang)} dir="ltr">
                {CONTACT.email}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2>{t(footer.privacyTitle)}</h2>
          <p>{t(footer.privacyText)}</p>
        </div>
      </div>
      <div />
      <div className="footer-word">
        {lang === 'ar' ? (
          <svg viewBox="0 0 1000 300" role="img" aria-label={word}>
            <text x="1000" y="235" fontSize="300" textAnchor="start" direction="rtl" textLength="1000" lengthAdjust="spacingAndGlyphs">
              {word}
            </text>
          </svg>
        ) : (
          <svg viewBox="0 0 1000 198" role="img" aria-label={word}>
            <text x="0" y="186" fontSize="258" textLength="1000" lengthAdjust="spacingAndGlyphs">
              {word.toUpperCase()}
            </text>
          </svg>
        )}
        <p className="legal">{t(footer.legal)}</p>
      </div>
    </footer>
  )
}
