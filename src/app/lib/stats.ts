// The statistics the services share. Plain implementations of standard methods.

export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
export const mean = (xs: number[]) => (xs.length ? sum(xs) / xs.length : 0)
export const sd = (xs: number[]) => {
  if (xs.length < 2) return 0
  const m = mean(xs)
  return Math.sqrt(sum(xs.map((x) => (x - m) ** 2)) / (xs.length - 1))
}
export const quantile = (xs: number[], q: number) => {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const pos = (s.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return s[lo] + (s[hi] - s[lo]) * (pos - lo)
}
export const median = (xs: number[]) => quantile(xs, 0.5)
export const groupBy = <T, K extends string | number>(xs: T[], key: (x: T) => K) => {
  const m = new Map<K, T[]>()
  for (const x of xs) {
    const k = key(x)
    const arr = m.get(k)
    if (arr) arr.push(x)
    else m.set(k, [x])
  }
  return m
}
export const sumBy = <T,>(xs: T[], f: (x: T) => number) => xs.reduce((a, x) => a + f(x), 0)
export const movingAverage = (xs: number[], w: number) =>
  xs.map((_, i) => (i < w - 1 ? NaN : mean(xs.slice(i - w + 1, i + 1))))

// Mean absolute percentage error.
export const mape = (actual: number[], pred: number[]) =>
  mean(actual.map((a, i) => Math.abs((a - pred[i]) / (a || 1))))

// Normal distribution: CDF and inverse, for tests and safety stock.
export function normCdf(z: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp((-z * z) / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return z > 0 ? 1 - p : p
}
export function normInv(p: number): number {
  // Acklam's approximation.
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239]
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572]
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416]
  const pl = 0.02425
  if (p < pl) {
    const q = Math.sqrt(-2 * Math.log(p))
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }
  if (p > 1 - pl) return -normInv(1 - p)
  const q = p - 0.5
  const r = q * q
  return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
}

// Ordinary least squares with an intercept. Returns coefficients (intercept first), R² and fitted values.
export function ols(X: number[][], y: number[]) {
  const n = y.length
  const A = X.map((row) => [1, ...row])
  const k = A[0].length
  const XtX = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => sum(A.map((r) => r[i] * r[j]))))
  const Xty = Array.from({ length: k }, (_, i) => sum(A.map((r, t) => r[i] * y[t])))
  const beta = solve(XtX, Xty)
  const fit = A.map((r) => sum(r.map((v, i) => v * beta[i])))
  const ym = mean(y)
  const ssr = sum(y.map((v, i) => (v - fit[i]) ** 2))
  const sst = sum(y.map((v) => (v - ym) ** 2))
  const sigma2 = ssr / Math.max(1, n - k)
  const inv = invert(XtX)
  const se = inv.map((row, i) => Math.sqrt(Math.max(0, row[i] * sigma2)))
  return { beta, se, r2: sst ? 1 - ssr / sst : 0, fit }
}

