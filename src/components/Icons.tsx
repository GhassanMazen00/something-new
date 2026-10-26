import type { ReactNode } from 'react'

function Icon({ children, size = 22 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const Arrow = () => (
  <Icon size={18}>
    <path className="flip" d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
)
export const Check = () => (
  <Icon size={16}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
)
export const Plus = () => (
  <Icon size={18}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)
export const Lock = () => (
  <Icon>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </Icon>
)
export const Spark = () => (
  <Icon size={18}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />
  </Icon>
)

// One icon per privacy rule, in the same order as privacy.rules.
export const ruleIcons = [
  // Confidentiality agreement
  <Icon key="0">
    <path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z" />
    <path d="M14 3.5V8h4M9.5 13h5M9.5 16.5h3" />
  </Icon>,
  // Only what's needed
  <Icon key="1">
    <path d="M4 5h16l-6 7.5V19l-4 1.5v-8z" />
  </Icon>,
  // Names out
  <Icon key="2">
    <path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4.3 9.5 6a14 14 0 0 1-2.6 3.3M6.4 7.6A14 14 0 0 0 2.5 12c1 1.7 4.5 6 9.5 6 1.5 0 2.8-.4 4-1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Icon>,
  // Private transfer
  <Icon key="3">
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5" />
  </Icon>,
  // AI that doesn't learn from you
  <Icon key="4">
    <rect x="6" y="6" width="12" height="12" rx="2.5" />
    <path d="M9.5 9.5h5v5h-5zM9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5" />
  </Icon>,
  // Deleted when done
  <Icon key="5">
    <path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5" />
  </Icon>,
  // Never shared, never sold
  <Icon key="6">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M6 6l12 12" />
  </Icon>,
  // Egypt's data law
  <Icon key="7">
    <path d="M12 3.5v17M7 20.5h10M4.5 7.5h15M7 7.5l-3 7a3 3 0 0 0 6 0zM17 7.5l-3 7a3 3 0 0 0 6 0z" />
  </Icon>,
]
