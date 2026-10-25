import { createContext, useContext } from 'react'
import type { Quest } from '../data/quests'
import type { Reward } from '../data/rewards'
import type { Lang } from './i18n'

// Everything the app remembers about the player. In demo mode it lives in
// localStorage; swapping load/save for a real backend (e.g. Supabase) is the next step.
// The React provider that owns this state is in StoreProvider.tsx.

export interface Profile {
  name: string
  handle: string
  avatar: string
  schoolId: string
  schoolName?: string // only for schools the player added themselves
  joinedAt: number
}

export interface Completion {
  id: string
  questId: string
  day: string
  daily: boolean
  xp: number
  photo?: string // compressed JPEG data URL
  caption: string
  at: number
}

export interface Redemption {
  id: string
  rewardId: string
  code: string
  cost: number
  at: number
}

export type Vote = 'legit' | 'fake'

export interface State {
  lang: Lang
  profile: Profile | null
  completions: Completion[]
  redemptions: Redemption[]
  votes: Record<string, Vote>
}

const STORAGE_KEY = 'irl:v1'

export function defaultState(): State {
  const lang: Lang = navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en'
  return { lang, profile: null, completions: [], redemptions: [], votes: {} }
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
    // Storage full (photos are big). Keep photos only for the 5 newest quests and retry.
    try {
      const keep = new Set(
        [...state.completions].sort((a, b) => b.at - a.at).slice(0, 5).map((c) => c.id),
      )
      const slim = {
        ...state,
        completions: state.completions.map((c) => (keep.has(c.id) ? c : { ...c, photo: undefined })),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim))
    } catch {
      // Nothing more we can do; progress stays in memory for this session.
    }
  }
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

export function rewardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return `IRL-${s.slice(0, 3)}-${s.slice(3)}`
}

export interface StoreValue {
  state: State
  setLang: (lang: Lang) => void
  createProfile: (p: Omit<Profile, 'joinedAt'>) => void
  completeQuest: (quest: Quest, daily: boolean, photo: string | undefined, caption: string) => Completion
  redeem: (reward: Reward) => Redemption
  vote: (postId: string, v: Vote) => void
  reset: () => void
}

export const StoreContext = createContext<StoreValue | null>(null)

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
