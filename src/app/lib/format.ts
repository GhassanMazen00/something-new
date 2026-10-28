// Number formatting for the workspace. Money is Egyptian pounds.

export function egp(n: number, opts: { exact?: boolean } = {}) {
  const sign = n < 0 ? '−' : ''
  const a = Math.abs(n)
  if (!opts.exact) {
    if (a >= 1e9) return `${sign}EGP ${(a / 1e9).toFixed(2)}B`
    if (a >= 1e6) return `${sign}EGP ${(a / 1e6).toFixed(a >= 1e7 ? 1 : 2)}M`
    if (a >= 1e4) return `${sign}EGP ${(a / 1e3).toFixed(0)}K`
  }
  return `${sign}EGP ${Math.round(a).toLocaleString('en-US')}`
}
export const num = (n: number, digits = 0) => n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits })
export const pct = (x: number, digits = 1) => `${(x * 100).toFixed(digits)}%`
export const signedPct = (x: number, digits = 1) => `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(digits)}%`
// Short axis labels: 1.2M, 340K.
export function short(n: number) {
  const a = Math.abs(n)
  const s = n < 0 ? '−' : ''
  if (a >= 1e6) return `${s}${(a / 1e6).toFixed(a >= 1e7 ? 0 : 1)}M`
  if (a >= 1e3) return `${s}${(a / 1e3).toFixed(a >= 1e4 ? 0 : 1)}K`
  return `${s}${Math.round(a * 10) / 10}`
}
