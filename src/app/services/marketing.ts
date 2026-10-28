// Marketing: five services.

import { monthIndex } from '../lib/dates'
import { egp, num, pct, signedPct } from '../lib/format'
import { auc, groupBy, mean, normCdf, quantile, sum, sumBy } from '../lib/stats'
import { cleanSales, monthLabels } from './common'
import type { Finding, ServiceDef, Tone } from './types'

type Part = Omit<ServiceDef, 'id' | 'dept' | 'get' | 'method' | 'data' | 'missing'>

// ---------- BG/NBD (Fader, Hardie and Lee, 2005) ----------

// Log-gamma by the Lanczos approximation.
function lgamma(x: number): number {
  const g = 7
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x)
  x -= 1
  let a = c[0]
  const t = x + g + 0.5
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i)
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a)
}
const lbeta = (a: number, b: number) => lgamma(a) + lgamma(b) - lgamma(a + b)

type Rfm = { x: number; tx: number; T: number }
// x = repeat purchases, tx = time of last purchase, T = time since first purchase (weeks).
function bgnbdLL([r, alpha, a, b]: number[], c: Rfm[]) {
  let ll = 0
  for (const { x, tx, T } of c) {
    const A1 = lgamma(r + x) - lgamma(r) + r * Math.log(alpha)
    const A2 = lbeta(a, b + x) - lbeta(a, b)
    const A3 = -(r + x) * Math.log(alpha + T)
    const A4 = x > 0 ? Math.log(a) - Math.log(b + x - 1) - (r + x) * Math.log(alpha + tx) : -Infinity
    const m = Math.max(A3, A4)
    ll += A1 + A2 + m + Math.log(Math.exp(A3 - m) + (x > 0 ? Math.exp(A4 - m) : 0))
  }
  return ll
}
// Nelder-Mead on log parameters.
function fitBgnbd(c: Rfm[]) {
  const f = (v: number[]) => -bgnbdLL(v.map(Math.exp), c)
  let simplex = [[0, 2, -0.5, 0.5]]
  for (let i = 0; i < 4; i++) {
    const p = [...simplex[0]]
    p[i] += 0.8
    simplex.push(p)
  }
  let vals = simplex.map(f)
  for (let it = 0; it < 260; it++) {
    const order = vals.map((_, i) => i).sort((i, j) => vals[i] - vals[j])
    simplex = order.map((i) => simplex[i])
    vals = order.map((i) => vals[i])
    const cen = [0, 1, 2, 3].map((j) => mean(simplex.slice(0, 4).map((p) => p[j])))
    const worst = simplex[4]
    const refl = cen.map((v, j) => v + (v - worst[j]))
    const fr = f(refl)
    if (fr < vals[0]) {
      const exp = cen.map((v, j) => v + 2 * (v - worst[j]))
      const fe = f(exp)
      ;[simplex[4], vals[4]] = fe < fr ? [exp, fe] : [refl, fr]
    } else if (fr < vals[3]) [simplex[4], vals[4]] = [refl, fr]
    else {
      const con = cen.map((v, j) => v + 0.5 * (worst[j] - v))
      const fc = f(con)
      if (fc < vals[4]) [simplex[4], vals[4]] = [con, fc]
      else {
        simplex = simplex.map((p) => p.map((v, j) => simplex[0][j] + 0.5 * (v - simplex[0][j])))
        vals = simplex.map(f)
      }
    }
  }
  return simplex[0].map(Math.exp)
}
const pAlive = ([r, alpha, a, b]: number[], { x, tx, T }: Rfm) => (x === 0 ? 1 : 1 / (1 + (a / (b + x - 1)) * ((alpha + T) / (alpha + tx)) ** (r + x)))
// Gauss hypergeometric function by its series (converges for z < 1).
function hyp2f1(a: number, b: number, c: number, z: number) {
  let term = 1
  let total = 1
  for (let k = 0; k < 500 && Math.abs(term) > 1e-10; k++) {
    term *= (((a + k) * (b + k)) / ((c + k) * (k + 1))) * z
    total += term
  }
  return total
}
// Expected purchases in the next t weeks for a customer with history (x, tx, T).
function expected([r, alpha, a0, b]: number[], { x, tx, T }: Rfm, t: number) {
  const a = Math.max(a0, 1.05)
  const head = (a + b + x - 1) / (a - 1)
  const body = 1 - ((alpha + T) / (alpha + T + t)) ** (r + x) * hyp2f1(r + x, b + x, a + b + x - 1, t / (alpha + T + t))
  const tail = 1 + (x > 0 ? (a / (b + x - 1)) * ((alpha + T) / (alpha + tx)) ** (r + x) : 0)
  return Math.max(0, (head * body) / tail)
}

