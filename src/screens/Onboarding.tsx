import { useMemo, useState } from 'react'
import { CUSTOM_PREFIX, SCHOOLS, schoolById } from '../data/schools'
import { useT } from '../lib/i18n'
import { useStore } from '../lib/store'
import { Button, LangToggle } from '../components/ui'

const AVATARS = ['😎', '🦊', '🐯', '🐼', '🦁', '🐸', '👽', '🤖', '🦄', '🐙', '🔥', '⚡']

// Invite links look like ?school=cu (or ?school=custom:x&name=My+School)
function readInvite(): { schoolId: string; schoolName?: string } | null {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('school')
  if (!id) return null
  if (id.startsWith(CUSTOM_PREFIX)) {
    const name = params.get('name')
    return name ? { schoolId: id, schoolName: name.slice(0, 60) } : null
  }
  return schoolById(id) ? { schoolId: id } : null
}

export function Onboarding() {
  const { createProfile } = useStore()
  const { t, lang } = useT()
  const [invite] = useState(readInvite)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [query, setQuery] = useState('')
  const [school, setSchool] = useState<{ schoolId: string; schoolName?: string } | null>(invite)

  const invitedName = invite
    ? invite.schoolName ?? schoolById(invite.schoolId)?.name[lang]
    : undefined

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SCHOOLS
    return SCHOOLS.filter((s) => s.name.en.toLowerCase().includes(q) || s.name.ar.includes(q))
  }, [query])

  const finish = () => {
    if (!school) return
    const cleanHandle = handle.trim() || `player${Math.floor(1000 + Math.random() * 9000)}`
    createProfile({ name: name.trim(), handle: cleanHandle, avatar, ...school })
    window.history.replaceState(null, '', window.location.pathname)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-5 pb-8">
      <div className="flex items-center justify-between">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="text-sm font-bold text-muted">
            {lang === 'ar' ? '→' : '←'} {t('back')}
          </button>
        ) : (
          <span />
        )}
        <LangToggle />
      </div>

      {step === 0 && (
        <div className="flex flex-1 flex-col justify-center">
          {invitedName && (
            <div className="mb-6 animate-rise rounded-2xl border border-lime/40 bg-lime/10 p-4 font-bold text-lime">
              {t('invited', { school: invitedName })}
            </div>
          )}
          <h1 className="animate-pop bg-gradient-to-br from-lime via-sky to-violet bg-clip-text text-[120px] leading-none font-black text-transparent">
            IRL
          </h1>
          <p className="mt-4 text-4xl leading-tight font-black">{t('tagline')}</p>
          <p className="mt-4 text-lg text-white/70">{t('heroSub')}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-sm font-bold">
            <span className="rounded-full bg-surface px-3 py-1.5">⚡ {t('todaysQuest')}</span>
            <span className="rounded-full bg-surface px-3 py-1.5">🏆 {t('heroLeague')}</span>
            <span className="rounded-full bg-surface px-3 py-1.5">🎁 {t('tabRewards')}</span>
          </div>
          <Button className="mt-10 w-full text-lg" onClick={() => setStep(1)}>
            {t('getStarted')} →
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="mt-8 flex flex-1 animate-rise flex-col">
          <h2 className="text-3xl font-black">{t('whatsYourName')}</h2>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 30))}
            placeholder={t('namePlaceholder')}
            className="mt-6 w-full rounded-2xl border border-line bg-surface p-4 text-lg outline-none focus:border-lime"
          />
          <div className="mt-3 flex items-center rounded-2xl border border-line bg-surface ps-4 focus-within:border-lime" dir="ltr">
            <span className="text-muted">@</span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 20))}
              placeholder={t('handlePlaceholder')}
              className="w-full bg-transparent p-4 ps-1 text-lg outline-none"
            />
          </div>

          <h3 className="mt-8 font-bold">{t('pickAvatar')}</h3>
          <div className="mt-3 grid grid-cols-6 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`aspect-square rounded-2xl text-3xl transition ${
                  avatar === a ? 'scale-105 bg-lime/20 ring-2 ring-lime' : 'bg-surface'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          <div className="flex-1" />
          <Button className="mt-8 w-full text-lg" disabled={!name.trim()} onClick={() => setStep(2)}>
            {t('next')} →
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-8 flex flex-1 animate-rise flex-col">
          <h2 className="text-3xl font-black">{t('pickSchool')}</h2>
          <p className="mt-2 text-white/70">{t('pickSchoolSub')}</p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 60))}
            placeholder={`🔍 ${t('searchSchool')}`}
            className="mt-5 w-full rounded-2xl border border-line bg-surface p-4 outline-none focus:border-lime"
          />
          <div className="mt-3 grid max-h-[44dvh] gap-2 overflow-y-auto pe-1">
            {school?.schoolName && (
              <SchoolOption label={school.schoolName} selected onClick={() => {}} />
            )}
            {results.map((s) => (
              <SchoolOption
                key={s.id}
                label={s.name[lang]}
                selected={school?.schoolId === s.id}
                onClick={() => setSchool({ schoolId: s.id })}
              />
            ))}
            {query.trim().length > 2 && !results.some((s) => s.name[lang].toLowerCase() === query.trim().toLowerCase()) && (
              <button
                onClick={() => {
                  const label = query.trim()
                  setSchool({ schoolId: `${CUSTOM_PREFIX}${label.toLowerCase().replace(/\s+/g, '-')}`, schoolName: label })
                  setQuery('')
                }}
                className="rounded-2xl border border-dashed border-lime/50 p-4 text-start font-bold text-lime"
              >
                ＋ {t('addSchool', { name: query.trim() })}
              </button>
            )}
          </div>
          <div className="flex-1" />
          <Button className="mt-6 w-full text-lg" disabled={!school} onClick={finish}>
            {t('letsGo')} 🚀
          </Button>
        </div>
      )}
    </div>
  )
}

function SchoolOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded-2xl border p-4 text-start font-bold transition ${
        selected ? 'border-lime bg-lime/10 text-lime' : 'border-line bg-surface hover:bg-surface-2'
      }`}
    >
      <span>🏫 {label}</span>
      {selected && <span>✓</span>}
    </button>
  )
}
