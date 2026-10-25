// SAMPLE DATA for demo mode only, so the league and feed don't look empty
// before there's a real backend. Every number here is made up and labeled as such in the UI.

import type { Bilingual } from '../data/quests'
import { SCHOOLS } from '../data/schools'
import { questsForDay } from './game'
import type { Lang } from './i18n'
import { hash, rng } from './random'
import { addDays, dayKey, startOfDay, weekProgress } from './time'

export interface DemoPlayer {
  name: Bilingual
  handle: string
  avatar: string
}

export const DEMO_PLAYERS: DemoPlayer[] = [
  { name: { en: 'Nour', ar: 'نور' }, handle: 'nour.q', avatar: '🦊' },
  { name: { en: 'Omar', ar: 'عمر' }, handle: 'omar.irl', avatar: '🐯' },
  { name: { en: 'Salma', ar: 'سلمى' }, handle: 'salma.side', avatar: '🦄' },
  { name: { en: 'Youssef', ar: 'يوسف' }, handle: 'youssef.lvl', avatar: '😎' },
  { name: { en: 'Malak', ar: 'ملك' }, handle: 'malak.out', avatar: '🐼' },
  { name: { en: 'Ziad', ar: 'زياد' }, handle: 'ziad.walks', avatar: '⚡' },
  { name: { en: 'Farida', ar: 'فريدة' }, handle: 'farida.draws', avatar: '🎨' },
  { name: { en: 'Karim', ar: 'كريم' }, handle: 'karim.kicks', avatar: '⚽' },
  { name: { en: 'Jana', ar: 'جنى' }, handle: 'jana.reads', avatar: '📚' },
  { name: { en: 'Adham', ar: 'أدهم' }, handle: 'adham.up', avatar: '🐸' },
  { name: { en: 'Hana', ar: 'هنا' }, handle: 'hana.sun', avatar: '🌅' },
  { name: { en: 'Seif', ar: 'سيف' }, handle: 'seif.go', avatar: '🦁' },
]

const CAPTIONS: Bilingual[] = [
  { en: 'Harder than it looks 😅', ar: 'أصعب مما شكلها 😅' },
  { en: 'Day 12 of not being an NPC', ar: 'اليوم 12 من إني مبقاش NPC' },
  { en: 'Did it with the whole squad', ar: 'عملناها الشلة كلها' },
  { en: 'Ok this was actually fun', ar: 'طيب دي طلعت ممتعة بجد' },
  { en: 'My mom is confused but proud', ar: 'ماما مش فاهمة بس فخورة' },
  { en: 'Felt weird. Would do again.', ar: 'إحساس غريب. هعملها تاني.' },
  { en: 'No phone, just vibes', ar: 'من غير موبايل، فايبس بس' },
  { en: "Who's next? 👀", ar: 'مين اللي عليه الدور؟ 👀' },
]

// Weekly points each sample school would reach by the end of the week.
const BASE_POINTS: Record<string, number> = {
  cu: 48200, asu: 45100, alex: 39800, auc: 37400, guc: 35900, azhar: 33100,
  mans: 31200, helwan: 28800, aast: 27300, bue: 25900, nu: 22400, assiut: 21800,
  tanta: 19600, zag: 18200, miu: 16900, fue: 15100,
}

export interface BoardRow {
  id: string
  name: string
  avatar?: string
  points: number
  mine: boolean
}

export function schoolBoard(opts: {
  lang: Lang
  mySchoolId: string
  mySchoolName: string
  myWeekXp: number
  now?: Date
}): BoardRow[] {
  const { lang, mySchoolId, mySchoolName, myWeekXp, now = new Date() } = opts
  const p = 0.12 + 0.88 * weekProgress(now) // schools fill up as the week goes on
  const rows: BoardRow[] = SCHOOLS.map((s) => ({
    id: s.id,
    name: s.name[lang],
    points: Math.round((BASE_POINTS[s.id] ?? 10000) * p) + (s.id === mySchoolId ? myWeekXp : 0),
    mine: s.id === mySchoolId,
  }))
  if (!rows.some((r) => r.mine)) {
    rows.push({ id: mySchoolId, name: mySchoolName, points: myWeekXp, mine: true })
  }
  return rows.sort((a, b) => b.points - a.points)
}

export function playerBoard(opts: {
  lang: Lang
  mySchoolId: string
  me: { name: string; avatar: string; weekXp: number }
  now?: Date
}): BoardRow[] {
  const { lang, mySchoolId, me, now = new Date() } = opts
  const p = 0.12 + 0.88 * weekProgress(now)
  const r = rng(hash(`players:${mySchoolId}`))
  const rows: BoardRow[] = DEMO_PLAYERS.slice(0, 9).map((pl) => ({
    id: pl.handle,
    name: pl.name[lang],
    avatar: pl.avatar,
    points: Math.round((300 + r() * 2600) * p),
    mine: false,
  }))
  rows.push({ id: 'me', name: me.name, avatar: me.avatar, points: me.weekXp, mine: true })
  return rows.sort((a, b) => b.points - a.points)
}

export interface DemoPost {
  id: string
  player: DemoPlayer
  schoolId: string
  questId: string
  caption: Bilingual
  at: number
  legit: number
  fake: number
}

// Posts from sample players on today's and yesterday's quests. They "appear" over the day.
export function demoFeed(mySchoolId: string, now = new Date()): DemoPost[] {
  const posts: DemoPost[] = []
  for (const offset of [0, -1]) {
    const day = addDays(now, offset)
    const key = dayKey(day)
    const { daily, bonus } = questsForDay(key)
    const r = rng(hash(`feed:${key}:${mySchoolId}`))
    const start = startOfDay(day).getTime()
    for (let i = 0; i < 14; i++) {
      const quest = i < 6 ? daily : bonus[i % bonus.length]
      const player = DEMO_PLAYERS[Math.floor(r() * DEMO_PLAYERS.length)]
      const schoolId = r() < 0.4 ? mySchoolId : SCHOOLS[Math.floor(r() * SCHOOLS.length)].id
      posts.push({
        id: `demo-${key}-${i}`,
        player,
        schoolId,
        questId: quest.id,
        caption: CAPTIONS[Math.floor(r() * CAPTIONS.length)],
        at: start + Math.floor((0.25 + r() * 0.75) * 86_400_000), // between 6am and midnight
        legit: 4 + Math.floor(r() * 60),
        fake: Math.floor(r() * 4),
      })
    }
  }
  return posts.filter((p) => p.at <= now.getTime()).sort((a, b) => b.at - a.at)
}
