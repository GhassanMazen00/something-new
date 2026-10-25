import { RunnerHud } from '../components/RunnerHud'
import { Bar, Frame, Glitch, Hud, Tag } from '../components/ui'
import { SEASONS, UPCOMING } from '../data/seasons'
import type { Level, Season } from '../data/types'
import { daysLeft, isLevelUnlocked, isSeasonComplete, levelProgress, seasonProgress } from '../lib/game'
import { useT } from '../lib/i18n'
import { useStore } from '../lib/store'
import { NEON } from '../lib/theme'

export function Ops({ onOpenLevel }: { onOpenLevel: (season: Season, level: Level) => void }) {
  const { state } = useStore()
  const { t, pick, pad } = useT()

  return (
    <div className="space-y-6">
      <RunnerHud />

      {SEASONS.map((season) => {
        const progress = seasonProgress(state, season)
        const cleared = isSeasonComplete(state, season)
        return (
          <section key={season.id} className="space-y-5">
            <Frame color={NEON.cyan} glow>
              <div className="relative overflow-hidden p-5">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 animate-sweep bg-gradient-to-b from-transparent via-cyan/10 to-transparent" />
                <div className="flex items-center justify-between">
                  <Hud color={NEON.cyan}>{t('season', { n: pad(season.number) })}</Hud>
                  {cleared ? (
                    <Tag color={NEON.magenta} solid>✦ {t('seasonCleared')}</Tag>
                  ) : (
                    <span className="flex items-center gap-2 font-mono text-xs text-matrix">
                      <span className="h-2 w-2 animate-pulse-dot rounded-full bg-matrix text-matrix" />
                      {t('live')} · {t('endsIn', { d: daysLeft(season) })}
                    </span>
                  )}
                </div>
                <Glitch
                  text={pick(season.title)}
                  className="mt-3 font-display text-[34px] leading-tight font-black tracking-wide text-white text-glow"
                />
                <p className="mt-2 font-mono text-sm text-dim">{pick(season.tagline)}</p>
                <div className="mt-5">
                  <Bar value={progress.done / progress.total} color={NEON.cyan} />
                  <div className="mt-1.5 font-mono text-xs text-cyan">{t('opsDone', { done: progress.done, total: progress.total })}</div>
                </div>
              </div>
            </Frame>

            <ol className="relative space-y-3 ps-6">
              <span className="absolute start-[11px] top-4 bottom-4 w-px bg-gradient-to-b from-cyan via-magenta to-edge" />
              {season.levels.map((level) => {
                const unlocked = isLevelUnlocked(state, season, level)
                const lp = levelProgress(state, season, level)
                const color = lp.complete ? NEON.matrix : unlocked ? NEON.acid : NEON.edge
                return (
                  <li key={level.id} className="relative">
                    <span
                      className="absolute top-1/2 h-[9px] w-[9px] -translate-y-1/2 rotate-45"
                      style={{ background: color, boxShadow: unlocked ? `0 0 10px ${color}` : undefined, insetInlineStart: '-17px' }}
                    />
                    <Frame
                      color={color}
                      glow={unlocked && !lp.complete}
                      onClick={unlocked ? () => onOpenLevel(season, level) : undefined}
                      innerClassName={unlocked ? '' : 'opacity-60'}
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div className="font-display text-3xl font-black tabular-nums" style={{ color }}>
                          {pad(level.number)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-[11px] tracking-[0.25em] text-dim">{t('level', { n: pad(level.number) })}</div>
                          <div className="truncate font-display text-lg font-bold tracking-wider text-white">
                            {unlocked ? pick(level.title) : '█████'}
                          </div>
                          <div className="mt-0.5 font-mono text-xs" style={{ color: unlocked ? color : NEON.dim }}>
                            {lp.complete
                              ? `✓ ${t('complete')}`
                              : unlocked
                                ? `▶ ${t('active')} · ${lp.done}/${lp.total}`
                                : `🔒 ${t('unlockHint', { n: pad(level.number - 1) })}`}
                          </div>
                        </div>
                        {unlocked && <span className="font-display text-xl text-dim rtl:rotate-180">›</span>}
                      </div>
                    </Frame>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}

      {UPCOMING.map((s) => (
        <Frame key={s.number} color={NEON.edge}>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <Hud>{t('season', { n: pad(s.number) })}</Hud>
              <Tag color={NEON.alert}>{t('classified')}</Tag>
            </div>
            <div className="mt-3 font-display text-2xl font-black tracking-widest text-dim/70">{s.codename}</div>
            <div className="mt-3 space-y-2">
              <div className="h-2.5 w-11/12 bg-edge" />
              <div className="h-2.5 w-8/12 bg-edge" />
              <div className="h-2.5 w-9/12 bg-edge" />
            </div>
            <p className="mt-4 font-mono text-xs text-dim">{t('classifiedBody')}</p>
          </div>
        </Frame>
      ))}
    </div>
  )
}
