import { Button, LangToggle, ProgressBar } from '../components/ui'
import { CATEGORY_META, questById } from '../data/quests'
import { LEVELS, levelLabel, schoolName, statsOf } from '../lib/game'
import { useT } from '../lib/i18n'
import { useStore } from '../lib/store'

export function Profile() {
  const { state, reset } = useStore()
  const { t, lang, pick, num, xp } = useT()
  const profile = state.profile!
  const stats = statsOf(state)
  const completions = [...state.completions].sort((a, b) => b.at - a.at)

  return (
    <div className="space-y-5">
      <header className="text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-surface text-6xl">{profile.avatar}</div>
        <h1 className="mt-3 text-2xl font-black">{profile.name}</h1>
        <p className="text-muted" dir="ltr">
          @{profile.handle}
        </p>
        <p className="mt-1 text-sm font-bold text-white/80">🏫 {schoolName(profile, lang)}</p>
      </header>

      <section className="rounded-3xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="text-xl font-black">
            {stats.level.emoji} {t(levelLabel(stats.level))}
          </span>
          <span className="text-sm text-muted">
            {stats.next ? t('toNext', { xp: xp(stats.next.min - stats.totalXp), level: t(levelLabel(stats.next)) }) : t('maxLevel')}
          </span>
        </div>
        <ProgressBar value={stats.progress} className="mt-3" />
        <div className="mt-4 flex justify-between">
          {LEVELS.map((l) => (
            <div key={l.key} className={`text-center text-xs ${stats.totalXp >= l.min ? 'text-white' : 'text-muted opacity-50'}`}>
              <div className="text-2xl">{l.emoji}</div>
              <div className="mt-1 font-bold">{t(levelLabel(l))}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: t('statQuests'), value: num(state.completions.length), emoji: '✅' },
          { label: t('statXp'), value: num(stats.totalXp), emoji: '⚡' },
          { label: t('statStreak'), value: num(stats.streak), emoji: '🔥' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface p-3">
            <div className="text-xl">{s.emoji}</div>
            <div className="text-2xl font-black tabular-nums">{s.value}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </section>

      <section>
        <h3 className="mb-2 text-lg font-extrabold">{t('myQuests')}</h3>
        {completions.length === 0 ? (
          <p className="rounded-2xl bg-surface p-4 text-center text-muted">{t('noQuestsYet')}</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {completions.map((c) => {
              const q = questById(c.questId)
              if (!q) return null
              const meta = CATEGORY_META[q.category]
              return (
                <div key={c.id} className="relative aspect-square overflow-hidden rounded-2xl" title={pick(q.title)}>
                  {c.photo ? (
                    <img src={c.photo} alt={pick(q.title)} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-4xl" style={{ background: `${meta.color}33` }}>
                      {meta.emoji}
                    </div>
                  )}
                  <span className="absolute start-1 bottom-1 rounded-full bg-black/70 px-1.5 text-[10px] font-bold">{meta.emoji}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-3xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <span className="font-bold">{t('language')}</span>
          <LangToggle />
        </div>
        <Button
          variant="ghost"
          className="w-full text-pink"
          onClick={() => {
            if (window.confirm(t('resetConfirm'))) reset()
          }}
        >
          🗑️ {t('resetDemo')}
        </Button>
      </section>
    </div>
  )
}
