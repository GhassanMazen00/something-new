// Market research: five services. Public-data inputs here are illustrative placeholders that the analyst
// replaces with sourced figures (CAPMAS, World Bank, Central Bank of Egypt) on a real job.

import type { Client } from '../data/types'
import { egp, num, pct, signedPct } from '../lib/format'
import { rng } from '../lib/rng'
import { mean, movingAverage, sum, sumBy } from '../lib/stats'
import { cleanSales } from './common'
import type { ServiceDef, Tone } from './types'

type Part = Omit<ServiceDef, 'id' | 'dept' | 'get' | 'method' | 'data' | 'missing'>

const SECTOR = {
  furniture: { market: 'Home furniture', unit: 'households', base: 6.8, share: 30, spend: 9000, keyword: 'furniture', peakNote: 'before Ramadan and in the summer wedding season' },
  medical: { market: 'Medical consumables to pharmacies and clinics', unit: 'outlets (thousands)', base: 0.082, share: 35, spend: 1_400_000, keyword: 'medical supplies', peakNote: 'in winter (flu season)' },
  beauty: { market: 'Skincare bought online', unit: 'online shoppers', base: 9.5, share: 45, spend: 2400, keyword: 'skincare', peakNote: 'around White Friday and before Eid' },
} as const

const ILLUSTRATIVE = 'Illustrative inputs for this preview. On a real job each figure is replaced with a sourced public number, cited in the report.'

