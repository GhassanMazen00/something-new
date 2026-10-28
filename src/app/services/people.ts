// People: five services.

import { DAYS, weekday } from '../lib/dates'
import { egp, num, pct, signedPct } from '../lib/format'
import { auc, groupBy, kaplanMeier, logistic, mean, median, ols, sumBy } from '../lib/stats'
import { cleanSales } from './common'
import type { Finding, Result, ServiceDef, Tone } from './types'

type Part = Omit<ServiceDef, 'id' | 'dept' | 'get' | 'method' | 'data' | 'missing'>

const current = (ds: Parameters<typeof cleanSales>[0]) => ds.staff.filter((s) => s.leave === null && s.hire < ds.days)

const THEMES: [string, RegExp][] = [
  ['Pay', /pay|salary|salaries|market|prices/i],
  ['Workload and overtime', /workload|overtime|late|too much/i],
  ['Growth and promotion', /grow|promot|path|learn/i],
  ['Management', /manag|listen|judged|performance/i],
  ['Tools and systems', /tool|system|crash|slow/i],
  ['Team and culture', /team|culture|proud|friendly|flexible/i],
]

export const peopleServices: Part[] = [
  {
    name: 'Staff turnover analysis',
    needs: { high: [['staff']], medium: [['payroll']] },
    adjust: (ds) => (current(ds).length < 50 ? { level: 'low', why: 'Under about 50 staff: turnover rate and cost only, no prediction.' } : null),
    run: ({ ds, level }) => {
      const now = current(ds)
      const yearAgo = ds.days - 365
      const leavers = ds.staff.filter((s) => s.leave !== null && s.leave >= yearAgo)
      const headAvg = (ds.staff.filter((s) => s.hire <= yearAgo && (s.leave === null || s.leave > yearAgo)).length + now.length) / 2
      const rate = leavers.length / headAvg
      const cost = sumBy(leavers, (s) => s.salary * 12 * 0.25)
      const byRole = [...groupBy(ds.staff.filter((s) => s.hire <= ds.days), (s) => s.role)].map(([role, xs]) => {
        const left = xs.filter((s) => s.leave !== null && s.leave >= yearAgo).length
        const avg = xs.filter((s) => s.hire <= ds.days && (s.leave === null || s.leave >= yearAgo)).length
        return { role, rate: avg ? left / avg : 0, n: avg }
      }).filter((r) => r.n >= 3).sort((a, b) => b.rate - a.rate)
      const tenure = ds.staff.map((s) => Math.max(0, ((s.leave ?? ds.days) - Math.max(s.hire, -3000)) / 30.4))
      const km = kaplanMeier(tenure.map((t) => Math.round(t)), ds.staff.map((s) => (s.leave !== null ? 1 : 0)))
      const at = (m: number) => [...km].reverse().find((p) => p.t <= m)?.s ?? 1
      const findings: Finding[] = [
        { text: `${pct(rate, 0)} of staff left in the last 12 months (${leavers.length} people), costing about ${egp(cost)} to replace.`, level: 'high' },
        { text: `${byRole[0].role} has the highest turnover: ${pct(byRole[0].rate, 0)} a year.`, level: 'high' },
        { text: `${pct(1 - at(12), 0)} of new joiners leave within their first year.`, action: 'Better onboarding and a 6-month check-in are the cheapest fix.', level: 'medium' },
      ]
      const charts: Result['charts'] = [
        { title: 'Still employed after … months (survival curve)', chart: { type: 'line', x: Array.from({ length: 37 }, (_, m) => String(m)), series: [{ name: 'Still employed', values: Array.from({ length: 37 }, (_, m) => at(m) * 100), tone: 'accent' }], format: 'num' } },
        { title: 'Turnover by role, last 12 months', chart: { type: 'bars', horizontal: true, labels: byRole.map((r) => r.role), values: byRole.map((r) => r.rate * 100), format: 'num', tones: byRole.map((r) => (r.rate > rate * 1.3 ? 'orange' : 'accent')) } },
      ]
      let modelAuc = 0
      if (level !== 'low') {
        // Who is likely to leave: pay against the role's median, overtime and tenure.
        const med = new Map([...groupBy(ds.staff, (s) => s.role)].map(([r, xs]) => [r, median(xs.map((s) => s.salary))]))
        const feat = (s: (typeof ds.staff)[number], at: number) => [s.salary / med.get(s.role)!, s.overtimeHrs, Math.min(120, Math.max(0, (at - s.hire) / 30.4))]
        // Everyone employed a year ago, described as they were then; did they leave during the year?
        const pool = ds.staff.filter((s) => s.hire <= yearAgo && (s.leave === null || s.leave >= yearAgo))
        const X = pool.map((s) => feat(s, yearAgo))
        const y = pool.map((s) => (s.leave !== null ? 1 : 0))
        // Five-fold cross-validation: every person is scored by a model that never saw them.
        const scores = Array(pool.length).fill(0)
        for (let f = 0; f < 5; f++) {
          const tr = pool.map((_, i) => i).filter((i) => i % 5 !== f)
          const fm = logistic(tr.map((i) => X[i]), tr.map((i) => y[i]))
          pool.forEach((_, i) => {
            if (i % 5 === f) scores[i] = fm.score(X[i])
          })
        }
        modelAuc = auc(scores, y)
        const m = logistic(X, y)
        if (modelAuc >= 0.6) {
          const risky = now.map((s) => ({ s, p: m.score(feat(s, ds.days)), ratio: feat(s, ds.days)[0] })).sort((a, b) => b.p - a.p).slice(0, 8)
          charts.push({
            title: 'Highest risk of leaving (names hidden)',
            chart: { type: 'table', columns: ['Employee', 'Role', 'Branch', 'Pay vs role median', 'Overtime / month', 'Risk'], rows: risky.map((r) => [r.s.id, r.s.role, r.s.branch, signedPct(r.ratio - 1, 0), `${r.s.overtimeHrs} h`, pct(r.p, 0)]), numeric: [false, false, false, true, true, true], tones: risky.map((r) => (r.p > 0.6 ? 'red' : 'amber')) },
            wide: true,
          })
          const w = m.weights
          findings.push({ text: `People paid below their role’s median and working long overtime are the most likely to leave${w[0] < 0 && w[1] > 0 ? '' : ' (weaker signal here)'}.`, action: 'Review pay for the people listed before they resign; replacing one costs about three months’ salary.', level: modelAuc > 0.68 ? 'high' : 'medium' })
        } else {
          findings.push({ text: 'At this size the pattern behind who leaves isn’t clear enough to name individuals.', action: 'Use exit interviews and the employee survey instead.', level: 'low' })
        }
      }
      return {
        kpis: [
          { label: 'Staff today', value: num(now.length) },
          { label: 'Turnover, last 12 months', value: pct(rate, 0), tone: rate > 0.2 ? 'bad' : 'good' },
          { label: 'Cost of replacing them', value: egp(cost), note: '25% of a year’s pay each' },
          level !== 'low' ? { label: 'Prediction test', value: `AUC ${modelAuc.toFixed(2)}`, note: 'cross-validated', tone: modelAuc > 0.68 ? 'good' : 'bad' } : { label: 'Prediction', value: 'Not run', note: 'too few staff' },
        ],
        charts,
        findings,
        accuracy: level !== 'low' ? `Risk model checked by 5-fold cross-validation (each person scored by a model that never saw them): AUC ${modelAuc.toFixed(2)}.` : undefined,
      }
    },
  },
  {
    name: 'Staffing plan',
    needs: { high: [['sales']], medium: [['einv']] },
    params: [{ key: 'per', label: 'Sales one person can handle per hour (EGP)', min: 500, max: 40000, step: 500, value: 9000, format: 'num' }],
    // Default: today's sales per front-line staff hour, so the plan starts from how the client works now.
    defaults: (c) => {
      const ds = c.data()
      const front = current(ds).filter((s) => /Sales|Cashier|Customer service/.test(s.role)).length || 1
      const rev = sumBy(cleanSales(ds).filter((v) => v.d >= ds.days - 91), (v) => v.qty * v.price)
      return { per: Math.max(500, Math.round(rev / (front * 13 * 48) / 500) * 500) }
    },
    run: ({ ds, p }) => {
      const s = cleanSales(ds).filter((v) => v.d >= ds.days - 91)
      const hours = [...new Set(s.map((v) => v.hour))].sort((a, b) => a - b)
      const units = Math.max(1, new Set(s.map((v) => v.branch)).size)
      const grid = DAYS.map((_, k) => {
        const days = 13
        return hours.map((h) => sumBy(s.filter((v) => v.hour === h && weekday(ds.start, v.d) === k), (v) => v.qty * v.price) / days / units)
      })
      const need = grid.map((row) => row.map((v) => (v > 0 ? Math.max(1, Math.ceil(v / p.per)) : 0)))
      const flat = need.flatMap((row, k) => row.map((n, i) => ({ n, k, h: hours[i] })))
      const peak = flat.reduce((a, b) => (b.n > a.n ? b : a))
      const quiet = flat.filter((x) => x.n > 0).reduce((a, b) => (b.n < a.n ? b : a))
      const totalHours = flat.reduce((a, b) => a + b.n, 0)
      return {
        kpis: [
          { label: 'Busiest hour', value: `${DAYS[peak.k]} ${peak.h}:00`, note: `${peak.n} people needed` },
          { label: 'Quietest', value: `${DAYS[quiet.k]} ${quiet.h}:00`, note: `${quiet.n} needed` },
          { label: 'Staff-hours a week', value: num(totalHours), note: units > 1 ? 'per branch' : undefined },
        ],
        charts: [{ title: `People needed on the floor${units > 1 ? ', average branch' : ''}`, chart: { type: 'heatmap', rows: DAYS, cols: hours.map((h) => `${h}`), values: need, format: 'num' }, wide: true }],
        findings: [
          { text: `Need peaks at ${peak.n} people on ${DAYS[peak.k]} around ${peak.h}:00, and drops to ${quiet.n} on ${DAYS[quiet.k]} at ${quiet.h}:00.`, action: 'Move people from quiet mornings to evening shifts instead of hiring.', level: 'medium' },
          { text: `Based on ${egp(p.per)} of sales per person per hour; adjust it to the client’s real productivity.`, level: 'medium' },
        ],
        notes: ['Shift schedules were not supplied, so need is shown against sales, not compared with today’s rota.'],
      }
    },
  },
  {
    name: 'Payroll error scan',
    needs: { high: [['payroll', 'staff']], medium: [['payroll']], low: [['bank']] },
    run: ({ ds, level }) => {
      const ids = new Map(ds.staff.map((s) => [s.id, s]))
      const flags: { emp: string; name: string; m: number; amount: number; why: string; tone: Tone }[] = []
      if (level === 'high') {
        for (const [emp, xs] of groupBy(ds.payroll.filter((l) => !ids.has(l.emp)), (l) => l.emp))
          flags.push({ emp, name: xs[0].name, m: xs[0].m, amount: sumBy(xs, (l) => l.base + l.overtime), why: `Paid ${xs.length} months, not on the staff list`, tone: 'red' })
        for (const l of ds.payroll) {
          const s = ids.get(l.emp)
          if (s && s.leave !== null && l.m * 30.4 > s.leave + 31) flags.push({ emp: l.emp, name: l.name, m: l.m, amount: l.base + l.overtime, why: 'Paid after leaving', tone: 'red' })
        }
      }
      for (const [, xs] of groupBy(ds.payroll, (l) => `${l.emp}|${l.m}`)) if (xs.length > 1) flags.push({ emp: xs[0].emp, name: xs[0].name, m: xs[0].m, amount: xs[1].base + xs[1].overtime, why: 'Paid twice in the same month', tone: 'red' })
      for (const [emp, xs] of groupBy(ds.payroll, (l) => l.emp)) {
        const med = median(xs.map((l) => l.overtime))
        for (const l of xs) if (med > 0 && l.overtime > 3.5 * med && l.overtime > 3000) flags.push({ emp, name: l.name, m: l.m, amount: l.overtime, why: `Overtime ${(l.overtime / med).toFixed(1)}× their usual`, tone: 'amber' })
      }
      const accounts = groupBy(ds.payroll, (l) => l.account)
      for (const [acc, xs] of accounts) if (new Set(xs.map((l) => l.emp)).size > 1) flags.push({ emp: xs[0].emp, name: xs[0].name, m: xs[0].m, amount: 0, why: `Bank account ${acc} shared by more than one person`, tone: 'red' })
      const value = sumBy(flags, (f) => f.amount)
      const findings: Finding[] = []
      const ghost = flags.find((f) => f.why.includes('not on the staff list'))
      if (ghost) findings.push({ text: `${ghost.name} (${ghost.emp}) was paid ${egp(ghost.amount)} but is not on the staff list.`, action: 'Confirm with HR in person before raising it with management.', level: 'high' })
      const twice = flags.filter((f) => f.why.includes('twice'))
      if (twice.length) findings.push({ text: `${twice.length} salaries were paid twice in the same month (${egp(sumBy(twice, (f) => f.amount))}).`, action: 'Recover through next month’s payroll.', level: 'high' })
      const ot = flags.filter((f) => f.why.startsWith('Overtime'))
      if (ot.length) findings.push({ text: `${ot.length} overtime payments are far above the person’s usual.`, action: 'Check they were approved.', level: 'medium' })
      if (!flags.length) findings.push({ text: 'No payroll errors found.', level: 'high' })
      if (level !== 'high') findings.push({ text: 'Without a staff list, ghost employees and pay after leaving can’t be checked.', level: 'medium' })
      return {
        kpis: [
          { label: 'Payroll lines checked', value: num(ds.payroll.length) },
          { label: 'Flags', value: String(flags.length), tone: flags.length ? 'bad' : 'good' },
          { label: 'Money involved', value: egp(value), tone: value ? 'bad' : 'good' },
        ],
        charts: [{ title: 'Flagged payments', chart: { type: 'table', columns: ['Employee', 'Name', 'Month', 'Amount', 'Why'], rows: flags.slice(0, 14).map((f) => [f.emp, f.name, `M${f.m + 1}`, f.amount ? egp(f.amount, { exact: true }) : '–', f.why]), numeric: [false, false, false, true, false], tones: flags.slice(0, 14).map((f) => f.tone) }, wide: true }],
        findings,
      }
    },
  },
  {
    name: 'Pay fairness check',
    needs: { high: [['staff']], medium: [['payroll']] },
    run: ({ ds }) => {
      const now = current(ds)
      const roles = [...new Set(now.map((s) => s.role))]
      const X = now.map((s) => [s.gender === 'F' ? 1 : 0, Math.max(0, (ds.days - s.hire) / 365), ...roles.slice(1).map((r) => (s.role === r ? 1 : 0))])
      const { beta, se } = ols(X, now.map((s) => Math.log(s.salary)))
      const gap = Math.exp(beta[1]) - 1
      const lo = Math.exp(beta[1] - 1.96 * se[1]) - 1
      const hi = Math.exp(beta[1] + 1.96 * se[1]) - 1
      const clear = hi < 0 || lo > 0
      const f = now.filter((s) => s.gender === 'F')
      const m = now.filter((s) => s.gender === 'M')
      const raw = mean(f.map((s) => s.salary)) / mean(m.map((s) => s.salary)) - 1
      const mixed = roles.filter((r) => now.some((s) => s.role === r && s.gender === 'F') && now.some((s) => s.role === r && s.gender === 'M'))
      const fixCost = sumBy(f, (s) => s.salary * -Math.min(0, gap)) * 12
      return {
        kpis: [
          { label: 'Raw gap, women vs men', value: signedPct(raw), note: 'all roles mixed together' },
          { label: 'Same role and tenure', value: signedPct(gap), note: `95% range ${signedPct(lo)} to ${signedPct(hi)}`, tone: clear && gap < 0 ? 'bad' : 'good' },
          { label: 'Cost to close it', value: egp(fixCost), note: 'a year' },
        ],
        charts: [{ title: 'Average monthly pay by role', chart: { type: 'bars', labels: mixed, values: mixed.map((r) => mean(f.filter((s) => s.role === r).map((s) => s.salary))), extra: { name: 'Men', values: mixed.map((r) => mean(m.filter((s) => s.role === r).map((s) => s.salary))) }, format: 'money' }, wide: true }],
        findings: [
          clear
            ? { text: `In the same role and with the same tenure, women are paid ${pct(Math.abs(gap))} ${gap < 0 ? 'less' : 'more'} than men.`, action: `Closing the gap costs about ${egp(fixCost)} a year. Review starting salaries first.`, level: 'high' }
            : { text: 'No clear pay gap between women and men once role and tenure are taken into account.', level: 'high' },
          { text: `Much of the raw ${signedPct(raw)} gap comes from which roles women and men hold, not pay within a role.`, level: 'medium' },
        ],
      }
    },
  },
  {
    name: 'Employee survey',
    needs: { high: [['empsurvey']] },
    preview: 'Comments are sorted into themes by keyword rules. In production, Claude reads each comment and an analyst checks the themes.',
    run: ({ ds }) => {
      const r = ds.empSurvey
      const prom = r.filter((x) => x.score >= 9).length / r.length
      const det = r.filter((x) => x.score <= 6).length / r.length
      const enps = Math.round((prom - det) * 100)
      const themes = THEMES.map(([name, re]) => {
        const xs = r.filter((x) => re.test(x.comment))
        return { name, n: xs.length, avg: xs.length ? mean(xs.map((x) => x.score)) : 0, quote: xs.find((x) => x.score <= 6)?.comment ?? xs[0]?.comment ?? '' }
      }).filter((t) => t.n).sort((a, b) => a.avg - b.avg)
      const worst = themes[0]
      return {
        kpis: [
          { label: 'eNPS', value: (enps > 0 ? '+' : '') + enps, note: '−100 to +100', tone: enps >= 10 ? 'good' : 'bad' },
          { label: 'Answers', value: String(r.length) },
          { label: 'Promoters (9–10)', value: pct(prom, 0) },
          { label: 'Detractors (0–6)', value: pct(det, 0), tone: det > 0.4 ? 'bad' : undefined },
        ],
        charts: [
          { title: 'Average score by what people wrote about', chart: { type: 'bars', horizontal: true, labels: themes.map((t) => `${t.name} (${t.n})`), values: themes.map((t) => t.avg), format: 'num', tones: themes.map((t) => (t.avg < 5 ? 'red' : t.avg < 7 ? 'amber' : 'green')) } },
          { title: 'In their words', chart: { type: 'table', columns: ['Theme', 'Comment'], rows: themes.slice(0, 5).map((t) => [t.name, `“${t.quote}”`]) } },
        ],
        findings: [
          { text: `eNPS is ${enps > 0 ? '+' : ''}${enps}: ${enps >= 10 ? 'more fans than critics' : 'more critics than fans'}.`, level: 'high' },
          { text: `${worst.name} is the biggest complaint: ${worst.n} comments, average score ${worst.avg.toFixed(1)}.`, action: worst.name.startsWith('Workload') ? 'Plan seasonal staff before White Friday and Ramadan.' : 'Address it before the next survey.', level: r.length >= 30 ? 'high' : 'medium' },
        ],
      }
    },
  },
]
