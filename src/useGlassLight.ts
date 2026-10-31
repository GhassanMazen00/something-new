import { useEffect } from 'react'

// Moves the soft light inside a glass panel to follow the pointer (read by .glass::before in the CSS).
export function useGlassLight() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return
    const on = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.<HTMLElement>('.glass, .card')
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    document.addEventListener('pointermove', on, { passive: true })
    return () => document.removeEventListener('pointermove', on)
  }, [])
}
