import { useEffect, useState, type ReactNode } from 'react'
import { meta, type Lang } from './content'
import { LangContext, initialLang } from './lang'

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    const html = document.documentElement
    html.lang = lang
    html.dir = lang === 'ar' ? 'rtl' : 'ltr'
    if (document.body.dataset.page !== 'services') document.title = meta.title[lang]
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description[lang])
  }, [lang])

  const setLang = (next: Lang) => {
    setLangState(next)
    try {
      sessionStorage.setItem('clearline:lang', next)
    } catch {
      // Storage blocked: the choice lasts for this visit only.
    }
  }

  return <LangContext.Provider value={{ lang, setLang, t: (text) => text[lang] }}>{children}</LangContext.Provider>
}
