import { rankFor, rankLabel, totalXp } from '../lib/game'
import { useT } from '../lib/i18n'
import { useStore } from '../lib/store'
import { NEON } from '../lib/theme'
import { Bar, Identicon } from './ui'

// Top bar on the main screens: who you are, your rank and XP.
export function RunnerHud() {
  const { state } = useStore()
  const { t, xp } = useT()
  const runner = state.runner!
  const total = totalXp(state)
  const { rank, progress } = rankFor(total)
  return (
    <header className="flex items-center gap-3">
      <Identicon seed={runner.id} size={48} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-display text-base font-bold tracking-wider text-white">{runner.callsign}</span>
          <span className="shrink-0 font-mono text-xs text-acid">{t(rankLabel(rank))}</span>
        </div>
        <div className="mt-1.5">
          <Bar value={progress} color={NEON.acid} />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[11px] text-dim">
          <span dir="ltr">{runner.id}</span>
          <span>{xp(total)}</span>
        </div>
      </div>
    </header>
  )
}
