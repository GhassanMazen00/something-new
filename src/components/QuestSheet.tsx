import { useState, type FormEvent } from 'react'
import { CONFIG, PROOF_DOMAINS, SOCIAL_URL } from '../config'
import type { Level, Quest, Season } from '../data/types'
import { resultOf, runnerTag, type QuestResult } from '../lib/game'
import { useT } from '../lib/i18n'
import { copyText, makeShareCard, shareImage } from '../lib/share'
import { questKey, useStore } from '../lib/store'
import { KIND_COLOR, NEON } from '../lib/theme'
import { toast } from '../lib/toast'
import { checkAnswer } from '../lib/verify'
import { Terminal } from './Terminal'
import { Button, CloseButton, Frame, Glitch, Hud, Overlay, Tag } from './ui'

export function QuestSheet({
  season,
  level,
  quest,
  onClose,
  initialResult,
}: {
  season: Season
  level: Level
  quest: Quest
  onClose: () => void
  initialResult?: QuestResult
}) {
  const { state, completeQuest } = useStore()
  const { t, pick, xp, pad } = useT()
  const key = questKey(season, quest)
  const record = state.quests[key]
  const done = record?.status === 'done'
  const color = KIND_COLOR[quest.kind]
  const [result, setResult] = useState<QuestResult | null>(initialResult ?? null)

  const finish = () => {
    const rec = completeQuest(season, quest)
    const after = { ...state, quests: { ...state.quests, [key]: rec } }
    setResult(resultOf(state, after, season, level, rec.xp))
  }

  if (result) return <Granted season={season} level={level} quest={quest} result={result} onClose={onClose} />

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between">
        <CloseButton onClick={onClose} />
        <Hud>
          {t('level', { n: pad(level.number) })}
        </Hud>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Tag color={color}>{t(`kind_${quest.kind}`)}</Tag>
        {quest.optional && <Tag color={NEON.dim}>{t('optional')}</Tag>}
        {done && <Tag color={NEON.matrix} solid>✓ {t('done')}</Tag>}
      </div>
      <Glitch text={pick(quest.title)} className="mt-3 font-display text-3xl font-black tracking-wide" style={{ color }} />
      <p className="mt-3 text-lg leading-snug text-[#c9e8ff]">{pick(quest.brief)}</p>

      <div className="mt-4 flex items-center gap-4 font-mono text-sm">
        <span className="text-cyan">{t('reward')}: {xp(quest.xp, true)}</span>
        {quest.fragment && (
          <span className="text-acid">
            {t('fragment')}: [{done ? quest.fragment : '?'}]
          </span>
        )}
      </div>

      <div className="mt-6">
        {quest.kind === 'terminal' && quest.terminal && state.runner && (
          <Terminal
            spec={quest.terminal}
            seasonId={season.id}
            questId={quest.id}
            answers={quest.answers ?? []}
            runner={state.runner}
            done={done}
            onSuccess={finish}
          />
        )}
        {quest.kind === 'puzzle' && <PuzzleBody season={season} quest={quest} done={done} onSolved={finish} />}
        {quest.kind === 'social-find' && <SocialFindBody season={season} quest={quest} done={done} onSolved={finish} />}
        {quest.kind === 'real' && <RealBody season={season} quest={quest} done={done} onSolved={finish} />}
        {quest.kind === 'social-post' && <SocialPostBody season={season} quest={quest} />}
      </div>
    </Overlay>
  )
}

function AnswerForm({
  season,
  quest,
  placeholder,
  onSolved,
}: {
  season: Season
  quest: Quest
  placeholder: string
  onSolved: () => void
}) {
  const { t } = useT()
  const [value, setValue] = useState('')
  const [denied, setDenied] = useState(0)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (checkAnswer(season.id, quest.id, value, quest.answers ?? [])) onSolved()
    else setDenied((n) => n + 1)
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div key={denied} className={denied ? 'animate-shake' : ''}>
        <Frame color={denied ? NEON.alert : NEON.cyan}>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, 40))}
            placeholder={placeholder}
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            dir="auto"
            className="w-full bg-transparent px-4 py-4 text-center font-mono text-2xl tracking-[0.2em] text-white uppercase outline-none placeholder:text-dim/60"
          />
        </Frame>
      </div>
      {denied > 0 && <div className="text-center font-display text-sm font-bold tracking-[0.3em] text-alert text-glow">✕ {t('denied')}</div>}
      <Button full type="submit" disabled={!value.trim()}>
        {t('transmit')}
      </Button>
    </form>
  )
}

