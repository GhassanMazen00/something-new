// Day indexes to calendar dates. Every dataset counts days from its own start date.

const MS = 86400000
export const toDate = (start: string, d: number) => new Date(Date.parse(start + 'T00:00:00Z') + d * MS)
export const iso = (start: string, d: number) => toDate(start, d).toISOString().slice(0, 10)
// Months since the start month (0 = the start month).
export const monthIndex = (start: string, d: number) => {
  const s = toDate(start, 0)
  const x = toDate(start, d)
  return (x.getUTCFullYear() - s.getUTCFullYear()) * 12 + x.getUTCMonth() - s.getUTCMonth()
}
export const weekday = (start: string, d: number) => toDate(start, d).getUTCDay() // 0 Sunday … 5 Friday, 6 Saturday
export const calMonth = (start: string, d: number) => toDate(start, d).getUTCMonth() // 0 January
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const monthName = (m: number) => MONTHS[((m % 12) + 12) % 12]
// Label for a month index, e.g. "Mar 26".
export const monthLabel = (start: string, m: number) => {
  const s = toDate(start, 0)
  const total = s.getUTCMonth() + m
  const y = s.getUTCFullYear() + Math.floor(total / 12)
  return `${monthName(total)} ${String(y).slice(2)}`
}
export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Ramadan, approximate Gregorian dates.
const RAMADAN = [
  ['2025-03-01', '2025-03-30'],
  ['2026-02-18', '2026-03-19'],
  ['2027-02-08', '2027-03-09'],
]
export const inRamadan = (start: string, d: number) => {
  const x = iso(start, d)
  return RAMADAN.some(([a, b]) => x >= a && x <= b)
}
// The two weeks before Ramadan, when furniture and food spending peaks.
export const preRamadan = (start: string, d: number) => {
  const t = toDate(start, d).getTime()
  return RAMADAN.some(([a]) => {
    const r = Date.parse(a + 'T00:00:00Z')
    return t < r && t >= r - 14 * MS
  })
}
// White Friday sales: the last week of November.
export const whiteFriday = (start: string, d: number) => {
  const x = toDate(start, d)
  return x.getUTCMonth() === 10 && x.getUTCDate() >= 24
}
