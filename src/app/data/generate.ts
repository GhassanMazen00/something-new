// Made-up sample data for three demo clients. Seeded, so it is the same on every load.
// Each dataset hides a few real-world problems for the scans to find.

import { calMonth, inRamadan, monthIndex, preRamadan, weekday, whiteFriday } from '../lib/dates'
import { rng, type Rng } from '../lib/rng'
import type { Branch, Dataset, EmpSurvey, Payable, PayrollLine, PnlMonth, PriceAnswer, Product, Sale, Staff } from './types'

const FIRST_F = ['Mariam', 'Nour', 'Salma', 'Yasmin', 'Hana', 'Farida', 'Laila', 'Aya', 'Dina', 'Rana', 'Mona', 'Heba', 'Sara', 'Reem', 'Malak', 'Habiba']
const FIRST_M = ['Ahmed', 'Mohamed', 'Omar', 'Youssef', 'Karim', 'Mostafa', 'Tarek', 'Hassan', 'Amr', 'Ali', 'Khaled', 'Mahmoud', 'Ziad', 'Sherif', 'Hany', 'Islam']
const LAST = ['Adel', 'Hassan', 'Saeed', 'Fathy', 'Mansour', 'Ibrahim', 'Nabil', 'Ezzat', 'Shawky', 'Fouad', 'Ragab', 'Samir', 'Lotfy', 'Gamal', 'Helmy', 'Sobhy']

const blankDataset = (start: string, days: number): Dataset => ({
  start,
  days,
  sales: [],
  products: [],
  einv: [],
  ledger: [],
  bank: [],
  receivables: [],
  payables: [],
  openingCash: 0,
  pnl: [],
  ads: [],
  payroll: [],
  staff: [],
  branches: [],
  abtest: null,
  empSurvey: [],
  custSurvey: null,
})

const round = (x: number, step = 1) => Math.round(x / step) * step

// ---------- Staff and payroll, shared by all three ----------

type RoleSpec = { role: string; median: number; female: number; monthlyLeave: number; overtime: number }

function staffAndPayroll(r: Rng, ds: Dataset, roles: { spec: RoleSpec; branch: string; count: number }[], opts: { ghost?: boolean; dupes?: boolean; spike?: boolean }) {
  const months = monthIndex(ds.start, ds.days - 1) + 1
  let next = 1001
  const make = (spec: RoleSpec, branch: string, hire: number): Staff => {
    const gender = r.next() < spec.female ? 'F' : 'M'
    const tenureYears = Math.max(0, -hire / 365)
    // Women are paid about 6% less in the same role: a gap the pay fairness check should find.
    const gap = gender === 'F' ? 0.94 : 1
    const salary = round(spec.median * gap * (1 + 0.015 * tenureYears) * Math.exp(r.normal(0, 0.12)), 50)
    const first = gender === 'F' ? r.pick(FIRST_F) : r.pick(FIRST_M)
    return {
      id: `E-${next++}`,
      name: `${first} ${r.pick(LAST)}`,
      role: spec.role,
      gender,
      hire,
      leave: null,
      salary,
      branch,
      overtimeHrs: Math.max(0, round(r.normal(spec.overtime, spec.overtime * 0.6))),
    }
  }
  const all: Staff[] = []
  for (const { spec, branch, count } of roles) for (let i = 0; i < count; i++) all.push(make(spec, branch, -r.int(30, 2600)))
  const specOf = new Map(roles.map((x) => [x.spec.role, x.spec]))
  // Month by month: some people leave and are replaced. Low pay and long overtime make leaving more likely.
  for (let m = 0; m < months; m++) {
    const day = m * 30.4
    for (const s of all.filter((x) => x.leave === null && x.hire <= day)) {
      const spec = specOf.get(s.role)!
      const ratio = s.salary / spec.median
      const p = spec.monthlyLeave * Math.exp(-5 * (ratio - 1)) * (s.overtimeHrs > 22 ? 2 : 1) * (s.hire > day - 365 ? 1.4 : 1)
      if (r.next() < p) {
        s.leave = Math.min(ds.days - 1, Math.round(day + r.int(0, 29)))
        all.push(make(spec, s.branch, s.leave + r.int(7, 40)))
      }
    }
  }
  ds.staff = all.filter((s) => s.hire < ds.days)
  // Payroll lines for each month a person was employed.
  const lines: PayrollLine[] = []
  for (let m = 0; m < months; m++) {
    const from = m * 30.4
    const to = from + 30
    for (const s of ds.staff) {
      if (s.hire > to || (s.leave !== null && s.leave < from)) continue
      const hourly = s.salary / 190
      let ot = Math.max(0, r.normal(s.overtimeHrs, 4))
      if (opts.spike && s === ds.staff[7] && m >= months - 6 && m <= months - 5) ot *= 4.5
      lines.push({ m, emp: s.id, name: s.name, base: s.salary, overtime: round(ot * hourly * 1.5), account: `EG38${s.id.slice(2)}00${(Number(s.id.slice(2)) * 7919) % 100000}` })
    }
    // A person on the payroll who is not on the staff list.
    if (opts.ghost && m >= months - 10) lines.push({ m, emp: 'E-9041', name: 'Mahmoud Samir', base: 14800, overtime: 2200, account: 'EG380090410077777' })
  }
  if (opts.dupes) {
    const target = lines.filter((l) => l.m === months - 4)
    lines.push({ ...target[3] }, { ...target[11] })
  }
  ds.payroll = lines
}

