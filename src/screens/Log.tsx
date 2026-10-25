import { Frame, Glitch, Hud } from '../components/ui'
import { SEASONS } from '../data/seasons'
import { isLevelUnlocked, isSeasonComplete } from '../lib/game'
import { useT } from '../lib/i18n'
import { hash, rng } from '../lib/random'
import { useStore } from '../lib/store'
import { NEON } from '../lib/theme'

const NOISE = '█▓▒░#@%&$?!<>/\\|01'

// Looks like encrypted text; stable for each level so it doesn't flicker on re-render.
function scrambled(seed: string, length: number): string {
  const r = rng(hash(seed))
  return Array.from({ length }, (_, i) => (i % 9 === 8 ? ' ' : NOISE[Math.floor(r() * NOISE.length)])).join('')
}

export function Log() {
  const { state } = useStore()
  const { t, pick, pad } = useT()

  return (
    <div className="space-y-6">
      <Glitch text={t('logTitle')} className="font-display text-2xl font-black tracking-wider text-white text-glow" />
      {SEASONS.map((season) => (
        <section key={season.id} className="space-y-4">
          <Frame color={NEON.cyan}>
            <div className="p-4">
              <Hud color={NEON.cyan}>
                {t('season', { n: pad(season.number) })} // {t('briefing')}
              </Hud>
              <div className="mt-2 font-display text-xl font-bold tracking-wider text-white">{pick(season.title)}</div>
              <p className="mt-2 text-[17px] leading-snug text-[#c9e8ff]">{pick(season.premise)}</p>
            </div>
          </Frame>

          {season.levels.map((level) => {
            const open = isLevelUnlocked(state, season, level)
            return (
              <Frame key={level.id} color={open ? NEON.magenta : NEON.edge}>
                <div className="p-4">
                  <Hud color={open ? NEON.magenta : NEON.dim}>
                    {t('level', { n: pad(level.number) })} // {open ? pick(level.title) : '████'}
                  </Hud>
                  {open ? (
                    <p className="mt-3 font-mono text-[14px] leading-relaxed whitespace-pre-wrap text-[#c9e8ff]">{pick(level.transmission)}</p>
                  ) : (
                    <>
                      <p dir="ltr" className="mt-3 font-mono text-[13px] leading-relaxed break-all text-dim/50">
                        {scrambled(`${season.id}/${level.id}`, 140)}
                      </p>
                      <p className="mt-2 font-mono text-xs text-alert">🔒 {t('encrypted', { n: pad(level.number - 1) })}</p>
                    </>
                  )}
                </div>
              </Frame>
            )
          })}

          {isSeasonComplete(state, season) && (
            <Frame color={NEON.acid} glow>
              <div className="p-4">
                <Hud color={NEON.acid}>{t('ending')}</Hud>
                <p className="mt-3 font-mono leading-relaxed whitespace-pre-wrap text-acid">{pick(season.ending)}</p>
              </div>
            </Frame>
          )}
        </section>
      ))}
    </div>
  )
}
