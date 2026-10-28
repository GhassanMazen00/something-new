// Runs services for a client: works out how confident each one can be, and caches results.

import type { Client, Kind } from './data/types'
import { levelOf, missingFor } from './services/common'
import type { Level, Result, ServiceDef } from './services/types'

export type Readiness = { level: Level; why?: string; missing: Kind[] }

const readyCache = new Map<string, Readiness>()
export function readiness(client: Client, svc: ServiceDef): Readiness {
  const key = `${client.id}|${svc.id}`
  const hit = readyCache.get(key)
  if (hit) return hit
  const ds = client.data()
  const have = new Set(client.files(ds).map((f) => f.kind))
  let level = levelOf(svc.needs, have)
  let why: string | undefined
  if (level !== 'none') {
    const adj = svc.adjust?.(ds, level)
    if (adj) {
      level = adj.level
      why = adj.why
    }
  }
  const out = { level, why, missing: missingFor(svc.needs, have) }
  readyCache.set(key, out)
  return out
}

export const startParams = (client: Client, svc: ServiceDef) => ({
  ...Object.fromEntries((svc.params ?? []).map((p) => [p.key, p.value])),
  ...(svc.defaults?.(client) ?? {}),
})

const resultCache = new Map<string, Result>()
export function run(client: Client, svc: ServiceDef, p: Record<string, number>) {
  const key = `${client.id}|${svc.id}|${JSON.stringify(p)}`
  const hit = resultCache.get(key)
  if (hit) return hit
  const r = svc.run({ ds: client.data(), client, level: readiness(client, svc).level, p })
  resultCache.set(key, r)
  return r
}
export const cached = (client: Client, svc: ServiceDef, p: Record<string, number>) => resultCache.get(`${client.id}|${svc.id}|${JSON.stringify(p)}`)
