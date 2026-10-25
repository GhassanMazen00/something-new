import { LOOT, SEASONS } from '../data/seasons'
import type { Level, LootItem, Quest, Season } from '../data/types'
import type { TKey } from './i18n'
import { questKey, type State } from './store'
import { checkAnswer } from './verify'

export const HINT_PENALTY = 0.3

export interface Rank {
  key: 'ghost' | 'runner' | 'netrunner' | 'legend'
  min: number
}

export const RANKS: Rank[] = [
  { key: 'ghost', min: 0 },
  { key: 'runner', min: 500 },
  { key: 'netrunner', min: 1500 },
  { key: 'legend', min: 3000 },
]

export const rankLabel = (r: Rank): TKey => `rank_${r.key}`

export function rankFor(xp: number) {
  let i = 0
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1].min) i++
  const rank = RANKS[i]
  const next = RANKS[i + 1]
  const progress = next ? (xp - rank.min) / (next.min - rank.min) : 1
  return { rank, next, progress }
}

export const isDone = (state: State, season: Season, quest: Quest) => state.quests[questKey(season, quest)]?.status === 'done'
export const isPending = (state: State, season: Season, quest: Quest) => state.quests[questKey(season, quest)]?.status === 'pending'

export const requiredQuests = (level: Level) => level.quests.filter((q) => !q.optional)

export function levelProgress(state: State, season: Season, level: Level) {
  const required = requiredQuests(level)
  const done = required.filter((q) => isDone(state, season, q)).length
  return { done, total: required.length, complete: done === required.length }
}

// A level opens once every required op in the previous level is done.
export function isLevelUnlocked(state: State, season: Season, level: Level): boolean {
  const i = season.levels.indexOf(level)
  return i <= 0 || levelProgress(state, season, season.levels[i - 1]).complete
}

export function isSeasonComplete(state: State, season: Season): boolean {
  return season.levels.every((l) => levelProgress(state, season, l).complete)
}

export function seasonProgress(state: State, season: Season) {
  const required = season.levels.flatMap(requiredQuests)
  return { done: required.filter((q) => isDone(state, season, q)).length, total: required.length }
}

// The letters of the final passphrase, in order, and whether the player has each one.
export function fragmentsOf(state: State, season: Season) {
  return season.levels
    .flatMap((l) => l.quests)
    .filter((q) => q.fragment)
    .map((q) => ({ letter: q.fragment!, got: isDone(state, season, q), quest: q }))
}

export function totalXp(state: State): number {
  return Object.values(state.quests).reduce((sum, r) => sum + (r.status === 'done' ? r.xp : 0), 0)
}

export function isLootUnlocked(state: State, item: LootItem): boolean {
  const season = SEASONS.find((s) => s.id === item.seasonId)
  if (!season) return false
  if (!item.levelId) return isSeasonComplete(state, season)
  const level = season.levels.find((l) => l.id === item.levelId)
  return !!level && levelProgress(state, season, level).complete
}

export const lootFor = (season: Season) => LOOT.filter((l) => l.seasonId === season.id)

// For the SCAN screen and QR links: which quest does this code belong to?
// Only real-world and social codes can be scanned; puzzles are solved in their own screen.
export function findQuestByCode(state: State, code: string) {
  for (const season of SEASONS) {
    for (const level of season.levels) {
      for (const quest of level.quests) {
        if ((quest.kind !== 'real' && quest.kind !== 'social-find') || !quest.answers) continue
        if (checkAnswer(season.id, quest.id, code, quest.answers)) {
          return {
            season,
            level,
            quest,
            unlocked: isLevelUnlocked(state, season, level),
            done: isDone(state, season, quest),
          }
        }
      }
    }
  }
  return null
}

export function daysLeft(season: Season, now = new Date()): number {
  return Math.max(0, Math.ceil((new Date(season.endsAt).getTime() - now.getTime()) / 86_400_000))
}

export interface QuestResult {
  xp: number
  levelUnlocked?: number
  seasonDone?: boolean
}

// Works out what finishing this quest unlocks, by comparing state before and after.
export function resultOf(before: State, after: State, season: Season, level: Level, xp: number): QuestResult {
  const next = season.levels[season.levels.indexOf(level) + 1]
  return {
    xp,
    levelUnlocked: next && !isLevelUnlocked(before, season, next) && isLevelUnlocked(after, season, next) ? next.number : undefined,
    seasonDone: !isSeasonComplete(before, season) && isSeasonComplete(after, season),
  }
}

// Players add this to social-post quests so the Game Master can match posts to Runners.
export const runnerTag = (runnerId: string) => `#GS${runnerId.replace(/^R-/, '')}`
