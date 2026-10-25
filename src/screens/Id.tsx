import { Bar, Button, Frame, Glitch, Hud, Identicon, LangToggle } from '../components/ui'
import { SEASONS } from '../data/seasons'
import { RANKS, fragmentsOf, rankFor, rankLabel, runnerTag, totalXp } from '../lib/game'
import { useT } from '../lib/i18n'
import { useStore } from '../lib/store'
import { NEON } from '../lib/theme'

export function Id() {
  const { state, reset } = useStore()
  const { t, xp, num } = useT()
  const runner = state.runner!
  const total = totalXp(state)
  const { rank, next, progress } = rankFor(total)
  const opsDone = Object.values(state.quests).filter((q) => q.status === 'done').length
  const fragments = SEASONS.flatMap((s) => fragmentsOf(state, s)).filter((f) => f.got).length

  return (
    <div className="space-y-6">
      <Frame color={NEON.cyan} glow>
        <div className="relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -end-10 -top-10 font-display text-[160px] leading-none font-black text-cyan/5">ID</div>
          <Hud color={NEON.cyan}>{t('runnerId')}</Hud>
          <div className="mt-4 flex items-center gap-4">
            <Identicon seed={runner.id} size={96} />
            <div className="min-w-0">
              <Glitch text={runner.callsign} as="h2" className="truncate font-display text-2xl font-black tracking-wider text-white text-glow" />
              <div dir="ltr" className="mt-1 font-mono text-cyan">{runner.id}</div>
              <div dir="ltr" className="font-mono text-sm text-magenta">{runnerTag(runner.id)}</div>
            </div>
          </div>
          <div className="mt-5 flex items-baseline justify-between">
            <span className="font-display text-lg font-bold tracking-[0.2em] text-acid text-glow">{t(rankLabel(rank))}</span>
            <span className="font-mono text-xs text-dim">
              {next ? t('toNextRank', { xp: xp(next.min - total), rank: t(rankLabel(next)) }) : t('maxRank')}
            </span>
          </div>
          <div className="mt-2">
            <Bar value={progress} color={NEON.acid} segments={24} />
          </div>
          <div dir="ltr" className="mt-3 flex justify-between font-mono text-[10px] text-dim">
            {RANKS.map((r) => (
              <span key={r.key} className={total >= r.min ? 'text-acid' : ''}>
                {t(rankLabel(r))}
              </span>
            ))}
          </div>
        </div>
      </Frame>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: t('statOps'), value: num(opsDone), color: NEON.matrix },
          { label: t('statXp'), value: num(total), color: NEON.cyan },
          { label: t('statFragments'), value: num(fragments), color: NEON.acid },
        ].map((s) => (
          <Frame key={s.label} color={`${s.color}66`}>
            <div className="p-3 text-center">
              <div className="font-display text-2xl font-black tabular-nums" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="font-mono text-[10px] tracking-widest text-dim">{s.label}</div>
            </div>
          </Frame>
        ))}
      </div>

      <Frame>
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <Hud>{t('language')}</Hud>
            <LangToggle />
          </div>
          <p className="font-mono text-xs leading-relaxed text-dim">{t('localNote')}</p>
          <Button
            full
            variant="danger"
            onClick={() => {
              if (window.confirm(t('wipeConfirm'))) reset()
            }}
          >
            {t('wipe')}
          </Button>
        </div>
      </Frame>
    </div>
  )
}
