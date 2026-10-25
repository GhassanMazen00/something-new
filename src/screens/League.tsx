import { useState } from 'react'
import { Button, DemoBanner, SegmentedTabs } from '../components/ui'
import { CUSTOM_PREFIX } from '../data/schools'
import { playerBoard, schoolBoard, type BoardRow } from '../lib/demo'
import { schoolName, statsOf } from '../lib/game'
import { useT } from '../lib/i18n'
import { inviteUrl, shareLink } from '../lib/media'
import { useStore } from '../lib/store'
import { formatDuration, msUntilNextWeek, useNow } from '../lib/time'
import { toast } from '../lib/toast'

const MEDALS = ['🥇', '🥈', '🥉']

export function League() {
  const { state } = useStore()
  const { t, lang, num } = useT()
  const now = useNow()
  const [tab, setTab] = useState<'schools' | 'players'>('schools')
  const profile = state.profile!
  const stats = statsOf(state, now)
  const mySchool = schoolName(profile, lang)

  const rows =
    tab === 'schools'
      ? schoolBoard({ lang, mySchoolId: profile.schoolId, mySchoolName: mySchool, myWeekXp: stats.weekXp, now })
      : playerBoard({ lang, mySchoolId: profile.schoolId, me: { name: profile.name, avatar: profile.avatar, weekXp: stats.weekXp }, now })

  const invite = async () => {
    const result = await shareLink(t('inviteText', { school: mySchool }), inviteUrl(profile.schoolId, profile.schoolName))
    if (result === 'copied') toast(t('copied'))
  }

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between">
        <h1 className="text-3xl font-black">{t('leagueTitle')}</h1>
        <span className="text-xs text-muted tabular-nums">⏳ {t('resetsIn', { time: formatDuration(msUntilNextWeek(now)) })}</span>
      </header>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet to-pink p-4">
        <div className="text-xs font-bold tracking-wider text-white/80 uppercase">🏆 {t('weeklyPrize')}</div>
        <p className="mt-1 text-lg leading-snug font-extrabold">{t('weeklyPrizeDesc')}</p>
        <span className="absolute -end-3 -bottom-4 text-7xl opacity-30">🎤</span>
      </section>

      <SegmentedTabs
        value={tab}
        onChange={setTab}
        options={[
          { value: 'schools', label: `🏫 ${t('schools')}` },
          { value: 'players', label: `🧍 ${t('players')}` },
        ]}
      />
      <DemoBanner />

      {tab === 'schools' && profile.schoolId.startsWith(CUSTOM_PREFIX) && (
        <p className="rounded-2xl bg-surface p-3 text-sm text-white/80">🌱 {t('newSchoolHint')}</p>
      )}

      <ol className="space-y-2">
        {rows.map((row, i) => (
          <Row key={row.id} row={row} rank={i + 1} pts={t('pts')} you={t('you')} num={num} />
        ))}
      </ol>

      <Button className="sticky bottom-24 w-full" onClick={invite}>
        📣 {t('inviteSquad')}
      </Button>
    </div>
  )
}

function Row({ row, rank, pts, you, num }: { row: BoardRow; rank: number; pts: string; you: string; num: (n: number) => string }) {
  return (
    <li
      className={`flex items-center gap-3 rounded-2xl border p-3 ${
        row.mine ? 'border-lime bg-lime/10' : 'border-line bg-surface'
      }`}
    >
      <span className="w-8 text-center text-lg font-black tabular-nums">{MEDALS[rank - 1] ?? rank}</span>
      {row.avatar && <span className="text-2xl">{row.avatar}</span>}
      <span className={`min-w-0 flex-1 truncate font-bold ${row.mine ? 'text-lime' : ''}`}>
        {row.name}
        {row.mine && row.avatar && <span className="ms-2 text-xs uppercase">({you})</span>}
      </span>
      <span className="shrink-0 font-black tabular-nums">
        {num(row.points)} <span className="text-xs font-bold text-muted">{pts}</span>
      </span>
    </li>
  )
}
