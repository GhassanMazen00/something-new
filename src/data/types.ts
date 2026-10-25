export type Bilingual = { en: string; ar: string }

// How a quest is proven:
//  terminal     hack a node in the in-app terminal (passphrase is checked by hash)
//  puzzle       crack a cipher / riddle shown in the app
//  social-find  find a code hidden on the official social accounts
//  social-post  post publicly with your personal Runner tag, submit the link (verified by the Game Master / bot)
//  real         find a real-world item (card, sticker, poster...) and enter or scan its code
export type QuestKind = 'terminal' | 'puzzle' | 'social-find' | 'social-post' | 'real'

export type Platform = 'instagram' | 'tiktok'

export interface TerminalNode {
  id: string
  status: 'target' | 'firewall' | 'offline'
}

export interface TerminalSpec {
  banner: Bilingual[]
  nodes: TerminalNode[]
  success: Bilingual[]
}

export interface Quest {
  id: string
  kind: QuestKind
  title: Bilingual
  brief: Bilingual
  xp: number
  optional?: boolean
  fragment?: string // one letter of the season's final passphrase
  answers?: string[] // SHA-256 hashes, see src/lib/verify.ts
  content?: Bilingual // the puzzle itself, shown in a monospace box
  hint?: Bilingual
  platform?: Platform
  terminal?: TerminalSpec
}

export interface Level {
  id: string
  number: number
  title: Bilingual
  transmission: Bilingual
  quests: Quest[]
}

export interface Season {
  id: string
  number: number
  title: Bilingual
  tagline: Bilingual
  premise: Bilingual
  endsAt: string // ISO date
  finalPhrase: string // what the fragments spell, e.g. "WE ARE THE SIGNAL"
  ending: Bilingual
  levels: Level[]
}

export interface SeasonTeaser {
  number: number
  codename: string
}

export interface LootItem {
  id: string
  kind: 'item' | 'code'
  glyph: string
  title: Bilingual
  desc: Bilingual
  seasonId: string
  levelId?: string // unlocked by finishing this level; omitted = finishing the whole season
}
