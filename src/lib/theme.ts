import type { QuestKind } from '../data/types'

export const NEON = {
  cyan: '#00f0ff',
  magenta: '#ff2bd6',
  acid: '#f5f000',
  alert: '#ff2a4f',
  matrix: '#3dff8b',
  edge: '#1d2a45',
  dim: '#7183a8',
}

export const KIND_COLOR: Record<QuestKind, string> = {
  terminal: NEON.matrix,
  puzzle: NEON.cyan,
  'social-find': NEON.magenta,
  'social-post': NEON.magenta,
  real: NEON.acid,
}

export const KIND_GLYPH: Record<QuestKind, string> = {
  terminal: '>_',
  puzzle: '#',
  'social-find': '@',
  'social-post': '@',
  real: '◎',
}
