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

// English first. Arabic only when the link says ?lang=ar or the visitor switched during this visit.
export function initialLang(): Lang {
  const param = new URLSearchParams(window.location.search).get('lang')
  if (param === 'ar' || param === 'en') return param
  try {
    if (sessionStorage.getItem('clearline:lang') === 'ar') return 'ar'
  } catch {
    // Storage blocked: fall through.
  }
  return 'en'
}