function rfmAt(ds: Parameters<typeof cleanSales>[0], cutoff: number) {
  const orders = new Map<string, Set<number>>()
  for (const s of cleanSales(ds)) {
    if (s.d >= cutoff) continue
    const set = orders.get(s.cust) ?? new Set<number>()
    set.add(s.d)
    orders.set(s.cust, set)
  }
  const out = new Map<string, Rfm>()
  for (const [c, days] of orders) {
    const ds_ = [...days].sort((a, b) => a - b)
    out.set(c, { x: ds_.length - 1, tx: (ds_[ds_.length - 1] - ds_[0]) / 7, T: (cutoff - ds_[0]) / 7 })
  }
  return out
}

// Weekly spend and new customers by channel, with a fitted diminishing-returns curve for each.
function channelCurves(ds: Parameters<typeof cleanSales>[0]) {
  const byCh = groupBy(ds.ads, (a) => a.channel)
  return [...byCh].map(([channel, ws]) => {
    const on = ws.filter((w) => w.spend > 0)
    let best = { err: Infinity, k: 0, s: 1 }
    const maxSpend = Math.max(...on.map((w) => w.spend), 1)
    for (let s = maxSpend * 0.1; s <= maxSpend * 4; s *= 1.08) {
      const g = on.map((w) => 1 - Math.exp(-w.spend / s))
      const k = sum(on.map((w, i) => w.newCustomers * g[i])) / (sum(g.map((v) => v * v)) || 1)
      const err = sum(on.map((w, i) => (w.newCustomers - k * g[i]) ** 2))
      if (err < best.err) best = { err, k, s }
    }
    const avgSpend = mean(ws.slice(-26).map((w) => w.spend))
    return { channel, weeks: ws, k: best.k, s: best.s, avgSpend }
  })
}

