// Sales: four services.

import { inRamadan, preRamadan, weekday } from '../lib/dates'
import { egp, num, pct, signedPct } from '../lib/format'
import { croston, groupBy, holtWinters, mape, mean, normInv, ols, sd, seasonalNaive, sum, sumBy } from '../lib/stats'
import { cleanSales, monthLabels, monthlyRevenue, months, productName } from './common'
import type { Dataset } from '../data/types'
import type { Finding, ServiceDef, Tone } from './types'

type Part = Omit<ServiceDef, 'id' | 'dept' | 'get' | 'method' | 'data' | 'missing'>

// Holt's linear trend, for histories too short for a seasonal model.
function holt(y: number[], horizon: number) {
  let best = { err: Infinity, a: 0.3, b: 0.1 }
  const run = (a: number, b: number, h: number) => {
    let level = y[0]
    let trend = y[1] - y[0]
    let err = 0
    const fitted: number[] = [y[0]]
    for (let t = 1; t < y.length; t++) {
      const f = level + trend
      fitted.push(f)
      err += (y[t] - f) ** 2
      const prev = level
      level = a * y[t] + (1 - a) * (level + trend)
      trend = b * (level - prev) + (1 - b) * trend
    }
    return { err, fitted, forecast: Array.from({ length: h }, (_, i) => level + (i + 1) * trend) }
  }
  for (const a of [0.2, 0.4, 0.6, 0.8]) for (const b of [0.05, 0.1, 0.3]) if (run(a, b, 0).err < best.err) best = { err: run(a, b, 0).err, a, b }
  const out = run(best.a, best.b, horizon)
  return { ...out, sigma: sd(y.map((v, i) => v - out.fitted[i])) }
}

type Model = { name: string; fit: (y: number[], h: number) => { forecast: number[]; sigma: number } }

// Monthly regression on trend, the yearly cycle and the number of Ramadan and pre-Ramadan days in each month.
// Ramadan moves about 11 days earlier every year, which a plain seasonal model can't follow.
function ramadanModel(ds: Dataset): Model {
  const feats = (m: number) => {
    let ram = 0
    let pre = 0
    for (let d = Math.round(m * 30.44); d < Math.round((m + 1) * 30.44); d++) {
      if (inRamadan(ds.start, d)) ram++
      if (preRamadan(ds.start, d)) pre++
    }
    const cal = (new Date(ds.start).getUTCMonth() + m) % 12
    return [m, Math.sin((2 * Math.PI * cal) / 12), Math.cos((2 * Math.PI * cal) / 12), Math.sin((4 * Math.PI * cal) / 12), Math.cos((4 * Math.PI * cal) / 12), ram, pre]
  }
  return {
    name: 'Regression with Ramadan calendar',
    fit: (y, h) => {
      const X = y.map((_, m) => feats(m))
      const { beta, fit } = ols(X, y)
      const forecast = Array.from({ length: h }, (_, i) => sum([1, ...feats(y.length + i)].map((v, j) => v * beta[j])))
      return { forecast, sigma: sd(y.map((v, i) => v - fit[i])) }
    },
  }
}

function models(ds: Dataset, n: number): Model[] {
  const list: Model[] = [{ name: 'Holt (trend)', fit: (y, h) => holt(y, h) }]
  if (n >= 15) list.push(ramadanModel(ds))
  if (n >= 30) {
    list.unshift({ name: 'Holt-Winters (ETS)', fit: (y, h) => holtWinters(y, 12, h) })
    list.push({
      name: 'Seasonal naive',
      fit: (y, h) => {
        const f = seasonalNaive(y, 12, h)
        const past = seasonalNaive(y.slice(0, -12), 12, 12)
        return { forecast: f, sigma: sd(y.slice(-12).map((v, i) => v - past[i])) }
      },
    })
  }
  return list
}

