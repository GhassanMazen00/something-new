import { lazy, Suspense, useEffect, useState } from 'react'
import { Granted, QuestSheet } from './components/QuestSheet'
import { Toaster } from './components/ui'
import type { Level, Quest, Season } from './data/types'
import type { QuestResult } from './lib/game'
import { useT, type TKey } from './lib/i18n'
import { useStore } from './lib/store'
import { StoreProvider } from './lib/StoreProvider'
import { Boot } from './screens/Boot'
import { Id } from './screens/Id'
import { LevelView } from './screens/LevelView'
import { Log } from './screens/Log'
import { Loot } from './screens/Loot'
import { Ops } from './screens/Ops'
import { Scan } from './screens/Scan'

const GameMaster = lazy(() => import('./screens/GameMaster'))

type Tab = 'ops' | 'log' | 'scan' | 'loot' | 'id'

const TABS: { id: Tab; glyph: string; label: TKey }[] = [
  { id: 'ops', glyph: '◈', label: 'tabOps' },
  { id: 'log', glyph: '≡', label: 'tabLog' },
  { id: 'scan', glyph: '◎', label: 'tabScan' },
  { id: 'loot', glyph: '⬢', label: 'tabLoot' },
  { id: 'id', glyph: '◉', label: 'tabId' },
]

// Links: #gm opens the Game Master console, #claim=CODE comes from a printed QR.
function readHash() {
  const h = window.location.hash.slice(1)
  if (h === 'gm') return { gm: true, claim: null }
  const claim = new URLSearchParams(h).get('claim')
  return { gm: false, claim: claim ? claim.slice(0, 40) : null }
}

interface Open {
  season: Season
  level: Level
  quest: Quest
  result?: QuestResult
}

function Shell() {
  const { state } = useStore()
  const { t } = useT()
  const [route, setRoute] = useState(readHash)
  const [tab, setTab] = useState<Tab>(route.claim ? 'scan' : 'ops')
  const [level, setLevel] = useState<{ season: Season; level: Level } | null>(null)
  const [open, setOpen] = useState<Open | null>(null)

  useEffect(() => {
    const onHash = () => {
      const next = readHash()
      setRoute(next)
      if (next.claim) setTab('scan')
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [tab, level])

  if (route.gm) {
    return (
      <Suspense fallback={null}>
        <GameMaster />
      </Suspense>
    )
  }

  if (!state.runner) return <Boot pendingCode={route.claim} />

  const clearClaim = () => {
    if (route.claim) {
      window.history.replaceState(null, '', window.location.pathname)
      setRoute({ gm: false, claim: null })
    }
  }

  const goTab = (next: Tab) => {
    setTab(next)
    setLevel(null)
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 pt-5 pb-32">
      {tab === 'ops' &&
        (level ? (
          <LevelView
            season={level.season}
            level={level.level}
            onBack={() => setLevel(null)}
            onOpenQuest={(quest) => setOpen({ ...level, quest })}
          />
        ) : (
          <Ops onOpenLevel={(season, l) => setLevel({ season, level: l })} />
        ))}
      {tab === 'log' && <Log />}
      {tab === 'scan' && (
        <Scan
          key={route.claim ?? 'scan'}
          initialCode={route.claim}
          onSolved={(season, l, quest, result) => {
            clearClaim()
            setOpen({ season, level: l, quest, result })
          }}
        />
      )}
      {tab === 'loot' && <Loot />}
      {tab === 'id' && <Id />}

      {open &&
        (open.result ? (
          <Granted season={open.season} level={open.level} quest={open.quest} result={open.result} onClose={() => setOpen(null)} />
        ) : (
          <QuestSheet season={open.season} level={open.level} quest={open.quest} onClose={() => setOpen(null)} />
        ))}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan/20 bg-void/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
        <div className="mx-auto flex max-w-md items-end">
          {TABS.map((item) => {
            const active = tab === item.id
            if (item.id === 'scan') {
              return (
                <button key={item.id} onClick={() => goTab('scan')} className="flex flex-1 flex-col items-center pb-2">
                  <span style={{ filter: `drop-shadow(0 0 12px #f5f00088)` }} className="-mt-6">
                    <span className="chamfer grid h-14 w-14 place-items-center bg-acid font-display text-2xl text-void">{item.glyph}</span>
                  </span>
                  <span className={`mt-1 font-mono text-[10px] tracking-widest ${active ? 'text-acid' : 'text-dim'}`}>{t(item.label)}</span>
                </button>
              )
            }
            return (
              <button
                key={item.id}
                onClick={() => goTab(item.id)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-3 transition ${active ? 'text-cyan' : 'text-dim'}`}
              >
                <span className={`font-display text-xl leading-none ${active ? 'text-glow' : ''}`}>{item.glyph}</span>
                <span className="font-mono text-[10px] tracking-widest">{t(item.label)}</span>
              </button>
            )
          })}
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
