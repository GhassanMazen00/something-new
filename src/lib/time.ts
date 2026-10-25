import { useEffect, useState } from 'react'

const DAY_MS = 86_400_000

// "2026-10-25" in the user's local time zone.
export function dayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function startOfDay(d = new Date()): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

// The league week starts on Sunday at midnight.
export function startOfWeek(d = new Date()): Date {
  const x = startOfDay(d)
  x.setDate(x.getDate() - x.getDay())
  return x
}

export function weekProgress(now = new Date()): number {
  return Math.min(1, (now.getTime() - startOfWeek(now).getTime()) / (7 * DAY_MS))
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return d > 0 ? `${d}d ${pad(h)}:${pad(m)}` : `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function msUntilTomorrow(now = new Date()): number {
  return addDays(startOfDay(now), 1).getTime() - now.getTime()
}

export function msUntilNextWeek(now = new Date()): number {
  return addDays(startOfWeek(now), 7).getTime() - now.getTime()
}

// Re-renders the calling component every `intervalMs`.
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
