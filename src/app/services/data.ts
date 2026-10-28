// Data analysis: seven services.

import { calMonth, DAYS, inRamadan, monthIndex, monthName, preRamadan, weekday } from '../lib/dates'
import { egp, num, pct, signedPct } from '../lib/format'
import { groupBy, mean, movingAverage, ols, sum, sumBy } from '../lib/stats'
import { cleanSales, monthLabels, monthlyRevenue, months, productName } from './common'
import type { Finding, Kpi, ServiceDef } from './types'

type Part = Omit<ServiceDef, 'id' | 'dept' | 'get' | 'method' | 'data' | 'missing'>

const ANY: Part['needs'] = { high: [['sales'], ['einv'], ['ledger'], ['bank'], ['payroll'], ['staff'], ['ads'], ['pnl']] }

const normName = (s: string) =>
  s
    .toLowerCase()
    .replace(/[.-]/g, ' ')
    .replace(/^el /, 'al ')
    .replace(/\s+/g, ' ')
    .trim()

export const dataServices: Part[] = [
  {
    name: 'Data health check',
    needs: ANY,
    run: ({ ds, client }) => {
      const rows: (string | number)[][] = []
      const findings: Finding[] = []
      let penalty = 0
      for (const f of client.files(ds)) {
        const issues: string[] = []
        if (f.kind === 'sales') {
          const seen = new Set<string>()
          let dup = 0
          for (const s of ds.sales) {
            const k = `${s.d}|${s.inv}|${s.prod}|${s.qty}|${s.price}`
            if (seen.has(k)) dup++
            seen.add(k)
          }
          const returns = ds.sales.filter((s) => s.qty < 0).length
          const noBranch = ds.sales.filter((s) => !s.branch).length
          if (dup) issues.push(`${dup} repeated rows`)
          if (returns) issues.push(`${returns} returns entered as negative quantities`)
          if (noBranch) issues.push(`${noBranch} rows with no branch`)
          penalty += dup * 0.05 + noBranch * 0.1 + returns * 0.02
          if (dup) findings.push({ text: `${dup} sales rows appear twice in the export.`, action: 'Removed before analysis. Ask the client whether their system double-posts.', level: 'high' })
        }
        if (f.kind === 'einv') {
          const nos = ds.einv.map((e) => e.no).sort((a, b) => a - b)
          let gaps = 0
          for (let i = 1; i < nos.length; i++) gaps += Math.max(0, nos[i] - nos[i - 1] - 1)
          const variants = new Set(ds.einv.map((e) => e.cust)).size - new Set(ds.einv.map((e) => normName(e.cust))).size
          if (gaps) issues.push(`${gaps} missing invoice numbers`)
          if (variants) issues.push(`${variants} customer names typed more than one way`)
          penalty += gaps * 0.3 + variants * 0.1
          if (gaps) findings.push({ text: `${gaps} invoice numbers are missing from the sequence.`, action: 'Ask for the cancelled-invoice log. Unexplained gaps are a tax-audit risk.', level: 'high' })
        }
        if (f.kind === 'ledger') {
          const refs = groupBy(ds.ledger, (l) => l.ref)
          const dupRefs = [...refs.values()].filter((v) => v.length > 1).length
          if (dupRefs) issues.push(`${dupRefs} references used twice`)
          penalty += dupRefs * 0.2
        }
        if (f.kind === 'bank') {
          const noRef = ds.bank.filter((b) => !b.ref).length
          if (noRef) issues.push(`${noRef} deposits with no reference`)
          penalty += noRef * 0.2
        }
        if (f.kind === 'payroll') {
          const ids = new Set(ds.staff.map((s) => s.id))
          const unknown = new Set(ds.payroll.filter((p) => !ids.has(p.emp)).map((p) => p.emp)).size
          if (unknown) issues.push(`${unknown} paid person not on the staff list`)
          penalty += unknown * 3
          if (unknown) findings.push({ text: 'Someone is on the payroll but not on the staff list.', action: 'Flagged for the payroll error scan.', level: 'high' })
        }
        rows.push([f.name, num(f.rows), issues.length ? issues.join(' · ') : 'No problems found'])
      }
      const score = Math.max(40, Math.round(100 - penalty))
      findings.unshift({
        text: score >= 85 ? `The files are in good shape: a score of ${score} out of 100.` : `The files need cleaning first: a score of ${score} out of 100.`,
        action: 'Every problem below is fixed or set aside automatically and listed in the report appendix.',
        level: 'high',
      })
      const totalRows = sum(client.files(ds).map((f) => f.rows))
      return {
        kpis: [
          { label: 'Health score', value: `${score} / 100`, tone: score >= 85 ? 'good' : 'bad' },
          { label: 'Files checked', value: String(client.files(ds).length) },
          { label: 'Rows checked', value: num(totalRows) },
          { label: 'Files with problems', value: String(rows.filter((r) => r[2] !== 'No problems found').length) },
        ],
        charts: [{ title: 'File by file', chart: { type: 'table', columns: ['File', 'Rows', 'What we found'], rows, numeric: [false, true, false] }, wide: true }],
        findings,
      }
    },
  },
  {
    name: 'Business snapshot',
    needs: { high: [['sales']], medium: [['einv']] },
    run: ({ ds }) => {
      const s = cleanSales(ds)
      const rev = monthlyRevenue(ds)
      const n = rev.length
      const last12 = sum(rev.slice(-12))
      const prev12 = n >= 24 ? sum(rev.slice(-24, -12)) : NaN
      const recent = s.filter((x) => x.d >= ds.days - 365)
      const byProd = [...groupBy(recent, (x) => x.prod)].map(([id, xs]) => ({ id, rev: sumBy(xs, (x) => x.qty * x.price) })).sort((a, b) => b.rev - a.rev)
      const orders = new Set(recent.map((x) => x.inv)).size
      const custs = new Set(recent.map((x) => x.cust)).size
      const byBranch = [...groupBy(recent, (x) => x.branch)].map(([b, xs]) => ({ b, rev: sumBy(xs, (x) => x.qty * x.price) })).sort((a, b) => b.rev - a.rev)
      const top5 = byProd.slice(0, 5)
      const top5share = sum(top5.map((p) => p.rev)) / last12
      const kpis: Kpi[] = [
        { label: 'Sales, last 12 months', value: egp(last12), note: isFinite(prev12) ? `${signedPct(last12 / prev12 - 1)} on the year before` : `${n} months of data`, tone: isFinite(prev12) && last12 > prev12 ? 'good' : undefined },
        { label: 'Orders', value: num(orders) },
        { label: 'Average order', value: egp(last12 / orders) },
        { label: 'Customers', value: num(custs) },
      ]
      const findings: Finding[] = [
        { text: `Five products bring ${pct(top5share, 0)} of sales, led by ${productName(ds, top5[0].id)}.`, action: 'Keep these in stock first; they carry the business.', level: 'high' },
      ]
      if (isFinite(prev12)) findings.unshift({ text: `Sales grew ${signedPct(last12 / prev12 - 1)} over the last 12 months.`, level: 'high' })
      if (byBranch.length > 1) {
        const w = byBranch[byBranch.length - 1]
        findings.push({ text: `${byBranch[0].b} sells the most; ${w.b} the least (${pct(w.rev / last12, 0)} of sales).`, action: 'See branch benchmarking for a fair comparison by size.', level: 'medium' })
      }
      return {
        kpis,
        charts: [
          { title: 'Monthly sales', chart: { type: 'line', x: monthLabels(ds), series: [{ name: 'Sales', values: rev, tone: 'accent' }], format: 'money', zero: true }, wide: true },
          { title: 'Top products, last 12 months', chart: { type: 'bars', horizontal: true, labels: top5.map((p) => productName(ds, p.id)), values: top5.map((p) => p.rev), format: 'money' } },
          byBranch.length > 1
            ? { title: 'Sales by branch, last 12 months', chart: { type: 'bars', horizontal: true, labels: byBranch.map((b) => b.b), values: byBranch.map((b) => b.rev), format: 'money', tones: byBranch.map((_, i) => (i === byBranch.length - 1 ? 'orange' : 'accent')) } }
            : {
                title: 'Top customers, last 12 months',
                chart: (() => {
                  const top = [...groupBy(recent, (x) => x.cust)].map(([c, xs]) => ({ c, rev: sumBy(xs, (x) => x.qty * x.price) })).sort((a, b) => b.rev - a.rev).slice(0, 6)
                  return { type: 'bars', horizontal: true, labels: top.map((t) => t.c), values: top.map((t) => t.rev), format: 'money' }
                })(),
              },
        ],
        findings,
      }
    },
  },
  {
    name: 'Data cleaning and merging',
    needs: { high: [['sales'], ['einv'], ['ledger']] },
    run: ({ ds }) => {
      const raw = ds.sales.length
      const clean = cleanSales(ds).length
      const returns = ds.sales.filter((s) => s.qty < 0).length
      const dup = raw - clean - returns
      const names = [...new Set(ds.einv.map((e) => e.cust))]
      const groups = groupBy(names, normName)
      const merged = [...groups.values()].filter((g) => g.length > 1)
      const examples = merged.slice(0, 8).map((g) => {
        const canonical = g.find((x) => /^[A-Z][a-z]/.test(x) && !x.endsWith('.') && !x.includes('-')) ?? g[0]
        return [g.filter((x) => x !== canonical).join(' · '), canonical, String(g.length)]
      })
      const unknownBranch = cleanSales(ds).filter((s) => s.branch === 'Unknown').length
      const findings: Finding[] = [{ text: `${num(raw)} rows in, ${num(clean)} clean rows out.`, action: 'The clean table is what every other service uses.', level: 'high' }]
      if (merged.length) findings.push({ text: `${merged.length} customers were typed in more than one way and are now merged.`, action: 'Customer totals and rankings are now correct.', level: 'high' })
      if (dup > 0) findings.push({ text: `${num(dup)} repeated rows removed.`, level: 'high' })
      if (returns) findings.push({ text: `${returns} returns moved to their own table so they don’t count as sales.`, level: 'high' })
      if (unknownBranch) findings.push({ text: `${unknownBranch} rows had no branch; marked “Unknown” rather than guessed.`, level: 'medium' })
      return {
        kpis: [
          { label: 'Rows in', value: num(raw) },
          { label: 'Clean rows out', value: num(clean) },
          { label: 'Repeated rows removed', value: num(Math.max(0, dup)) },
          { label: 'Customer names merged', value: num(merged.length) },
        ],
        charts: merged.length
          ? [{ title: 'Names merged (examples)', chart: { type: 'table', columns: ['Typed as', 'Merged into', 'Spellings'], rows: examples, numeric: [false, false, true] }, wide: true }]
          : [{ title: 'Cleaning steps', chart: { type: 'table', columns: ['Step', 'Rows affected'], rows: [['Repeated rows removed', num(Math.max(0, dup))], ['Returns separated', num(returns)], ['Missing branch marked', num(unknownBranch)]], numeric: [false, true] }, wide: true }],
        findings,
      }
    },
  },
  {
    name: 'KPI dashboard',
    needs: { high: [['sales', 'pnl']], medium: [['sales'], ['einv']] },
    run: ({ ds }) => {
      const s = cleanSales(ds)
      const n = months(ds)
      const per = Array.from({ length: n }, () => ({ rev: 0, cost: 0, orders: new Set<string>(), custs: new Set<string>() }))
      for (const x of s) {
        const m = per[monthIndex(ds.start, x.d)]
        m.rev += x.qty * x.price
        m.cost += x.qty * x.cost
        m.orders.add(x.inv)
        m.custs.add(x.cust)
      }
      const labels = monthLabels(ds)
      // Target: the same month last year plus the business's typical growth.
      const growth = n >= 24 ? sum(per.slice(-12).map((m) => m.rev)) / sum(per.slice(-24, -12).map((m) => m.rev)) : 1.1
      const target = per.map((_, i) => (i >= 12 ? per[i - 12].rev * growth : null))
      const rows = per.slice(-6).map((m, k) => {
        const i = n - 6 + k
        const t = target[i]
        return [labels[i], egp(m.rev), pct((m.rev - m.cost) / m.rev), num(m.orders.size), egp(m.rev / m.orders.size), t ? signedPct(m.rev / t - 1) : '–']
      })
      const last = per[n - 1]
      const lt = target[n - 1]
      const hit = per.slice(-6).filter((m, k) => {
        const t = target[n - 6 + k]
        return t !== null && m.rev >= t
      }).length
      return {
        kpis: [
          { label: `Sales, ${labels[n - 1]}`, value: egp(last.rev), note: lt ? `${signedPct(last.rev / lt - 1)} vs target` : undefined, tone: lt && last.rev >= lt ? 'good' : 'bad' },
          { label: 'Gross margin', value: pct((last.rev - last.cost) / last.rev) },
          { label: 'Orders', value: num(last.orders.size) },
          { label: 'Targets met, last 6 months', value: `${hit} of 6`, tone: hit >= 4 ? 'good' : 'bad' },
        ],
        charts: [
          { title: 'Sales against suggested target', chart: { type: 'line', x: labels, series: [{ name: 'Sales', values: per.map((m) => m.rev), tone: 'accent' }, { name: 'Target', values: target, tone: 'muted', dashed: true }], format: 'money', zero: true }, wide: true },
          { title: 'Last six months', chart: { type: 'table', columns: ['Month', 'Sales', 'Margin', 'Orders', 'Avg order', 'vs target'], rows, numeric: [false, true, true, true, true, true] }, wide: true },
        ],
        findings: [
          { text: `Suggested target: the same month last year plus ${signedPct(growth - 1, 0)}, the business’s own growth rate.`, action: 'Agree targets with the client; the dashboard refreshes every month.', level: n >= 24 ? 'high' : 'medium' },
          { text: `Targets met in ${hit} of the last 6 months.`, level: 'high' },
        ],
      }
    },
  },
  {
    name: 'Trends and seasonality',
    needs: { high: [['sales']], medium: [['einv']] },
    adjust: (ds) => (months(ds) < 24 ? { level: 'medium', why: 'Under two years of data: monthly pattern from one or two seasons only.' } : null),
    run: ({ ds }) => {
      const s = cleanSales(ds)
      const rev = monthlyRevenue(ds)
      const trend = movingAverage(rev, 3)
      const daily = Array(ds.days).fill(0)
      for (const x of s) daily[x.d] += x.qty * x.price
      const avg = mean(daily)
      const wd = DAYS.map((_, k) => mean(daily.filter((_, d) => weekday(ds.start, d) === k)) / avg)
      const byCal = Array.from({ length: 12 }, (_, m) => {
        const days = daily.filter((_, d) => calMonth(ds.start, d) === m)
        return days.length ? mean(days) / avg : 0
      })
      const ram = mean(daily.filter((_, d) => inRamadan(ds.start, d)))
      const pre = mean(daily.filter((_, d) => preRamadan(ds.start, d)))
      const other = mean(daily.filter((_, d) => !inRamadan(ds.start, d) && !preRamadan(ds.start, d)))
      const order = byCal.map((v, m) => ({ v, m })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v)
      const bestDay = wd.map((v, k) => ({ v, k })).sort((a, b) => b.v - a.v)
      return {
        kpis: [
          { label: 'Strongest month', value: monthName(order[0].m), note: `${signedPct(order[0].v - 1, 0)} on an average month` },
          { label: 'Weakest month', value: monthName(order[order.length - 1].m), note: signedPct(order[order.length - 1].v - 1, 0) },
          { label: 'Two weeks before Ramadan', value: signedPct(pre / other - 1, 0), tone: 'good' },
          { label: 'During Ramadan', value: signedPct(ram / other - 1, 0), tone: ram < other ? 'bad' : 'good' },
        ],
        charts: [
          { title: 'Monthly sales and underlying trend', chart: { type: 'line', x: monthLabels(ds), series: [{ name: 'Sales', values: rev, tone: 'muted' }, { name: '3-month trend', values: trend.map((v) => (isNaN(v) ? null : v)), tone: 'accent' }], format: 'money', zero: true }, wide: true },
          { title: 'Day of the week (100 = average day)', chart: { type: 'bars', labels: DAYS, values: wd.map((v) => v * 100), format: 'num', ref: { value: 100, label: 'Average' }, tones: wd.map((v) => (v >= 1.1 ? 'accent' : v < 0.95 ? 'muted' : 'accent')) } },
          { title: 'Month of the year (100 = average)', chart: { type: 'bars', labels: byCal.map((_, m) => monthName(m)), values: byCal.map((v) => v * 100), format: 'num', ref: { value: 100, label: 'Average' } } },
        ],
        findings: [
          bestDay[0].v > 1.05
            ? { text: `${DAYS[bestDay[0].k]} and ${DAYS[bestDay[1].k]} are the busiest days: ${signedPct(bestDay[0].v - 1, 0)} and ${signedPct(bestDay[1].v - 1, 0)} on an average day.`, action: 'Put the strongest staff on these days.', level: 'high' }
            : { text: 'There is no real weekday pattern: every day sells about the same.', level: 'high' },
          { text: `Sales jump ${signedPct(pre / other - 1, 0)} in the two weeks before Ramadan and change ${signedPct(ram / other - 1, 0)} during it.`, action: 'Order stock and plan campaigns six weeks ahead of Ramadan.', level: 'high' },
          { text: `${monthName(order[0].m)} is the strongest month and ${monthName(order[order.length - 1].m)} the weakest.`, level: months(ds) >= 24 ? 'high' : 'medium' },
        ],
      }
    },
  },
  {
    name: 'Driver analysis',
    needs: { high: [['sales']], medium: [['einv']] },
    preview: 'Multiple regression on daily sales. Contributions are exact for a linear model, which is what SHAP reduces to here.',
    run: ({ ds }) => {
      const s = cleanSales(ds)
      const daily = Array(ds.days).fill(0)
      const promo = Array(ds.days).fill(0)
      const priceSum = Array(ds.days).fill(0)
      const priceN = Array(ds.days).fill(0)
      const base = new Map(ds.products.map((p) => [p.id, p.price]))
      for (const x of s) {
        daily[x.d] += x.qty * x.price
        if (x.promo) promo[x.d] = 1
        priceSum[x.d] += x.price / (base.get(x.prod) ?? x.price)
        priceN[x.d]++
      }
      const open = daily.map((v, d) => ({ v, d })).filter((x) => x.v > 0)
      const candidates: { name: string; f: (d: number) => number; unit: string }[] = [
        { name: 'Weekend (Fri–Sat)', f: (d) => (weekday(ds.start, d) >= 5 ? 1 : 0), unit: 'day' },
        { name: 'Thursday', f: (d) => (weekday(ds.start, d) === 4 ? 1 : 0), unit: 'day' },
        { name: 'Promotion running', f: (d) => promo[d], unit: 'day' },
        { name: 'Two weeks before Ramadan', f: (d) => (preRamadan(ds.start, d) ? 1 : 0), unit: 'day' },
        { name: 'During Ramadan', f: (d) => (inRamadan(ds.start, d) ? 1 : 0), unit: 'day' },
        { name: 'Price level (+10%)', f: (d) => (priceN[d] ? (priceSum[d] / priceN[d] - 1) * 10 : 0), unit: '10% higher prices' },
        { name: 'Growth per month', f: (d) => d / 30.4, unit: 'month' },
      ]
      const corr = (u: number[], v: number[]) => {
        const mu = mean(u)
        const mv = mean(v)
        const cov = sum(u.map((x, i) => (x - mu) * (v[i] - mv)))
        return cov / Math.sqrt(sum(u.map((x) => (x - mu) ** 2)) * sum(v.map((x) => (x - mv) ** 2)) || 1)
      }
      const feats: typeof candidates = []
      for (const ft of candidates) {
        const vals = open.map((x) => ft.f(x.d))
        if (Math.max(...vals) === Math.min(...vals)) continue
        if (feats.some((k) => Math.abs(corr(vals, open.map((x) => k.f(x.d)))) > 0.85)) continue
        feats.push(ft)
      }
      const X = open.map((x) => feats.map((ft) => ft.f(x.d)))
      const y = open.map((x) => x.v)
      const { beta, se, r2 } = ols(X, y)
      const effects = feats.map((ft, i) => ({ name: ft.name, b: beta[i + 1], sig: Math.abs(beta[i + 1] / (se[i + 1] || 1)) > 2, unit: ft.unit }))
      const sorted = [...effects].sort((a, b) => Math.abs(b.b) - Math.abs(a.b))
      const findings: Finding[] = sorted.slice(0, 4).map((e) => ({
        text: `${e.name}: ${e.b >= 0 ? '+' : '−'}${egp(Math.abs(e.b))} a day${e.unit !== 'day' ? ` per ${e.unit}` : ''}.`,
        level: e.sig ? 'high' : 'low',
      }))
      if (r2 < 0.3) findings.unshift({ text: `Calendar and price explain only ${pct(r2, 0)} of the day-to-day swings: sales here depend on when customers order, not on the day.`, action: 'Look at customer-level drivers instead (account watch, customer groups).', level: 'medium' })
      const priceEff = effects.find((e) => e.name.startsWith('Price'))
      if (priceEff && priceEff.b < 0) findings.push({ text: 'Higher prices cost some volume, but less than the price gain: revenue still rises.', action: 'Use the price what-if to test the next change.', level: 'medium' })
      return {
        kpis: [
          { label: 'Explained by these factors', value: pct(r2, 0), note: 'R² on daily sales' },
          { label: 'Biggest driver', value: sorted[0].name },
          { label: 'Days analysed', value: num(open.length) },
        ],
        charts: [{ title: 'Effect on daily sales (EGP)', chart: { type: 'bars', horizontal: true, labels: effects.map((e) => e.name), values: effects.map((e) => e.b), format: 'money', tones: effects.map((e) => (!e.sig ? 'muted' : e.b >= 0 ? 'green' : 'red')) } }],
        findings,
        notes: ['Grey bars are not statistically clear (|t| < 2): treat as noise.'],
      }
    },
  },
  {
    name: 'Branch and product benchmarking',
    needs: { high: [['sales', 'branches']], medium: [['sales'], ['einv']] },
    run: ({ ds }) => {
      const recent = cleanSales(ds).filter((x) => x.d >= ds.days - 365)
      if (ds.branches.length) {
        const rows = ds.branches.map((b) => {
          const xs = recent.filter((x) => x.branch === b.id)
          const rev = sumBy(xs, (x) => x.qty * x.price)
          return { b, rev, perSqm: rev / b.sqm, perStaff: rev / b.staff }
        })
        const avgSqm = mean(rows.map((r) => r.perSqm))
        const sorted = [...rows].sort((a, b) => b.perSqm - a.perSqm)
        const worst = sorted[sorted.length - 1]
        const best = sorted[0]
        return {
          kpis: [
            { label: 'Best per m²', value: best.b.name, note: `${egp(best.perSqm)} a year` },
            { label: 'Weakest per m²', value: worst.b.name, note: `${pct(worst.perSqm / avgSqm, 0)} of average`, tone: 'bad' },
            { label: 'Average per m²', value: egp(avgSqm) },
          ],
          charts: [
            { title: 'Sales per m², last 12 months (index, 100 = average)', chart: { type: 'bars', labels: sorted.map((r) => r.b.name), values: sorted.map((r) => (r.perSqm / avgSqm) * 100), format: 'num', ref: { value: 100, label: 'Average' }, tones: sorted.map((r) => (r.perSqm / avgSqm < 0.75 ? 'orange' : 'accent')) } },
            { title: 'Branch comparison', chart: { type: 'table', columns: ['Branch', 'Sales', 'Area m²', 'Per m²', 'Staff', 'Per person'], rows: sorted.map((r) => [r.b.name, egp(r.rev), num(r.b.sqm), egp(r.perSqm), String(r.b.staff), egp(r.perStaff)]), numeric: [false, true, true, true, true, true] } },
          ],
          findings: [
            { text: `${worst.b.name} sells ${pct(1 - worst.perSqm / avgSqm, 0)} less per m² than the average branch.`, action: 'Before opening a seventh branch, find out why: location, layout or staffing.', level: 'high' },
            { text: `${best.b.name} is the model branch: ${egp(best.perSqm)} per m² a year.`, level: 'high' },
          ],
        }
      }
      const byCat = [...groupBy(recent, (x) => productName(ds, x.prod))].map(([name, xs]) => {
        const rev = sumBy(xs, (x) => x.qty * x.price)
        return { name, rev, margin: (rev - sumBy(xs, (x) => x.qty * x.cost)) / rev, units: sumBy(xs, (x) => x.qty) }
      })
      const avg = mean(byCat.map((c) => c.margin))
      const sorted = byCat.sort((a, b) => b.rev - a.rev)
      const low = [...byCat].sort((a, b) => a.margin - b.margin)[0]
      return {
        kpis: [
          { label: 'Products compared', value: String(byCat.length) },
          { label: 'Average margin', value: pct(avg) },
          { label: 'Lowest margin', value: low.name, note: pct(low.margin), tone: 'bad' },
        ],
        charts: [{ title: 'Products, last 12 months', chart: { type: 'table', columns: ['Product', 'Sales', 'Units', 'Margin'], rows: sorted.map((c) => [c.name, egp(c.rev), num(c.units), pct(c.margin)]), numeric: [false, true, true, true] }, wide: true }],
        findings: [{ text: `${low.name} has the thinnest margin, ${pct(low.margin)}.`, action: 'Check its price and cost first in the price what-if.', level: 'medium' }],
        notes: ['No branch details: products are compared instead of branches.'],
      }
    },
  },
]
