// The shapes of the files a client sends, after intake has mapped their columns.

// File kinds. The first eleven match the website's "What can we do with what you have?" list.
export type Kind =
  | 'sales'
  | 'einv'
  | 'bank'
  | 'ledger'
  | 'unpaid'
  | 'pnl'
  | 'cost'
  | 'stock'
  | 'ads'
  | 'payroll'
  | 'staff'
  | 'branches'
  | 'abtest'
  | 'empsurvey'
  | 'custsurvey'

export const KIND_LABEL: Record<Kind, string> = {
  sales: 'Sales list',
  einv: 'E-invoices',
  bank: 'Bank statements',
  ledger: 'Ledger / books',
  unpaid: 'Unpaid invoices & bills',
  pnl: 'Profit & loss',
  cost: 'Prices & costs',
  stock: 'Stock on hand',
  ads: 'Ad spend per channel',
  payroll: 'Payroll',
  staff: 'Staff list',
  branches: 'Branch details',
  abtest: 'A/B test results',
  empsurvey: 'Employee survey',
  custsurvey: 'Customer survey',
}

// Days are counted from the dataset's start date.
export type Sale = {
  d: number
  inv: string
  cust: string
  prod: string
  branch: string
  channel: string
  qty: number
  price: number
  cost: number
  hour: number
  promo: boolean
}
export type Product = {
  id: string
  name: string
  category: string
  price: number
  cost: number
  imported: number
  leadDays: number
  onHand: number
}
export type EInvoice = { no: number; d: number; cust: string; amount: number }
export type LedgerEntry = { id: string; d: number; account: string; party: string; amount: number; ref: string }
export type BankTx = { d: number; desc: string; amount: number; ref: string }
export type Receivable = { inv: string; cust: string; amount: number; due: number }
export type Payable = { ref: string; vendor: string; amount: number; due: number }
export type PnlMonth = { m: number; revenue: number; cogs: number; payroll: number; rent: number; marketing: number; other: number }
export type AdWeek = { w: number; channel: string; spend: number; newCustomers: number; revenue: number }
export type PayrollLine = { m: number; emp: string; name: string; base: number; overtime: number; account: string }
export type Staff = {
  id: string
  name: string
  role: string
  gender: 'F' | 'M'
  hire: number
  leave: number | null
  salary: number
  branch: string
  overtimeHrs: number
}
export type Branch = { id: string; name: string; sqm: number; staff: number }
export type AbTest = { name: string; metric: string; a: { visitors: number; conversions: number }; b: { visitors: number; conversions: number } }
export type EmpSurvey = { score: number; comment: string }
export type PriceAnswer = { tooCheap: number; cheap: number; expensive: number; tooExpensive: number }

export type Dataset = {
  start: string // ISO date of day 0
  days: number
  sales: Sale[]
  products: Product[]
  einv: EInvoice[]
  ledger: LedgerEntry[]
  bank: BankTx[]
  receivables: Receivable[]
  payables: Payable[]
  openingCash: number
  pnl: PnlMonth[]
  ads: AdWeek[]
  payroll: PayrollLine[]
  staff: Staff[]
  branches: Branch[]
  abtest: AbTest | null
  empSurvey: EmpSurvey[]
  custSurvey: { product: string; answers: PriceAnswer[] } | null
}

export type FileMeta = { name: string; kind: Kind; rows: number; cols: string[]; uploaded: string }

export type Client = {
  id: string
  name: string
  industry: string
  sector: 'furniture' | 'medical' | 'beauty'
  contact: string
  analyst: string // the analyst's id
  question: string
  // Services that answer the client's question, suggested first.
  focus: string[]
  received: string
  deleteOn: string
  status: 'Intake' | 'Analysing' | 'In review' | 'Delivered'
  // What arrived, described from the data itself so row counts always match.
  files: (ds: Dataset) => FileMeta[]
  data: () => Dataset
}
