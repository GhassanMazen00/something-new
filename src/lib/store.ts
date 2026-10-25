import { createContext, useContext } from 'react'
import type { LootItem, Quest, Season } from '../data/types'
import type { Lang } from './i18n'

// Everything the app remembers about the player. For now it lives in localStorage;
// swapping load/save for a real backend (e.g. Supabase) is the next step.
// The React provider that owns this state is in StoreProvider.tsx.

export interface Runner {
  id: string // R-XXXXXX
  callsign: string
  createdAt: number
}

export interface QuestRecord {
  status: 'done' | 'pending' // pending = social post waiting for verification
  xp: number
  at: number
  proofUrl?: string
}

export interface Claim {
  code: string
  at: number
}

export interface State {
  lang: Lang
  runner: Runner | null
  quests: Record<string, QuestRecord> // key: "s1/l1-cipher"
  hints: Record<string, true>
  seen: Record<string, true> // transmissions already typed out once
  claims: Record<string, Claim>
}

const STORAGE_KEY = 'irl:v2'

export const questKey = (season: Season | string, quest: Quest | string) =>
  `${typeof season === 'string' ? season : season.id}/${typeof quest === 'string' ? quest : quest.id}`

export function defaultState(): State {
  const lang: Lang = navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en'
  return { lang, runner: null, quests: {}, hints: {}, seen: {}, claims: {} }
}

export function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaultState(), ...JSON.parse(raw) }
  } catch {
    // Private mode or corrupted data: start fresh.
  }
  return defaultState()
}

export function save(state: State) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable; progress stays in memory for this session.
  }
}

export interface StoreValue {
  state: State
  setLang: (lang: Lang) => void
  createRunner: (callsign: string, id: string) => void
  completeQuest: (season: Season, quest: Quest) => QuestRecord
  submitProof: (season: Season, quest: Quest, url: string) => void
  revealHint: (season: Season, quest: Quest) => void
  markSeen: (key: string) => void
  claimLoot: (item: LootItem) => Claim
  reset: () => void
}

export const StoreContext = createContext<StoreValue | null>(null)

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
