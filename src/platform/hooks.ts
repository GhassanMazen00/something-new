// Loading data from the server into a screen, with a way to load it again after a change.

import { useCallback, useEffect, useRef, useState } from 'react'

export function useLoad<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)
  const live = useRef(0)
  useEffect(() => {
    const n = ++live.current
    setError('')
    load().then(
      (d) => n === live.current && setData(d),
      (e: Error) => n === live.current && setError(e.message),
    )
  }, [...deps, tick])
  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, error, reload, setData }
}

// Runs an action, showing it as busy and keeping its error message until the next try.
export function useAction() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    setBusy(true)
    setError('')
    try {
      return await fn()
    } catch (e) {
      setError((e as Error).message)
      return undefined
    } finally {
      setBusy(false)
    }
  }, [])
  return { busy, error, run, setError }
}

// The server sends UTC times without a zone mark, sometimes with microseconds.
const toDate = (iso: string) => new Date(iso.length === 10 ? iso + 'T12:00:00' : iso.replace(/(\.\d{3})\d+/, '$1').replace(/Z?$/, 'Z'))
export const fmtDate = (iso: string) => toDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
export const fmtTime = (iso: string) => toDate(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
export const daysLeft = (iso: string) => Math.max(0, Math.ceil((toDate(iso).getTime() - Date.now()) / 864e5))
