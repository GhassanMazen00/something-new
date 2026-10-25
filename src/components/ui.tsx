import { useEffect, useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import type { Rarity } from '../data/quests'
import { useT } from '../lib/i18n'
import { rng } from '../lib/random'
import { useStore } from '../lib/store'
import { TOAST_EVENT } from '../lib/toast'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-lime text-ink hover:brightness-110 shadow-[0_8px_30px_-8px_#c6ff3d80]',
  secondary: 'bg-surface-2 text-white border border-line hover:bg-line',
  ghost: 'text-muted hover:text-white',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-bold transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${BUTTON_STYLES[variant]} ${className}`}
    />
  )
}

export function Chip({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>
      {children}
    </span>
  )
}

const RARITY_STYLES: Record<Rarity, string> = {
  common: 'bg-white/10 text-white/80',
  rare: 'bg-violet/25 text-[#b8a6ff]',
  legendary: 'bg-gradient-to-r from-gold to-pink text-ink',
}

export function RarityChip({ rarity }: { rarity: Rarity }) {
  const { t } = useT()
  return <Chip className={RARITY_STYLES[rarity]}>{rarity === 'legendary' ? '✨ ' : ''}{t(`rarity_${rarity}`)}</Chip>
}

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-white/10 ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-lime to-sky transition-[width] duration-700"
        style={{ width: `${Math.max(3, Math.min(100, value * 100))}%` }}
      />
    </div>
  )
}

export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[92dvh] w-full max-w-md animate-rise overflow-y-auto rounded-t-3xl border-t border-line bg-surface px-5 pt-3 pb-8"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
        {children}
      </div>
    </div>
  )
}

export function SegmentedTabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex rounded-2xl bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
            value === o.value ? 'bg-surface-2 text-white shadow' : 'text-muted'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function LangToggle() {
  const { state, setLang } = useStore()
  const lang = state.lang
  return (
    <div className="inline-flex rounded-full bg-surface p-1 text-sm font-bold" dir="ltr">
      {(['en', 'ar'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-full px-3 py-1 transition ${lang === l ? 'bg-lime text-ink' : 'text-muted'}`}
        >
          {l === 'en' ? 'EN' : 'عربي'}
        </button>
      ))}
    </div>
  )
}

const CONFETTI_COLORS = ['#c6ff3d', '#7c5cff', '#ff4da6', '#ffb627', '#3dc8ff']

export function Confetti() {
  const pieces = useMemo(() => {
    const random = rng(42)
    return Array.from({ length: 48 }, (_, i) => ({
      id: i,
      left: random() * 100,
      delay: random() * 0.6,
      size: 6 + random() * 8,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      round: random() > 0.5,
    }))
  }, [])
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 animate-fall"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (p.round ? 1 : 1.6),
            background: p.color,
            borderRadius: p.round ? '999px' : '2px',
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
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
      <div className="animate-pop rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-xl">{message}</div>
    </div>
  )
}

export function DemoBanner() {
  const { t } = useT()
  return (
    <div className="rounded-2xl border border-dashed border-gold/40 bg-gold/10 px-3 py-2 text-xs text-gold">
      🧪 {t('demoBanner')}
    </div>
  )
}
