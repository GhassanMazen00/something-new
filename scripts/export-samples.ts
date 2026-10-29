// Writes the three demo clients' data as the files a client would really send (varied column names,
// day-first dates, a title row here and there), for testing the platform's intake and services.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { deltaData, lotusData, nileData } from '../src/app/data/generate'
import type { Dataset } from '../src/app/data/types'

const out = process.argv[2]
const dmy = (start: string, d: number) => {
  const x = new Date(Date.parse(start + 'T00:00:00Z') + d * 864e5)
  return `${String(x.getUTCDate()).padStart(2, '0')}/${String(x.getUTCMonth() + 1).padStart(2, '0')}/${x.getUTCFullYear()}`
}
const iso = (start: string, d: number) => new Date(Date.parse(start + 'T00:00:00Z') + d * 864e5).toISOString().slice(0, 10)
const month = (start: string, m: number) => {
  const s = new Date(start + 'T00:00:00Z')
  const x = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth() + m, 1))
  return x.toISOString().slice(0, 7)
}
const esc = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
function csv(dir: string, name: string, header: string[], rows: unknown[][], title?: string) {
  mkdirSync(dir, { recursive: true })
  const lines = [...(title ? [title, ''] : []), header.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))]
  writeFileSync(join(dir, name), lines.join('\n'))
}

function common(dir: string, ds: Dataset, opts: { arabic?: boolean }) {
  const s = ds.start
  if (ds.staff.length)
    csv(dir, 'staff_list.csv', ['Employee ID', 'Name', 'Job Title', 'Gender', 'Hire Date', 'Termination Date', 'Monthly Salary', 'Branch', 'Overtime hours'], ds.staff.map((x) => [x.id, x.name, x.role, x.gender === 'F' ? 'Female' : 'Male', x.hire < 0 ? iso(s, x.hire) : iso(s, x.hire), x.leave === null ? '' : iso(s, x.leave), x.salary, x.branch, x.overtimeHrs]))
  if (ds.payroll.length)
    csv(dir, 'payroll.csv', opts.arabic ? ['الشهر', 'كود الموظف', 'الاسم', 'الراتب الأساسي', 'إضافي', 'رقم الحساب'] : ['Pay month', 'Emp ID', 'Employee name', 'Basic salary', 'Overtime pay', 'IBAN'], ds.payroll.map((p) => [month(s, p.m), p.emp, p.name, p.base, p.overtime, p.account]))
  if (ds.pnl.length) csv(dir, 'monthly_pnl.csv', ['Period', 'Revenue', 'Cost of sales', 'Salaries', 'Rent', 'Advertising', 'Other expenses'], ds.pnl.map((p) => [month(s, p.m), p.revenue, p.cogs, p.payroll, p.rent, p.marketing, p.other]))
  if (ds.products.length) {
    csv(dir, 'price_list.csv', ['SKU', 'Product name', 'Category', 'Selling price', 'Unit cost', 'Imported %'], ds.products.map((p) => [p.id, p.name, p.category, p.price, p.cost, Math.round(p.imported * 100)]))
    csv(dir, 'stock_count.csv', ['SKU', 'Qty on hand', 'Lead time (days)'], ds.products.map((p) => [p.id, p.onHand, p.leadDays]))
  }
  if (ds.ads.length) {
    const start = new Date(s + 'T00:00:00Z')
    csv(dir, 'ad_spend_weekly.csv', ['Week starting', 'Channel', 'Spend (EGP)', 'New customers', 'Revenue'], ds.ads.map((a) => [new Date(start.getTime() + a.w * 7 * 864e5).toISOString().slice(0, 10), a.channel, a.spend, a.newCustomers, a.revenue]))
  }
}

