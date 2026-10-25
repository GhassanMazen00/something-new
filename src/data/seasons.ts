import { SEASON_1 } from './season1'
import type { LootItem, Season, SeasonTeaser } from './types'

// Playable seasons, in order. Add SEASON_2 here when its story is ready.
export const SEASONS: Season[] = [SEASON_1]

// Shown as "CLASSIFIED" teasers on the map.
export const UPCOMING: SeasonTeaser[] = [{ number: 2, codename: '██████ ████' }]

export const seasonById = (id: string) => SEASONS.find((s) => s.id === id)

// Real-world rewards. A runner claims them in the app, then shows the claim code
// to the Game Master (you) to get the item. Verify claims in the #gm console.
export const LOOT: LootItem[] = [
  {
    id: 's1-stickers',
    kind: 'item',
    glyph: '◆',
    seasonId: 's1',
    levelId: 'l1',
    title: { en: 'Holo sticker pack', ar: 'باكيت ستيكرز هولوجرام' },
    desc: { en: 'Five Ghost Signal holographic stickers.', ar: 'خمس ستيكرز هولوجرام من Ghost Signal.' },
  },
  {
    id: 's1-partner',
    kind: 'code',
    glyph: '⌬',
    seasonId: 's1',
    levelId: 'l2',
    title: { en: 'Partner drop code', ar: 'كود من شريك' },
    desc: { en: 'A discount code from a season partner.', ar: 'كود خصم من شريك الموسم.' },
  },
  {
    id: 's1-keycard',
    kind: 'item',
    glyph: '▣',
    seasonId: 's1',
    levelId: 'l3',
    title: { en: 'Runner keycard', ar: 'كارت Runner' },
    desc: { en: 'A physical black keycard with your callsign.', ar: 'كارت أسود حقيقي عليه اسمك الحركي.' },
  },
  {
    id: 's1-pin',
    kind: 'item',
    glyph: '⬢',
    seasonId: 's1',
    levelId: 'l4',
    title: { en: 'Season 01 pin', ar: 'دبوس الموسم 01' },
    desc: { en: 'Metal pin. Only Runners who breached Obelisk have one.', ar: 'دبوس معدن. مع اللي اخترقوا Obelisk بس.' },
  },
  {
    id: 's1-finale',
    kind: 'item',
    glyph: '✦',
    seasonId: 's1',
    title: { en: 'Founding Runner patch', ar: 'باتش Runner مؤسس' },
    desc: { en: 'For everyone who finishes Season 01. Plus entry to the finale.', ar: 'لكل اللي يخلّص الموسم 01. ومعاه دخول الختام.' },
  },
]
