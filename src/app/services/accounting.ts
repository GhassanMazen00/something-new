// Accounting and finance: six services.

import type { Dataset, PnlMonth } from '../data/types'
import { iso, monthIndex } from '../lib/dates'
import { egp, num, pct, signedPct } from '../lib/format'
import { rng } from '../lib/rng'
import { groupBy, mean, median, quantile, sum, sumBy } from '../lib/stats'
import { cleanSales, monthLabels, months } from './common'
import type { Finding, ServiceDef, Tone } from './types'

type Part = Omit<ServiceDef, 'id' | 'dept' | 'get' | 'method' | 'data' | 'missing'>

// The profit and loss as sent, or rebuilt from sales, staff and ads when it wasn't.
function pnlOf(ds: Dataset): { pnl: PnlMonth[]; estimated: boolean } {
  if (ds.pnl.length) return { pnl: ds.pnl, estimated: false }
  const n = months(ds)
  const rev = Array(n).fill(0)
  const cogs = Array(n).fill(0)
  for (const s of cleanSales(ds)) {
    const m = monthIndex(ds.start, s.d)
    rev[m] += s.qty * s.price
    cogs[m] += s.qty * s.cost
  }
  const mkt = Array(n).fill(0)
  for (const a of ds.ads) mkt[Math.min(n - 1, Math.floor((a.w * 7) / 30.4))] += a.spend
  const payroll = sumBy(ds.staff.filter((s) => s.leave === null), (s) => s.salary * 1.1)
  return {
    pnl: rev.map((r, m) => ({ m, revenue: r, cogs: cogs[m], payroll, rent: 60000, marketing: mkt[m], other: r * 0.08 })),
    estimated: true,
  }
}
const net = (p: PnlMonth) => p.revenue - p.cogs - p.payroll - p.rent - p.marketing - p.other

const BENFORD = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => Math.log10(1 + 1 / d))
const firstDigit = (x: number) => Number(String(Math.abs(x)).replace(/^[0.]+/, '')[0])