export const marketingServices: Part[] = [
  {
    name: 'Customer groups',
    needs: { high: [['sales']], medium: [['einv']] },
    run: ({ ds }) => {
      const s = cleanSales(ds).filter((v) => v.d >= ds.days - 365)
      const per = [...groupBy(s, (v) => v.cust)].map(([c, xs]) => ({ c, r: ds.days - Math.max(...xs.map((v) => v.d)), f: new Set(xs.map((v) => v.inv)).size, m: sumBy(xs, (v) => v.qty * v.price) }))
      const cuts = (vals: number[]) => [0.2, 0.4, 0.6, 0.8].map((q) => quantile(vals, q))
      const score = (qs: number[], v: number, invert = false) => {
        const k = 1 + qs.filter((q) => v > q).length
        return invert ? 6 - k : k
      }
      const rs = cuts(per.map((p) => p.r))
      const ms = cuts(per.map((p) => p.m))
      const seg = (r: number, f: number) => (r >= 4 && f >= 3 ? 'Best customers' : f >= 3 && r >= 3 ? 'Loyal' : r >= 4 ? 'New or one-time' : f >= 2 && r <= 2 ? 'At risk' : r <= 2 ? 'Lost' : 'Need attention')
      const tagged = per.map((p) => ({ ...p, seg: seg(score(rs, p.r, true), p.f >= 4 ? 5 : p.f === 3 ? 4 : p.f === 2 ? 3 : 1), ms: score(ms, p.m) }))
      const total = sumBy(tagged, (p) => p.m)
      const order = ['Best customers', 'Loyal', 'New or one-time', 'Need attention', 'At risk', 'Lost']
      const groups = order.map((name) => {
        const xs = tagged.filter((p) => p.seg === name)
        return { name, n: xs.length, rev: sumBy(xs, (p) => p.m), rec: mean(xs.map((p) => p.r)) }
      }).filter((g) => g.n)
      const repeat = per.filter((p) => p.f > 1).length / per.length
      const best = groups.find((g) => g.name === 'Best customers')
      const risk = groups.find((g) => g.name === 'At risk')
      const tones: Tone[] = groups.map((g) => (g.name === 'At risk' ? 'orange' : g.name === 'Lost' ? 'muted' : g.name === 'Best customers' ? 'green' : 'accent'))
      const findings: Finding[] = []
      if (best) findings.push({ text: `${num(best.n)} best customers (${pct(best.n / per.length, 0)}) bring ${pct(best.rev / total, 0)} of sales.`, action: 'Give them early access and a named contact.', level: 'high' })
      if (risk) findings.push({ text: `${num(risk.n)} regular customers have gone quiet; together they spent ${egp(risk.rev)} last year.`, action: 'Win-back message this month, before they become lost.', level: 'high' })
      findings.push({ text: `${pct(repeat, 0)} of customers bought more than once in the year.`, action: repeat < 0.2 ? 'Most buy once, which is normal for big purchases: focus on referrals and after-sale accessories.' : 'Repeat buying is healthy; protect it.', level: 'high' })
      return {
        kpis: [
          { label: 'Customers, last 12 months', value: num(per.length) },
          { label: 'Bought more than once', value: pct(repeat, 0) },
          { label: 'Best customers', value: best ? num(best.n) : '0', note: best ? `${pct(best.rev / total, 0)} of sales` : undefined },
          { label: 'At risk', value: risk ? num(risk.n) : '0', tone: 'bad' },
        ],
        charts: [
          { title: 'Share of sales by group', chart: { type: 'bars', horizontal: true, labels: groups.map((g) => g.name), values: groups.map((g) => (g.rev / total) * 100), format: 'num', tones } },
          { title: 'Groups', chart: { type: 'table', columns: ['Group', 'Customers', 'Sales', 'Days since last order'], rows: groups.map((g) => [g.name, num(g.n), egp(g.rev), num(g.rec)]), numeric: [false, true, true, true] } },
        ],
        findings,
      }
    },
  },
  {
    name: 'Ad channel performance',
    needs: { high: [['ads', 'sales'], ['ads', 'einv']], medium: [['ads']] },
    run: ({ ds }) => {
      const s = cleanSales(ds)
      const margin = 1 - sumBy(s, (v) => v.qty * v.cost) / sumBy(s, (v) => v.qty * v.price)
      const lastWeek = Math.max(...ds.ads.map((a) => a.w))
      const recent = ds.ads.filter((a) => a.w > lastWeek - 26)
      const rows = [...groupBy(recent, (a) => a.channel)].map(([ch, ws]) => {
        const spend = sumBy(ws, (w) => w.spend)
        const nc = sumBy(ws, (w) => w.newCustomers)
        const rev = sumBy(ws, (w) => w.revenue)
        const cac = nc ? spend / nc : Infinity
        const gpPerCust = nc ? (rev * margin) / nc : 0
        return { ch, spend, nc, rev, cac, roas: spend ? rev / spend : 0, payback: gpPerCust ? cac / gpPerCust : Infinity }
      }).filter((r) => r.spend > 0).sort((a, b) => a.cac - b.cac)
      const best = rows[0]
      const worst = rows[rows.length - 1]
      return {
        kpis: [
          { label: 'Ad spend, last 26 weeks', value: egp(sumBy(rows, (r) => r.spend)) },
          { label: 'New customers', value: num(sumBy(rows, (r) => r.nc)) },
          { label: 'Cheapest customer', value: best.ch, note: `${egp(best.cac)} each`, tone: 'good' },
          { label: 'Most expensive', value: worst.ch, note: `${egp(worst.cac)} each`, tone: 'bad' },
        ],
        charts: [
          { title: 'Cost to win one customer, last 26 weeks', chart: { type: 'bars', horizontal: true, labels: rows.map((r) => r.ch), values: rows.map((r) => r.cac), format: 'money', tones: rows.map((_, i) => (i === 0 ? 'green' : i === rows.length - 1 ? 'orange' : 'accent')) } },
          { title: 'By channel', chart: { type: 'table', columns: ['Channel', 'Spend', 'New customers', 'Cost each', 'Return on spend', 'Payback'], rows: rows.map((r) => [r.ch, egp(r.spend), num(r.nc), egp(r.cac), `${r.roas.toFixed(1)}×`, r.payback < 1 ? 'First order' : `${r.payback.toFixed(1)} orders`]), numeric: [false, true, true, true, true, true] } },
        ],
        findings: [
          { text: `${best.ch} wins customers for ${egp(best.cac)} each; ${worst.ch} costs ${egp(worst.cac)}, ${(worst.cac / best.cac).toFixed(1)} times as much.`, action: 'See the budget split before moving money: cheap channels can be close to their limit.', level: 'high' },
          { text: `Every EGP 1 spent brings back EGP ${(sumBy(rows, (r) => r.rev) / sumBy(rows, (r) => r.spend)).toFixed(1)} in first-order sales overall.`, level: 'medium' },
        ],
      }
    },
  },
  {
    name: 'Budget split across channels',
    needs: { high: [['ads']] },
    preview: 'A response curve with diminishing returns fitted to each channel’s weekly spend; budget moved EGP 1,000 at a time to wherever the next pound brings the most customers. Production runs Google Meridian with carry-over effects and uncertainty.',
    adjust: (ds) => (new Set(ds.ads.map((a) => a.w)).size < 100 ? { level: 'medium', why: 'Under two years of weekly spend: curves are rougher; confirm with a pause test.' } : null),
    run: ({ ds }) => {
      const curves = channelCurves(ds)
      const budget = sum(curves.map((c) => c.avgSpend))
      const resp = (c: (typeof curves)[number], x: number) => c.k * (1 - Math.exp(-x / c.s))
      const alloc = curves.map(() => 0)
      for (let left = budget; left >= 1000; left -= 1000) {
        const gains = curves.map((c, i) => resp(c, alloc[i] + 1000) - resp(c, alloc[i]))
        alloc[gains.indexOf(Math.max(...gains))] += 1000
      }
      const now = sum(curves.map((c) => resp(c, c.avgSpend)))
      const better = sum(curves.map((c, i) => resp(c, alloc[i])))
      const marginal = curves.map((c) => (c.k * Math.exp(-c.avgSpend / c.s) * 1000) / c.s)
      const top = marginal.indexOf(Math.max(...marginal))
      const low = marginal.indexOf(Math.min(...marginal))
      return {
        kpis: [
          { label: 'Weekly budget', value: egp(budget) },
          { label: 'Customers a week now', value: num(now, 0) },
          { label: 'With the suggested split', value: num(better, 0), note: signedPct(better / now - 1), tone: 'good' },
          { label: 'Next EGP 1,000 should go to', value: curves[top].channel },
        ],
        charts: [
          { title: 'Weekly spend: now and suggested', chart: { type: 'bars', labels: curves.map((c) => c.channel), values: curves.map((c) => c.avgSpend), extra: { name: 'Suggested', values: alloc }, format: 'money' } },
          { title: 'Customers from the next EGP 1,000', chart: { type: 'bars', horizontal: true, labels: curves.map((c) => c.channel), values: marginal, format: 'num', tones: marginal.map((_, i) => (i === top ? 'green' : i === low ? 'orange' : 'accent')) } },
        ],
        findings: [
          better / now - 1 > 0.02
            ? { text: `The same budget, split differently, could bring ${signedPct(better / now - 1, 0)} more customers a week.`, action: 'Move money in steps of 10–20% and check results after four weeks.', level: 'medium' }
            : { text: 'Today’s split is already close to the best one for this budget.', action: 'Any extra budget should go to the channel with the most customers per EGP 1,000.', level: 'medium' },
          { text: `${curves[low].channel} is close to its limit: the next EGP 1,000 there brings ${marginal[low].toFixed(1)} customers, against ${marginal[top].toFixed(1)} on ${curves[top].channel}.`, level: 'medium' },
        ],
      }
    },
  },
  {
    name: 'Customer value and churn',
    needs: { high: [['sales']], medium: [['einv']] },
    adjust: (ds) => {
      if (ds.days < 365) return { level: 'low', why: 'Under a year of orders: cohort tables only.' }
      const r = rfmAt(ds, ds.days)
      const repeat = [...r.values()].filter((x) => x.x > 0).length / r.size
      return repeat < 0.2 ? { level: 'low', why: `Only ${pct(repeat, 0)} of customers ever buy twice, so churn models don’t apply: cohort tables only.` } : null
    },
    run: ({ ds, level }) => {
      const s = cleanSales(ds)
      // Cohorts: share of each month's new customers who bought again k months later.
      const first = new Map<string, number>()
      const buyMonths = new Map<string, Set<number>>()
      for (const v of s) {
        const m = monthIndex(ds.start, v.d)
        if (!first.has(v.cust) || first.get(v.cust)! > m) first.set(v.cust, m)
        const set = buyMonths.get(v.cust) ?? new Set<number>()
        set.add(m)
        buyMonths.set(v.cust, set)
      }
      const nMonths = monthIndex(ds.start, ds.days - 1) + 1
      const cohorts = Array.from({ length: Math.min(8, nMonths - 6) }, (_, i) => nMonths - 7 - i).reverse().filter((m) => m >= 0)
      const members = new Map(cohorts.map((m) => [m, [...first].filter(([, fm]) => fm === m).map(([c]) => c)]))
      const grid = cohorts.map((m) => [1, 2, 3, 4, 5, 6].map((k) => {
        const xs = members.get(m)!
        return xs.length ? (xs.filter((c) => buyMonths.get(c)!.has(m + k)).length / xs.length) * 100 : 0
      }))
      const cohortChart = { title: 'Cohorts: % buying again, months after first order', chart: { type: 'heatmap' as const, rows: cohorts.map((m) => monthLabels(ds, 1, m)[0]), cols: ['+1', '+2', '+3', '+4', '+5', '+6'], values: grid, format: 'pct' as const } }
      const monthOne = mean(grid.map((r) => r[0])) / 100
      const now = rfmAt(ds, ds.days)
      const repeat = [...now.values()].filter((x) => x.x > 0).length / now.size
      if (level === 'low') {
        return {
          kpis: [
            { label: 'Customers', value: num(now.size) },
            { label: 'Ever bought twice', value: pct(repeat, 0), tone: 'bad' },
            { label: 'Back within a month', value: pct(monthOne, 1) },
          ],
          charts: [cohortChart],
          findings: [
            { text: `Only ${pct(repeat, 0)} of customers ever buy a second time: this is a one-purchase business.`, action: 'Value comes from referrals, after-sale accessories and service, not from repeat orders.', level: 'high' },
            { text: 'A churn model would mislabel almost everyone, so it was not run.', level: 'high' },
          ],
        }
      }
      // Few, large business customers: watch each account instead of modelling churn.
      if (now.size < 500) {
        const accounts = [...groupBy(s.filter((v) => v.d >= ds.days - 365), (v) => v.cust)].map(([c, xs]) => {
          const recent = sumBy(xs.filter((v) => v.d >= ds.days - 91), (v) => v.qty * v.price) / 3
          const before = sumBy(xs.filter((v) => v.d < ds.days - 91), (v) => v.qty * v.price) / 9
          return { c, recent, before, change: before ? recent / before - 1 : 0, last: ds.days - Math.max(...xs.map((v) => v.d)) }
        }).filter((a) => a.before > 0)
        // Only accounts big enough to matter: the smallest third swing too much month to month.
        const floor = quantile(accounts.map((a) => a.before), 0.33)
        const falling = accounts.filter((a) => a.change < -0.5 && a.before >= floor).sort((a, b) => b.before - a.before)
        const atStake = sumBy(falling, (a) => (a.before - a.recent) * 12)
        return {
          kpis: [
            { label: 'Active accounts', value: num(accounts.length) },
            { label: 'Ordering less than half as much', value: num(falling.length), tone: falling.length ? 'bad' : 'good' },
            { label: 'Sales at stake', value: egp(atStake), note: 'a year, if they don’t come back', tone: falling.length ? 'bad' : undefined },
          ],
          charts: [
            {
              title: 'Accounts whose orders fell most (last 3 months vs the 9 before)',
              chart: { type: 'table', columns: ['Account', 'Monthly before', 'Monthly now', 'Change', 'Days since last order'], rows: falling.slice(0, 10).map((a) => [a.c, egp(a.before), egp(a.recent), signedPct(a.change, 0), num(a.last)]), numeric: [false, true, true, true, true], tones: falling.slice(0, 10).map((a) => (a.recent === 0 ? 'red' : 'orange')) },
              wide: true,
            },
          ],
          findings: [
            falling.length
              ? { text: `${falling.length} accounts now order less than half what they used to; ${falling.filter((a) => a.recent === 0).length} have stopped completely.`, action: 'A sales visit this month: ask what changed, before the competitor’s terms become habit.', level: 'high' }
              : { text: 'No account has cut its orders sharply.', level: 'high' },
            { text: 'With a small number of business customers, each account is watched one by one instead of using a churn model.', level: 'high' },
          ],
        }
      }
      const H = 90 / 7
      // Fitting on every customer is slow in the browser; an even sample fits the same curve.
      const sampleOf = <T,>(xs: T[]) => xs.filter((_, i) => i % Math.max(1, Math.floor(xs.length / 2500)) === 0)
      const params = fitBgnbd(sampleOf([...now.values()]))
      // Test: fit on data up to 90 days ago, then check who actually bought in the last 90 days.
      const before = rfmAt(ds, ds.days - 90)
      const back = new Set(s.filter((v) => v.d >= ds.days - 90).map((v) => v.cust))
      const testIds = sampleOf([...before.keys()])
      const p2 = fitBgnbd(testIds.map((c) => before.get(c)!))
      const score = auc(testIds.map((c) => expected(p2, before.get(c)!, H)), testIds.map((c) => (back.has(c) ? 1 : 0)))
      const per = [...now].map(([c, r]) => {
        const e = expected(params, r, H)
        return { c, r, alive: pAlive(params, r), prob: 1 - Math.exp(-e) }
      })
      const lost = per.filter((p) => p.prob < 0.05)
      const fading = per.filter((p) => p.r.x >= 1 && p.alive >= 0.2 && p.alive < 0.7)
      // What the fading regulars actually spent in the last 12 months.
      const spent = new Map<string, number>()
      for (const v of s) if (v.d >= ds.days - 365) spent.set(v.cust, (spent.get(v.cust) ?? 0) + v.qty * v.price)
      const atRisk = sumBy(fading, (p) => spent.get(p.c) ?? 0)
      const buckets = [0.05, 0.15, 0.3, 0.5, 1.01]
      const dist = buckets.map((b, i) => per.filter((p) => p.prob < b && p.prob >= (i ? buckets[i - 1] : 0)).length)
      return {
        kpis: [
          { label: 'Customers', value: num(per.length), note: `${pct(repeat, 0)} have bought twice or more` },
          { label: 'Probably lost', value: pct(lost.length / per.length, 0), note: 'under 5% chance of buying in 90 days', tone: 'bad' },
          { label: 'Regulars fading', value: num(fading.length), note: `spent ${egp(atRisk)} last year` },
          { label: 'Test: who comes back', value: `AUC ${score.toFixed(2)}`, tone: score > 0.7 ? 'good' : 'bad' },
        ],
        charts: [
          { title: 'Chance each customer buys in the next 90 days', chart: { type: 'bars', labels: ['<5%', '5–15%', '15–30%', '30–50%', '>50%'], values: dist, format: 'num', tones: ['muted', 'orange', 'amber', 'accent', 'green'] } },
          cohortChart,
        ],
        findings: [
          { text: `${num(fading.length)} regular customers are fading: they used to buy often but have gone quiet. Together they spent ${egp(atRisk)} in the last 12 months.`, action: 'Send them a personal offer now; it is too late for the lost group.', level: score > 0.7 ? 'high' : 'medium' },
          { text: `About ${pct(lost.length / per.length, 0)} of past customers have probably stopped buying for good.`, level: 'medium' },
          { text: `${pct(monthOne, 0)} of new customers buy again within their first month, and fewer each month after.`, action: 'A reminder 3–5 weeks after the first order is the cheapest lever.', level: 'high' },
        ],
        accuracy: `Fitted on data up to 90 days ago, then checked against who actually bought in the last 90 days: AUC ${score.toFixed(2)} (0.5 is a coin toss, 1.0 is perfect).`,
      }
    },
  },
  {
    name: 'A/B test check',
    needs: { high: [['abtest']] },
    run: ({ ds }) => {
      const t = ds.abtest!
      const pa = t.a.conversions / t.a.visitors
      const pb = t.b.conversions / t.b.visitors
      const pool = (t.a.conversions + t.b.conversions) / (t.a.visitors + t.b.visitors)
      const se0 = Math.sqrt(pool * (1 - pool) * (1 / t.a.visitors + 1 / t.b.visitors))
      const z = (pb - pa) / se0
      const p = 2 * (1 - normCdf(Math.abs(z)))
      const se = Math.sqrt((pa * (1 - pa)) / t.a.visitors + (pb * (1 - pb)) / t.b.visitors)
      const lo = pb - pa - 1.96 * se
      const hi = pb - pa + 1.96 * se
      const win = p < 0.05
      return {
        kpis: [
          { label: 'Version A', value: pct(pa, 2), note: `${num(t.a.conversions)} of ${num(t.a.visitors)}` },
          { label: 'Version B', value: pct(pb, 2), note: `${num(t.b.conversions)} of ${num(t.b.visitors)}` },
          { label: 'Lift', value: signedPct(pb / pa - 1), tone: win ? 'good' : undefined },
          { label: 'p-value', value: p < 0.001 ? '< 0.001' : p.toFixed(3), note: 'chance of a gap this big if there were no real difference', tone: win ? 'good' : 'bad' },
        ],
        charts: [{ title: `${t.name}: ${t.metric.toLowerCase()}`, chart: { type: 'bars', labels: ['Version A', 'Version B'], values: [pa * 100, pb * 100], format: 'num', tones: ['muted', win ? 'green' : 'accent'] } }],
        findings: [
          win
            ? { text: `Version B really is better: ${signedPct(pb / pa - 1)} more orders per visitor.`, action: 'Switch everyone to version B.', level: 'high' }
            : { text: 'The difference could easily be luck.', action: 'Keep the test running or test a bolder change.', level: 'medium' },
          { text: `The true gain is most likely between ${signedPct(lo / pa)} and ${signedPct(hi / pa)}.`, level: 'high' },
        ],
      }
    },
  },
]
