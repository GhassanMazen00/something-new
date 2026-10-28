// Session, activity log and report drafts. Demo only: kept in this browser tab. In production every one of
// these is a database row, and the activity log cannot be edited.

import { useSyncExternalStore } from 'react'
import { ANALYSTS, CLIENTS } from './data/clients'

type Entry = { t: number; who: string; client: string; what: string }
type State = { analyst: string | null; log: Entry[]; report: Record<string, string[]>; sent: Record<string, boolean> }

const KEY = 'clearline:workspace'
const seed = (): State => ({
  analyst: null,
  log: CLIENTS.flatMap((c) => [
    { t: Date.parse(c.received + 'T09:12:00'), who: 'Admin', client: c.id, what: `Confidentiality agreement signed with ${c.name}` },
    { t: Date.parse(c.received + 'T10:40:00'), who: 'Admin', client: c.id, what: `Assigned to ${ANALYSTS.find((a) => a.id === c.analyst)!.name}` },
    { t: Date.parse(c.received + 'T11:05:00'), who: c.contact.split(',')[0], client: c.id, what: `${c.files(c.data()).length} files uploaded through the encrypted link` },
  ]),
  report: { nile: [], lotus: [], delta: [] },
  sent: {},
})

let state: State = (() => {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as State
  } catch {
    // Storage blocked: start fresh.
  }
  return seed()
})()
const listeners = new Set<() => void>()
function set(next: Partial<State>) {
  state = { ...state, ...next }
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage blocked: changes last until the tab closes.
  }
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
export const useStore = () => useSyncExternalStore(subscribe, () => state)

export const me = () => ANALYSTS.find((a) => a.id === state.analyst) ?? null
export const signIn = (id: string) => {
  set({ analyst: id })
  log('', 'Signed in with two-step code')
}
export const signOut = () => {
  log('', 'Signed out')
  set({ analyst: null })
}
export function log(client: string, what: string) {
  const who = me()?.name ?? 'Unknown'
  const last = state.log[state.log.length - 1]
  if (last && last.what === what && last.client === client && Date.now() - last.t < 60000) return
  set({ log: [...state.log, { t: Date.now(), who, client, what }] })
}
export const toggleReport = (client: string, svc: string, name: string) => {
  const cur = state.report[client] ?? []
  const on = cur.includes(svc)
  set({ report: { ...state.report, [client]: on ? cur.filter((x) => x !== svc) : [...cur, svc] } })
  log(client, on ? `Removed “${name}” from the report` : `Added “${name}” to the report`)
}
export const sendForReview = (client: string) => {
  set({ sent: { ...state.sent, [client]: true } })
  log(client, 'Report sent to the reviewer')
}
