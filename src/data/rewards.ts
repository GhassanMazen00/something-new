import type { Bilingual } from './quests'

export interface Reward {
  id: string
  emoji: string
  cost: number
  title: Bilingual
  partner: Bilingual
}

// Example rewards. Real ones come from partner cafés, cinemas, gyms and brands.
export const REWARDS: Reward[] = [
  {
    id: 'meetup', emoji: '🎟️', cost: 250,
    title: { en: 'Entry to the monthly IRL meetup', ar: 'دخول لقاء IRL الشهري' },
    partner: { en: 'IRL', ar: 'IRL' },
  },
  {
    id: 'coffee', emoji: '☕', cost: 400,
    title: { en: 'Free coffee', ar: 'قهوة ببلاش' },
    partner: { en: 'Partner café', ar: 'كافيه شريك' },
  },
  {
    id: 'books', emoji: '📚', cost: 500,
    title: { en: '20% off any book', ar: 'خصم 20% على أي كتاب' },
    partner: { en: 'Partner bookstore', ar: 'مكتبة شريكة' },
  },
  {
    id: 'gym', emoji: '🏋️', cost: 600,
    title: { en: 'Gym day pass', ar: 'يوم في الجيم' },
    partner: { en: 'Partner gym', ar: 'جيم شريك' },
  },
  {
    id: 'cinema', emoji: '🎬', cost: 900,
    title: { en: '2-for-1 cinema tickets', ar: 'تذكرتين سينما بسعر واحدة' },
    partner: { en: 'Partner cinema', ar: 'سينما شريكة' },
  },
  {
    id: 'mystery', emoji: '🎁', cost: 1500,
    title: { en: 'Mystery box', ar: 'صندوق المفاجآت' },
    partner: { en: 'IRL', ar: 'IRL' },
  },
]
