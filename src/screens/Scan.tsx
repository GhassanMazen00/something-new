import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button, Frame, Glitch, Hud } from '../components/ui'
import { findQuestByCode, resultOf, type QuestResult } from '../lib/game'
import { useT } from '../lib/i18n'
import { questKey, useStore } from '../lib/store'
import { NEON } from '../lib/theme'
import type { Level, Quest, Season } from '../data/types'

type Outcome = { type: 'invalid' } | { type: 'already' } | { type: 'locked'; level: number }

// One place to type any code found in the real world or on social media.
// QR codes on printed items open the app with #claim=CODE, which lands here automatically.
export function Scan({
  initialCode,
  onSolved,
}: {
  initialCode: string | null
  onSolved: (season: Season, level: Level, quest: Quest, result: QuestResult) => void
}) {
  const { state, completeQuest } = useStore()
  const { t, pad } = useT()
  const [code, setCode] = useState(initialCode ?? '')
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const autoRan = useRef(false)

  const check = (value: string) => {
    const match = findQuestByCode(state, value)
    if (!match) return setOutcome({ type: 'invalid' })
    if (match.done) return setOutcome({ type: 'already' })
    if (!match.unlocked) return setOutcome({ type: 'locked', level: match.level.number - 1 })
    const rec = completeQuest(match.season, match.quest)
    const after = { ...state, quests: { ...state.quests, [questKey(match.season, match.quest)]: rec } }
    onSolved(match.season, match.level, match.quest, resultOf(state, after, match.season, match.level, rec.xp))
  }

  useEffect(() => {
    if (initialCode && !autoRan.current) {
      autoRan.current = true
      check(initialCode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (code.trim()) check(code)
  }

  const message =
    outcome?.type === 'invalid'
      ? { text: `✕ ${t('scanInvalid')}`, color: NEON.alert }
      : outcome?.type === 'already'
        ? { text: `✓ ${t('scanAlready')}`, color: NEON.matrix }
        : outcome?.type === 'locked'
          ? { text: `🔒 ${t('scanLocked', { n: pad(outcome.level) })}`, color: NEON.acid }
          : null

  return (
    <div className="space-y-6">
      <div>
        <Hud color={NEON.acid}>◎ {t('scanTitle')}</Hud>
        <Glitch text={t('enterCode')} className="mt-2 font-display text-3xl font-black tracking-wider text-white text-glow" />
        <p className="mt-2 text-lg text-[#c9e8ff]">{t('scanSub')}</p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div key={JSON.stringify(outcome)} className={outcome?.type === 'invalid' ? 'animate-shake' : ''}>
          <Frame color={message?.color ?? NEON.acid} glow>
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.slice(0, 40))
                setOutcome(null)
              }}
              placeholder="XXXX-XXXX"
              autoCapitalize="characters"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              dir="ltr"
              className="w-full bg-transparent px-4 py-6 text-center font-mono text-3xl tracking-[0.2em] text-white uppercase outline-none placeholder:text-dim/40"
            />
          </Frame>
        </div>
        {message && (
          <p className="text-center font-mono text-sm" style={{ color: message.color }}>
            {message.text}
          </p>
        )}
        <Button full type="submit" disabled={!code.trim()}>
          {t('transmit')}
        </Button>
      </form>

      <div className="chamfer-sm flex gap-3 bg-panel-2 p-4 text-dim">
        <span className="font-display text-2xl text-acid">⌗</span>
        <span className="leading-snug">{t('qrTip')}</span>
      </div>
    </div>
  )
}
