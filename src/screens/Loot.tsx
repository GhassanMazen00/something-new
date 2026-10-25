import { Fragment, useState } from 'react'
import { Button, CloseButton, Frame, Glitch, Hud, Overlay, Tag } from '../components/ui'
import { SEASONS } from '../data/seasons'
import type { LootItem } from '../data/types'
import { fragmentsOf, isLootUnlocked, lootFor } from '../lib/game'
import { useT } from '../lib/i18n'
import { useStore } from '../lib/store'
import { NEON } from '../lib/theme'

export function Loot() {
  const { state, claimLoot } = useStore()
  const { t, pick, pad } = useT()
  const [shown, setShown] = useState<LootItem | null>(null)

  return (
    <div className="space-y-6">
      <Glitch text={t('tabLoot')} className="font-display text-3xl font-black tracking-wider text-white text-glow" />

      {SEASONS.map((season) => {
        const fragments = fragmentsOf(state, season)
        const words = season.finalPhrase.split(' ')
        let cursor = 0
        return (
          <section key={season.id} className="space-y-6">
            <Frame color={NEON.acid} glow>
              <div className="p-4">
                <Hud color={NEON.acid}>
                  {t('season', { n: pad(season.number) })} // {t('fragmentsTitle')} {fragments.filter((f) => f.got).length}/{fragments.length}
                </Hud>
                <p className="mt-2 text-[#c9e8ff]">{t('fragmentsSub')}</p>
                <div dir="ltr" className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
                  {words.map((word, wi) => (
                    <div key={wi} className="flex gap-1">
                      {[...word].map((_, li) => {
                        const f = fragments[cursor++]
                        return (
                          <Fragment key={li}>
                            {f?.got ? (
                              <span className="chamfer-sm grid h-10 w-8 place-items-center bg-acid font-display text-lg font-black text-void">
                                {f.letter}
                              </span>
                            ) : (
                              <span className="chamfer-sm grid h-10 w-8 place-items-center border border-dashed border-acid/40 font-display text-lg text-acid/40">
                                ?
                              </span>
                            )}
                          </Fragment>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </Frame>

            <div className="space-y-3">
              <Hud>{t('realLoot')}</Hud>
              {lootFor(season).map((item) => {
                const unlocked = isLootUnlocked(state, item)
                const claim = state.claims[item.id]
                const level = season.levels.find((l) => l.id === item.levelId)
                const color = claim ? NEON.matrix : unlocked ? NEON.cyan : NEON.edge
                return (
                  <Frame key={item.id} color={color} glow={unlocked && !claim}>
                    <div className={`flex items-center gap-4 p-4 ${unlocked ? '' : 'opacity-55'}`}>
                      <div
                        className="chamfer-sm grid h-14 w-14 shrink-0 place-items-center font-display text-3xl"
                        style={{ background: `${color}1a`, color: unlocked ? color : NEON.dim }}
                      >
                        {item.glyph}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Tag color={item.kind === 'item' ? NEON.acid : NEON.magenta}>{t(`kind_${item.kind}`)}</Tag>
                        <div className="mt-1 font-display text-[15px] font-bold tracking-wide text-white">{pick(item.title)}</div>
                        <div className="text-sm leading-snug text-dim">{pick(item.desc)}</div>
                        {!unlocked && (
                          <div className="mt-1.5 font-mono text-[11px] text-dim">
                            🔒 {level ? t('unlockLevel', { n: pad(level.number) }) : t('unlockSeason')}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0">
                        {claim ? (
                          <Button variant="ghost" className="text-xs" onClick={() => setShown(item)}>
                            ✓ {t('claimed')}
                          </Button>
                        ) : (
                          unlocked && (
                            <Button
                              variant="cyan"
                              onClick={() => {
                                claimLoot(item)
                                setShown(item)
                              }}
                            >
                              {t('claim')}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  </Frame>
                )
              })}
            </div>
          </section>
        )
      })}

      {shown && state.claims[shown.id] && (
        <Overlay onClose={() => setShown(null)}>
          <CloseButton onClick={() => setShown(null)} />
          <div className="mt-16 text-center">
            <div className="font-display text-7xl text-cyan text-glow">{shown.glyph}</div>
            <div className="mt-4 font-display text-2xl font-black tracking-wider text-white">{pick(shown.title)}</div>
            <Hud color={NEON.acid} className="mt-8">
              {t('claimTitle')}
            </Hud>
            <div className="mt-3" style={{ filter: `drop-shadow(0 0 16px ${NEON.acid}66)` }}>
              <div dir="ltr" className="chamfer bg-acid px-4 py-6 font-mono text-4xl tracking-[0.15em] text-void">
                {state.claims[shown.id].code}
              </div>
            </div>
            <div dir="ltr" className="mt-4 font-mono text-cyan">
              {state.runner?.callsign} // {state.runner?.id}
            </div>
            <p className="mt-6 text-lg leading-snug text-[#c9e8ff]">{t('claimBody')}</p>
          </div>
        </Overlay>
      )}
    </div>
  )
}
