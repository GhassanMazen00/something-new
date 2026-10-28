import type { Client, Dataset, Kind } from '../data/types'

export type Level = 'high' | 'medium' | 'low' | 'none'
export type Tone = 'accent' | 'muted' | 'green' | 'amber' | 'orange' | 'red'
export type Format = 'money' | 'num' | 'pct'

export type Chart =
  | {
      type: 'line'
      x: string[]
      series: { name: string; values: (number | null)[]; tone?: Tone; dashed?: boolean }[]
      band?: { lo: (number | null)[]; hi: (number | null)[]; name: string }
      marks?: { index: number; label: string; tone?: Tone }[]
      format?: Format
      zero?: boolean
    }
  | { type: 'bars'; labels: string[]; values: number[]; tones?: Tone[]; format?: Format; ref?: { value: number; label: string }; horizontal?: boolean; extra?: { name: string; values: number[] } }
  | { type: 'table'; columns: string[]; rows: (string | number)[][]; numeric?: boolean[]; tones?: (Tone | undefined)[] }
  | { type: 'heatmap'; rows: string[]; cols: string[]; values: number[][]; format?: Format }

export type Kpi = { label: string; value: string; note?: string; tone?: 'good' | 'bad' }
export type Finding = { text: string; action?: string; level: Level }
export type Result = {
  kpis: Kpi[]
  charts: { title: string; chart: Chart; wide?: boolean }[]
  findings: Finding[]
  // Accuracy measured on this client's own data, when the method can be tested.
  accuracy?: string
  notes?: string[]
}

export type Param = { key: string; label: string; min: number; max: number; step: number; value: number; format?: Format | 'egp-rate' }
export type Ctx = { ds: Dataset; client: Client; level: Level; p: Record<string, number> }

export type Needs = { high: Kind[][]; medium?: Kind[][]; low?: Kind[][]; publicData?: boolean }

export type ServiceDef = {
  id: string
  dept: string
  name: string
  get: string
  method: string
  data: string
  missing: string
  needs: Needs
  // The method this preview actually runs, when it is a lighter version of the production one.
  preview?: string
  params?: Param[]
  // Starting values that depend on the client, e.g. market size inputs for their sector.
  defaults?: (client: Client) => Record<string, number>
  // A last say on confidence once the data is known (too few months, too few staff).
  adjust?: (ds: Dataset, level: Level) => { level: Level; why: string } | null
  run: (ctx: Ctx) => Result
}
