import { CATEGORY_META, DAILY_MULTIPLIER, RARITY_XP, type Quest } from '../data/quests'
import { useT } from '../lib/i18n'
import { formatDuration, msUntilTomorrow, useNow } from '../lib/time'
import { Button, Chip, RarityChip } from './ui'

export function DailyQuestCard({
  quest,
  done,
  onStart,
  onShare,
}: {
  quest: Quest
  done: boolean
  onStart: () => void
  onShare: () => void
}) {
  const { t, pick, xp } = useT()
  const now = useNow()
  const meta = CATEGORY_META[quest.category]

  return (
    <section
      className="relative overflow-hidden rounded-3xl border p-5"
      style={{ background: `linear-gradient(140deg, ${meta.color}38, #15151f 62%)`, borderColor: `${meta.color}55` }}
    >
      <div
        className="pointer-events-none absolute -top-16 -end-16 h-48 w-48 rounded-full blur-3xl"
        style={{ background: `${meta.color}40` }}
      />
      <div className="relative flex items-center justify-between gap-2 text-[11px] font-bold tracking-wider uppercase">
        <span className="text-lime">⚡ {t('todaysQuest')}</span>
        <span className="text-white/60 tabular-nums">{t('newQuestIn', { time: formatDuration(msUntilTomorrow(now)) })}</span>
      </div>

      <div className="relative mt-4 text-6xl">{meta.emoji}</div>
      <h2 className="relative mt-3 text-[26px] leading-tight font-extrabold">{pick(quest.title)}</h2>
      <p className="relative mt-2 text-white/75">{pick(quest.desc)}</p>

      <div className="relative mt-4 flex flex-wrap gap-2">
        <RarityChip rarity={quest.rarity} />
        <Chip className="bg-white/10 text-white/80">{t(`category_${quest.category}`)}</Chip>
        <Chip className="bg-lime/15 text-lime">{xp(RARITY_XP[quest.rarity] * DAILY_MULTIPLIER, true)} · {t('doubleXp')}</Chip>
      </div>
      <p className="relative mt-3 text-xs text-white/50">🌍 {t('everyoneSame')}</p>

      {done ? (
        <div className="relative mt-5 flex gap-2">
          <div className="flex flex-1 items-center justify-center rounded-2xl bg-lime/15 py-3.5 font-bold text-lime">
            ✅ {t('done')}
          </div>
          <Button variant="secondary" onClick={onShare}>
            📤 {t('shareIt')}
          </Button>
        </div>
      ) : (
        <Button className="relative mt-5 w-full text-lg" onClick={onStart}>
          {t('iDidIt')} 📸
        </Button>
      )}
    </section>
  )
}

export function BonusQuestRow({ quest, done, onStart }: { quest: Quest; done: boolean; onStart: () => void }) {
  const { pick, xp } = useT()
  const meta = CATEGORY_META[quest.category]
  return (
    <button
      onClick={onStart}
      disabled={done}
      className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-start transition hover:bg-surface-2 disabled:opacity-60"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl" style={{ background: `${meta.color}26` }}>
        {meta.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-bold">{pick(quest.title)}</div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
          <RarityChip rarity={quest.rarity} />
          <span>{xp(RARITY_XP[quest.rarity], true)}</span>
        </div>
      </div>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg font-black ${done ? '' : 'bg-lime text-ink'}`}>
        {done ? '✅' : '+'}
      </span>
    </button>
  )
}
