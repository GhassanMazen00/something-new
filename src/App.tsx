import { useEffect, useState } from 'react'
import { Toaster } from './components/ui'
import type { TKey } from './lib/i18n'
import { useT } from './lib/i18n'
import { useStore } from './lib/store'
import { StoreProvider } from './lib/StoreProvider'
import { Feed } from './screens/Feed'
import { League } from './screens/League'
import { Onboarding } from './screens/Onboarding'
import { Profile } from './screens/Profile'
import { Rewards } from './screens/Rewards'
import { Today } from './screens/Today'

type Tab = 'today' | 'feed' | 'league' | 'rewards' | 'me'

const TABS: { id: Tab; emoji: string; label: TKey }[] = [
  { id: 'today', emoji: '⚡', label: 'tabToday' },
  { id: 'feed', emoji: '📸', label: 'tabFeed' },
  { id: 'league', emoji: '🏆', label: 'tabLeague' },
  { id: 'rewards', emoji: '🎁', label: 'tabRewards' },
  { id: 'me', emoji: '👤', label: 'tabMe' },
]

const SCREENS: Record<Tab, () => React.JSX.Element> = {
  today: Today,
  feed: Feed,
  league: League,
  rewards: Rewards,
  me: Profile,
}

function Shell() {
  const { state } = useStore()
  const { t } = useT()
  const [tab, setTab] = useState<Tab>('today')

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [tab])

  if (!state.profile) return <Onboarding />

  const Screen = SCREENS[tab]
  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 pt-5 pb-28">
      <Screen />
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
        <div className="mx-auto flex max-w-md">
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition ${
                tab === item.id ? 'text-lime' : 'text-muted'
              }`}
            >
              <span className={`text-xl transition ${tab === item.id ? 'scale-110' : 'opacity-70 grayscale'}`}>{item.emoji}</span>
              {t(item.label)}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
      <Toaster />
    </StoreProvider>
  )
}
