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
  // Encrypted, always
  <Icon key="2">
    <path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z" />
    <rect x="9" y="11" width="6" height="5" rx="1" />
    <path d="M10.2 11V9.6a1.8 1.8 0 0 1 3.6 0V11" />
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

const SmallIcon = ({ children }: { children: ReactNode }) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)
export const Sun = () => (
  <SmallIcon>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
  </SmallIcon>
)
export const Moon = () => (
  <SmallIcon>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </SmallIcon>
)
export const Menu = () => (
  <SmallIcon>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </SmallIcon>
)
export const Chat = () => (
  <SmallIcon>
    <path d="M4 5.5h16v10H9l-5 4z" />
  </SmallIcon>
)
export const Close = () => (
  <SmallIcon>
    <path d="M6 6l12 12M18 6L6 18" />
  </SmallIcon>
)

export const Gear = () => (
  <SmallIcon>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </SmallIcon>
)

// Contact channels.
export const contactIcons = {
  email: (
    <Icon>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3.5 7.5l8.5 6 8.5-6" />
    </Icon>
  ),
  whatsapp: (
    <Icon>
      <path d="M4 20l1.3-4A8.5 8.5 0 1 1 8 18.8z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-2-1-1 .8a4 4 0 0 1-2.1-2.1l.8-1-1-2z" />
    </Icon>
  ),
  phone: (
    <Icon>
      <path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z" />
    </Icon>
  ),
}
