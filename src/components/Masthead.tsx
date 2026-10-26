import { useState, type CSSProperties } from 'react'
import { brand, hero, nav } from '../content'
import { BenfordChart, CashChart } from '../fragments/Charts'
import { Nilometer } from '../fragments/Drawings'
import { AnonTable, PageExcerpt } from '../fragments/Report'
import { useLang } from '../lang'

const order = (n: number) => ({ '--i': n }) as CSSProperties

export function Masthead() {
  const { t, lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const other = lang === 'en' ? 'ar' : 'en'
  const close = () => setOpen(false)

  return (
    <header className="masthead">
      <nav className={`topbar${open ? ' open' : ''}`} aria-label={t(nav.menu)}>
        <div className="tab">
          <a className="wordmark" href="#top">
            {t(brand)}
          </a>
          <a href="#privacy">{t(nav.privacy)}</a>
          <a href="#services">{t(nav.services)}</a>
          <a href="#process">{t(nav.process)}</a>
          <button type="button" className="menu-button" aria-expanded={open} aria-controls="site-actions" onClick={() => setOpen(!open)}>
            {open ? t(nav.close) : t(nav.menu)}
          </button>
        </div>
        <div className="actions" id="site-actions">
          {open && (
            <div className="mobile-links">
              <a href="#privacy" onClick={close}>
                {t(nav.privacy)}
              </a>
              <a href="#services" onClick={close}>
                {t(nav.services)}
              </a>
              <a href="#process" onClick={close}>
                {t(nav.process)}
              </a>
              <a href="#faq" onClick={close}>
                {t(nav.faq)}
              </a>
            </div>
          )}
          <button type="button" className="lang link" lang={other} aria-label={t(nav.switchLabel)} onClick={() => setLang(other)}>
            {t(nav.switchTo)}
          </button>
          <a className="button" href="#contact" onClick={close}>
            {t(nav.book)}
          </a>
        </div>
      </nav>

      <div className="band">
        <div className="cell-a" style={order(0)}>
          <BenfordChart />
        </div>
        <figure className="cell-n nilo" style={order(1)}>
          <Nilometer />
          <figcaption>
            <p>{t(hero.nilometer)}</p>
          </figcaption>
        </figure>
        <div className="cell-t1" style={order(2)} />
        <div className="cell-d" style={order(3)}>
          <PageExcerpt />
        </div>
        <div className="cell-f" style={order(4)}>
          <AnonTable />
        </div>
        <div className="cell-g" style={order(5)}>
          <CashChart />
        </div>
        <div className="cell-t2" style={order(6)} />
      </div>

      <div className="hero-text wrap" id="top">
        <p className="standfirst" data-rise style={order(0)}>
          {t(hero.standfirst)}
        </p>
        <h1 className="title lines">
          {hero.title[lang].map((line, n) => (
            <span className="line" key={line}>
              <span data-line style={order(n)}>
                {line}
              </span>
            </span>
          ))}
        </h1>
        <a className="button hero-cta" href="#contact" data-rise style={order(1)}>
          {t(nav.book)}
        </a>
      </div>
    </header>
  )
}
