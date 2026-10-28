// Small shared pieces: confidence level, logo, icons.

import type { ReactNode } from 'react'
import type { Level as L } from '../services/types'

export const LEVEL_TEXT: Record<L, string> = {
  high: 'Full confidence',
  medium: 'Partial · stand-in data',
  low: 'Estimates only',
  none: 'Needs data',
}
const BARS: Record<L, number> = { high: 3, medium: 2, low: 1, none: 0 }

export function Level({ level, text }: { level: L; text?: string }) {
  return (
    <span className={`level lv-${level}`}>
      <span className="bars" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <i key={n} className={n <= BARS[level] ? 'on' : undefined} />
        ))}
      </span>
      {text ?? LEVEL_TEXT[level]}
    </span>
  )
}

export const LogoMark = () => (
  <svg width="30" height="20" viewBox="0 0 36 24" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="ws-logo" x1="0" x2="1">
        <stop offset="0" stopColor="#1d4ed8" />
        <stop offset="0.5" stopColor="#93c5fd" />
        <stop offset="1" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    <path d="M1.5 21 L9 11.5 L12.5 15 L18 3.5 L23.5 13.5 L26.5 10.5 L34.5 21" stroke="url(#ws-logo)" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    <circle cx="18" cy="3.5" r="1.6" fill="#dbeafe" />
  </svg>
)

const Icon = ({ children }: { children: ReactNode }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)
export const icons = {
  clients: (
    <Icon>
      <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
      <path d="M3.5 9h17M8 4v16" />
    </Icon>
  ),
  catalog: (
    <Icon>
      <path d="M12 3l9 5-9 5-9-5z" />
      <path d="M3 13l9 5 9-5" />
    </Icon>
  ),
  log: (
    <Icon>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </Icon>
  ),
  lock: (
    <Icon>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </Icon>
  ),
  sun: (
    <Icon>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
    </Icon>
  ),
  moon: (
    <Icon>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </Icon>
  ),
  out: (
    <Icon>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 17l5-5-5-5M21 12H9" />
    </Icon>
  ),
  spark: (
    <Icon>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />
    </Icon>
  ),
  upload: (
    <Icon>
      <path d="M12 16V4M7 9l5-5 5 5M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
    </Icon>
  ),
}
