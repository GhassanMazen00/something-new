import { useState } from 'react'
import { Button, DemoBanner, Sheet } from '../components/ui'
import { REWARDS } from '../data/rewards'
import { statsOf } from '../lib/game'
import { useT } from '../lib/i18n'
import { useStore, type Redemption } from '../lib/store'

export function Rewards() {
  const { state, redeem } = useStore()
  const { t, pick, num, xp } = useT()
  const [shown, setShown] = useState<Redemption | null>(null)
  const { balance } = statsOf(state)
  const shownReward = shown && REWARDS.find((r) => r.id === shown.rewardId)

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-black">{t('rewardsTitle')}</h1>

      <section className="rounded-3xl bg-gradient-to-br from-lime to-sky p-5 text-ink">
        <div className="text-sm font-bold opacity-70">{t('balance')}</div>
        <div className="text-5xl font-black tabular-nums">{xp(balance)}</div>
        <p className="mt-2 text-sm font-medium opacity-80">{t('earnMore')}</p>
      </section>

      <DemoBanner />

      <div className="grid grid-cols-2 gap-3">
        {REWARDS.map((r) => {
          const short = r.cost - balance
          return (
            <div key={r.id} className="flex flex-col rounded-3xl border border-line bg-surface p-4">
              <div className="text-4xl">{r.emoji}</div>
              <div className="mt-2 leading-tight font-extrabold">{pick(r.title)}</div>
              <div className="mt-1 text-xs text-muted">{pick(r.partner)}</div>
              <div className="flex-1" />
              <Button
                className="mt-3 w-full px-2 py-2.5 text-sm"
                variant={short > 0 ? 'secondary' : 'primary'}
                disabled={short > 0}
                onClick={() => setShown(redeem(r))}
              >
                {short > 0 ? t('needMore', { xp: num(short) }) : `${t('redeem')} · ${num(r.cost)}`}
              </Button>
            </div>
          )
        })}
      </div>

      {state.redemptions.length > 0 && (
        <section>
          <h3 className="mb-2 text-lg font-extrabold">{t('myRewards')}</h3>
          <div className="space-y-2">
            {[...state.redemptions].reverse().map((red) => {
              const r = REWARDS.find((x) => x.id === red.rewardId)
              if (!r) return null
              return (
                <button
                  key={red.id}
                  onClick={() => setShown(red)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-start"
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="flex-1 font-bold">{pick(r.title)}</span>
                  <code className="rounded-lg bg-surface-2 px-2 py-1 text-xs text-lime" dir="ltr">
                    {red.code}
                  </code>
                </button>
              )
            })}
          </div>
        </section>
      )}

      <Sheet open={!!shown} onClose={() => setShown(null)}>
        {shown && shownReward && (
          <div className="text-center">
            <div className="animate-pop text-7xl">{shownReward.emoji}</div>
            <h2 className="mt-3 text-2xl font-black">{pick(shownReward.title)}</h2>
            <p className="mt-1 text-muted">{pick(shownReward.partner)}</p>
            <div className="mt-6 text-sm font-bold text-muted">{t('yourCode')}</div>
            <div className="mt-1 rounded-2xl border-2 border-dashed border-lime p-4 text-3xl font-black tracking-widest text-lime" dir="ltr">
              {shown.code}
            </div>
            <p className="mt-3 text-sm text-white/70">{t('showCode')}</p>
            <Button variant="ghost" className="mt-4 w-full" onClick={() => setShown(null)}>
              {t('close')}
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  )
}