// ---------- Nile Home Furnishings: furniture retail, six branches ----------

export function nileData(): Dataset {
  const r = rng(11)
  const ds = blankDataset('2024-10-01', 730)
  const branches: Branch[] = [
    { id: 'HEL', name: 'Heliopolis', sqm: 1400, staff: 24 },
    { id: 'MAA', name: 'Maadi', sqm: 1100, staff: 20 },
    { id: 'NCA', name: 'New Cairo', sqm: 2200, staff: 30 },
    { id: 'ZAY', name: 'Sheikh Zayed', sqm: 1800, staff: 26 },
    { id: 'NAS', name: 'Nasr City', sqm: 900, staff: 20 },
    { id: 'GIZ', name: 'Giza', sqm: 1300, staff: 18 },
  ]
  const branchWeight = [1.0, 0.95, 1.55, 1.3, 0.8, 0.42]
  ds.branches = branches
  const P: [string, string, number, number, number, number][] = [
    // name, category, price, cost share, imported share, popularity
    ['Aswan 3-seat sofa', 'Living', 38500, 0.56, 0.35, 9],
    ['Luxor corner sofa', 'Living', 62000, 0.55, 0.35, 5],
    ['Siwa armchair', 'Living', 14800, 0.57, 0.3, 8],
    ['Nubia coffee table', 'Living', 7900, 0.52, 0.2, 10],
    ['Karnak TV unit', 'Living', 12400, 0.54, 0.25, 7],
    ['Dahab rug', 'Living', 6200, 0.48, 0.6, 8],
    ['Fayoum king bed', 'Bedroom', 29000, 0.57, 0.25, 7],
    ['Fayoum wardrobe', 'Bedroom', 34500, 0.58, 0.3, 5],
    ['Rosetta nightstand', 'Bedroom', 4300, 0.5, 0.2, 9],
    ['Sinai king mattress', 'Bedroom', 16900, 0.6, 0.45, 9],
    ['Rosetta dresser', 'Bedroom', 11800, 0.55, 0.25, 4],
    ['Kids bunk bed', 'Bedroom', 18400, 0.58, 0.3, 3],
    ['Alexandria dining table', 'Dining', 24600, 0.55, 0.2, 5],
    ['Alexandria dining chair', 'Dining', 3400, 0.5, 0.2, 11],
    ['Damietta buffet', 'Dining', 19800, 0.56, 0.2, 2],
    ['Bar stool', 'Dining', 2600, 0.48, 0.4, 3],
    ['Cairo desk', 'Office', 9800, 0.54, 0.3, 4],
    ['Ergo office chair', 'Office', 7600, 0.62, 0.7, 6],
    ['Open bookshelf', 'Office', 6900, 0.5, 0.2, 3],
    ['Floor lamp', 'Decor', 2900, 0.45, 0.75, 6],
    ['Wall mirror', 'Decor', 3800, 0.42, 0.5, 6],
    ['Cushion set', 'Decor', 1200, 0.38, 0.5, 12],
    ['Curtain pair', 'Decor', 2400, 0.44, 0.55, 7],
    ['Vase set', 'Decor', 1500, 0.4, 0.8, 4],
  ]
  const products: Product[] = P.map(([name, category, price, cs, imp], i) => ({
    id: `P${String(i + 1).padStart(3, '0')}`,
    name,
    category,
    price,
    cost: round(price * cs, 10),
    imported: imp,
    leadDays: imp > 0.5 ? r.int(45, 70) : r.int(14, 35),
    onHand: 0,
  }))
  const pop = P.map((p) => p[5])
  const season = [0.9, 1.05, 1.0, 0.95, 0.95, 1.1, 1.15, 1.1, 1.05, 0.95, 1.0, 1.05]
  const wd = [0.9, 0.85, 0.85, 0.9, 1.15, 1.4, 1.3]
  const hours = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
  const hourW = [2, 3, 4, 4, 4, 5, 6, 8, 11, 12, 11, 8, 4]
  let inv = 100000
  let oneTime = 20000
  // Prices rise 9% in February 2025, and living and bedroom pieces another 6% in January 2026.
  const priceFactor = (p: Product, d: number) => (d >= 123 ? 1.09 : 1) * (d >= 457 && (p.category === 'Living' || p.category === 'Bedroom') ? 1.06 : 1)
  for (let d = 0; d < ds.days; d++) {
    const summerSale = calMonth(ds.start, d) === 6 && new Date(Date.parse(ds.start) + d * 864e5).getUTCDate() <= 15
    const promo = whiteFriday(ds.start, d) || summerSale
    const lambda =
      30 *
      (1 + (0.13 * d) / 365) *
      season[calMonth(ds.start, d)] *
      wd[weekday(ds.start, d)] *
      (preRamadan(ds.start, d) ? 1.45 : 1) *
      (inRamadan(ds.start, d) ? 0.78 : 1) *
      (promo ? 1.55 : 1) *
      // Each price rise costs some customers (overall elasticity close to -0.9).
      (d >= 123 ? 0.925 : 1) *
      (d >= 457 ? 0.97 : 1) *
      Math.exp(r.normal(0, 0.07))
    const orders = r.poisson(lambda)
    for (let o = 0; o < orders; o++) {
      // Higher prices lower demand a little (elasticity about -1.2).
      const w = products.map((p, i) => pop[i] * priceFactor(p, d) ** -1.2)
      const p = r.weighted(products, w)
      const qty = p.category === 'Decor' ? r.int(1, 3) : p.name.includes('chair') && p.category === 'Dining' ? r.pick([2, 4, 6]) : 1
      const price = round(p.price * priceFactor(p, d) * (promo ? 0.88 : 1), 10)
      ds.sales.push({
        d,
        inv: `N-${inv++}`,
        cust: r.next() < 0.12 ? `C${r.int(10000, 10900)}` : `C${oneTime++}`,
        prod: p.id,
        branch: r.weighted(branches, branchWeight).id,
        channel: r.weighted(['Store', 'Online', 'Phone'], [80, 15, 5]),
        qty,
        price,
        cost: round(p.cost * priceFactor(p, d), 10),
        hour: r.weighted(hours, hourW),
        promo,
      })
    }
  }
  // Problems a real export has: repeated rows, a missing branch, returns entered as negative quantities.
  const n = ds.sales.length
  for (let i = 0; i < 58; i++) ds.sales.push({ ...ds.sales[r.int(0, n - 1)] })
  for (let i = 0; i < 24; i++) ds.sales[r.int(0, n - 1)].branch = ''
  for (let i = 0; i < 31; i++) {
    const s = ds.sales[r.int(0, n - 1)]
    ds.sales.push({ ...s, d: Math.min(ds.days - 1, s.d + r.int(2, 20)), qty: -s.qty })
  }
  ds.sales.sort((a, b) => a.d - b.d)
  // Stock on hand: somewhere between one and ten weeks of recent demand.
  products.forEach((p) => {
    const recent = ds.sales.filter((s) => s.prod === p.id && s.d >= ds.days - 90 && s.qty > 0).reduce((a, s) => a + s.qty, 0) / 90
    p.onHand = Math.max(0, round(recent * r.int(6, 70)))
  })
  ds.products = products
  // Weekly ad spend. Each channel brings customers with diminishing returns; Google is close to saturation.
  const resp: Record<string, [number, number]> = {
    'Facebook & Instagram': [150, 70000],
    'Google Search': [95, 24000],
    TikTok: [80, 45000],
    'Outdoor billboards': [70, 220000],
  }
  for (let w = 0; w < 104; w++) {
    for (const ch of Object.keys(resp)) {
      let spend = 0
      if (ch === 'Facebook & Instagram') spend = r.int(35, 85) * 1000
      if (ch === 'Google Search') spend = r.int(38, 60) * 1000
      if (ch === 'TikTok') spend = w < 30 ? 0 : r.int(12, 40) * 1000
      if (ch === 'Outdoor billboards') spend = w % 16 < 4 ? r.int(110, 160) * 1000 : 0
      const [k, s] = resp[ch]
      const nc = Math.max(0, Math.round(k * (1 - Math.exp(-spend / s)) * Math.exp(r.normal(0, 0.15))))
      ds.ads.push({ w, channel: ch, spend, newCustomers: nc, revenue: round(nc * 17500 * Math.exp(r.normal(0, 0.1)), 100) })
    }
  }
  const roles = (b: string, k: number): { spec: RoleSpec; branch: string; count: number }[] => [
    { spec: { role: 'Branch manager', median: 32000, female: 0.3, monthlyLeave: 0.006, overtime: 12 }, branch: b, count: 1 },
    { spec: { role: 'Interior designer', median: 18000, female: 0.7, monthlyLeave: 0.012, overtime: 10 }, branch: b, count: 2 },
    { spec: { role: 'Sales associate', median: 11000, female: 0.45, monthlyLeave: 0.024, overtime: 18 }, branch: b, count: Math.round(k * 0.5) },
    { spec: { role: 'Cashier', median: 9500, female: 0.6, monthlyLeave: 0.015, overtime: 8 }, branch: b, count: 2 },
    { spec: { role: 'Warehouse', median: 8500, female: 0, monthlyLeave: 0.018, overtime: 24 }, branch: b, count: Math.round(k * 0.2) },
    { spec: { role: 'Driver', median: 9000, female: 0, monthlyLeave: 0.016, overtime: 26 }, branch: b, count: Math.round(k * 0.12) },
  ]
  staffAndPayroll(
    r,
    ds,
    [
      ...branches.flatMap((b) => roles(b.id, b.staff)),
      { spec: { role: 'Accountant', median: 16000, female: 0.5, monthlyLeave: 0.008, overtime: 6 }, branch: 'HQ', count: 3 },
      { spec: { role: 'Marketing', median: 17000, female: 0.6, monthlyLeave: 0.012, overtime: 6 }, branch: 'HQ', count: 2 },
    ],
    { ghost: true, dupes: true, spike: true },
  )
  ds.pnl = pnlFrom(ds, (m) => sumRent(branches, m), 0.04, r)
  return ds
}

