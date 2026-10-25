import { QUESTS, type Quest } from '../data/quests'
import { CUSTOM_PREFIX, schoolById } from '../data/schools'
import type { Lang, TKey } from './i18n'
import { hash, rng, shuffle } from './random'
import type { Profile, State } from './store'
import { addDays, dayKey, startOfWeek } from './time'

export interface Level {
  key: 'npc' | 'side' | 'main' | 'legend'
  min: number
  emoji: string
}

export const LEVELS: Level[] = [
  { key: 'npc', min: 0, emoji: '🤖' },
  { key: 'side', min: 300, emoji: '🎭' },
  { key: 'main', min: 1000, emoji: '🌟' },
  { key: 'legend', min: 3000, emoji: '👑' },
]

export const levelLabel = (l: Level): TKey => `level_${l.key}`

export function levelFor(xp: number) {
  let i = 0
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].min) i++
  const level = LEVELS[i]
  const next = LEVELS[i + 1]
  const progress = next ? (xp - level.min) / (next.min - level.min) : 1
  return { level, next, progress }
}

// Same quests for everyone on a given day: 1 daily (never legendary) + 3 bonus.
export function questsForDay(day = dayKey()): { daily: Quest; bonus: Quest[] } {
  const order = shuffle(QUESTS, rng(hash(`irl:${day}`)))
  const daily = order.find((q) => q.rarity !== 'legendary')!
  const bonus = order.filter((q) => q.id !== daily.id).slice(0, 3)
  return { daily, bonus }
}

// Consecutive days with the daily quest done, counting back from today
// (or from yesterday, so the streak isn't "lost" before you've had a chance today).
export function streakOf(state: State, now = new Date()): number {
  const days = new Set(state.completions.filter((c) => c.daily).map((c) => c.day))
  let cursor = days.has(dayKey(now)) ? now : addDays(now, -1)
  let n = 0
  while (days.has(dayKey(cursor))) {
    n++
    cursor = addDays(cursor, -1)
  }
  return n
}

export function statsOf(state: State, now = new Date()) {
  const totalXp = state.completions.reduce((sum, c) => sum + c.xp, 0)
  const spent = state.redemptions.reduce((sum, r) => sum + r.cost, 0)
  const weekStart = startOfWeek(now).getTime()
  const weekXp = state.completions.filter((c) => c.at >= weekStart).reduce((sum, c) => sum + c.xp, 0)
  const today = dayKey(now)
  const doneToday = new Set(state.completions.filter((c) => c.day === today).map((c) => c.questId))
  return {
    totalXp,
    balance: totalXp - spent,
    weekXp,
    doneToday,
    streak: streakOf(state, now),
    ...levelFor(totalXp),
  }
}

export function schoolName(profile: Pick<Profile, 'schoolId' | 'schoolName'>, lang: Lang): string {
  if (profile.schoolId.startsWith(CUSTOM_PREFIX)) return profile.schoolName ?? '?'
  return schoolById(profile.schoolId)?.name[lang] ?? '?'
}
