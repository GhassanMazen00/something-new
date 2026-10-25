import { sha256 } from './sha256'

// The app never stores answers or codes in plain text, only their hashes.
// Reading the source code doesn't reveal them.
//
// To add a code: open the Game Master console (#gm) or run
//   node scripts/hash.mjs <seasonId> <questId> <CODE>
// and paste the hash into the quest's `answers` list.

// "drop 7q4m", "DROP-7Q4M" and "Drop.7Q4M" all count as the same code.
// Arabic answers are normalized too (diacritics, alef/yaa/taa marbuta forms).
export function normalizeAnswer(raw: string): string {
  return raw
    .normalize('NFKC')
    .toUpperCase()
    .replace(/[ً-ْـ]/g, '') // Arabic diacritics + tatweel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}]/gu, '')
}

export function answerHash(seasonId: string, questId: string, raw: string): string {
  return sha256(`irl:${seasonId}:${questId}:${normalizeAnswer(raw)}`)
}

export function checkAnswer(seasonId: string, questId: string, raw: string, hashes: string[]): boolean {
  if (!normalizeAnswer(raw)) return false
  return hashes.includes(answerHash(seasonId, questId, raw))
}

// Short, readable codes for printing on real-world items (no 0/O or 1/I confusion).
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function randomCode(prefix = '', groups = 2, size = 4): string {
  const values = crypto.getRandomValues(new Uint32Array(groups * size))
  const chars = Array.from(values, (v) => CODE_ALPHABET[v % CODE_ALPHABET.length]).join('')
  const parts = Array.from({ length: groups }, (_, i) => chars.slice(i * size, (i + 1) * size))
  return [prefix, ...parts].filter(Boolean).join('-')
}

// Claim codes let the Game Master check a reward claim in person:
// the same runner + reward always gives the same code.
export function claimCode(runnerId: string, rewardId: string, salt: string): string {
  const h = sha256(`claim:${salt}:${runnerId}:${rewardId}`).toUpperCase()
  return `CLM-${h.slice(0, 4)}-${h.slice(4, 8)}`
}
