import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { TerminalSpec } from '../data/types'
import { useT } from '../lib/i18n'
import type { Runner } from '../lib/store'
import { checkAnswer } from '../lib/verify'

type Tone = 'sys' | 'in' | 'ok' | 'err' | 'zero'
interface Line {
  text: string
  tone: Tone
}

const TONE_CLASS: Record<Tone, string> = {
  sys: 'text-[#8fb3d9]',
  in: 'text-white',
  ok: 'text-matrix',
  err: 'text-alert',
  zero: 'text-magenta',
}

// A tiny fake shell. Commands: help, scan, connect <node>, whoami, clear.
// Connecting to the target node asks for a passphrase, which is checked by hash.
export function Terminal({
  spec,
  seasonId,
  questId,
  answers,
  runner,
  done,
  onSuccess,
}: {
  spec: TerminalSpec
  seasonId: string
  questId: string
  answers: string[]
  runner: Runner
  done: boolean
  onSuccess: () => void
}) {
  const { pick } = useT()
  const banner = spec.banner.map((b) => ({ text: pick(b), tone: 'sys' as Tone }))
  const successLines = spec.success.map((s) => ({ text: pick(s), tone: (pick(s).startsWith('ZERO') ? 'zero' : 'ok') as Tone }))
  const [lines, setLines] = useState<Line[]>(() => (done ? [...banner, ...successLines, { text: '// session closed', tone: 'sys' }] : banner))
  const [input, setInput] = useState('')
  const [awaitingPass, setAwaitingPass] = useState<string | null>(null)
  const [locked, setLocked] = useState(done)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'nearest' })
  }, [lines])

  const print = (...more: Line[]) => setLines((l) => [...l, ...more])

  const run = (raw: string) => {
    const cmd = raw.trim()
    if (awaitingPass) {
      print({ text: `PASSPHRASE: ${'*'.repeat(cmd.length)}`, tone: 'in' })
      if (checkAnswer(seasonId, questId, cmd, answers)) {
        setLocked(true)
        setAwaitingPass(null)
        // Reveal the success lines one by one for drama.
        successLines.forEach((line, i) => setTimeout(() => print(line), 350 * (i + 1)))
        setTimeout(onSuccess, 350 * (successLines.length + 2))
      } else {
        print({ text: 'ACCESS DENIED', tone: 'err' }, { text: `connection to ${awaitingPass} dropped`, tone: 'sys' })
        setAwaitingPass(null)
      }
      return
    }

    print({ text: `> ${cmd}`, tone: 'in' })
    const [name, arg] = cmd.split(/\s+/)
    switch ((name ?? '').toLowerCase()) {
      case '':
        return
      case 'help':
        print(
          { text: 'help              show this list', tone: 'sys' },
          { text: 'scan              list nearby nodes', tone: 'sys' },
          { text: 'connect <node>    open a line to a node', tone: 'sys' },
          { text: 'whoami            show your identity', tone: 'sys' },
          { text: 'clear             clear the screen', tone: 'sys' },
        )
        return
      case 'scan':
        print(
          { text: 'scanning…', tone: 'sys' },
          ...spec.nodes.map((n) => ({
            text: `  ${n.id.padEnd(18)} ${n.status === 'firewall' ? '[FIREWALL]' : n.status === 'offline' ? '[OFFLINE]' : '[OPEN]'}`,
            tone: (n.status === 'target' ? 'ok' : 'sys') as Tone,
          })),
        )
        return
      case 'whoami':
        print({ text: `${runner.callsign} // ${runner.id}`, tone: 'ok' })
        return
      case 'clear':
        setLines([])
        return
      case 'connect': {
        if (!arg) return print({ text: 'usage: connect <node>', tone: 'err' })
        const node = spec.nodes.find((n) => n.id === arg.toLowerCase())
        if (!node) return print({ text: `no such node: ${arg} (try 'scan')`, tone: 'err' })
        if (node.status === 'firewall') return print({ text: 'CONNECTION REFUSED // obelisk firewall', tone: 'err' })
        if (node.status === 'offline') return print({ text: 'NODE OFFLINE', tone: 'err' })
        print({ text: `connecting to ${node.id}…`, tone: 'sys' }, { text: 'PASSPHRASE REQUIRED', tone: 'zero' })
        setAwaitingPass(node.id)
        return
      }
      default:
        print({ text: `command not found: ${name}`, tone: 'err' })
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    run(input)
    setInput('')
  }

  return (
    <div
      dir="ltr"
      onClick={() => inputRef.current?.focus()}
      className="chamfer relative h-80 overflow-y-auto bg-[#020306] p-4 font-mono text-[13px] leading-relaxed shadow-[inset_0_0_0_1px_#3dff8b55]"
    >
      {lines.map((l, i) => (
        <div key={i} className={`whitespace-pre-wrap ${TONE_CLASS[l.tone]}`}>
          {l.text}
        </div>
      ))}
      {!locked && (
        <form onSubmit={submit} className="flex items-center gap-2 text-matrix">
          <span>{awaitingPass ? 'PASSPHRASE:' : '>'}</span>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type={awaitingPass ? 'password' : 'text'}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            aria-label="terminal input"
            className="min-w-0 flex-1 bg-transparent text-white caret-matrix outline-none"
          />
        </form>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
