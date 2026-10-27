import { process } from '../content'
import { useLang } from '../lang'
import type { Level as L } from '../samples'

const BARS: Record<L, number> = { high: 3, medium: 2, low: 1, none: 0 }

// Confidence shown as signal bars plus a word, instead of coloured badges.
export function Level({ level, text }: { level: string; text?: string }) {
  const { t } = useLang()
  const l = (level in BARS ? level : 'none') as L
  return (
    <span className={`level lv-${l}`}>
      <span className="bars" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <i key={n} className={n <= BARS[l] ? 'on' : undefined} />
        ))}
      </span>
      {text ?? t(process.levels[l])}
    </span>
  )
}
