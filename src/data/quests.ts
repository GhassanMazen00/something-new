export type Bilingual = { en: string; ar: string }

export type Category = 'social' | 'brave' | 'kind' | 'explore' | 'create' | 'body' | 'mind'
export type Rarity = 'common' | 'rare' | 'legendary'

export interface Quest {
  id: string
  category: Category
  rarity: Rarity
  title: Bilingual
  desc: Bilingual
}

export const RARITY_XP: Record<Rarity, number> = {
  common: 50,
  rare: 120,
  legendary: 300,
}

// The daily quest (same for everyone) is worth double.
export const DAILY_MULTIPLIER = 2

export const CATEGORY_META: Record<Category, { emoji: string; color: string }> = {
  social: { emoji: '🗣️', color: '#ff4da6' },
  brave: { emoji: '🦁', color: '#ff8a3d' },
  kind: { emoji: '💛', color: '#ffb627' },
  explore: { emoji: '🧭', color: '#3dd6c0' },
  create: { emoji: '🎨', color: '#7c5cff' },
  body: { emoji: '💪', color: '#c6ff3d' },
  mind: { emoji: '🧠', color: '#3dc8ff' },
}

// Every quest must be safe, legal and kind. Nothing humiliating, nothing risky.
export const QUESTS: Quest[] = [
  // Social
  {
    id: 's1', category: 'social', rarity: 'common',
    title: { en: 'Compliment a stranger', ar: 'اعمل كومبليمنت لحد متعرفوش' },
    desc: { en: 'Make it specific and mean it. Then walk away like a legend.', ar: 'خليه محدد ومن قلبك. وبعدين امشي زي الأسطورة.' },
  },
  {
    id: 's2', category: 'social', rarity: 'common',
    title: { en: 'Call a grandparent', ar: 'كلّم جدك أو جدتك' },
    desc: { en: 'Ask about their first job. Write one thing that surprised you.', ar: 'اسألهم عن أول شغلانة اشتغلوها. اكتب حاجة واحدة فاجأتك.' },
  },
  {
    id: 's3', category: 'social', rarity: 'rare',
    title: { en: 'Eat lunch with someone new', ar: 'اتغدّى مع حد جديد' },
    desc: { en: "Someone from your class you've never really talked to.", ar: 'حد من فصلك أو دفعتك عمرك ما اتكلمت معاه بجد.' },
  },
  {
    id: 's4', category: 'social', rarity: 'common',
    title: { en: 'Learn the name of someone you see every day', ar: 'اعرف اسم حد بتشوفه كل يوم' },
    desc: { en: 'The guard, the kiosk guy, the bus driver. Use it next time.', ar: 'الأمن، صاحب الكشك، السوّاق. ناديه باسمه المرة الجاية.' },
  },

  // Brave
  {
    id: 'b1', category: 'brave', rarity: 'rare',
    title: { en: 'Go somewhere alone', ar: 'روح مكان لوحدك' },
    desc: { en: 'A café, a cinema, a museum. Just you. No scrolling allowed.', ar: 'كافيه، سينما، متحف. انت بس. وممنوع السكرول.' },
  },
  {
    id: 'b2', category: 'brave', rarity: 'common',
    title: { en: 'Ask a question out loud', ar: 'اسأل سؤال بصوت عالي' },
    desc: { en: "In class or a lecture. The one everyone's thinking.", ar: 'في الفصل أو المحاضرة. السؤال اللي الكل بيفكر فيه.' },
  },
  {
    id: 'b3', category: 'brave', rarity: 'rare',
    title: { en: 'Post something you made', ar: 'انشر حاجة انت عملتها' },
    desc: { en: 'A drawing, a song, a poem, some code. Not a selfie.', ar: 'رسمة، أغنية، شعر، كود. مش سيلفي.' },
  },
  {
    id: 'b4', category: 'brave', rarity: 'legendary',
    title: { en: 'Meet 5 new people in one day', ar: 'اتعرّف على 5 ناس جداد في يوم واحد' },
    desc: { en: 'Five new first names, one day. List them in your caption.', ar: 'خمس أسامي جديدة في يوم واحد. اكتبهم في الكابشن.' },
  },

  // Kind
  {
    id: 'k1', category: 'kind', rarity: 'common',
    title: { en: 'Feed the street cats', ar: 'أكّل قطط الشارع' },
    desc: { en: 'Leave food and water out for cats or birds on your street.', ar: 'حط أكل وميّه للقطط أو العصافير في شارعكم.' },
  },
  {
    id: 'k2', category: 'kind', rarity: 'rare',
    title: { en: 'Pick up 20 pieces of trash', ar: 'لمّ 20 حتة زبالة' },
    desc: { en: 'Your street, the beach, your campus. Before and after photo.', ar: 'شارعك، البحر، الكامبس. صورة قبل وبعد.' },
  },
  {
    id: 'k3', category: 'kind', rarity: 'common',
    title: { en: 'Teach someone younger something', ar: 'علّم حد أصغر منك حاجة' },
    desc: { en: 'A math trick, a game, a word in English. Ten minutes.', ar: 'حيلة في الماث، لعبة، كلمة إنجليزي. عشر دقايق.' },
  },
  {
    id: 'k4', category: 'kind', rarity: 'rare',
    title: { en: "Donate clothes you haven't worn in a year", ar: 'اتبرّع بهدوم ملبستهاش من سنة' },
    desc: { en: 'Bag them up and get them to someone who needs them.', ar: 'لمّهم في شنطة ووصّلهم لحد محتاجهم.' },
  },
  {
    id: 'k5', category: 'kind', rarity: 'legendary',
    title: { en: 'Volunteer for a full shift', ar: 'اتطوّع شيفت كامل' },
    desc: { en: 'A food bank, an orphanage, a clean-up campaign. 3+ hours.', ar: 'بنك طعام، دار أيتام، حملة نضافة. 3 ساعات أو أكتر.' },
  },

  // Explore
  {
    id: 'e1', category: 'explore', rarity: 'common',
    title: { en: "Walk a street you've never walked", ar: 'امشي في شارع عمرك ما مشيت فيه' },
    desc: { en: 'Within 2 km of home. Find one thing you never noticed.', ar: 'في حدود 2 كيلو من بيتك. لاقي حاجة عمرك ما خدت بالك منها.' },
  },
  {
    id: 'e2', category: 'explore', rarity: 'rare',
    title: { en: 'Watch the sunset', ar: 'اتفرّج على الغروب' },
    desc: { en: "Find a view. Phone stays in your pocket until the sun's gone.", ar: 'دوّر على منظر حلو. الموبايل في جيبك لحد ما الشمس تغيب.' },
  },
  {
    id: 'e3', category: 'explore', rarity: 'common',
    title: { en: "Try a food you've never eaten", ar: 'جرّب أكلة عمرك ما كلتها' },
    desc: { en: 'A street cart, a new place, a dish from another country.', ar: 'عربية في الشارع، مكان جديد، أكلة من بلد تاني.' },
  },
  {
    id: 'e4', category: 'explore', rarity: 'rare',
    title: { en: "Get off at a stop you've never visited", ar: 'انزل في محطة عمرك ما نزلتها' },
    desc: { en: 'Metro or bus. Explore for 30 minutes, come back with a photo.', ar: 'مترو أو أتوبيس. لف نص ساعة وارجع بصورة.' },
  },
  {
    id: 'e5', category: 'explore', rarity: 'legendary',
    title: { en: 'Find the oldest building in your area', ar: 'لاقي أقدم مبنى في منطقتك' },
    desc: { en: 'Find out who built it and when. Tell us in the caption.', ar: 'اعرف مين بناه وإمتى. احكيلنا في الكابشن.' },
  },

  // Create
  {
    id: 'c1', category: 'create', rarity: 'common',
    title: { en: 'Draw the view from your window', ar: 'ارسم المنظر من شباكك' },
    desc: { en: 'Ten minutes. Talent not required.', ar: 'عشر دقايق. الموهبة مش شرط.' },
  },
  {
    id: 'c2', category: 'create', rarity: 'rare',
    title: { en: 'Cook something without a recipe', ar: 'اطبخ حاجة من غير وصفة' },
    desc: { en: 'Open the fridge, improvise, feed someone.', ar: 'افتح التلاجة، ارتجل، وأكّل حد.' },
  },
  {
    id: 'c3', category: 'create', rarity: 'common',
    title: { en: 'Photograph 5 things of the same color', ar: 'صوّر 5 حاجات لونهم واحد' },
    desc: { en: 'Make a collage. Pick a weird color.', ar: 'اعمل كولاج. اختار لون غريب.' },
  },
  {
    id: 'c4', category: 'create', rarity: 'rare',
    title: { en: 'Write a 4-line poem about your street', ar: 'اكتب 4 أبيات عن شارعكم' },
    desc: { en: 'Rhymes optional. Honesty required.', ar: 'القافية اختيارية. الصدق إجباري.' },
  },

  // Body
  {
    id: 'p1', category: 'body', rarity: 'common',
    title: { en: 'Take the stairs all day', ar: 'اطلع على السلم طول اليوم' },
    desc: { en: 'Every elevator you skip counts.', ar: 'كل أسانسير تسيبه بيتحسب.' },
  },
  {
    id: 'p2', category: 'body', rarity: 'rare',
    title: { en: 'Play a street football match', ar: 'العب ماتش كورة في الشارع' },
    desc: { en: 'Or basketball, or volleyball. At least 4 players.', ar: 'أو باسكت أو فولي. 4 لاعيبة على الأقل.' },
  },
  {
    id: 'p3', category: 'body', rarity: 'common',
    title: { en: 'Walk 10,000 steps', ar: 'امشي 10,000 خطوة' },
    desc: { en: 'Screenshot your step counter at the end of the day.', ar: 'اسكرين شوت لعدّاد الخطوات آخر اليوم.' },
  },

  // Mind
  {
    id: 'm1', category: 'mind', rarity: 'rare',
    title: { en: 'Two hours, no phone', ar: 'ساعتين من غير موبايل' },
    desc: { en: 'Lock it in a drawer. Proof: a screen-time screenshot.', ar: 'اقفل عليه في درج. الإثبات: سكرين شوت لوقت الشاشة.' },
  },
  {
    id: 'm2', category: 'mind', rarity: 'common',
    title: { en: 'Read 20 pages of a real book', ar: 'اقرا 20 صفحة من كتاب حقيقي' },
    desc: { en: 'Paper. No summaries.', ar: 'ورق. من غير ملخصات.' },
  },
  {
    id: 'm3', category: 'mind', rarity: 'legendary',
    title: { en: 'A full day without social media', ar: 'يوم كامل من غير سوشيال ميديا' },
    desc: { en: 'Wake to sleep. Your feed will survive.', ar: 'من الصبح لحد ما تنام. الفيد هيعيش من غيرك.' },
  },
  {
    id: 'm4', category: 'mind', rarity: 'common',
    title: { en: 'Learn 10 words in a new language', ar: 'اتعلّم 10 كلمات بلغة جديدة' },
    desc: { en: 'Then use one on someone today.', ar: 'واستخدم واحدة منهم مع حد النهارده.' },
  },
]

export const questById = (id: string) => QUESTS.find((q) => q.id === id)
