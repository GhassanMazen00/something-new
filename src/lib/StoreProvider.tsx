import { useEffect, useState, type ReactNode } from 'react'
import { CONFIG } from '../config'
import { HINT_PENALTY } from './game'
import { StoreContext, defaultState, load, questKey, save, type Claim, type QuestRecord, type State, type StoreValue } from './store'
import { claimCode } from './verify'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)

  useEffect(() => {
    save(state)
  }, [state])

  useEffect(() => {
    document.documentElement.lang = state.lang
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr'
  }, [state.lang])

  const value: StoreValue = {
    state,
    setLang: (lang) => setState((s) => ({ ...s, lang })),
    createRunner: (callsign, id) => setState((s) => ({ ...s, runner: { id, callsign, createdAt: Date.now() } })),
    completeQuest: (season, quest) => {
      const key = questKey(season, quest)
      const xp = state.hints[key] ? Math.round(quest.xp * (1 - HINT_PENALTY)) : quest.xp
      const record: QuestRecord = { status: 'done', xp, at: Date.now() }
      setState((s) => ({ ...s, quests: { ...s.quests, [key]: record } }))
      return record
    },
    submitProof: (season, quest, url) => {
      const record: QuestRecord = { status: 'pending', xp: 0, at: Date.now(), proofUrl: url }
      setState((s) => ({ ...s, quests: { ...s.quests, [questKey(season, quest)]: record } }))
    },
    revealHint: (season, quest) =>
      setState((s) => ({ ...s, hints: { ...s.hints, [questKey(season, quest)]: true } })),
    markSeen: (key) => setState((s) => (s.seen[key] ? s : { ...s, seen: { ...s.seen, [key]: true } })),
    claimLoot: (item) => {
      const claim: Claim = { code: claimCode(state.runner?.id ?? '', item.id, CONFIG.claimSalt), at: Date.now() }
      setState((s) => ({ ...s, claims: { ...s.claims, [item.id]: claim } }))
      return claim
    },
    reset: () => setState({ ...defaultState(), lang: state.lang }),
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