export const marketServices: Part[] = [
  {
    name: 'Market size',
    needs: { high: [], publicData: true },
    params: [
      { key: 'pop', label: 'Potential buyers (millions)', min: 0.05, max: 30, step: 0.05, value: 1, format: 'num' },
      { key: 'reach', label: 'Share in the client’s area and price range', min: 5, max: 100, step: 1, value: 30, format: 'pct' },
      { key: 'spend', label: 'Yearly spend per buyer (EGP)', min: 500, max: 2_000_000, step: 100, value: 9000, format: 'num' },
    ],
    defaults: (c) => ({ pop: SECTOR[c.sector].base, reach: SECTOR[c.sector].share, spend: SECTOR[c.sector].spend }),
    run: ({ ds, client, p }) => {
      const sec = SECTOR[client.sector]
      const tam = p.pop * 1e6 * p.spend
      const sam = tam * (p.reach / 100)
      const ours = sumBy(cleanSales(ds).filter((v) => v.d >= ds.days - 365), (v) => v.qty * v.price)
      const som = sam * Math.min(0.25, (ours / sam) * 1.6)
      return {
        kpis: [
          { label: 'Total market (TAM)', value: egp(tam), note: sec.market },
          { label: 'Reachable market (SAM)', value: egp(sam) },
          { label: 'Client’s share today', value: pct(ours / sam, 1), note: egp(ours) },
          { label: 'Realistic in 3 years (SOM)', value: egp(som) },
        ],
        charts: [{ title: 'Market funnel', chart: { type: 'bars', horizontal: true, labels: ['Total market', 'Reachable market', 'Realistic target', 'Client today'], values: [tam, sam, som, ours], format: 'money', tones: ['muted', 'accent', 'green', 'amber'] } }],
        findings: [
          { text: `The client holds about ${pct(ours / sam, 1)} of the market it can realistically reach.`, action: ours / sam < 0.05 ? 'Plenty of room to grow without new markets.' : 'Growth will need new areas or price ranges.', level: 'medium' },
          { text: 'Sized top-down (buyers × spend) here. The full report adds a bottom-up check from outlets and average sales, and uses the lower of the two.', level: 'medium' },
        ],
        notes: [ILLUSTRATIVE],
      }
    },
  },
  {
    name: 'Demand trends',
    needs: { high: [], publicData: true },
    preview: 'Weekly search interest, smoothed and split into trend and season. The series in this preview is synthetic; production pulls Google Trends for the client’s keywords.',
    run: ({ client }) => {
      const sec = SECTOR[client.sector]
      const r = rng(client.id.length * 97)
      const weeks = 156
      const peakWeeks = client.sector === 'beauty' ? [46, 47] : client.sector === 'medical' ? [0, 1, 2, 49, 50, 51] : [5, 6, 26, 27, 28]
      const series = Array.from({ length: weeks }, (_, w) => {
        const wk = w % 52
        const season = peakWeeks.includes(wk) ? 1.45 : 1 + 0.08 * Math.sin((2 * Math.PI * wk) / 52)
        return Math.max(5, Math.min(100, 50 * (1 + (client.sector === 'beauty' ? 0.22 : 0.07) * (w / 52)) * season * Math.exp(r.normal(0, 0.06))))
      })
      const trend = movingAverage(series, 13)
      const yoy = mean(series.slice(-52)) / mean(series.slice(-104, -52)) - 1
      const peak = series.slice(-52).indexOf(Math.max(...series.slice(-52)))
      return {
        kpis: [
          { label: `Search interest in “${sec.keyword}”`, value: signedPct(yoy), note: 'last 12 months vs the year before', tone: yoy > 0 ? 'good' : 'bad' },
          { label: 'Peak', value: `Week ${peak + 1}`, note: sec.peakNote },
        ],
        charts: [{ title: 'Weekly search interest (100 = peak)', chart: { type: 'line', x: series.map((_, w) => `W${(w % 52) + 1}`), series: [{ name: 'Interest', values: series, tone: 'muted' }, { name: '13-week trend', values: trend.map((v) => (isNaN(v) ? null : v)), tone: 'accent' }], format: 'num' }, wide: true }],
        findings: [
          { text: `Interest is ${yoy >= 0 ? 'rising' : 'falling'}: ${signedPct(yoy)} on the year before.`, level: 'medium' },
          { text: `Demand peaks ${sec.peakNote}.`, action: 'Start campaigns three to four weeks before the peak, when attention is cheaper.', level: 'medium' },
        ],
        notes: [ILLUSTRATIVE],
      }
    },
  },
  {
    name: 'Competitor check',
    needs: { high: [], publicData: true },
    preview: 'Prices collected by hand from competitors’ shops and websites; review themes read by AI and checked by the analyst. Competitors are anonymised in this preview.',
    run: ({ ds, client }) => {
      const r = rng(client.id.length * 31)
      const top = [...ds.products].sort((a, b) => b.price - a.price).slice(0, 6)
      const comps = ['Competitor A · national chain', 'Competitor B · online only', 'Competitor C · discount', 'Competitor D · premium']
      const factors = [1.08, 0.92, 0.8, 1.3]
      const rows = top.map((pr) => [pr.name, egp(pr.price, { exact: true }), ...factors.map((f) => egp(Math.round((pr.price * f * Math.exp(r.normal(0, 0.06))) / 10) * 10, { exact: true }))])
      const idx = factors.map((f) => 100 / f)
      const complaints: Record<Client['sector'], [string, number][]> = {
        furniture: [['Late delivery', 38], ['Assembly problems', 22], ['Quality not as shown', 19], ['Rude staff', 11], ['Price', 10]],
        medical: [['Stock-outs', 41], ['Late delivery', 27], ['Wrong items', 14], ['Credit terms', 12], ['Price', 6]],
        beauty: [['Late delivery', 33], ['Fake or expired products', 24], ['Skin reaction', 15], ['Price', 15], ['Customer service', 13]],
      }
      const c = complaints[client.sector]
      return {
        kpis: [
          { label: 'Client price vs market', value: signedPct(1 / mean(factors) - 1), note: 'average across 4 competitors' },
          { label: 'Top complaint about competitors', value: c[0][0], note: `${c[0][1]}% of negative reviews` },
        ],
        charts: [
          { title: 'Price check, client’s top items', chart: { type: 'table', columns: ['Item', 'Client', ...comps.map((x) => x.split(' · ')[0])], rows, numeric: [false, true, true, true, true, true] }, wide: true },
          { title: 'What competitors’ customers complain about (% of negative reviews)', chart: { type: 'bars', horizontal: true, labels: c.map((x) => x[0]), values: c.map((x) => x[1]), format: 'num', tones: c.map((_, i) => (i === 0 ? 'orange' : 'accent')) } },
          { title: 'Price index (client = 100)', chart: { type: 'bars', labels: comps.map((x) => x.split(' · ')[0]), values: idx, format: 'num', ref: { value: 100, label: 'Client' } } },
        ],
        findings: [
          { text: `${c[0][0]} is the most common complaint about competitors.`, action: `Promise and advertise what they fail at: for example, ${client.sector === 'medical' ? 'a guaranteed stock level' : 'a delivery date guarantee'}.`, level: 'medium' },
          { text: 'The client sits mid-market on price: above the discounter and online-only shop, below the premium brand.', level: 'medium' },
        ],
        notes: [ILLUSTRATIVE],
      }
    },
  },
  {
    name: 'Customer survey',
    needs: { high: [['custsurvey']] },
    run: ({ ds }) => {
      const sv = ds.custSurvey!
      const a = sv.answers
      const prices = Array.from({ length: 60 }, (_, i) => 150 + i * 20)
      const share = (f: (x: (typeof a)[number]) => boolean) => a.filter(f).length / a.length
      const tooCheap = prices.map((p) => share((x) => x.tooCheap >= p))
      const notCheap = prices.map((p) => share((x) => x.cheap < p))
      const notExp = prices.map((p) => share((x) => x.expensive > p))
      const tooExp = prices.map((p) => share((x) => x.tooExpensive <= p))
      const cross = (u: number[], v: number[]) => {
        const i = u.findIndex((x, k) => k > 0 && (x - v[k]) * (u[k - 1] - v[k - 1]) <= 0)
        return prices[Math.max(0, i)]
      }
      const pmc = cross(tooCheap, notCheap)
      const pme = cross(tooExp, notExp)
      const opp = cross(tooCheap, tooExp)
      const current = ds.products.find((p) => p.name === sv.product)?.price ?? 0
      const inRange = current >= pmc && current <= pme
      return {
        kpis: [
          { label: 'Acceptable price range', value: `${egp(pmc, { exact: true })} – ${egp(pme, { exact: true })}` },
          { label: 'Optimal price point', value: egp(opp, { exact: true }) },
          { label: 'Price today', value: egp(current, { exact: true }), tone: inRange ? 'good' : 'bad' },
          { label: 'Answers', value: num(a.length) },
        ],
        charts: [
          {
            title: `${sv.product}: Van Westendorp price test`,
            chart: {
              type: 'line',
              x: prices.map((p) => String(p)),
              series: [
                { name: 'Too cheap', values: tooCheap.map((v) => v * 100), tone: 'muted', dashed: true },
                { name: 'Not cheap', values: notCheap.map((v) => v * 100), tone: 'green' },
                { name: 'Not expensive', values: notExp.map((v) => v * 100), tone: 'accent' },
                { name: 'Too expensive', values: tooExp.map((v) => v * 100), tone: 'red', dashed: true },
              ],
              marks: [
                { index: prices.indexOf(pmc), label: 'Lowest', tone: 'amber' as Tone },
                { index: prices.indexOf(pme), label: 'Highest', tone: 'amber' as Tone },
              ],
              format: 'num',
            },
            wide: true,
          },
        ],
        findings: [
          { text: `Customers find ${egp(pmc, { exact: true })} to ${egp(pme, { exact: true })} acceptable for the ${sv.product.toLowerCase()}.`, level: a.length >= 300 ? 'high' : 'medium' },
          inRange
            ? { text: `Today’s price of ${egp(current, { exact: true })} is inside the range${current < pme - 60 ? `, with room to rise towards ${egp(pme - 40, { exact: true })}` : ''}.`, action: current < pme - 60 ? 'Test a modest rise with the price what-if first.' : undefined, level: 'high' }
            : { text: `Today’s price of ${egp(current, { exact: true })} is outside what customers accept.`, action: 'Reprice before the next campaign.', level: 'high' },
        ],
        accuracy: `${num(a.length)} answers: margin of error about ±${(98 / Math.sqrt(a.length)).toFixed(0)} points on each curve.`,
      }
    },
  },
  {
    name: 'Market conditions',
    needs: { high: [], publicData: true },
    params: [{ key: 'rate', label: 'Pounds per dollar today', min: 30, max: 70, step: 0.5, value: 50, format: 'egp-rate' }],
    run: ({ ds, client, p }) => {
      const imp = sumBy(ds.products, (x) => x.imported * x.cost) / (sumBy(ds.products, (x) => x.cost) || 1)
      const scen = [
        { name: 'Calm', infl: 12, rate: p.rate, demand: 0.06 },
        { name: 'Base', infl: 18, rate: p.rate * 1.1, demand: 0.02 },
        { name: 'Shock', infl: 30, rate: p.rate * 1.35, demand: -0.08 },
      ]
      const rev = sum(cleanSales(ds).filter((v) => v.d >= ds.days - 365).map((v) => v.qty * v.price))
      const gm = 1 - sum(cleanSales(ds).filter((v) => v.d >= ds.days - 365).map((v) => v.qty * v.cost)) / rev
      const impact = scen.map((s) => {
        const costUp = imp * (s.rate / p.rate - 1) + (1 - imp) * (s.infl / 100)
        const margin = 1 - (1 - gm) * (1 + costUp)
        return { ...s, margin }
      })
      const pestel: [string, string, Tone][] = [
        ['Political', 'Import rules and customs clearance times', 'amber'],
        ['Economic', `Inflation and the pound: ${pct(imp, 0)} of costs are imported`, imp > 0.4 ? 'red' : 'amber'],
        ['Social', client.sector === 'beauty' ? 'Shift to online buying, younger buyers' : 'Household budgets squeezed; buyers trade down', 'amber'],
        ['Technological', 'E-invoicing and e-receipts now mandatory', 'green'],
        ['Environmental', 'Fuel and transport costs', 'amber'],
        ['Legal', 'Data protection law 151/2020; consumer protection', 'green'],
      ]
      return {
        kpis: impact.map((s) => ({ label: `${s.name} scenario`, value: pct(s.margin), note: `margin · ${s.infl}% inflation · EGP ${s.rate.toFixed(1)}/$`, tone: s.margin < gm - 0.05 ? ('bad' as const) : undefined })),
        charts: [
          { title: 'Gross margin under each scenario', chart: { type: 'bars', labels: impact.map((s) => s.name), values: impact.map((s) => s.margin * 100), format: 'num', ref: { value: gm * 100, label: 'Today' }, tones: impact.map((s) => (s.margin < gm - 0.05 ? 'red' : s.margin < gm ? 'amber' : 'green')) } },
          { title: 'PESTEL summary', chart: { type: 'table', columns: ['Factor', 'What matters for this client'], rows: pestel.map((x) => [x[0], x[1]]), tones: pestel.map((x) => x[2]) } },
        ],
        findings: [
          { text: `In a currency shock, gross margin would fall from ${pct(gm)} to about ${pct(impact[2].margin)}.`, action: 'Agree in advance which prices move and when, so the reaction is fast.', level: 'medium' },
          { text: 'The economy affects this client mainly through import costs, more than through demand.', level: 'medium' },
        ],
        notes: [ILLUSTRATIVE],
      }
    },
  },
]
