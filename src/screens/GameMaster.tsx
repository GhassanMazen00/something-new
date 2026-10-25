import QRCode from 'qrcode'
import { useEffect, useMemo, useState } from 'react'
import { Button, Frame, Glitch, Hud, Tag } from '../components/ui'
import { CONFIG } from '../config'
import { LOOT, SEASONS } from '../data/seasons'
import { copyText } from '../lib/share'
import { KIND_COLOR, NEON } from '../lib/theme'
import { toast } from '../lib/toast'
import { answerHash, claimCode, normalizeAnswer, randomCode } from '../lib/verify'

// Your private console (open the app with #gm at the end of the link).
// 1. Make codes + printable QR stickers for real-world items.
// 2. Check reward claim codes when a Runner comes to collect.
export default function GameMaster() {
  const quests = useMemo(
    () =>
      SEASONS.flatMap((s) =>
        s.levels.flatMap((l) =>
          l.quests
            .filter((q) => q.kind === 'real' || q.kind === 'social-find')
            .map((q) => ({ season: s, level: l, quest: q, key: `${s.id}/${q.id}` })),
        ),
      ),
    [],
  )
  const [questKey, setQuestKey] = useState(quests[0]?.key ?? '')
  const [code, setCode] = useState('')
  const [qr, setQr] = useState('')
  const selected = quests.find((q) => q.key === questKey)

  const hash = selected && normalizeAnswer(code) ? answerHash(selected.season.id, selected.quest.id, code) : ''
  const alreadyValid = !!hash && !!selected?.quest.answers?.includes(hash)
  const claimUrl = code.trim() ? `${window.location.origin}${window.location.pathname}#claim=${encodeURIComponent(code.trim().toUpperCase())}` : ''

  useEffect(() => {
    if (!claimUrl) return
    let live = true
    QRCode.toDataURL(claimUrl, { width: 640, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#04050a', light: '#ffffff' } }).then(
      (url) => live && setQr(url),
    )
    return () => {
      live = false
    }
  }, [claimUrl])

  const [runnerId, setRunnerId] = useState('')
  const [lootId, setLootId] = useState(LOOT[0]?.id ?? '')
  const expectedClaim = runnerId.trim() ? claimCode(runnerId.trim().toUpperCase(), lootId, CONFIG.claimSalt) : ''

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 pt-6 pb-16" dir="ltr">
      <div>
        <Hud color={NEON.alert}>restricted</Hud>
        <Glitch text="GAME MASTER" className="mt-2 font-display text-3xl font-black tracking-wider text-alert text-glow" />
        <p className="mt-2 text-[#c9e8ff]">Make codes for your real-world items and verify reward claims. Keep this screen to yourself: the codes you type here are spoilers.</p>
        <a href="#" className="mt-3 inline-block font-mono text-xs text-dim hover:text-cyan">◂ back to the app</a>
      </div>

      <Frame color={NEON.acid}>
        <div className="space-y-4 p-4">
          <Hud color={NEON.acid}>1 // code forge</Hud>
          <label className="block space-y-1">
            <span className="font-mono text-xs text-dim">QUEST</span>
            <select
              value={questKey}
              onChange={(e) => setQuestKey(e.target.value)}
              className="chamfer-sm w-full bg-panel-2 p-3 font-mono text-sm text-white outline-none"
            >
              {quests.map((q) => (
                <option key={q.key} value={q.key}>
                  S{q.season.number} L{q.level.number} · {q.quest.title.en} ({q.quest.kind})
                </option>
              ))}
            </select>
          </label>
          {selected && <Tag color={KIND_COLOR[selected.quest.kind]}>{selected.quest.kind}</Tag>}
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 40))}
              placeholder="TYPE OR GENERATE"
              className="chamfer-sm min-w-0 flex-1 bg-panel-2 p-3 font-mono text-lg tracking-widest text-white outline-none"
            />
            <Button variant="ghost" onClick={() => setCode(randomCode(selected?.quest.id.split('-')[1]?.slice(0, 4).toUpperCase() ?? ''))}>
              GEN
            </Button>
          </div>

          {hash && (
            <div className="space-y-3">
              <div className={`font-mono text-xs ${alreadyValid ? 'text-matrix' : 'text-acid'}`}>
                {alreadyValid ? '✓ This code already works for this quest.' : '◇ New code. Add this line to the quest\'s answers in src/data/season1.ts:'}
              </div>
              {!alreadyValid && (
                <button
                  onClick={async () => (await copyText(`'${hash}',`)) && toast('Copied')}
                  className="chamfer-sm block w-full bg-panel-2 p-3 text-start font-mono text-[11px] break-all text-cyan"
                >
                  '{hash}',
                </button>
              )}
              {qr && (
                <div className="space-y-2 text-center">
                  <img src={qr} alt="QR code" className="mx-auto w-56 bg-white p-2" />
                  <div className="font-mono text-xs break-all text-dim">{claimUrl}</div>
                  <a
                    href={qr}
                    download={`irl-${normalizeAnswer(code)}.png`}
                    className="chamfer-sm inline-block bg-cyan px-5 py-3 font-display text-sm font-bold tracking-[0.18em] text-void"
                  >
                    DOWNLOAD QR
                  </a>
                  <p className="text-xs text-dim">Print this QR on the item, with the code written next to it for people without a camera.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Frame>

      <Frame color={NEON.cyan}>
        <div className="space-y-4 p-4">
          <Hud color={NEON.cyan}>2 // verify a claim</Hud>
          <input
            value={runnerId}
            onChange={(e) => setRunnerId(e.target.value.slice(0, 12))}
            placeholder="RUNNER ID (R-XXXXXX)"
            className="chamfer-sm w-full bg-panel-2 p-3 font-mono tracking-widest text-white uppercase outline-none"
          />
          <select
            value={lootId}
            onChange={(e) => setLootId(e.target.value)}
            className="chamfer-sm w-full bg-panel-2 p-3 font-mono text-sm text-white outline-none"
          >
            {LOOT.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title.en}
              </option>
            ))}
          </select>
          {expectedClaim && (
            <div className="text-center">
              <div className="font-mono text-xs text-dim">Their screen should show</div>
              <div className="mt-1 font-mono text-3xl tracking-widest text-acid text-glow">{expectedClaim}</div>
            </div>
          )}
        </div>
      </Frame>
    </div>
  )
}
