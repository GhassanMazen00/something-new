import { useState } from 'react'
import { DemoBanner, SegmentedTabs } from '../components/ui'
import { CATEGORY_META, questById } from '../data/quests'
import { schoolById } from '../data/schools'
import { demoFeed } from '../lib/demo'
import { schoolName } from '../lib/game'
import { useT } from '../lib/i18n'
import { useStore, type Vote } from '../lib/store'
import { useNow } from '../lib/time'

interface Post {
  id: string
  mine: boolean
  name: string
  handle: string
  avatar: string
  schoolId: string
  school: string
  questId: string
  caption: string
  photo?: string
  at: number
  legit: number
  fake: number
}

export function Feed() {
  const { state, vote } = useStore()
  const { t, lang, pick } = useT()
  const now = useNow(30_000)
  const [scope, setScope] = useState<'school' | 'all'>('school')
  const profile = state.profile!
  const mySchool = schoolName(profile, lang)

  const mine: Post[] = state.completions.map((c) => ({
    id: c.id,
    mine: true,
    name: profile.name,
    handle: profile.handle,
    avatar: profile.avatar,
    schoolId: profile.schoolId,
    school: mySchool,
    questId: c.questId,
    caption: c.caption,
    photo: c.photo,
    at: c.at,
    legit: 0,
    fake: 0,
  }))
  const demo: Post[] = demoFeed(profile.schoolId, now).map((p) => ({
    id: p.id,
    mine: false,
    name: p.player.name[lang],
    handle: p.player.handle,
    avatar: p.player.avatar,
    schoolId: p.schoolId,
    school: p.schoolId === profile.schoolId ? mySchool : (schoolById(p.schoolId)?.name[lang] ?? ''),
    questId: p.questId,
    caption: pick(p.caption),
    at: p.at,
    legit: p.legit,
    fake: p.fake,
  }))

  const posts = [...mine, ...demo]
    .filter((p) => scope === 'all' || p.schoolId === profile.schoolId)
    .sort((a, b) => b.at - a.at)
    .slice(0, 40)

  const ago = (at: number) => {
    const mins = Math.floor((now.getTime() - at) / 60_000)
    if (mins < 1) return t('justNow')
    if (mins < 60) return t('minutesAgo', { n: mins })
    return t('hoursAgo', { n: Math.floor(mins / 60) })
  }

  return (
    <div className="space-y-4">
      <SegmentedTabs
        value={scope}
        onChange={setScope}
        options={[
          { value: 'school', label: `🏫 ${t('feedSchool')}` },
          { value: 'all', label: `🌍 ${t('feedAll')}` },
        ]}
      />
      <DemoBanner />
      {posts.length === 0 && <p className="py-16 text-center text-muted">{t('emptyFeed')}</p>}
      {posts.map((p) => (
        <PostCard key={p.id} post={p} ago={ago(p.at)} myVote={state.votes[p.id]} onVote={(v) => vote(p.id, v)} />
      ))}
    </div>
  )
}

function PostCard({ post, ago, myVote, onVote }: { post: Post; ago: string; myVote?: Vote; onVote: (v: Vote) => void }) {
  const { t, pick } = useT()
  const quest = questById(post.questId)
  if (!quest) return null
  const meta = CATEGORY_META[quest.category]
  const legit = post.legit + (myVote === 'legit' ? 1 : 0)
  const fake = post.fake + (myVote === 'fake' ? 1 : 0)

  return (
    <article className={`overflow-hidden rounded-3xl border bg-surface ${post.mine ? 'border-lime/40' : 'border-line'}`}>
      <div className="flex items-center gap-3 p-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-xl">{post.avatar}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-bold">
            <span className="truncate">{post.name}</span>
            {post.mine && <span className="rounded-full bg-lime px-2 text-[10px] text-ink uppercase">{t('you')}</span>}
          </div>
          <div className="truncate text-xs text-muted">
            🏫 {post.school} · {ago}
          </div>
        </div>
      </div>

      {post.photo ? (
        <img src={post.photo} alt="" className="aspect-square w-full object-cover" />
      ) : (
        <div
          className="grid aspect-[4/3] w-full place-items-center text-8xl"
          style={{ background: `linear-gradient(135deg, ${meta.color}55, #1f1f2d)` }}
        >
          {meta.emoji}
        </div>
      )}

      <div className="p-3">
        <div className="text-sm font-bold" style={{ color: meta.color }}>
          {meta.emoji} {pick(quest.title)}
        </div>
        {post.caption && <p className="mt-1 text-white/85">{post.caption}</p>}
        {!post.mine && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onVote('legit')}
              className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${myVote === 'legit' ? 'bg-lime text-ink' : 'bg-surface-2 text-white/80'}`}
            >
              ✅ {t('legit')} · {legit}
            </button>
            <button
              onClick={() => onVote('fake')}
              className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${myVote === 'fake' ? 'bg-pink text-ink' : 'bg-surface-2 text-white/80'}`}
            >
              🚩 {t('fake')} · {fake}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