export const accountingServices: Part[] = [
  {
    name: 'Error and fraud scan',
    needs: { high: [['ledger', 'bank']], medium: [['einv', 'bank'], ['ledger']], low: [['einv'], ['bank']] },
    preview: 'Benford’s law, duplicate checks and invoice-number gaps as in production. Outliers use a robust score per supplier (median and spread) where production uses Isolation Forest.',
    run: ({ ds }) => {
      const useLedger = ds.ledger.length > 0
      const entries = useLedger ? ds.ledger.filter((l) => l.account !== 'Sales') : ds.einv.map((e) => ({ id: String(e.no), d: e.d, account: 'Sales', party: e.cust, amount: e.amount, ref: `INV-${e.no}` }))
      const flags: { d: number; party: string; amount: number; ref: string; why: string; tone: Tone }[] = []
      // Benford: first digits of all amounts against the expected curve.
      const counts = Array(9).fill(0)
      for (const e of entries) if (e.amount >= 10) counts[firstDigit(e.amount) - 1]++
      const n = sum(counts)
      const share = counts.map((c) => c / n)
      const z = share.map((s, i) => (s - BENFORD[i]) / Math.sqrt((BENFORD[i] * (1 - BENFORD[i])) / n))
      const mad = mean(share.map((s, i) => Math.abs(s - BENFORD[i])))
      const odd = z.map((v, i) => ({ v, d: i + 1 })).filter((x) => x.v > 3)
      for (const o of odd) {
        const byParty = [...groupBy(entries.filter((e) => firstDigit(e.amount) === o.d && e.amount >= 10), (e) => e.party)].sort((a, b) => b[1].length - a[1].length)[0]
        if (byParty) {
          const [party, xs] = byParty
          const near = xs.filter((e) => e.amount < 10 ** Math.floor(Math.log10(e.amount) + 1) && e.amount >= 0.9 * 10 ** Math.floor(Math.log10(e.amount) + 1))
          for (const e of near.slice(0, 6)) flags.push({ d: e.d, party, amount: e.amount, ref: e.ref, why: `Just under ${egp(10 ** Math.floor(Math.log10(e.amount) + 1), { exact: true })} (approval limit?)`, tone: 'orange' })
        }
      }
      // Duplicates: same party and amount within five days.
      const dupes: typeof entries = []
      for (const [, xs] of groupBy(entries, (e) => `${e.party}|${e.amount.toFixed(2)}`)) {
        const sorted = xs.sort((a, b) => a.d - b.d)
        for (let i = 1; i < sorted.length; i++) if (sorted[i].d - sorted[i - 1].d <= 5) dupes.push(sorted[i])
      }
      for (const e of dupes) flags.push({ d: e.d, party: e.party, amount: e.amount, ref: e.ref, why: 'Same supplier and amount within 5 days', tone: 'red' })
      // Outliers: far above what this party usually costs.
      for (const [party, xs] of groupBy(entries, (e) => e.party)) {
        if (xs.length < 30) continue
        const logs = xs.map((e) => Math.log(e.amount))
        const md = median(logs)
        // A floor on the spread, so a cluster of near-identical payments can't make ordinary bills look extreme.
        const madv = Math.max(0.4, median(logs.map((v) => Math.abs(v - md))))
        for (const e of xs) if ((Math.log(e.amount) - md) / (1.4826 * madv) > 4) flags.push({ d: e.d, party, amount: e.amount, ref: e.ref, why: 'Far above this supplier’s usual amount', tone: 'amber' })
      }
      // Gaps in the e-invoice numbering.
      const nos = ds.einv.map((e) => e.no).sort((a, b) => a - b)
      const gaps: number[] = []
      for (let i = 1; i < nos.length; i++) for (let k = nos[i - 1] + 1; k < nos[i]; k++) gaps.push(k)
      const dupValue = sumBy(dupes, (e) => e.amount)
      const findings: Finding[] = []
      if (dupes.length) findings.push({ text: `${dupes.length} payments look like the same bill paid twice, worth ${egp(dupValue)}.`, action: 'Check each against the supplier statement and claim back the duplicates.', level: 'high' })
      if (odd.length) findings.push({ text: `Too many amounts start with ${odd.map((o) => o.d).join(' and ')} (Benford’s law). Most sit just under a round limit from one supplier.`, action: 'Check whether purchases were split to avoid approval.', level: n > 500 ? 'high' : 'medium' })
      if (gaps.length) findings.push({ text: `${gaps.length} e-invoice numbers are missing from the sequence.`, action: 'Ask for the cancellation records for each.', level: 'high' })
      findings.push({ text: `${flags.length} entries flagged out of ${num(entries.length)} checked. A flag is a question, not an accusation.`, level: 'high' })
      // Most serious first: likely double payments, then split purchases, then unusual amounts.
      const rank: Record<string, number> = { red: 0, orange: 1, amber: 2 }
      flags.sort((a, b) => rank[a.tone] - rank[b.tone] || b.amount - a.amount)
      return {
        kpis: [
          { label: 'Entries checked', value: num(entries.length) },
          { label: 'Flagged for review', value: num(flags.length), tone: flags.length ? 'bad' : 'good' },
          { label: 'Possible double payments', value: egp(dupValue), tone: dupValue ? 'bad' : 'good' },
          { label: 'Benford fit (MAD)', value: mad.toFixed(4), note: mad < 0.012 ? 'acceptable' : 'non-conforming', tone: mad < 0.012 ? 'good' : 'bad' },
        ],
        charts: [
          { title: 'First digits against Benford’s law', chart: { type: 'bars', labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'], values: share.map((s) => s * 100), extra: { name: 'Expected', values: BENFORD.map((b) => b * 100) }, format: 'num', tones: z.map((v) => (v > 3 ? 'red' : 'accent')) } },
          { title: 'Flagged entries (most serious first)', chart: { type: 'table', columns: ['Date', 'Party', 'Amount', 'Reference', 'Why'], rows: flags.slice(0, 14).map((f) => [iso(ds.start, f.d), f.party, egp(f.amount, { exact: true }), f.ref, f.why]), numeric: [false, false, true, false, false], tones: flags.slice(0, 14).map((f) => f.tone) }, wide: true },
          ...(gaps.length ? [{ title: 'Missing invoice numbers', chart: { type: 'table' as const, columns: ['Missing numbers'], rows: [[gaps.slice(0, 30).join(', ') + (gaps.length > 30 ? ` … and ${gaps.length - 30} more` : '')]] } }] : []),
        ],
        findings,
      }
    },
  },
  {
    name: 'Books, e-invoices and bank, matched',
    needs: { high: [['ledger', 'einv', 'bank']], medium: [['ledger', 'einv'], ['ledger', 'bank'], ['einv', 'bank']] },
    run: ({ ds }) => {
      const books = new Map(ds.ledger.filter((l) => l.account === 'Sales').map((l) => [l.ref, l]))
      const missing = ds.einv.filter((e) => !books.has(`INV-${e.no}`))
      const wrong = ds.einv.filter((e) => {
        const b = books.get(`INV-${e.no}`)
        return b && Math.abs(b.amount - e.amount) > 0.5
      })
      const deposits = ds.bank.filter((b) => b.amount > 0)
      const einvRefs = new Set(ds.einv.map((e) => `INV-${e.no}`))
      const noInvoice = deposits.filter((b) => !einvRefs.has(b.ref))
      const paid = new Set(deposits.map((b) => b.ref))
      const unpaid = ds.einv.filter((e) => !paid.has(`INV-${e.no}`) && e.d < ds.days - 120)
      const rows: (string | number)[][] = [
        ['E-invoices not in the books', num(missing.length), egp(sumBy(missing, (e) => e.amount))],
        ['Amount in books differs from e-invoice', num(wrong.length), egp(sumBy(wrong, (e) => Math.abs(books.get(`INV-${e.no}`)!.amount - e.amount)))],
        ['Deposits with no e-invoice', num(noInvoice.length), egp(sumBy(noInvoice, (b) => b.amount))],
        ['Invoices over 4 months old, never paid', num(unpaid.length), egp(sumBy(unpaid, (e) => e.amount))],
      ]
      const detail = [
        ...missing.slice(0, 6).map((e) => [iso(ds.start, e.d), `INV-${e.no}`, e.cust, egp(e.amount, { exact: true }), 'Not in the books']),
        ...wrong.slice(0, 4).map((e) => [iso(ds.start, e.d), `INV-${e.no}`, e.cust, egp(e.amount, { exact: true }), `Books show ${egp(books.get(`INV-${e.no}`)!.amount, { exact: true })}`]),
        ...noInvoice.slice(0, 6).map((b) => [iso(ds.start, b.d), '–', b.desc, egp(b.amount, { exact: true }), 'Deposit with no e-invoice']),
      ]
      const matched = ds.einv.length - missing.length - wrong.length
      return {
        kpis: [
          { label: 'E-invoices matched', value: pct(matched / ds.einv.length, 1), note: `${num(matched)} of ${num(ds.einv.length)}`, tone: 'good' },
          { label: 'Missing from the books', value: num(missing.length), tone: missing.length ? 'bad' : 'good' },
          { label: 'Deposits with no e-invoice', value: num(noInvoice.length), note: egp(sumBy(noInvoice, (b) => b.amount)), tone: noInvoice.length ? 'bad' : 'good' },
          { label: 'Old unpaid invoices', value: egp(sumBy(unpaid, (e) => e.amount)) },
        ],
        charts: [
          { title: 'What doesn’t match', chart: { type: 'table', columns: ['Check', 'Count', 'Value'], rows, numeric: [false, true, true], tones: ['red', 'orange', 'red', 'amber'] }, wide: true },
          { title: 'Examples to check', chart: { type: 'table', columns: ['Date', 'Invoice', 'Party', 'Amount', 'Problem'], rows: detail, numeric: [false, false, false, true, false] }, wide: true },
        ],
        findings: [
          { text: `${missing.length} e-invoices (${egp(sumBy(missing, (e) => e.amount))}) were sent to the tax authority but never entered in the books.`, action: 'Post them now: the books under-state sales.', level: 'high' },
          { text: `${noInvoice.length} cash deposits (${egp(sumBy(noInvoice, (b) => b.amount))}) have no e-invoice behind them.`, action: 'If these are sales, they need e-invoices: a tax risk to fix before an audit.', level: 'high' },
          { text: `${wrong.length} invoices were typed into the books with a different amount.`, level: 'high' },
          { text: `${egp(sumBy(unpaid, (e) => e.amount))} of invoices older than four months have never been paid.`, action: 'Chase or provide for them.', level: 'medium' },
        ],
      }
    },
  },
  {
    name: '13-week cash forecast',
    needs: { high: [['bank', 'unpaid']], medium: [['bank']] },
    preview: 'Direct method: opening bank balance, plus customer payments expected by due date and past lateness, minus bills, payroll and rent by date.',
    run: ({ ds }) => {
      const end = ds.days
      const weeks = Array.from({ length: 13 }, () => ({ inflow: 0, outflow: 0 }))
      const deposits = ds.bank.filter((b) => b.amount > 0 && b.d >= end - 91)
      const avgWeekly = sumBy(deposits, (b) => b.amount) / 13
      const lateShare = 0.3
      for (const r of ds.receivables) {
        const w = Math.floor((r.due - end) / 7)
        if (w < 0) {
          weeks[Math.min(3, -w % 4)].inflow += r.amount * 0.6
        } else if (w < 13) {
          weeks[w].inflow += r.amount * (1 - lateShare)
          if (w + 4 < 13) weeks[w + 4].inflow += r.amount * lateShare * 0.8
        }
      }
      // Sales made during the quarter start paying in after about five weeks.
      for (let w = 5; w < 13; w++) weeks[w].inflow += avgWeekly * Math.min(1, (w - 4) / 4) * 0.55
      for (const p of ds.payables) {
        const w = Math.floor((p.due - end) / 7)
        if (w >= 0 && w < 13) weeks[w].outflow += p.amount
      }
      const lastPayroll = ds.payroll.filter((p) => p.m === Math.max(...ds.payroll.map((x) => x.m)))
      const payroll = sumBy(lastPayroll, (p) => p.base + p.overtime)
      const rent = Math.abs(ds.bank.filter((b) => b.desc === 'Rent').slice(-1)[0]?.amount ?? 0)
      for (const w of [3, 7, 11]) weeks[w].outflow += payroll
      for (const w of [0, 4, 8, 12]) weeks[w].outflow += rent
      let bal = ds.openingCash
      const closing = weeks.map((w) => (bal += w.inflow - w.outflow))
      const low = Math.min(...closing)
      const lowW = closing.indexOf(low)
      const firstNeg = closing.findIndex((c) => c < 0)
      const overdue = sumBy(ds.receivables.filter((r) => r.due < end), (r) => r.amount)
      const labels = weeks.map((_, i) => `W${i + 1}`)
      // The large bills that land in the weeks leading to the low point.
      const bigBills = [...new Set(ds.payables.filter((p) => p.amount > 500000 && Math.floor((p.due - end) / 7) <= lowW && Math.floor((p.due - end) / 7) >= lowW - 1).map((p) => p.vendor))]
      return {
        kpis: [
          { label: 'Cash today', value: egp(ds.openingCash) },
          { label: 'Lowest point', value: egp(low), note: `week ${lowW + 1}`, tone: low < 0 ? 'bad' : 'good' },
          { label: firstNeg >= 0 ? 'Runs out in' : 'Runs out', value: firstNeg >= 0 ? `Week ${firstNeg + 1}` : 'Not in 13 weeks', tone: firstNeg >= 0 ? 'bad' : 'good' },
          { label: 'Overdue from customers', value: egp(overdue) },
        ],
        charts: [
          {
            title: 'Cash at the end of each week',
            chart: { type: 'line', x: labels, series: [{ name: 'Closing cash', values: closing, tone: 'accent' }], marks: [{ index: lowW, label: `Lowest: ${egp(low)}`, tone: low < 0 ? 'red' : 'amber' }], format: 'money', zero: true },
            wide: true,
          },
          { title: 'Week by week', chart: { type: 'table', columns: ['Week', 'Money in', 'Money out', 'Closing cash'], rows: weeks.map((w, i) => [labels[i], egp(w.inflow), egp(w.outflow), egp(closing[i])]), numeric: [false, true, true, true], tones: closing.map((c) => (c < 0 ? 'red' : undefined)) }, wide: true },
        ],
        findings: [
          firstNeg >= 0
            ? { text: `Cash runs short in week ${firstNeg + 1} and bottoms out at ${egp(low)} in week ${lowW + 1}${bigBills.length ? `, when import bills from ${bigBills.join(' and ')} fall due` : ''}.`, action: `Ask to split the import payments, or arrange a facility of at least ${egp(Math.abs(low) * 1.2)} by week ${Math.max(1, firstNeg - 1)}.`, level: 'high' }
            : { text: `Cash stays positive; the lowest point is ${egp(low)} in week ${lowW + 1}.`, level: 'high' },
          { text: `${egp(overdue)} is already overdue from customers.`, action: `Collecting half of it in the next four weeks would lift the low point by about ${egp(overdue * 0.5)}.`, level: 'high' },
        ],
      }
    },
  },
  {
    name: 'Profit projection with what-ifs',
    needs: { high: [['pnl']], medium: [['ledger'], ['sales', 'cost']], low: [['bank']] },
    preview: 'Driver-based model of the next 12 months, run 2,000 times with uncertain growth, margin and wage rises (Monte Carlo).',
    params: [
      { key: 'growth', label: 'Sales growth', min: -10, max: 40, step: 1, value: 12, format: 'pct' },
      { key: 'wages', label: 'Wage rise', min: 0, max: 30, step: 1, value: 15, format: 'pct' },
    ],
    run: ({ ds, p }) => {
      const { pnl, estimated } = pnlOf(ds)
      const last = pnl.slice(-12)
      const r = rng(7)
      const sims = 2000
      const monthly: number[][] = Array.from({ length: 12 }, () => [])
      const totals: number[] = []
      for (let k = 0; k < sims; k++) {
        const g = r.normal(p.growth / 100, 0.06)
        const gm = r.normal(0, 0.015)
        const w = r.normal(p.wages / 100, 0.03)
        let t = 0
        last.forEach((m, i) => {
          const rev = m.revenue * (1 + g)
          const cogs = rev * (m.cogs / m.revenue - gm)
          const prof = rev - cogs - m.payroll * (1 + w) - m.rent * 1.1 - m.marketing - (m.other / m.revenue) * rev
          monthly[i].push(prof)
          t += prof
        })
        totals.push(t)
      }
      const p10 = quantile(totals, 0.1)
      const p50 = quantile(totals, 0.5)
      const p90 = quantile(totals, 0.9)
      const lastYear = sumBy(last, net)
      const lossMonths = monthly.filter((xs) => quantile(xs, 0.5) < 0).length
      const labels = monthLabels(ds, 12, months(ds))
      const lossChance = totals.filter((t) => t < 0).length / sims
      return {
        kpis: [
          { label: 'Profit, last 12 months', value: egp(lastYear) },
          { label: 'Next 12 months, most likely', value: egp(p50), note: signedPct(p50 / lastYear - 1), tone: p50 >= lastYear ? 'good' : 'bad' },
          { label: '80% range', value: `${egp(p10)} – ${egp(p90)}` },
          { label: 'Chance of a loss-making year', value: pct(lossChance, 0), tone: lossChance > 0.1 ? 'bad' : 'good' },
        ],
        charts: [
          {
            title: 'Monthly profit, next 12 months',
            chart: { type: 'line', x: labels, series: [{ name: 'Most likely', values: monthly.map((xs) => quantile(xs, 0.5)), tone: 'accent' }], band: { lo: monthly.map((xs) => quantile(xs, 0.1)), hi: monthly.map((xs) => quantile(xs, 0.9)), name: '80% range' }, format: 'money', zero: true },
            wide: true,
          },
        ],
        findings: [
          { text: `With ${signedPct(p.growth / 100, 0)} sales growth and a ${pct(p.wages / 100, 0)} wage rise, profit is most likely ${egp(p50)}: ${signedPct(p50 / lastYear - 1)} on last year.`, level: estimated ? 'medium' : 'high' },
          { text: lossMonths ? `${lossMonths} months are likely to make a loss on their own.` : 'Every month is likely to stay profitable.', action: lossMonths ? 'Plan cash for those months in advance.' : undefined, level: 'medium' },
          { text: `Each extra 5% of wage rise costs about ${egp(sumBy(last, (m) => m.payroll) * 0.05)} a year.`, level: 'high' },
        ],
        notes: estimated ? ['No profit and loss file: costs other than goods are estimates from staff and ad data. Ask the client for a P&L to firm this up.'] : [],
      }
    },
  },
  {
    name: 'Break-even',
    needs: { high: [['pnl', 'cost']], medium: [['cost'], ['pnl']] },
    params: [{ key: 'fixed', label: 'Change in fixed costs', min: -20, max: 40, step: 1, value: 0, format: 'pct' }],
    run: ({ ds, p }) => {
      const { pnl, estimated } = pnlOf(ds)
      const last3 = pnl.slice(-3)
      const rev = mean(last3.map((m) => m.revenue))
      const cmr = 1 - mean(last3.map((m) => m.cogs / m.revenue)) - mean(last3.map((m) => m.other / m.revenue))
      const fx = mean(last3.map((m) => m.payroll + m.rent + m.marketing)) * (1 + p.fixed / 100)
      const be = fx / cmr
      const safety = (rev - be) / rev
      const xs = Array.from({ length: 21 }, (_, i) => (rev * 1.6 * i) / 20)
      const beIdx = xs.findIndex((x) => x >= be)
      return {
        kpis: [
          { label: 'Monthly fixed costs', value: egp(fx) },
          { label: 'Kept from each EGP 100 of sales', value: `EGP ${(cmr * 100).toFixed(0)}`, note: 'after goods and variable costs' },
          { label: 'Break-even sales a month', value: egp(be) },
          { label: 'Safety margin', value: pct(safety, 0), note: 'how far sales can fall before a loss', tone: safety > 0.15 ? 'good' : 'bad' },
        ],
        charts: [
          {
            title: 'Monthly sales against total costs',
            chart: {
              type: 'line',
              x: xs.map((x) => egp(x)),
              series: [
                { name: 'Sales', values: xs, tone: 'accent' },
                { name: 'Total costs', values: xs.map((x) => fx + x * (1 - cmr)), tone: 'orange' },
              ],
              marks: [...(beIdx >= 0 ? [{ index: beIdx, label: 'Break-even', tone: 'amber' as Tone }] : []), { index: Math.round((rev / (rev * 1.6)) * 20), label: 'Today', tone: 'green' as Tone }],
              format: 'money',
            },
            wide: true,
          },
        ],
        findings: [
          { text: `The business needs ${egp(be)} of sales a month to cover its costs; it makes ${egp(rev)} today.`, level: estimated ? 'medium' : 'high' },
          { text: `Sales could fall ${pct(Math.max(0, safety), 0)} before the business makes a loss.`, action: safety < 0.15 ? 'Thin cushion: cut fixed costs or raise prices.' : undefined, level: 'high' },
          { text: `A new branch adding ${egp(fx * 0.15)} of fixed costs a month must sell at least ${egp((fx * 0.15) / cmr)} a month to pay for itself.`, level: 'medium' },
        ],
        notes: estimated ? ['No profit and loss file: fixed costs are estimates.'] : [],
      }
    },
  },
  {
    name: 'Exchange rate and inflation impact',
    needs: { high: [['cost', 'pnl']], medium: [['cost']] },
    params: [
      { key: 'rate', label: 'Pounds per dollar today', min: 30, max: 70, step: 0.5, value: 50, format: 'egp-rate' },
      { key: 'infl', label: 'Local cost inflation', min: 0, max: 40, step: 1, value: 12, format: 'pct' },
    ],
    run: ({ ds, p }) => {
      const s = cleanSales(ds).filter((v) => v.d >= ds.days - 365)
      const imp = new Map(ds.products.map((q) => [q.id, q.imported]))
      const rev = sumBy(s, (v) => v.qty * v.price)
      const cost = sumBy(s, (v) => v.qty * v.cost)
      const importedCost = sumBy(s, (v) => v.qty * v.cost * (imp.get(v.prod) ?? 0))
      const localCost = cost - importedCost
      const share = importedCost / cost
      const scen = [p.rate * 0.9, p.rate, p.rate * 1.1, p.rate * 1.2, p.rate * 1.3].map((x) => Math.round(x * 2) / 2)
      const margin = (rate: number) => 1 - (importedCost * (rate / p.rate) + localCost * (1 + p.infl / 100)) / rev
      const today = 1 - cost / rev
      const priceToHold = (rate: number) => (importedCost * (rate / p.rate) + localCost * (1 + p.infl / 100)) / (1 - today) / rev - 1
      return {
        kpis: [
          { label: 'Imported share of costs', value: pct(share, 0) },
          { label: 'Gross margin today', value: pct(today) },
          { label: `Margin at ${scen[3]} to the dollar`, value: pct(margin(scen[3])), tone: 'bad' },
          { label: 'Price rise to hold margin', value: signedPct(priceToHold(scen[3])), note: `at ${scen[3]}` },
        ],
        charts: [
          { title: 'Gross margin at each exchange rate', chart: { type: 'bars', labels: scen.map((x) => `EGP ${x}`), values: scen.map((x) => margin(x) * 100), format: 'num', ref: { value: today * 100, label: 'Today' }, tones: scen.map((x) => (margin(x) < today - 0.05 ? 'red' : margin(x) < today ? 'amber' : 'green')) } },
          { title: 'Scenarios', chart: { type: 'table', columns: ['Pounds per dollar', 'Gross margin', 'Price rise to keep today’s margin'], rows: scen.map((x) => [`EGP ${x}`, pct(margin(x)), signedPct(priceToHold(x))]), numeric: [true, true, true] } },
        ],
        findings: [
          { text: `${pct(share, 0)} of what the business sells is paid for in foreign currency.`, level: 'high' },
          { text: `Every 10% fall in the pound cuts gross margin by about ${pct(margin(p.rate) - margin(p.rate * 1.1), 1)} points.`, action: `Holding margin at EGP ${scen[3]} would need prices ${signedPct(priceToHold(scen[3]), 0)}.`, level: 'high' },
          { text: 'Agree a rate trigger with the client: the level at which prices are reviewed automatically.', level: 'medium' },
        ],
        notes: ['Exchange rate and inflation are scenario inputs set by the analyst, not forecasts.', ...(ds.pnl.length ? [] : ['No profit and loss file: margin is product margin only.'])],
      }
    },
  },
]

