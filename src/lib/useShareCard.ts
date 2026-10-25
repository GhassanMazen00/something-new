import { CATEGORY_META, questById } from '../data/quests'
import { schoolName, statsOf } from './game'
import { useT } from './i18n'
import { makeShareCard, shareImage } from './media'
import { useStore, type Completion } from './store'
import { toast } from './toast'

// Builds the story card for a finished quest and opens the share sheet.
export function useShareCard() {
  const { state } = useStore()
  const { t, lang, pick } = useT()

  return async (completion: Completion) => {
    const quest = questById(completion.questId)
    if (!quest || !state.profile) return
    const stats = statsOf(state)
    const title = pick(quest.title)
    const blob = await makeShareCard({
      lang,
      heading: t('questComplete').toUpperCase(),
      title,
      emoji: CATEGORY_META[quest.category].emoji,
      color: CATEGORY_META[quest.category].color,
      xpLine: `+${completion.xp} XP`,
      rarity: t(`rarity_${quest.rarity}`),
      streak: stats.streak > 0 ? `🔥 ${t('streak', { n: stats.streak })}` : `@${state.profile.handle}`,
      school: schoolName(state.profile, lang),
      tagline: t('tagline'),
      photo: completion.photo,
    })
    const result = await shareImage(blob, `irl-${quest.id}.png`, t('shareText', { quest: title }))
    if (result === 'saved') toast(t('saved'))
  }
}