const nile = nileData()
{
  const dir = join(out, 'nile-home-furnishings')
  const s = nile.start
  csv(dir, 'sales_export_2024-2026.csv', ['Invoice', 'Date', 'Time', 'Customer', 'Item code', 'Branch', 'Channel', 'Qty', 'Unit price', 'Promo'], nile.sales.map((x) => [x.inv, dmy(s, x.d), `${String(x.hour).padStart(2, '0')}:00`, x.cust, x.prod, nile.branches.find((b) => b.id === x.branch)?.name ?? '', x.channel, x.qty, x.price, x.promo ? 'Yes' : 'No']), 'Nile Home Furnishings · Sales export')
  csv(dir, 'branches.csv', ['Branch', 'Area m2', 'Staff'], nile.branches.map((b) => [b.name, b.sqm, b.staff]))
  common(dir, nile, {})
}
const lotus = lotusData()
{
  const dir = join(out, 'lotus-beauty')
  const s = lotus.start
  csv(dir, 'shopify_orders.csv', ['Name', 'Created at', 'Customer ID', 'Lineitem sku', 'Source', 'Lineitem quantity', 'Lineitem price'], lotus.sales.map((x) => [`#${x.inv}`, `${iso(s, x.d)} ${String(x.hour).padStart(2, '0')}:15:00`, x.cust, x.prod, x.channel, x.qty, x.price]))
  csv(dir, 'checkout_ab_test.csv', ['Variant', 'Visitors', 'Orders'], [['A (control)', lotus.abtest!.a.visitors, lotus.abtest!.a.conversions], ['B one-page', lotus.abtest!.b.visitors, lotus.abtest!.b.conversions]])
  csv(dir, 'price_survey_serum.csv', ['Too cheap', 'Cheap', 'Expensive', 'Too expensive'], lotus.custSurvey!.answers.map((a) => [a.tooCheap, a.cheap, a.expensive, a.tooExpensive]))
  csv(dir, 'team_survey.csv', ['How likely are you to recommend working here (0-10)', 'Comments'], lotus.empSurvey.map((e) => [e.score, e.comment]))
  common(dir, lotus, {})
}
const delta = deltaData()
{
  const dir = join(out, 'delta-medical-supplies')
  const s = delta.start
  csv(dir, 'eta_einvoices.csv', ['Internal ID', 'Date Issued', 'Receiver Name', 'Total Amount'], delta.einv.map((e) => [`INV-${e.no}`, iso(s, e.d), e.cust, e.amount.toFixed(2)]))
  csv(dir, 'general_ledger.csv', opts2(), delta.ledger.map((l) => [l.id, dmy(s, l.d), l.account, l.party, l.amount.toFixed(2), l.ref]))
  // Running balance, ending at the cash the business holds on the last day.
  let after = delta.bank.reduce((t, b) => t + b.amount, 0)
  const balances = delta.bank.map((b) => {
    const bal = delta.openingCash - after + b.amount
    after -= b.amount
    return bal
  })
  csv(dir, 'bank_statement_cib.csv', ['Value Date', 'Narrative', 'Debit', 'Credit', 'Reference', 'Balance'], delta.bank.map((b, i) => [iso(s, b.d), b.desc, b.amount < 0 ? (-b.amount).toFixed(2) : '', b.amount > 0 ? b.amount.toFixed(2) : '', b.ref, balances[i].toFixed(2)]))
  csv(dir, 'receivables_aging.csv', ['Invoice', 'Customer', 'Outstanding', 'Due date'], delta.receivables.map((r) => [r.inv, r.cust, r.amount.toFixed(2), iso(s, r.due)]))
  csv(dir, 'bills_to_pay.csv', ['Bill', 'Supplier', 'Amount', 'Due date'], delta.payables.map((p) => [p.ref, p.vendor, p.amount.toFixed(2), iso(s, p.due)]))
  common(dir, delta, { arabic: true })
}
function opts2() {
  return ['رقم القيد', 'التاريخ', 'الحساب', 'المورد', 'المبلغ', 'المرجع']
}
console.log('samples written to', out)
