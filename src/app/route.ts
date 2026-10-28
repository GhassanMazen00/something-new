// Where the analyst is in the app. Kept in memory and mirrored to the address bar's hash when the app runs on
// its own page; inside the claude.ai viewer only plain #names reach the address bar, so the hash is left alone.

import { useSyncExternalStore } from 'react'

const parse = (h: string) => h.replace(/^#?\/?/, '').split('/').filter(Boolean)
const framed = (() => {
  try {
    return window.top !== window
  } catch {
    return true
  }
})()

let current = parse(location.hash)
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function navigate(path: string) {
  current = parse(path)
  if (!framed) {
    const h = '#/' + current.join('/')
    if (location.hash !== h) history.pushState(null, '', h)
  }
  window.scrollTo(0, 0)
  emit()
}

const fromAddress = () => {
  current = parse(location.hash)
  window.scrollTo(0, 0)
  emit()
}
window.addEventListener('hashchange', fromAddress)
window.addEventListener('popstate', fromAddress)

// In-app links are plain <a href="#/…">; route them here instead of through the address bar.
document.addEventListener('click', (e) => {
  const a = (e.target as Element | null)?.closest?.('a[href^="#/"]')
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  navigate(a.getAttribute('href')!.slice(1))
})

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
export const useRoute = () => useSyncExternalStore(subscribe, () => current)