export const salesServices: Part[] = [
  {
    name: 'Sales forecast, 3 to 12 months',
    needs: { high: [['sales'], ['einv']], medium: [['bank']] },
    preview: 'Holt-Winters (ETS), a regression that follows the moving Ramadan calendar, seasonal naive and Holt’s trend, each tested on the last 6 months; the most accurate one is used. Production adds ARIMA, Prophet and Chronos to the same contest.',
    params: [{ key: 'h', label: 'Months ahead', min: 3, max: 12, step: 1, value: 6, format: 'num' }],
    adjust: (ds) => (months(ds) < 24 ? { level: 'medium', why: 'Under two years of history: no seasonal model, wider ranges.' } : null),
    run: ({ ds, p }) => {
      const y = monthlyRevenue(ds)
      const n = y.length
      const h = p.h
      const test = 6
      const scores = models(ds, n).map((m) => {
        const f = m.fit(y.slice(0, n - test), test).forecast
        return { m, err: mape(y.slice(n - test), f), f }
      })
      scores.sort((a, b) => a.err - b.err)
      const best = scores[0]
      const fit = best.m.fit(y, h)
      const z = normInv(0.9)
      const lo = fit.forecast.map((v, i) => v - z * fit.sigma * Math.sqrt(i + 1))
      const hi = fit.forecast.map((v, i) => v + z * fit.sigma * Math.sqrt(i + 1))
      // The total's range: monthly errors partly cancel, so it is narrower than adding the monthly ranges.
      const totalSd = fit.sigma * Math.sqrt(sum(fit.forecast.map((_, i) => i + 1)))
      const labels = monthLabels(ds, n + h)
      const pad = <T,>(xs: T[]) => [...Array(n).fill(null), ...xs]
      const total = sum(fit.forecast)
      const lastYear = sum(y.slice(n - 12, n - 12 + h))
      const peak = fit.forecast.indexOf(Math.max(...fit.forecast))
      return {
        kpis: [
          { label: `Next ${h} months`, value: egp(total), note: n >= 12 + h ? `${signedPct(total / lastYear - 1)} on the same months last year` : undefined },
          { label: 'Likely range (80%)', value: `${egp(sum(fit.forecast) - z * totalSd)} – ${egp(sum(fit.forecast) + z * totalSd)}` },
          { label: 'Peak month', value: labels[n + peak], note: egp(fit.forecast[peak]) },
          { label: 'Error on hidden months', value: pct(best.err), tone: best.err < 0.1 ? 'good' : 'bad' },
        ],
        charts: [
          {
            title: 'Monthly sales and forecast',
            chart: {
              type: 'line',
              x: labels,
              series: [
                { name: 'Actual', values: [...y, ...Array(h).fill(null)], tone: 'accent' },
                { name: `Forecast (${best.m.name})`, values: [...Array(n - 1).fill(null), y[n - 1], ...fit.forecast], tone: 'accent', dashed: true },
              ],
              band: { lo: pad(lo), hi: pad(hi), name: '80% range' },
              marks: [{ index: n + peak, label: 'Peak' }],
              format: 'money',
              zero: true,
            },
            wide: true,
          },
          { title: 'Model contest: error on the 6 hidden months', chart: { type: 'bars', horizontal: true, labels: scores.map((s) => s.m.name), values: scores.map((s) => s.err * 100), format: 'num', tones: scores.map((_, i) => (i === 0 ? 'green' : 'muted')) } },
        ],
        findings: [
          { text: `Expected sales over the next ${h} months: ${egp(total)}, most likely between ${egp(total - z * totalSd)} and ${egp(total + z * totalSd)}.`, level: best.err < 0.1 && n >= 24 ? 'high' : 'medium' },
          { text: `${labels[n + peak]} should be the strongest month.`, action: 'Place stock orders at least one supplier lead time before it.', level: 'medium' },
          { text: `${best.m.name} won the accuracy test with ${pct(best.err)} average error on months it had not seen.`, level: 'high' },
        ],
        accuracy: `Tested on the last 6 months, hidden from the model: average error ${pct(best.err)}.`,
      }
    },
  },
  {
    name: 'Price change what-if',
    needs: { high: [['cost', 'sales'], ['cost', 'einv']], medium: [['cost']] },
    params: [{ key: 'x', label: 'Price change', min: -20, max: 30, step: 1, value: 8, format: 'pct' }],
    run: ({ ds, p }) => {
      const x = p.x / 100
      const s = cleanSales(ds).filter((v) => v.d >= ds.days - 365)
      const rev = sumBy(s, (v) => v.qty * v.price)
      const cost = sumBy(s, (v) => v.qty * v.cost)
      const m = (rev - cost) / rev
      // Elasticity from the business's own past price changes, if there were any.
      const daily = Array.from({ length: ds.days }, () => ({ units: 0, rel: 0, n: 0, promo: false }))
      const base = new Map(ds.products.map((q) => [q.id, q.price]))
      for (const v of cleanSales(ds)) {
        const dd = daily[v.d]
        dd.units += v.qty
        dd.rel += v.price / (base.get(v.prod) ?? v.price)
        dd.n++
        if (v.promo) dd.promo = true
      }
      const rows = daily.map((v, d) => ({ ...v, d })).filter((v) => v.units > 0 && !v.promo)
      const idx = rows.map((r) => r.rel / r.n)
      let e: number | null = null
      if (sd(idx) > 0.02) {
        const X = rows.map((r, i) => [Math.log(idx[i]), weekday(ds.start, r.d) >= 5 ? 1 : 0, inRamadan(ds.start, r.d) ? 1 : 0, preRamadan(ds.start, r.d) ? 1 : 0, Math.sin((2 * Math.PI * r.d) / 365), Math.cos((2 * Math.PI * r.d) / 365), r.d / 365])
        e = ols(X, rows.map((r) => Math.log(r.units))).beta[1]
      }
      const el = e ?? -1
      const breakEven = x / (m + x)
      const volume = (1 + x) ** el - 1
      const profit = (k: number) => ((1 + k) ** el * (rev * (1 + k) - cost)) / (rev - cost) - 1
      const curve = Array.from({ length: 51 }, (_, i) => -20 + i)
      const chosen = profit(x)
      const findings: Finding[] = [
        {
          text: x >= 0 ? `A ${signedPct(x, 0)} price change pays off as long as sales fall by less than ${pct(Math.abs(breakEven), 0)}.` : `A ${signedPct(x, 0)} price cut pays off only if sales rise by more than ${pct(Math.abs(breakEven), 0)}.`,
          level: 'high',
        },
      ]
      if (e !== null)
        findings.push({ text: `From past price changes, sales fall about ${Math.abs(el).toFixed(1)}% for every 1% price rise (elasticity ${el.toFixed(2)}).`, action: `Expected profit change at ${signedPct(x, 0)}: ${signedPct(chosen)}.`, level: 'medium' })
      else findings.push({ text: 'Prices have never changed in this data, so customer reaction can’t be measured yet.', action: 'Run a two-week price test in a few products or one region before a full change.', level: 'low' })
      return {
        kpis: [
          { label: 'Gross margin today', value: pct(m) },
          { label: x >= 0 ? 'Sales drop it can survive' : 'Sales rise it needs', value: pct(Math.abs(breakEven)) },
          { label: 'Expected change in units', value: signedPct(volume), note: e !== null ? `elasticity ${el.toFixed(2)}` : 'assumed elasticity −1.0' },
          { label: 'Expected profit change', value: signedPct(chosen), tone: chosen >= 0 ? 'good' : 'bad' },
        ],
        charts: [
          {
            title: 'Profit change at each price change',
            chart: {
              type: 'line',
              x: curve.map((c) => `${c > 0 ? '+' : ''}${c}%`),
              series: [{ name: 'Profit change', values: curve.map((c) => profit(c / 100) * 100), tone: 'accent' }],
              marks: [{ index: p.x + 20, label: `${p.x > 0 ? '+' : ''}${p.x}%`, tone: chosen >= 0 ? 'green' : 'red' }],
              format: 'num',
            },
            wide: true,
          },
        ],
        findings,
      }
    },
  },
  {
    name: 'Product and customer ranking',
    needs: { high: [['sales']], medium: [['einv']] },
    run: ({ ds }) => {
      const s = cleanSales(ds).filter((v) => v.d >= ds.days - 365)
      const total = sumBy(s, (v) => v.qty * v.price)
      const prods = [...groupBy(s, (v) => v.prod)].map(([id, xs]) => ({ id, rev: sumBy(xs, (v) => v.qty * v.price), profit: sumBy(xs, (v) => v.qty * (v.price - v.cost)) })).sort((a, b) => b.rev - a.rev)
      let cum = 0
      const classed = prods.map((pr) => {
        cum += pr.rev
        const c = cum / total <= 0.8 + 1e-9 || cum - pr.rev === 0 ? 'A' : cum / total <= 0.95 ? 'B' : 'C'
        return { ...pr, c, cum: cum / total }
      })
      const count = (c: string) => classed.filter((x) => x.c === c).length
      const custs = [...groupBy(s, (v) => v.cust)].map(([, xs]) => sumBy(xs, (v) => v.qty * v.price)).sort((a, b) => b - a)
      const top20 = sum(custs.slice(0, Math.max(1, Math.round(custs.length * 0.2)))) / total
      const tones: Tone[] = classed.map((x) => (x.c === 'A' ? 'accent' : x.c === 'B' ? 'muted' : 'orange'))
      return {
        kpis: [
          { label: 'A products (80% of sales)', value: `${count('A')} of ${classed.length}` },
          { label: 'C products (last 5%)', value: String(count('C')), tone: count('C') > 3 ? 'bad' : undefined },
          { label: 'Top 20% of customers bring', value: pct(top20, 0) },
        ],
        charts: [
          { title: 'Products by sales, last 12 months (A · B · C)', chart: { type: 'bars', labels: classed.map((x) => productName(ds, x.id)), values: classed.map((x) => x.rev), format: 'money', tones }, wide: true },
          { title: 'Ranking', chart: { type: 'table', columns: ['Product', 'Class', 'Sales', 'Share', 'Profit'], rows: classed.map((x) => [productName(ds, x.id), x.c, egp(x.rev), pct(x.rev / total), egp(x.profit)]), numeric: [false, false, true, true, true] }, wide: true },
        ],
        findings: [
          { text: `${count('A')} products bring 80% of sales.`, action: 'Never let these run out; review their prices first.', level: 'high' },
          { text: `${count('C')} products together bring under 5% of sales.`, action: 'Candidates to drop or sell only to order, freeing cash and shelf space.', level: 'high' },
          { text: `The top 20% of customers bring ${pct(top20, 0)} of sales.`, action: top20 > 0.6 ? 'Look after them: a loyalty offer or a named contact.' : 'Sales are well spread across customers.', level: 'high' },
        ],
      }
    },
  },
  {
    name: 'Stock reorder plan',
    needs: { high: [['stock', 'sales'], ['stock', 'einv']], medium: [['sales'], ['einv']] },
    preview: 'Reorder point with 95% safety stock; Croston’s method for products that sell on fewer than a third of days.',
    run: ({ ds, level }) => {
      const s = cleanSales(ds).filter((v) => v.d >= ds.days - 180)
      const z = 1.645
      const rows = ds.products.map((pr) => {
        const daily = Array(180).fill(0)
        for (const v of s) if (v.prod === pr.id) daily[v.d - (ds.days - 180)] += v.qty
        const slow = daily.filter((v) => v > 0).length / 180 < 0.33
        const mu = slow ? croston(daily) : mean(daily)
        const sigma = sd(daily)
        const L = pr.leadDays
        const safety = z * sigma * Math.sqrt(L)
        const rop = mu * L + safety
        const cover = mu > 0 ? pr.onHand / mu : Infinity
        const status = pr.onHand <= rop ? 'Order now' : pr.onHand <= rop + mu * 14 ? 'Order within 2 weeks' : cover > 150 ? 'Overstocked' : 'OK'
        const qty = Math.max(0, Math.round(mu * (L + 30) + safety - pr.onHand))
        return { pr, mu, rop, cover, status, qty, slow }
      })
      const rank = { 'Order now': 0, 'Order within 2 weeks': 1, Overstocked: 2, OK: 3 } as const
      rows.sort((a, b) => rank[a.status as keyof typeof rank] - rank[b.status as keyof typeof rank] || a.cover - b.cover)
      const now = rows.filter((r) => r.status === 'Order now')
      const over = rows.filter((r) => r.status === 'Overstocked')
      const overValue = sumBy(over, (r) => (r.pr.onHand - r.mu * 90) * r.pr.cost)
      const tone = (st: string): Tone | undefined => (st === 'Order now' ? 'red' : st === 'Order within 2 weeks' ? 'amber' : st === 'Overstocked' ? 'orange' : undefined)
      return {
        kpis: [
          { label: 'Order now', value: String(now.length), tone: now.length ? 'bad' : 'good' },
          { label: 'Order within 2 weeks', value: String(rows.filter((r) => r.status === 'Order within 2 weeks').length) },
          { label: 'Overstocked', value: String(over.length), note: over.length ? `${egp(overValue)} tied up beyond 3 months` : undefined },
          { label: 'Service level', value: '95%', note: 'chance of no stock-out' },
        ],
        charts: [
          {
            title: 'Reorder plan',
            chart: {
              type: 'table',
              columns: ['Product', 'On hand', 'Sells a day', 'Lead time', 'Reorder at', 'Days of cover', 'Status', 'Order qty'],
              rows: rows.map((r) => [productName(ds, r.pr.id) + (r.slow ? ' *' : ''), num(r.pr.onHand), r.mu.toFixed(1), `${r.pr.leadDays} d`, num(Math.ceil(r.rop)), isFinite(r.cover) ? num(r.cover) : '–', r.status, r.qty ? num(r.qty) : '–']),
              numeric: [false, true, true, true, true, true, false, true],
              tones: rows.map((r) => tone(r.status)),
            },
            wide: true,
          },
        ],
        findings: [
          now.length
            ? { text: `${now.length} products are at or below their reorder point: ${now.slice(0, 3).map((r) => productName(ds, r.pr.id)).join(', ')}${now.length > 3 ? '…' : ''}.`, action: 'Place these orders this week.', level: level === 'high' ? 'high' : 'medium' }
            : { text: 'No product is below its reorder point.', level: 'high' },
          ...(over.length ? [{ text: `${over.length} products have more than five months of stock.`, action: `About ${egp(overValue)} of cash is tied up; pause their orders.`, level: 'high' as const }] : []),
        ],
        notes: ['* Slow seller: demand estimated with Croston’s method.', ...(level !== 'high' ? ['No stock count: on-hand figures are estimates until the client sends one.'] : [])],
      }
    },
  },
]

