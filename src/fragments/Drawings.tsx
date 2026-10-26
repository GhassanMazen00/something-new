// Drawings made in code: the Roda Nilometer (Egypt's oldest forecasting instrument)
// and a mashrabiya lattice (the Cairo window that lets you see out without being seen).

export function Nilometer({ marks = true }: { marks?: boolean }) {
  const ticks = Array.from({ length: 16 }, (_, i) => i + 1)
  const yOf = (n: number) => 272 - (n - 1) * 14
  return (
    <svg viewBox="0 0 120 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="120" height="300" fill="#38450f" />
      <g className="water">
        <g className="wave">
          <path
            d="M-20 118 q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V320 H-20 Z"
            fill="#ecebe7"
            opacity="0.16"
          />
        </g>
      </g>
      {/* capital and base */}
      <rect x="40" y="26" width="40" height="10" fill="none" stroke="#ecebe7" strokeWidth="1.5" />
      <rect x="44" y="36" width="32" height="6" fill="none" stroke="#ecebe7" strokeWidth="1.5" />
      <rect x="40" y="280" width="40" height="10" fill="none" stroke="#ecebe7" strokeWidth="1.5" />
      {/* the octagonal shaft */}
      <rect x="49" y="42" width="22" height="238" fill="none" stroke="#ecebe7" strokeWidth="1.5" />
      <line x1="55" y1="42" x2="55" y2="280" stroke="#ecebe7" strokeWidth="0.8" opacity="0.6" />
      <line x1="65" y1="42" x2="65" y2="280" stroke="#ecebe7" strokeWidth="0.8" opacity="0.6" />
      {ticks.map((n) => (
        <g key={n}>
          <line x1={n % 2 === 0 ? 38 : 42} x2="49" y1={yOf(n)} y2={yOf(n)} stroke="#ecebe7" strokeWidth="1.2" />
          {marks && n % 2 === 0 && (
            <text x="34" y={yOf(n) + 3} textAnchor="end" fontSize="8" fill="#ecebe7" fontFamily="Libre Franklin, sans-serif">
              {n}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

export function Mashrabiya() {
  return (
    <svg viewBox="0 0 720 900" aria-hidden="true">
      <defs>
        <pattern id="lattice" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#e1dfd9" />
          <line x1="0" y1="20" x2="40" y2="20" stroke="#38450f" strokeWidth="3" />
          <line x1="20" y1="0" x2="20" y2="40" stroke="#38450f" strokeWidth="3" />
          <circle cx="20" cy="20" r="6.5" fill="#38450f" />
          <ellipse cx="0" cy="20" rx="5.5" ry="3.6" fill="#38450f" />
          <ellipse cx="40" cy="20" rx="5.5" ry="3.6" fill="#38450f" />
          <ellipse cx="20" cy="0" rx="3.6" ry="5.5" fill="#38450f" />
          <ellipse cx="20" cy="40" rx="3.6" ry="5.5" fill="#38450f" />
        </pattern>
      </defs>
      <rect width="720" height="900" fill="#d6d3ca" />
      <rect x="56" y="176" width="608" height="668" fill="url(#lattice)" />
      <rect x="56" y="176" width="608" height="668" fill="none" stroke="#38450f" strokeWidth="10" />
      <rect x="40" y="150" width="640" height="18" fill="#38450f" />
      <rect x="40" y="852" width="640" height="18" fill="#38450f" />
      <line x1="360" y1="176" x2="360" y2="844" stroke="#38450f" strokeWidth="8" />
      <line x1="56" y1="510" x2="664" y2="510" stroke="#38450f" strokeWidth="8" />
    </svg>
  )
}