function DoneNote() {
  const { t } = useT()
  return (
    <Frame color={NEON.matrix}>
      <div className="p-4 text-center font-display font-bold tracking-[0.3em] text-matrix text-glow">✓ {t('granted')}</div>
    </Frame>
  )
}

function PuzzleBody({ season, quest, done, onSolved }: { season: Season; quest: Quest; done: boolean; onSolved: () => void }) {
  const { state, revealHint } = useStore()
  const { t, pick } = useT()
  const hintShown = state.hints[questKey(season, quest)]
  return (
    <div className="space-y-4">
      {quest.content && (
        <Frame color={NEON.cyan} glow>
          <pre dir="auto" className="p-5 text-center font-mono text-xl leading-relaxed whitespace-pre-wrap text-cyan text-glow">
            {pick(quest.content)}
          </pre>
        </Frame>
      )}
      {quest.hint &&
        (hintShown ? (
          <div className="chamfer-sm bg-acid/10 p-3 text-acid">
            <span className="font-mono text-xs tracking-widest">{t('hint')} // </span>
            {pick(quest.hint)}
          </div>
        ) : (
          !done && (
            <button onClick={() => revealHint(season, quest)} className="font-mono text-xs tracking-widest text-acid/80 underline-offset-4 hover:underline">
              ◇ {t('hintButton')}
            </button>
          )
        ))}
      {done ? <DoneNote /> : <AnswerForm season={season} quest={quest} placeholder={t('enterAnswer')} onSolved={onSolved} />}
    </div>
  )
}

function SocialFindBody({ season, quest, done, onSolved }: { season: Season; quest: Quest; done: boolean; onSolved: () => void }) {
  const { t } = useT()
  const platform = quest.platform ?? 'instagram'
  const handle = CONFIG[platform]
  const label = platform === 'instagram' ? 'Instagram' : 'TikTok'
  return (
    <div className="space-y-4">
      {handle ? (
        <a href={SOCIAL_URL[platform](handle)} target="_blank" rel="noreferrer" className="block">
          <Frame color={NEON.magenta} glow>
            <div className="flex items-center justify-between p-4 font-display text-sm font-bold tracking-[0.15em] text-magenta">
              <span>{t('openPlatform', { platform: label.toUpperCase() })}</span>
              <span dir="ltr">@{handle} ↗</span>
            </div>
          </Frame>
        </a>
      ) : (
        <div className="chamfer-sm bg-magenta/10 p-3 font-mono text-xs text-magenta">⚠ {t('accountNotSet')}</div>
      )}
      {done ? <DoneNote /> : <AnswerForm season={season} quest={quest} placeholder={t('enterCode')} onSolved={onSolved} />}
    </div>
  )
}

function RealBody({ season, quest, done, onSolved }: { season: Season; quest: Quest; done: boolean; onSolved: () => void }) {
  const { t } = useT()
  return (
    <div className="space-y-4">
      <div className="chamfer-sm flex gap-3 bg-acid/10 p-3 text-acid">
        <span className="font-display text-xl">◎</span>
        <span className="text-[15px] leading-snug">{t('qrTip')}</span>
      </div>
      {done ? <DoneNote /> : <AnswerForm season={season} quest={quest} placeholder="XXXX-XXXX" onSolved={onSolved} />}
    </div>
  )
}


function SocialPostBody({ season, quest }: { season: Season; quest: Quest }) {
  const { state, submitProof } = useStore()
  const { t } = useT()
  const record = state.quests[questKey(season, quest)]
  const [url, setUrl] = useState('')
  const [error, setError] = useState(false)
  const tag = runnerTag(state.runner?.id ?? '')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    try {
      const parsed = new URL(url.trim())
      const ok = parsed.protocol === 'https:' && PROOF_DOMAINS.some((d) => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`))
      if (!ok) throw new Error('bad domain')
      submitProof(season, quest, parsed.toString())
    } catch {
      setError(true)
    }
  }

  if (record?.status === 'done') return <DoneNote />
  if (record?.status === 'pending') {
    return (
      <Frame color={NEON.magenta}>
        <div className="space-y-2 p-4">
          <div className="font-display font-bold tracking-[0.25em] text-magenta">◷ {t('proofReceived')}</div>
          <p className="text-[#c9e8ff]">{t('proofQueued')}</p>
          <p dir="ltr" className="truncate font-mono text-xs text-dim">{record.proofUrl}</p>
        </div>
      </Frame>
    )
  }

  return (
    <div className="space-y-4">
      <Frame color={NEON.magenta} glow>
        <div className="flex items-center justify-between gap-3 p-4">
          <div>
            <div className="font-mono text-xs tracking-widest text-dim">{t('yourTag')}</div>
            <div dir="ltr" className="font-display text-2xl font-black text-magenta text-glow">{tag}</div>
          </div>
          <Button
            variant="ghost"
            onClick={async () => {
              if (await copyText(`#${CONFIG.hashtag} ${tag}`)) toast(t('copied'))
            }}
          >
            {t('copy')}
          </Button>
        </div>
      </Frame>
      <p className="font-mono text-sm leading-relaxed whitespace-pre-line text-[#c9e8ff]">{t('postSteps', { hashtag: CONFIG.hashtag })}</p>
      <form onSubmit={submit} className="space-y-3">
        <Frame color={error ? NEON.alert : NEON.edge}>
          <input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError(false)
            }}
            placeholder="https://www.instagram.com/p/…"
            inputMode="url"
            dir="ltr"
            className="w-full bg-transparent px-4 py-3.5 font-mono text-sm text-white outline-none placeholder:text-dim/60"
          />
        </Frame>
        {error && <p className="text-sm text-alert">{t('badUrl')}</p>}
        <Button full type="submit" variant="cyan" disabled={!url.trim()}>
          {t('transmit')}
        </Button>
      </form>
    </div>
  )
}