const sumRent = (branches: Branch[], m: number) => branches.reduce((a, b) => a + b.sqm * 170, 0) * (m >= 15 ? 1.15 : 1)

function pnlFrom(ds: Dataset, rent: (m: number) => number, otherShare: number, r: Rng) {
  const months = monthIndex(ds.start, ds.days - 1) + 1
  const out: PnlMonth[] = []
  const rev = Array(months).fill(0)
  const cogs = Array(months).fill(0)
  for (const s of ds.sales) {
    if (s.qty <= 0) continue
    const m = monthIndex(ds.start, s.d)
    rev[m] += s.qty * s.price
    cogs[m] += s.qty * s.cost
  }
  const pay = Array(months).fill(0)
  for (const l of ds.payroll) pay[l.m] += l.base + l.overtime
  const mkt = Array(months).fill(0)
  for (const a of ds.ads) mkt[Math.min(months - 1, Math.floor((a.w * 7) / 30.4))] += a.spend
  for (let m = 0; m < months; m++)
    out.push({ m, revenue: round(rev[m]), cogs: round(cogs[m]), payroll: round(pay[m]), rent: round(rent(m)), marketing: round(mkt[m]), other: round(rev[m] * otherShare * Math.exp(r.normal(0, 0.15))) })
  return out
}

