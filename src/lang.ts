import { createContext, useContext } from 'react'
import type { Lang, T } from './content'

export interface LangValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (text: T) => string
}

export const LangContext = createContext<LangValue | null>(null)

export function useLang(): LangValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>')
  return ctx
}

// ?lang=ar in the link wins, then a saved choice, then the browser language.
export function initialLang(): Lang {
  const param = new URLSearchParams(window.location.search).get('lang')
  if (param === 'ar' || param === 'en') return param
  try {
    const saved = localStorage.getItem('basira:lang')
    if (saved === 'ar' || saved === 'en') return saved
  } catch {
    // Storage blocked: fall through.
  }
  return navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en'
}
