// Seeded random numbers, so every sample dataset is identical on every load.
export function rng(seed: number) {
  let s = seed >>> 0
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const normal = (mean = 0, sd = 1) => {
    const u = 1 - next()
    const v = next()
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  const int = (min: number, max: number) => Math.floor(min + next() * (max - min + 1))
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(next() * xs.length)]
  // Picks by weight: weights need not sum to 1.
  const weighted = <T,>(xs: readonly T[], w: readonly number[]) => {
    const total = w.reduce((a, b) => a + b, 0)
    let r = next() * total
    for (let i = 0; i < xs.length; i++) {
      r -= w[i]
      if (r <= 0) return xs[i]
    }
    return xs[xs.length - 1]
  }
  const poisson = (lambda: number) => {
    if (lambda > 30) return Math.max(0, Math.round(normal(lambda, Math.sqrt(lambda))))
    const l = Math.exp(-lambda)
    let k = 0
    let p = 1
    do {
      k++
      p *= next()
    } while (p > l)
    return k - 1
  }
  return { next, normal, int, pick, weighted, poisson }
}
export type Rng = ReturnType<typeof rng>
