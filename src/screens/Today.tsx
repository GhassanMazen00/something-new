import { useState } from 'react'
import { BonusQuestRow, DailyQuestCard } from '../components/QuestCard'
import { ProofSheet } from '../components/ProofSheet'
import { Button, ProgressBar } from '../components/ui'
import type { Quest } from '../data/quests'
import { schoolBoard } from '../lib/demo'
import { levelLabel, questsForDay, schoolName, statsOf } from '../lib/game'
import { useT } from '../lib/i18n'
import { inviteUrl, shareLink } from '../lib/media'
import { useStore } from '../lib/store'
import { dayKey } from '../lib/time'
import { toast } from '../lib/toast'
import { useShareCard } from '../lib/useShareCard'

export function Today() {
  const { state } = useStore()
  const { t, lang, num, xp } = useT()
  const share = useShareCard()
  const [active, setActive] = useState<{ quest: Quest; daily: boolean } | null>(null)
  const profile = state.profile!
  const stats = statsOf(state)
  const { daily, bonus } = questsForDay()
  const today = dayKey()
  const dailyCompletion = state.completions.find((c) => c.day === today && c.daily)

  const mySchool = schoolName(profile, lang)
  const board = schoolBoard({ lang, mySchoolId: profile.schoolId, mySchoolName: mySchool, myWeekXp: stats.weekXp })
  const rank = board.findIndex((r) => r.mine) + 1
  const gap = rank > 1 ? board[rank - 2].points - board[rank - 1].points : 0

  const invite = async () => {
    const result = await shareLink(t('inviteText', { school: mySchool }), inviteUrl(profile.schoolId, profile.schoolName))
    if (result === 'copied') toast(t('copied'))
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-surface text-3xl">{profile.avatar}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-lg font-extrabold">{profile.name}</span>
            <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-sm font-bold text-gold">🔥 {stats.streak}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span className="font-bold text-white/80">
              {stats.level.emoji} {t(levelLabel(stats.level))}
            </span>
            <ProgressBar value={stats.progress} className="flex-1" />
            <span className="tabular-nums">{xp(stats.totalXp)}</span>
          </div>
        </div>
      </header>

      <DailyQuestCard
        quest={daily}
        done={!!dailyCompletion}
        onStart={() => setActive({ quest: daily, daily: true })}
        onShare={() => dailyCompletion && share(dailyCompletion)}
      />

      <section className="rounded-3xl border border-line bg-surface p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet/20 text-2xl">🏆</div>
          <div className="min-w-0 flex-1">
            <div className="font-extrabold">{t('schoolRank', { school: mySchool, rank })}</div>
            <div className="text-sm text-muted">
              {rank === 1 ? t('leading') : t('behindBy', { points: num(gap), rank: rank - 1 })}
            </div>
          </div>
        </div>
        <Button variant="secondary" className="mt-3 w-full" onClick={invite}>
          📣 {t('inviteSquad')}
        </Button>
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-lg font-extrabold">{t('bonusQuests')}</h3>
          <span className="text-xs text-muted">{t('bonusSub')}</span>
        </div>
        <div className="space-y-2">
          {bonus.map((q) => (
            <BonusQuestRow
              key={q.id}
              quest={q}
              done={stats.doneToday.has(q.id)}
              onStart={() => setActive({ quest: q, daily: false })}
            />
          ))}
        </div>
      </section>

      <p className="px-2 text-center text-xs text-muted">🛡️ {t('safety')}</p>

      {active && (
        <ProofSheet key={active.quest.id} quest={active.quest} daily={active.daily} onClose={() => setActive(null)} />
      )}
    </div>
  )
}
