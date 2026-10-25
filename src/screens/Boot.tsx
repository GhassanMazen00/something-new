import { useEffect, useState } from 'react'
import { Button, Frame, Glitch, Hud, Identicon, LangToggle } from '../components/ui'
import { SEASONS } from '../data/seasons'
import { useT } from '../lib/i18n'
import { useStore } from '../lib/store'
import { NEON } from '../lib/theme'
import { randomCode } from '../lib/verify'

const BOOT_LINES = [
  '> IRL://BOOT',
  '> loading ghost_shell ........... OK',
  '> scanning frequencies .......... OK',
  '> decrypting noise .............. OK',
  '> !! UNKNOWN SIGNAL INTERCEPTED',
  '> origin: ZERO',
]

export function Boot({ pendingCode }: { pendingCode: string | null }) {
  const { createRunner } = useStore()
  const { t, pick, pad } = useT()
  const season = SEASONS[0]
  const [lineCount, setLineCount] = useState(0)
  const [step, setStep] = useState<'intro' | 'callsign'>('intro')
  const [callsign, setCallsign] = useState('')
  const [runnerId] = useState(() => `R-${randomCode('', 1, 6)}`)
  const booted = lineCount >= BOOT_LINES.length

  useEffect(() => {
    if (booted) return
    const id = setTimeout(() => setLineCount((n) => n + 1), lineCount === 0 ? 300 : 260)
    return () => clearTimeout(id)
  }, [lineCount, booted])

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-5 pb-10">
      <div className="flex items-center justify-between">
        {step === 'callsign' ? (
          <button onClick={() => setStep('intro')} className="font-mono text-xs tracking-widest text-dim">
            ◂ {t('back')}
          </button>
        ) : (
          <span className="font-mono text-xs text-dim">v0.2 // {runnerId}</span>
        )}
        <LangToggle />
      </div>

      {step === 'intro' && (
        <>
          <div dir="ltr" className="mt-6 min-h-40 font-mono text-[13px] leading-relaxed">
            {BOOT_LINES.slice(0, lineCount).map((line) => (
              <div key={line} className={line.includes('!!') || line.includes('ZERO') ? 'text-magenta' : 'text-matrix/80'}>
                {line}
              </div>
            ))}
            {!booted && <span className="animate-blink text-matrix">█</span>}
          </div>

          {booted && (
            <div className="flex flex-1 animate-rise flex-col">
              {pendingCode && (
                <div className="chamfer-sm mb-5 bg-acid/15 p-3 font-mono text-sm text-acid">◎ {t('codeWaiting')}</div>
              )}
              <Glitch
                text="IRL"
                className="font-display text-[110px] leading-none font-black text-acid text-glow"
                style={{ letterSpacing: '0.04em' }}
              />
              <Glitch
                as="h2"
                text={`${t('season', { n: pad(season.number) })} // ${pick(season.title)}`}
                className="mt-3 font-display text-lg font-bold tracking-[0.2em] text-cyan text-glow"
              />
              <p className="mt-2 font-mono text-sm text-dim">{pick(season.tagline)}</p>
              <div className="mt-6">
                <Frame color={NEON.magenta}>
                  <p className="p-4 text-lg leading-snug text-[#c9e8ff]">{pick(season.premise)}</p>
                </Frame>
              </div>
              <div className="flex-1" />
              <div className="mt-8">
                <Button full onClick={() => setStep('callsign')}>
                  {t('acceptTransmission')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {step === 'callsign' && (
        <form
          className="mt-10 flex flex-1 animate-rise flex-col"
          onSubmit={(e) => {
            e.preventDefault()
            if (callsign.trim()) createRunner(callsign.trim(), runnerId)
          }}
        >
          <Hud color={NEON.cyan}>{t('chooseCallsign')}</Hud>
          <p className="mt-3 text-lg text-[#c9e8ff]">{t('callsignHint')}</p>
          <div className="mt-6">
            <Frame color={NEON.cyan} glow>
              <input
                autoFocus
                value={callsign}
                onChange={(e) => setCallsign(e.target.value.toUpperCase().replace(/[^\p{L}\p{N}_]/gu, '').slice(0, 16))}
                placeholder="NEON_FOX"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-transparent px-4 py-4 font-display text-2xl font-bold tracking-[0.15em] text-white outline-none placeholder:text-dim/40"
              />
            </Frame>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <Identicon seed={runnerId} size={88} />
            <div className="font-mono text-sm">
              <div className="text-dim">{t('runnerId')}</div>
              <div dir="ltr" className="text-xl text-cyan text-glow">{runnerId}</div>
              <div className="mt-1 font-display text-lg font-bold text-white">{callsign || '—'}</div>
            </div>
          </div>
          <div className="flex-1" />
          <div className="mt-8">
            <Button full type="submit" disabled={!callsign.trim()}>
              {t('jackIn')} ▸
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