// ---------- Delta Medical Supplies: distributor to pharmacies and clinics ----------

export function deltaData(): Dataset {
  const r = rng(22)
  const ds = blankDataset('2024-10-01', 730)
  const kinds = ['Pharmacy', 'Pharmacy', 'Pharmacy', 'Clinic', 'Medical Center', 'Hospital']
  const names = ['Al Shifa', 'El Nour', 'Misr', 'Al Hayah', 'Dar El Salam', 'Al Rahma', 'Nile', 'Al Amal', 'Cleopatra', 'Al Salam', 'El Gomhoreya', 'Zamalek', 'Al Mostakbal', 'Rofayda', 'El Ezaby', 'Seif', 'Al Tarek', 'Horus', 'Al Fayrouz', 'Maadi Care', 'Andalusia', 'Saudi German', 'El Hayat', 'Royal', 'Golden', 'Sun', 'Dr. Hanaa', 'Family Care', 'Heliopolis', 'October']
  const customers = Array.from({ length: 118 }, (_, i) => `${names[i % names.length]} ${kinds[i % kinds.length]}${i >= names.length ? ' ' + ['Nasr City', 'Dokki', 'Mohandessin', 'Shubra'][Math.floor(i / names.length) - 1] : ''}`)
  const custW = customers.map((_, i) => 1 / (i + 3) ** 0.9)
  const terms = customers.map(() => r.pick([30, 45, 60, 60, 90]))
  // The same customer typed differently in the e-invoice export: one of the things cleaning fixes.
  const variant = (c: string) => {
    const k = r.int(0, 3)
    if (k === 0) return c.toUpperCase()
    if (k === 1) return c.replace(/^Al /, 'El ').replace(/^El /, 'Al ')
    if (k === 2) return c.replace(' ', '-')
    return c + '.'
  }
  const P: [string, number, number][] = [
    ['Nitrile gloves, box of 100', 420, 0.85],
    ['Syringes 5 ml, box of 100', 380, 0.8],
    ['Gauze rolls, pack of 12', 260, 0.4],
    ['Blood pressure monitor', 2150, 0.95],
    ['Glucose test strips, 50', 640, 0.95],
    ['IV cannula, box of 50', 910, 0.9],
    ['Surgical masks, box of 50', 190, 0.6],
    ['Disinfectant 5 L', 520, 0.3],
    ['Digital thermometer', 310, 0.9],
    ['Pulse oximeter', 980, 0.95],
    ['Nebulizer', 2650, 0.95],
    ['Wheelchair', 9800, 0.85],
  ]
  ds.products = P.map(([name, price, imp], i) => ({ id: `M${String(i + 1).padStart(3, '0')}`, name, category: 'Medical supplies', price, cost: round(price * 0.72, 5), imported: imp, leadDays: imp > 0.7 ? r.int(50, 80) : r.int(10, 25), onHand: r.int(80, 1600) }))
  let no = 240001
  const gapMonth = 17
  // Three steady customers who quietly moved to a competitor.
  const gone = new Set([customers[6], customers[11], customers[17]])
  for (let d = 0; d < ds.days; d++) {
    const wday = weekday(ds.start, d)
    if (wday === 5 || wday === 6) continue
    const n = r.poisson(24 * (1 + (0.18 * d) / 365) * (calMonth(ds.start, d) === 0 ? 1.15 : 1) * (inRamadan(ds.start, d) ? 0.85 : 1))
    for (let i = 0; i < n; i++) {
      // A run of missing invoice numbers in one month: cancelled or deleted invoices to explain.
      if (monthIndex(ds.start, d) === gapMonth && r.next() < 0.03) no++
      const c = r.weighted(customers, custW)
      if (gone.has(c) && d > ds.days - 100) continue
      const amount = Math.round(Math.exp(r.normal(Math.log(16000), 0.95)) * 100) / 100
      ds.einv.push({ no: no++, d, cust: customers.indexOf(c) % 5 === 0 && r.next() < 0.25 ? variant(c) : c, amount })
      const p = r.weighted(ds.products, [9, 8, 6, 2, 5, 4, 7, 5, 4, 3, 1, 0.5])
      ds.sales.push({ d, inv: `INV-${no - 1}`, cust: c, prod: p.id, branch: 'Main warehouse', channel: 'B2B', qty: Math.max(1, Math.round(amount / p.price)), price: p.price, cost: p.cost, hour: r.int(9, 17), promo: false })
    }
  }
  // Books: sales entries copy the e-invoices, with a few missing and a few typed wrong.
  const missingInBooks = new Set(Array.from({ length: 14 }, () => r.int(0, ds.einv.length - 1)))
  const typo = new Set(Array.from({ length: 6 }, () => r.int(0, ds.einv.length - 1)))
  ds.einv.forEach((e, i) => {
    if (missingInBooks.has(i)) return
    const amount = typo.has(i) ? round(e.amount * 1.1, 0.01) : e.amount
    ds.ledger.push({ id: `J${ds.ledger.length + 1}`, d: e.d, account: 'Sales', party: e.cust, amount, ref: `INV-${e.no}` })
  })
  const vendors = ['MedSource GmbH', 'Shanghai Medical Co.', 'Pharco Packaging', 'Cairo Logistics', 'Nile Customs Brokers', 'El Nasr Printing', 'Delta Office Supplies', 'Al Amal Maintenance', 'Egypt Post', 'Orange Business']
  const vendorW = [6, 5, 4, 5, 3, 2, 2, 2, 1, 1]
  let pref = 50001
  for (let d = 0; d < ds.days; d++) {
    const wday = weekday(ds.start, d)
    if (wday === 5 || wday === 6) continue
    const n = r.poisson(4.2)
    for (let i = 0; i < n; i++) {
      const v = r.weighted(vendors, vendorW)
      const amount = Math.round(Math.exp(r.normal(Math.log(v.includes('GmbH') || v.includes('Shanghai') ? 120000 : 14000), 1.0)) * 100) / 100
      ds.ledger.push({ id: `J${ds.ledger.length + 1}`, d, account: 'Purchases & expenses', party: v, amount, ref: `PV-${pref++}` })
    }
  }
  // Payments split to stay just under the 10,000 approval limit: a pile of amounts starting with 9.
  for (let i = 0; i < 150; i++) {
    const d = r.int(400, ds.days - 1)
    ds.ledger.push({ id: `J${ds.ledger.length + 1}`, d, account: 'Purchases & expenses', party: 'Al Amal Maintenance', amount: round(9000 + r.next() * 990, 0.01), ref: `PV-${pref++}` })
  }
  // The same supplier invoice paid twice, a few days apart.
  const exp = ds.ledger.filter((l) => l.account !== 'Sales')
  for (let i = 0; i < 7; i++) {
    const e = exp[r.int(0, exp.length - 1)]
    ds.ledger.push({ ...e, id: `J${ds.ledger.length + 1}`, d: Math.min(ds.days - 1, e.d + r.int(1, 3)), ref: `PV-${pref++}` })
  }
  ds.ledger.sort((a, b) => a.d - b.d)
  // Staff and payroll.
  staffAndPayroll(
    r,
    ds,
    [
      { spec: { role: 'Sales representative', median: 13500, female: 0.35, monthlyLeave: 0.02, overtime: 10 }, branch: 'Main', count: 18 },
      { spec: { role: 'Pharmacist', median: 16500, female: 0.6, monthlyLeave: 0.01, overtime: 6 }, branch: 'Main', count: 4 },
      { spec: { role: 'Warehouse', median: 8800, female: 0, monthlyLeave: 0.018, overtime: 22 }, branch: 'Main', count: 16 },
      { spec: { role: 'Driver', median: 9200, female: 0, monthlyLeave: 0.016, overtime: 25 }, branch: 'Main', count: 12 },
      { spec: { role: 'Accountant', median: 15500, female: 0.5, monthlyLeave: 0.008, overtime: 8 }, branch: 'Main', count: 5 },
      { spec: { role: 'Manager', median: 34000, female: 0.25, monthlyLeave: 0.005, overtime: 10 }, branch: 'Main', count: 4 },
    ],
    { spike: true },
  )
  // Bank: customers pay after their terms, some late; a few deposits with no invoice behind them.
  const end = ds.days
  const paid = new Set<number>()
  ds.einv.forEach((e) => {
    const ci = customers.indexOf(e.cust) >= 0 ? customers.indexOf(e.cust) : 0
    const late = r.next() < 0.3 ? r.int(15, 75) : r.int(-5, 8)
    const pd = e.d + terms[ci] + late
    if (pd < end && r.next() > 0.015) {
      ds.bank.push({ d: pd, desc: `Transfer from ${e.cust}`, amount: e.amount, ref: `INV-${e.no}` })
      paid.add(e.no)
    }
  })
  for (let i = 0; i < 11; i++) ds.bank.push({ d: r.int(200, end - 1), desc: 'Cash deposit', amount: round(8000 + r.next() * 32000, 0.01), ref: '' })
  ds.ledger.forEach((l) => {
    if (l.account !== 'Sales' && l.d + 1 < end) ds.bank.push({ d: l.d + 1, desc: `Payment to ${l.party}`, amount: -l.amount, ref: l.ref })
  })
  const months = monthIndex(ds.start, end - 1) + 1
  for (let m = 0; m < months; m++) {
    const d = Math.min(end - 1, Math.round(m * 30.4 + 25))
    const pay = ds.payroll.filter((p) => p.m === m).reduce((a, p) => a + p.base + p.overtime, 0)
    ds.bank.push({ d, desc: 'Payroll', amount: -round(pay, 0.01), ref: `PAY-${m}` })
    ds.bank.push({ d: Math.round(m * 30.4 + 2), desc: 'Rent', amount: -95000, ref: `RENT-${m}` })
  }
  ds.bank.sort((a, b) => a.d - b.d)
  // Cash in the bank on the last day of the data: enough for now, tight once the import bills land.
  ds.openingCash = 1_350_000
  // Unpaid invoices at the end, and the bills due over the next quarter, including a large import shipment.
  ds.einv.filter((e) => !paid.has(e.no) && e.d > end - 160).forEach((e) => {
    const ci = Math.max(0, customers.indexOf(e.cust))
    ds.receivables.push({ inv: `INV-${e.no}`, cust: e.cust, amount: e.amount, due: e.d + terms[ci] })
  })
  const bills: Payable[] = []
  const weeklySales = ds.einv.filter((e) => e.d >= end - 91).reduce((a, e) => a + e.amount, 0) / 13
  for (let w = 0; w < 13; w++) {
    // Local supplies and services, paid weekly.
    const k = r.int(4, 8)
    for (let i = 0; i < k; i++) {
      const v = r.weighted(vendors.slice(2), vendorW.slice(2))
      bills.push({ ref: `BILL-${7000 + bills.length}`, vendor: v, amount: round((weeklySales * 0.72 * 0.3) / k * Math.exp(r.normal(0, 0.2)), 0.01), due: end + w * 7 + r.int(0, 6) })
    }
  }
  // Imported stock, paid on arrival: the big lumps that make cash tight.
  const shipment = weeklySales * 4.33 * 0.72 * 0.7
  bills.push({ ref: 'BILL-IMPORT-33', vendor: 'Shanghai Medical Co.', amount: round(shipment * 0.7, 1000), due: end + 2 * 7 + 1 })
  bills.push({ ref: 'BILL-IMPORT-34', vendor: 'MedSource GmbH', amount: round(shipment * 0.75, 1000), due: end + 5 * 7 + 3 })
  bills.push({ ref: 'BILL-IMPORT-35', vendor: 'MedSource GmbH', amount: round(shipment * 0.95, 1000), due: end + 8 * 7 + 2 })
  bills.push({ ref: 'BILL-IMPORT-36', vendor: 'Shanghai Medical Co.', amount: round(shipment * 0.6, 1000), due: end + 8 * 7 + 4 })
  ds.payables = bills
  ds.pnl = pnlFrom(ds, () => 95000, 0.035, r)
  return ds
}

