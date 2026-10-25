import { useRef, useState } from 'react'
import { CATEGORY_META, DAILY_MULTIPLIER, RARITY_XP, type Quest } from '../data/quests'
import { schoolName, statsOf } from '../lib/game'
import { useT } from '../lib/i18n'
import { compressImage } from '../lib/media'
import { useStore, type Completion } from '../lib/store'
import { useShareCard } from '../lib/useShareCard'
import { Button, Confetti, RarityChip, Sheet } from './ui'

// Two steps: add a photo as proof, then celebrate + share.
export function ProofSheet({ quest, daily, onClose }: { quest: Quest | null; daily: boolean; onClose: () => void }) {
  const { state, completeQuest } = useStore()
  const { t, pick, lang, xp: fmtXp } = useT()
  const share = useShareCard()
  const fileRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<string>()
  const [caption, setCaption] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<Completion | null>(null)

  if (!quest || !state.profile) return null
  const meta = CATEGORY_META[quest.category]
  const xp = RARITY_XP[quest.rarity] * (daily ? DAILY_MULTIPLIER : 1)

  const onFile = async (file?: File) => {
    if (!file) return
    setBusy(true)
    try {
      setPhoto(await compressImage(file))
    } finally {
      setBusy(false)
    }
  }

  const submit = () => {
    if (!photo) return
    setDone(completeQuest(quest, daily, photo, caption))
  }

  if (done) {
    const stats = statsOf(state)
    return (
      <Sheet open onClose={onClose}>
        <Confetti />
        <div className="text-center">
          <div className="animate-pop text-7xl">{meta.emoji}</div>
          <h2 className="mt-3 text-3xl font-black text-lime">{t('questComplete')}</h2>
          <p className="mt-2 font-bold">{t('xpEarned', { xp: fmtXp(done.xp, true), school: schoolName(state.profile, lang) })}</p>
          {stats.streak > 0 && <p className="mt-1 text-gold">🔥 {t('streak', { n: stats.streak })}</p>}
          {done.photo && (
            <img src={done.photo} alt="" className="mx-auto mt-5 aspect-square w-full max-w-xs rounded-3xl object-cover" />
          )}
          <div className="mt-6 grid gap-2">
            <Button onClick={() => share(done)}>📤 {t('shareCard')}</Button>
            <Button variant="ghost" onClick={onClose}>
              {t('close')}
            </Button>
          </div>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet open onClose={onClose}>
      <div className="flex items-start gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: `${meta.color}26` }}>
          {meta.emoji}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl leading-tight font-extrabold">{pick(quest.title)}</h2>
          <div className="mt-1.5 flex items-center gap-2 text-sm text-muted">
            <RarityChip rarity={quest.rarity} />
            <span className="font-bold text-lime">{fmtXp(xp, true)}</span>
          </div>
        </div>
      </div>

      <h3 className="mt-6 text-lg font-bold">{t('proofTitle')}</h3>
      <p className="text-sm text-muted">{t('proofSub')}</p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="relative mt-3 grid aspect-square w-full place-items-center overflow-hidden rounded-3xl border-2 border-dashed border-line bg-surface-2 transition hover:border-lime"
      >
        {photo ? (
          <>
            <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute bottom-3 rounded-full bg-black/70 px-3 py-1 text-sm font-bold">🔄 {t('changePhoto')}</span>
          </>
        ) : (
          <span className="text-center">
            <span className="block text-5xl">{busy ? '⏳' : '📸'}</span>
            <span className="mt-2 block font-bold">{t('addPhoto')}</span>
          </span>
        )}
      </button>
      <p className="mt-2 text-xs text-muted">🔒 {t('privacyNote')}</p>

      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value.slice(0, 200))}
        placeholder={t('captionPlaceholder')}
        rows={2}
        className="mt-4 w-full resize-none rounded-2xl border border-line bg-surface-2 p-3 outline-none placeholder:text-muted focus:border-lime"
      />

      <Button className="mt-4 w-full text-lg" disabled={!photo || busy} onClick={submit}>
        {photo ? `✅ ${t('submit')}` : t('needPhoto')}
      </Button>
    </Sheet>
  )
}