function solve(M: number[][], v: number[]) {
  const n = v.length
  const a = M.map((row, i) => [...row, v[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r
    ;[a[c], a[p]] = [a[p], a[c]]
    const piv = a[c][c] || 1e-12
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = a[r][c] / piv
      for (let j = c; j <= n; j++) a[r][j] -= f * a[c][j]
    }
  }
  return a.map((row, i) => row[n] / (row[i] || 1e-12))
}
function invert(M: number[][]) {
  const n = M.length
  return Array.from({ length: n }, (_, j) => solve(M, Array.from({ length: n }, (_, i) => (i === j ? 1 : 0)))).reduce<number[][]>(
    (acc, col, j) => {
      col.forEach((v, i) => (acc[i][j] = v))
      return acc
    },
    Array.from({ length: n }, () => Array(n).fill(0)),
  )
}

// Logistic regression by gradient descent on standardised inputs. Returns a scoring function and the weights.
export function logistic(X: number[][], y: number[], iters = 600, lr = 0.3) {
  const k = X[0].length
  const mu = Array.from({ length: k }, (_, j) => mean(X.map((r) => r[j])))
  const sg = Array.from({ length: k }, (_, j) => sd(X.map((r) => r[j])) || 1)
  const Z = X.map((r) => r.map((v, j) => (v - mu[j]) / sg[j]))
  const w = Array(k + 1).fill(0)
  const sig = (z: number) => 1 / (1 + Math.exp(-z))
  for (let it = 0; it < iters; it++) {
    const g = Array(k + 1).fill(0)
    Z.forEach((r, i) => {
      const e = sig(w[0] + sum(r.map((v, j) => v * w[j + 1]))) - y[i]
      g[0] += e
      r.forEach((v, j) => (g[j + 1] += e * v))
    })
    for (let j = 0; j <= k; j++) w[j] -= (lr * g[j]) / Z.length
  }
  const score = (row: number[]) => sig(w[0] + sum(row.map((v, j) => ((v - mu[j]) / sg[j]) * w[j + 1])))
  return { score, weights: w.slice(1) }
}

// Area under the ROC curve.
export function auc(scores: number[], labels: number[]) {
  const pairs = scores.map((s, i) => [s, labels[i]]).sort((a, b) => a[0] - b[0])
  let rank = 0
  let pos = 0
  pairs.forEach(([, l], i) => {
    if (l) {
      rank += i + 1
      pos++
    }
  })
  const neg = pairs.length - pos
  return pos && neg ? (rank - (pos * (pos + 1)) / 2) / (pos * neg) : 0.5
}

// Additive Holt-Winters (triple exponential smoothing), grid-searched on in-sample one-step error.
export function holtWinters(y: number[], season: number, horizon: number) {
  let best = { err: Infinity, a: 0.3, b: 0.1, g: 0.2 }
  const run = (a: number, b: number, g: number, h: number) => {
    let level = mean(y.slice(0, season))
    let trend = (mean(y.slice(season, 2 * season)) - level) / season
    const seas = y.slice(0, season).map((v) => v - level)
    const fitted: number[] = []
    let err = 0
    for (let t = 0; t < y.length; t++) {
      const s = seas[t % season]
      const f = level + trend + s
      fitted.push(f)
      if (t >= season) err += (y[t] - f) ** 2
      const prevLevel = level
      level = a * (y[t] - s) + (1 - a) * (level + trend)
      trend = b * (level - prevLevel) + (1 - b) * trend
      seas[t % season] = g * (y[t] - level) + (1 - g) * s
    }
    const forecast = Array.from({ length: h }, (_, i) => level + (i + 1) * trend + seas[(y.length + i) % season])
    return { err, fitted, forecast }
  }
  for (const a of [0.1, 0.2, 0.3, 0.5, 0.7])
    for (const b of [0.01, 0.05, 0.1, 0.2])
      for (const g of [0.05, 0.1, 0.3, 0.5]) {
        const { err } = run(a, b, g, 0)
        if (err < best.err) best = { err, a, b, g }
      }
  const out = run(best.a, best.b, best.g, horizon)
  const resid = y.slice(season).map((v, i) => v - out.fitted[i + season])
  return { forecast: out.forecast, fitted: out.fitted, sigma: sd(resid), params: best }
}

// Seasonal naive: the same month last year, scaled by the year-on-year growth.
export function seasonalNaive(y: number[], season: number, horizon: number) {
  const last = y.slice(-season)
  const prev = y.slice(-2 * season, -season)
  const growth = prev.length ? sum(last) / (sum(prev) || 1) : 1
  return Array.from({ length: horizon }, (_, i) => last[i % season] * growth)
}

// Croston's method for slow, intermittent demand: average demand size over average gap.
export function croston(y: number[], alpha = 0.1) {
  let z = 0
  let p = 1
  let q = 1
  let first = true
  for (const v of y) {
    if (v > 0) {
      if (first) {
        z = v
        p = q
        first = false
      } else {
        z = alpha * v + (1 - alpha) * z
        p = alpha * q + (1 - alpha) * p
      }
      q = 1
    } else q++
  }
  return first ? 0 : z / p
}

// Kaplan-Meier survival estimate. durations in months, event 1 = left.
export function kaplanMeier(durations: number[], events: number[]) {
  const times = [...new Set(durations.filter((_, i) => events[i]))].sort((a, b) => a - b)
  let s = 1
  const out: { t: number; s: number }[] = [{ t: 0, s: 1 }]
  for (const t of times) {
    const atRisk = durations.filter((d) => d >= t).length
    const died = durations.filter((d, i) => d === t && events[i]).length
    if (atRisk) s *= 1 - died / atRisk
    out.push({ t, s })
  }
  return out
}

// Levenshtein distance, for matching names typed differently.
export function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return dp[b.length]
}
export const similarity = (a: string, b: string) => 1 - levenshtein(a, b) / Math.max(a.length, b.length, 1)