// ---------- Lotus Beauty: online skincare shop ----------

export function lotusData(): Dataset {
  const r = rng(33)
  const ds = blankDataset('2025-04-01', 548)
  const P: [string, number, number, number][] = [
    ['Rose hydrating serum', 650, 0.3, 10],
    ['Vitamin C serum', 720, 0.32, 8],
    ['Daily SPF 50', 540, 0.35, 9],
    ['Night cream', 690, 0.3, 6],
    ['Clay mask', 380, 0.28, 5],
    ['Lip balm set', 220, 0.25, 7],
    ['Hair oil', 410, 0.3, 6],
    ['Body lotion', 350, 0.3, 5],
    ['Gentle cleanser', 330, 0.27, 8],
    ['Eye cream', 590, 0.3, 3],
    ['Gift box', 1450, 0.4, 2],
    ['Travel kit', 480, 0.35, 2],
  ]
  ds.products = P.map(([name, price, cs], i) => ({ id: `L${String(i + 1).padStart(3, '0')}`, name, category: 'Skincare', price, cost: round(price * cs, 5), imported: r.int(35, 75) / 100, leadDays: r.int(20, 50), onHand: 0 }))
  const pw = P.map((p) => p[3])
  const channels: Record<string, [number, number]> = { Instagram: [120, 60000], TikTok: [110, 35000], 'Google Search': [55, 30000], Influencers: [90, 90000] }
  const weeks = Math.ceil(ds.days / 7)
  let inv = 500000
  let cust = 1
  const orders: Sale[][] = []
  const placeOrder = (d: number, c: string, ch: string) => {
    const lines: Sale[] = []
    const k = r.weighted([1, 2, 3, 4], [45, 32, 16, 7])
    const id = `W-${inv++}`
    const promo = whiteFriday(ds.start, d)
    for (let i = 0; i < k; i++) {
      const p = r.weighted(ds.products, pw)
      const same = lines.find((l) => l.prod === p.id)
      if (same) {
        same.qty++
        continue
      }
      lines.push({ d, inv: id, cust: c, prod: p.id, branch: 'Online', channel: ch, qty: 1, price: round(p.price * (promo ? 0.8 : 1), 5), cost: p.cost, hour: r.weighted([9, 12, 15, 18, 20, 22, 23], [1, 2, 2, 3, 4, 4, 2]), promo })
    }
    orders.push(lines)
  }
  for (let w = 0; w < weeks; w++) {
    for (const ch of Object.keys(channels)) {
      const [k, s] = channels[ch]
      const boost = whiteFriday(ds.start, w * 7) || preRamadan(ds.start, w * 7) ? 1.6 : 1
      const spend = r.int(ch === 'Influencers' ? 0 : 15, ch === 'Instagram' ? 110 : 70) * 1000 * boost
      const nc = Math.round(k * (1 - Math.exp(-spend / s)) * boost * Math.exp(r.normal(0, 0.12)))
      let rev = 0
      for (let i = 0; i < nc; i++) {
        // Each customer has their own buying rate and chance of drifting away (the BG/NBD story).
        const c = `CU${String(cust++).padStart(5, '0')}`
        let d = w * 7 + r.int(0, 6)
        if (d >= ds.days) break
        const rate = Math.exp(r.normal(Math.log(1 / 55), 0.6))
        const drop = Math.min(0.6, Math.max(0.05, r.normal(0.28, 0.12)))
        placeOrder(d, c, ch)
        rev += orders[orders.length - 1].reduce((a, s) => a + s.price, 0)
        while (r.next() > drop) {
          d += Math.max(3, Math.round(-Math.log(1 - r.next()) / rate))
          if (d >= ds.days) break
          placeOrder(d, c, ch)
        }
      }
      ds.ads.push({ w, channel: ch, spend, newCustomers: nc, revenue: round(rev, 10) })
    }
  }
  ds.sales = orders.flat().sort((a, b) => a.d - b.d)
  ds.products.forEach((p) => {
    const recent = ds.sales.filter((s) => s.prod === p.id && s.d >= ds.days - 60).length / 60
    p.onHand = Math.round(recent * r.int(8, 60))
  })
  ds.abtest = { name: 'One-page checkout', metric: 'Orders per visitor', a: { visitors: 18420, conversions: 481 }, b: { visitors: 18310, conversions: 553 } }
  const answers: PriceAnswer[] = Array.from({ length: 420 }, () => {
    const tc = Math.max(120, r.normal(300, 70))
    const ch = tc + Math.max(40, r.normal(190, 60))
    const ex = ch + Math.max(60, r.normal(260, 80))
    const te = ex + Math.max(60, r.normal(230, 90))
    return { tooCheap: round(tc, 10), cheap: round(ch, 10), expensive: round(ex, 10), tooExpensive: round(te, 10) }
  })
  ds.custSurvey = { product: 'Rose hydrating serum', answers }
  staffAndPayroll(
    r,
    ds,
    [
      { spec: { role: 'Customer service', median: 10500, female: 0.75, monthlyLeave: 0.03, overtime: 12 }, branch: 'Online', count: 10 },
      { spec: { role: 'Content creator', median: 15000, female: 0.7, monthlyLeave: 0.02, overtime: 14 }, branch: 'Online', count: 6 },
      { spec: { role: 'Packer', median: 8200, female: 0.4, monthlyLeave: 0.03, overtime: 20 }, branch: 'Online', count: 12 },
      { spec: { role: 'Marketing', median: 18000, female: 0.6, monthlyLeave: 0.015, overtime: 8 }, branch: 'Online', count: 5 },
      { spec: { role: 'Developer', median: 26000, female: 0.3, monthlyLeave: 0.015, overtime: 6 }, branch: 'Online', count: 3 },
    ],
    {},
  )
  const comments: [number, string][] = [
    [9, 'Love the team and the products, I feel proud of what we make.'],
    [8, 'Good culture and supportive manager.'],
    [4, 'The workload in peak season is too much, we stay late every day.'],
    [3, 'Pay is below the market for the hours we work.'],
    [5, 'No clear path to grow or get promoted.'],
    [7, 'Flexible hours help a lot.'],
    [2, 'Too much overtime during White Friday and Ramadan, nobody plans ahead.'],
    [6, 'Tools are slow, the order system crashes in busy hours.'],
    [9, 'Great place to learn, management listens.'],
    [4, 'Salary increases did not keep up with prices.'],
    [5, 'I do not know how my performance is judged.'],
    [8, 'Friendly team, good training.'],
  ]
  ds.empSurvey = Array.from({ length: 34 }, (): EmpSurvey => {
    const [base, comment] = r.pick(comments)
    return { score: Math.min(10, Math.max(0, base + r.int(-1, 1))), comment }
  })
  ds.pnl = []
  return ds
}

