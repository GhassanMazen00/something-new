import { useEffect } from 'react'

// Marks every [data-reveal] element with data-in the first time it scrolls into view.
// An attribute, not a class: React rewrites className when a component re-renders, which would hide it again.
// Elements added later (a new tab, a switched example) are picked up too.
// Content stays visible if this never runs (the CSS only hides it under html.js).
export function useReveal() {
  useEffect(() => {
    const show = (el: Element) => el.setAttribute('data-in', '')
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal]').forEach(show)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            show(e.target)
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    )
    const watch = () => document.querySelectorAll('[data-reveal]:not([data-in])').forEach((el) => io.observe(el))
    watch()
    const mo = new MutationObserver(watch)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}