export function Granted({
  season,
  level,
  quest,
  result,
  onClose,
}: {
  season: Season
  level: Level
  quest: Quest
  result: QuestResult
  onClose: () => void
}) {
  const { state } = useStore()
  const { t, pick, xp, pad, lang } = useT()

  const share = async () => {
    const blob = await makeShareCard({
      lang,
      season: `${t('season', { n: pad(season.number) })} // ${pick(season.title)}`,
      heading: t('granted'),
      quest: pick(quest.title),
      level: `${t('level', { n: pad(level.number) })} // ${pick(level.title)}`,
      fragment: quest.fragment,
      fragmentLabel: quest.fragment ? t('fragmentRecovered') : t('seasonCleared'),
      xp: `+${result.xp} XP`,
      callsign: state.runner?.callsign ?? '',
      runnerId: state.runner?.id ?? '',
      footer: 'JOIN THE SIGNAL',
    })
    const outcome = await shareImage(blob, `irl-${quest.id}.png`, t('shareText', { quest: pick(quest.title), season: pick(season.title) }))
    if (outcome === 'saved') toast(t('saved'))
  }

  return (
    <Overlay onClose={onClose}>
      <div className="flex min-h-[85dvh] flex-col items-center justify-center text-center">
        <Hud color={NEON.matrix}>{pick(quest.title)}</Hud>
        <Glitch text={t('granted')} className="mt-4 animate-boot font-display text-4xl font-black tracking-wider text-matrix text-glow" />
        <div className="mt-4 font-display text-3xl font-bold text-cyan text-glow">{xp(result.xp, true)}</div>

        {quest.fragment && (
          <div className="mt-8 flex flex-col items-center">
            <div style={{ filter: `drop-shadow(0 0 22px ${NEON.acid}88)` }}>
              <div className="chamfer grid h-36 w-36 animate-boot place-items-center bg-acid p-[3px]">
                <div className="chamfer grid h-full w-full place-items-center bg-panel font-display text-7xl font-black text-acid text-glow">
                  {quest.fragment}
                </div>
              </div>
            </div>
            <div className="mt-3 font-mono text-sm tracking-[0.3em] text-acid">{t('fragmentRecovered')}</div>
          </div>
        )}

        {result.levelUnlocked && (
          <div className="mt-8 w-full">
            <Frame color={NEON.cyan} glow>
              <div className="p-4 font-display font-bold tracking-[0.2em] text-cyan">▲ {t('levelUnlocked', { n: pad(result.levelUnlocked) })}</div>
            </Frame>
          </div>
        )}

        {result.seasonDone && (
          <div className="mt-8 w-full">
            <Frame color={NEON.magenta} glow>
              <div className="p-5">
                <div className="font-display text-xl font-black tracking-[0.2em] text-magenta text-glow">
                  ✦ {t('seasonDone', { n: pad(season.number) })}
                </div>
                <p className="mt-3 font-mono leading-relaxed whitespace-pre-line text-[#c9e8ff]">{pick(season.ending)}</p>
              </div>
            </Frame>
          </div>
        )}

        <div className="mt-10 grid w-full gap-3">
          <Button full onClick={share}>
            ⇪ {t('share')}
          </Button>
          <Button full variant="ghost" onClick={onClose}>
            {t('continue')}
          </Button>
        </div>
      </div>
    </Overlay>
  )
}
