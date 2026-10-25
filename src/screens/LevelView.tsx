import { Frame, Glitch, Hud, Tag, Typewriter } from '../components/ui'
import type { Level, Quest, Season } from '../data/types'
import { isDone, isPending, levelProgress } from '../lib/game'
import { useT } from '../lib/i18n'
import { useStore } from '../lib/store'
import { KIND_COLOR, KIND_GLYPH, NEON } from '../lib/theme'

export function LevelView({
  season,
  level,
  onBack,
  onOpenQuest,
}: {
  season: Season
  level: Level
  onBack: () => void
  onOpenQuest: (quest: Quest) => void
}) {
  const { state, markSeen } = useStore()
  const { t, pick, pad, xp } = useT()
  const seenKey = `${season.id}/${level.id}`
  const progress = levelProgress(state, season, level)

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="font-mono text-xs tracking-widest text-dim hover:text-cyan">
        <span className="inline-block rtl:rotate-180">◂</span> {t('back')}
      </button>

      <div>
        <Hud color={NEON.acid}>
          {t('level', { n: pad(level.number) })} · {progress.done}/{progress.total}
        </Hud>
        <Glitch text={pick(level.title)} className="mt-2 font-display text-4xl font-black tracking-wider text-white text-glow" />
      </div>

      <Frame color={NEON.magenta}>
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between font-mono text-[11px] tracking-[0.25em] text-magenta">
            <span>◉ {t('transmission')}</span>
            {!state.seen[seenKey] && <span className="text-dim">{t('tapToSkip')}</span>}
          </div>
          <Typewriter
            key={`${seenKey}-${state.lang}`}
            text={pick(level.transmission)}
            instant={!!state.seen[seenKey]}
            onDone={() => markSeen(seenKey)}
          />
        </div>
      </Frame>

      <section className="space-y-3">
        <Hud>{t('ops')}</Hud>
        {level.quests.map((q) => {
          const done = isDone(state, season, q)
          const pending = isPending(state, season, q)
          const color = done ? NEON.matrix : KIND_COLOR[q.kind]
          return (
            <Frame key={q.id} color={color} onClick={() => onOpenQuest(q)} innerClassName={done ? 'bg-matrix/5' : ''}>
              <div className="flex items-center gap-3 p-4">
                <div
                  className="chamfer-sm grid h-12 w-12 shrink-0 place-items-center font-mono text-lg font-bold"
                  style={{ background: `${KIND_COLOR[q.kind]}1a`, color: KIND_COLOR[q.kind] }}
                >
                  {KIND_GLYPH[q.kind]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag color={KIND_COLOR[q.kind]}>{t(`kind_${q.kind}`)}</Tag>
                    {q.optional && <Tag color={NEON.dim}>{t('optional')}</Tag>}
                  </div>
                  <div className="mt-1 truncate font-display text-base font-bold tracking-wider text-white">{pick(q.title)}</div>
                  <div className="font-mono text-xs text-dim">{xp(q.xp, true)}</div>
                </div>
                <div className="shrink-0 text-center">
                  {done ? (
                    <div className="chamfer-sm grid h-10 w-10 place-items-center bg-acid font-display text-xl font-black text-void">
                      {q.fragment ?? '✓'}
                    </div>
                  ) : pending ? (
                    <Tag color={NEON.magenta}>◷ {t('pending')}</Tag>
                  ) : (
                    <div className="chamfer-sm grid h-10 w-10 place-items-center border border-dashed border-edge font-display text-lg text-dim">
                      {q.fragment ? '?' : '›'}
                    </div>
                  )}
                </div>
              </div>
            </Frame>
          )
        })}
      </section>
    </div>
  )
}
