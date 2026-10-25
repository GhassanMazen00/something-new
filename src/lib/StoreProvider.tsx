import { useEffect, useState, type ReactNode } from 'react'
import { DAILY_MULTIPLIER, RARITY_XP } from '../data/quests'
import {
  StoreContext,
  defaultState,
  load,
  rewardCode,
  save,
  uid,
  type Completion,
  type Redemption,
  type State,
  type StoreValue,
} from './store'
import { dayKey } from './time'

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
    createProfile: (p) => setState((s) => ({ ...s, profile: { ...p, joinedAt: Date.now() } })),
    completeQuest: (quest, daily, photo, caption) => {
      const completion: Completion = {
        id: uid(),
        questId: quest.id,
        day: dayKey(),
        daily,
        xp: RARITY_XP[quest.rarity] * (daily ? DAILY_MULTIPLIER : 1),
        photo,
        caption: caption.trim(),
        at: Date.now(),
      }
      setState((s) => ({ ...s, completions: [...s.completions, completion] }))
      return completion
    },
    redeem: (reward) => {
      const r: Redemption = { id: uid(), rewardId: reward.id, code: rewardCode(), cost: reward.cost, at: Date.now() }
      setState((s) => ({ ...s, redemptions: [...s.redemptions, r] }))
      return r
    },
    vote: (postId, v) =>
      setState((s) => {
        const votes = { ...s.votes }
        if (votes[postId] === v) delete votes[postId]
        else votes[postId] = v
        return { ...s, votes }
      }),
    reset: () => setState({ ...defaultState(), lang: state.lang }),
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
