// Prints the hash to paste into a quest's `answers` list.
// Usage: node scripts/hash.mjs s1 l1-deaddrop DROP-7Q4M
// Must match normalizeAnswer() + answerHash() in src/lib/verify.ts.
import { createHash } from 'node:crypto'

const [seasonId, questId, ...rest] = process.argv.slice(2)
const raw = rest.join(' ')
if (!seasonId || !questId || !raw) {
  console.error('Usage: node scripts/hash.mjs <seasonId> <questId> <answer>')
  process.exit(1)
}

const normalized = raw
  .normalize('NFKC')
  .toUpperCase()
  .replace(/[ً-ْـ]/g, '')
  .replace(/[أإآ]/g, 'ا')
  .replace(/ى/g, 'ي')
  .replace(/ة/g, 'ه')
  .replace(/[^\p{L}\p{N}]/gu, '')

const hash = createHash('sha256').update(`irl:${seasonId}:${questId}:${normalized}`).digest('hex')
console.log(`${normalized}  ->  '${hash}',`)
