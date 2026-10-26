import { useEffect, useRef, useState, type CSSProperties } from 'react'

export const order = (n: number) => ({ '--i': n }) as CSSProperties

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// True once the element has scrolled into view.
export function useInView<E extends Element>() {
  const ref = useRef<E>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSeen(true)
        io.disconnect()
      }
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, seen] as const
}

// A number that counts up from 0 the first time it is seen.
export function CountUp({ to, duration = 1400, prefix = '' }: { to: number; duration?: number; prefix?: string }) {
  const [ref, seen] = useInView<HTMLSpanElement>()
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!seen) return
    if (reducedMotion()) {
      setValue(to)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, to, duration])
  return (
    <span ref={ref} className="num">
      {prefix}
      {value.toLocaleString('en-US')}
    </span>
  )
}

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*'

// Text that scrambles through random characters before settling.
export function Scramble({ text, className }: { text: string; className?: string }) {
  const [shown, setShown] = useState(text)
  useEffect(() => {
    if (reducedMotion()) {
      setShown(text)
      return
    }
    let frame = 0
    let raf = 0
    const total = 16
    const tick = () => {
      frame++
      const settled = Math.floor((frame / total) * text.length)
      setShown(
        text
          .split('')
          .map((c, i) => (i < settled || c === ' ' || c === '-' ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(''),
      )
      if (frame < total) raf = requestAnimationFrame(tick)
      else setShown(text)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text])
  return (
    <span className={className} dir="ltr">
      {shown}
    </span>
  )
}

// Page-wide pointer effects: the glow that follows the cursor, and the spotlight on .spot cards.
export function usePointerFx() {
  useEffect(() => {
    const glow = document.querySelector<HTMLElement>('.cursor-glow')
    let raf = 0
    let x = 0
    let y = 0
    const on = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      const el = (e.target as Element | null)?.closest?.('.spot') as HTMLElement | null
      if (el) {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${x - r.left}px`)
        el.style.setProperty('--my', `${y - r.top}px`)
      }
      if (!raf && glow) {
        raf = requestAnimationFrame(() => {
          glow.style.transform = `translate(${x}px, ${y}px)`
          raf = 0
        })
      }
    }
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [])
}

// Sets --p (0 to 1) on the element as it scrolls through the viewport.
export function useScrollProgress<E extends HTMLElement>() {
  const ref = useRef<E>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(1, Math.max(0, (vh * 0.65 - r.top) / r.height))
      el.style.setProperty('--p', p.toFixed(3))
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])
  return ref
}
