import { useEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react'
import { useT } from '../lib/i18n'
import { sha256 } from '../lib/sha256'
import { useStore } from '../lib/store'
import { NEON } from '../lib/theme'
import { TOAST_EVENT } from '../lib/toast'

// A panel with cut corners and a 1px neon edge.
export function Frame({
  children,
  color = NEON.edge,
  glow = false,
  className = '',
  innerClassName = '',
  onClick,
}: {
  children: ReactNode
  color?: string
  glow?: boolean
  className?: string
  innerClassName?: string
  onClick?: () => void
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={`block w-full text-start ${onClick ? 'transition active:scale-[0.99]' : ''} ${className}`}
      style={glow ? { filter: `drop-shadow(0 0 10px ${color}66)` } : undefined}
    >
      <div className="chamfer p-px" style={{ background: color }}>
        <div className={`chamfer bg-panel ${innerClassName}`}>{children}</div>
      </div>
    </Tag>
  )
}

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'cyan'

const BUTTON_STYLES: Record<ButtonVariant, { cls: string; glow: string }> = {
  primary: { cls: 'bg-acid text-void', glow: NEON.acid },
  cyan: { cls: 'bg-cyan text-void', glow: NEON.cyan },
  danger: { cls: 'bg-alert text-white', glow: NEON.alert },
  ghost: { cls: 'bg-panel-2 text-cyan border border-cyan/40', glow: 'transparent' },
}

export function Button({
  variant = 'primary',
  full = false,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; full?: boolean }) {
  const style = BUTTON_STYLES[variant]
  return (
    <span
      className={`${full ? 'block w-full' : 'inline-block'} transition ${props.disabled ? 'opacity-35' : ''} ${className}`}
      style={{ filter: props.disabled ? undefined : `drop-shadow(0 0 12px ${style.glow}55)` }}
    >
      <button
        {...props}
        className={`chamfer-sm w-full px-5 py-3.5 font-display text-sm font-bold tracking-[0.18em] uppercase transition hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed ${style.cls}`}
      />
    </span>
  )
}

export function Tag({ children, color, solid = false }: { children: ReactNode; color: string; solid?: boolean }) {
  return (
    <span
      className="chamfer-sm inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[11px] tracking-wider uppercase"
      style={solid ? { background: color, color: '#04050a' } : { background: `${color}1f`, color, boxShadow: `inset 0 0 0 1px ${color}55` }}
    >
      {children}
    </span>
  )
}

// Small "[ LABEL ]" headings
export function Hud({ children, color = NEON.dim, className = '' }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <div className={`font-mono text-xs tracking-[0.25em] uppercase ${className}`} style={{ color }}>
      [ {children} ]
    </div>
  )
}

export function Glitch({
  text,
  as: Tag = 'h1',
  className = '',
  style,
}: {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'div' | 'span'
  className?: string
  style?: CSSProperties
}) {
  return (
    <Tag className={`glitch ${className}`} data-text={text} style={style}>
      {text}
    </Tag>
  )
}

export function Bar({ value, color = NEON.cyan, segments = 20 }: { value: number; color?: string; segments?: number }) {
  const filled = Math.round(Math.max(0, Math.min(1, value)) * segments)
  return (
    <div className="flex gap-[3px]" dir="ltr">
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          className="h-2 flex-1 skew-x-[-20deg]"
          style={i < filled ? { background: color, boxShadow: `0 0 6px ${color}` } : { background: '#1d2a45' }}
        />
      ))}
    </div>
  )
}

// Reveals text like an incoming transmission. Tap to show it all at once.
export function Typewriter({ text, instant = false, onDone }: { text: string; instant?: boolean; onDone?: () => void }) {
  const [shown, setShown] = useState(instant ? text.length : 0)
  const finished = shown >= text.length
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  })

  useEffect(() => {
    if (finished) {
      onDoneRef.current?.()
      return
    }
    const id = setTimeout(() => setShown((n) => n + 2), 16)
    return () => clearTimeout(id)
  }, [shown, finished])

  return (
    <div onClick={() => setShown(text.length)} className="font-mono text-[15px] leading-relaxed whitespace-pre-wrap text-[#c9e8ff]">
      {text.slice(0, shown)}
      <span className="animate-blink text-cyan">█</span>
    </div>
  )
}

// A unique 5x5 neon glyph per Runner, generated from their ID.
export function Identicon({ seed, size = 56 }: { seed: string; size?: number }) {
  const h = sha256(seed)
  const colors = [NEON.cyan, NEON.magenta, NEON.acid, NEON.matrix]
  const color = colors[parseInt(h.slice(0, 2), 16) % colors.length]
  const cells: [number, number][] = []
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      if (parseInt(h[2 + y * 3 + x], 16) % 2 === 0) {
        cells.push([x, y])
        if (x < 2) cells.push([4 - x, y])
      }
    }
  }
  return (
    <div className="chamfer-sm grid shrink-0 place-items-center bg-panel-2 p-2" style={{ width: size, height: size, boxShadow: `inset 0 0 0 1px ${color}66` }}>
      <svg viewBox="0 0 5 5" width="100%" height="100%" style={{ filter: `drop-shadow(0 0 3px ${color})` }} shapeRendering="crispEdges">
        {cells.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} />
        ))}
      </svg>
    </div>
  )
}

export function LangToggle() {
  const { state, setLang } = useStore()
  return (
    <div className="chamfer-sm inline-flex bg-panel-2 p-1 font-mono text-xs" dir="ltr">
      {(['en', 'ar'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`chamfer-sm px-3 py-1 transition ${state.lang === l ? 'bg-cyan text-void' : 'text-dim'}`}
        >
          {l === 'en' ? 'EN' : 'عربي'}
        </button>
      ))}
    </div>
  )
}

// Full-screen layer for quests, claims and results.
export function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 overflow-y-auto bg-void/95 backdrop-blur-md">
      <div className="mx-auto max-w-md animate-rise px-4 pt-4 pb-10">{children}</div>
    </div>
  )
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  const { t } = useT()
  return (
    <button onClick={onClick} className="font-mono text-xs tracking-widest text-dim uppercase hover:text-cyan">
      ✕ {t('close')}
    </button>
  )
}

export function Toaster() {
  const [message, setMessage] = useState<string | null>(null)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onToast = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail)
      clearTimeout(timer)
      timer = setTimeout(() => setMessage(null), 2200)
    }
    window.addEventListener(TOAST_EVENT, onToast)
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast)
      clearTimeout(timer)
    }
  }, [])
  if (!message) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex justify-center px-4">
      <div className="chamfer-sm animate-rise bg-cyan px-4 py-2 font-mono text-sm text-void">{message}</div>
    </div>
  )
}
