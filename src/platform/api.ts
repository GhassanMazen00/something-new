// Talks to the Clearline server on this computer. Every change carries a header that pages on other sites can't add.

import type { Level, Result } from '../app/services/types'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type Listener = () => void
const signedOut = new Set<Listener>()
export const onSignedOut = (l: Listener) => {
  signedOut.add(l)
  return () => {
    signedOut.delete(l)
  }
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const init: RequestInit = { method, credentials: 'same-origin', headers: { 'X-Clearline': '1' } }
  if (body instanceof FormData) init.body = body
  else if (body !== undefined) {
    init.body = JSON.stringify(body)
    ;(init.headers as Record<string, string>)['Content-Type'] = 'application/json'
  }
  let res: Response
  try {
    res = await fetch('/api' + path, init)
  } catch {
    throw new ApiError(0, 'The Clearline server isn’t running. Start it with start.bat, then reload this page.')
  }
  if (res.status === 401 && !path.startsWith('/login')) signedOut.forEach((l) => l())
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : null
  if (!res.ok) {
    const d = data?.detail
    const msg = typeof d === 'string' ? d : Array.isArray(d) ? d.map((x: { msg: string }) => x.msg).join(' ') : `Something went wrong (${res.status}).`
    throw new ApiError(res.status, msg)
  }
  return data as T
}

export const api = {
  get: <T>(p: string) => call<T>('GET', p),
  post: <T>(p: string, b?: unknown) => call<T>('POST', p, b ?? {}),
  put: <T>(p: string, b: unknown) => call<T>('PUT', p, b),
  patch: <T>(p: string, b: unknown) => call<T>('PATCH', p, b),
  del: <T>(p: string) => call<T>('DELETE', p),
  upload: <T>(p: string, form: FormData) => call<T>('POST', p, form),
}

export type Role = 'admin' | 'analyst' | 'reviewer'
export type Me = { id: number; name: string; email: string; role: Role; active: boolean; must_change_password: boolean; two_step: boolean; ai: boolean }
export type Person = { id: number; name: string; role: Role; email?: string; active?: boolean; two_step?: boolean; temp_password?: string }
export type Ref = { id: number; name: string } | null

export type ClientT = {
  id: number
  name: string
  industry: string
  sector: string
  contact: string
  question: string
  status: string
  analyst: Ref
  reviewer: Ref
  received_at: string
  delivered_at: string | null
  delete_on: string
  currency: string
  calendar: 'auto' | 'mena' | 'gulf' | 'other'
  files: number
  review_comment: string
}

export type Health = { rows_in: number; rows_out: number; issues: string[]; score: number; from?: string; to?: string; dayfirst?: boolean; duplicates?: number }
export type FileT = {
  id: number
  name: string
  size: number
  kind: string | null
  kind_label: string | null
  columns: string[]
  mapping: Record<string, string>
  options: { sheet?: string; header_row?: number; dayfirst?: boolean; sheets?: string[] }
  suggested?: { kind: string; confidence: number }
  rows: number
  ready: boolean
  health: Health | Record<string, never>
  uploaded_at: string
  preview?: string[][]
  preview_columns?: string[]
  spend_columns?: string[]
}

export type KindT = { key: string; label: string; any_of: string[][]; fields: { key: string; label: string; type: string; required: boolean }[] }

export type ParamT = { key: string; label: string; min: number; max: number; step: number; value: number; format: 'num' | 'pct' | 'share' | 'rate' | 'money' }
export type ServiceT = {
  id: string
  dept: string
  name: string
  get: string
  method: string
  data: string
  missing: string
  preview?: string
  params: ParamT[]
  needs: { high: string[][]; medium: string[][] | null; low: string[][] | null; public: boolean }
}
export type Catalog = { departments: { id: string; name: string }[]; services: ServiceT[] }
export type Readiness = { id: string; level: Level; why: string | null; missing: string[]; last_run: { id: number; at: string; level: Level } | null; params: Record<string, number> }

export type CheckT = { id: string; title: string; status: 'pass' | 'warn' | 'fail'; detail: string }
export type Ack = { reason: string; by: string; at: string }
export type ReportCheck = CheckT & { section_id: number | null; service: string | null; ack: Ack | null }
export type RunT = { id: number; service_id: string; level: Level; params: Record<string, number>; created_at: string; ms: number; result: Result & { currency?: string; checks?: CheckT[] }; why?: string | null }
export type Section = { id: number; position: number; note: string; run: RunT; files: string[]; acks: Record<string, Ack>; service: ServiceT }
export type ReportT = { client: ClientT; summary: string; sections: Section[]; checks: { blocking: number; accepted: number; warnings: number; passed: number; items: ReportCheck[] } }
export type ActivityT = { entries: { at: string; who: string; client: string | null; what: string }[]; chain_intact: boolean | null }
