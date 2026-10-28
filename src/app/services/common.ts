// Helpers shared by the services.

import type { Dataset, Kind, Sale } from '../data/types'
import { monthIndex, monthLabel } from '../lib/dates'
import type { Level, Needs } from './types'

// The sales list as an analyst would use it: repeated rows and returns removed, missing branch marked.
const cleanCache = new WeakMap<Dataset, Sale[]>()
export function cleanSales(ds: Dataset) {
  const hit = cleanCache.get(ds)
  if (hit) return hit
  const seen = new Set<string>()
  const out: Sale[] = []
  for (const s of ds.sales) {
    if (s.qty <= 0) continue
    const key = `${s.d}|${s.inv}|${s.prod}|${s.qty}|${s.price}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(s.branch ? s : { ...s, branch: 'Unknown' })
  }
  cleanCache.set(ds, out)
  return out
}

export const months = (ds: Dataset) => monthIndex(ds.start, ds.days - 1) + 1
export const monthLabels = (ds: Dataset, n = months(ds), from = 0) => Array.from({ length: n }, (_, i) => monthLabel(ds.start, from + i))

export function monthlyRevenue(ds: Dataset) {
  const out = Array(months(ds)).fill(0)
  for (const s of cleanSales(ds)) out[monthIndex(ds.start, s.d)] += s.qty * s.price
  return out as number[]
}

export function levelOf(needs: Needs, have: Set<Kind>): Level {
  if (needs.publicData) return 'high'
  const any = (ways: Kind[][] = []) => ways.some((w) => w.every((k) => have.has(k)))
  if (any(needs.high)) return 'high'
  if (any(needs.medium)) return 'medium'
  if (any(needs.low)) return 'low'
  return 'none'
}

// The files that would lift a service to full confidence, using the way that needs the fewest.
export function missingFor(needs: Needs, have: Set<Kind>) {
  if (needs.publicData || !needs.high.length) return []
  return needs.high.map((w) => w.filter((k) => !have.has(k))).sort((a, b) => a.length - b.length)[0]
}

export const productName = (ds: Dataset, id: string) => ds.products.find((p) => p.id === id)?.name ?? id
