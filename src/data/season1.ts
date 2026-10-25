import type { Season } from './types'

// SEASON 01 // GHOST SIGNAL
// Answers and codes are stored as hashes. The plain answers are in gm/SEASON-01-ANSWERS.md
// (keep that file private before launch, and change the real-world codes to your own).

export const SEASON_1: Season = {
  id: 's1',
  number: 1,
  title: { en: 'GHOST SIGNAL', ar: 'الإشارة الشبح' },
  tagline: { en: 'Neo-Cairo, 2049. Nobody looks up anymore.', ar: 'نيو-كايرو، 2049. محدش بيبص لفوق خلاص.' },
  premise: {
    en: 'OBELISK Systems wired the whole city into the FEED. Eyes down, thumbs moving, forever. Then a signal broke through the noise. Someone called ZERO is recruiting Runners: people who still move in the real world.',
    ar: 'شركة OBELISK وصّلت المدينة كلها بالـFEED. العيون في الأرض والصوابع بتتحرك، على طول. وفجأة إشارة اخترقت الدوشة. حد اسمه ZERO بيجنّد Runners: ناس لسه بتتحرك في العالم الحقيقي.',
  },
  endsAt: '2027-01-31',
  finalPhrase: 'WE ARE THE SIGNAL',
  ending: {
    en: 'There is no ZERO.\nZERO was every Runner who looked up.\nObelisk can own the Feed. It can never own the street.\n\nWE ARE THE SIGNAL.',
    ar: 'مفيش حاجة اسمها ZERO.\nZERO كان كل Runner بصّ لفوق.\nObelisk ممكن تمتلك الـFeed. عمرها ما هتمتلك الشارع.\n\nإحنا الإشارة.',
  },
  levels: [
    {
      id: 'l1',
      number: 1,
      title: { en: 'WAKE UP', ar: 'اصحى' },
      transmission: {
        en: "> INCOMING // ORIGIN: UNKNOWN\n\nIf you can read this, the Feed hasn't swallowed you yet.\n\nThey call me ZERO. Obelisk built a city where nobody looks up. I need Runners.\n\nFirst, open a line to my relay. The passphrase is the one thing they can't sell you: being AWAKE.\n\nThen prove you can read between the lines. And when you're ready, go outside. I left something for you.",
        ar: '> إشارة واردة // المصدر: مجهول\n\nلو قادر تقرا ده، يبقى الـFeed لسه مبلعكش.\n\nبيقولولي ZERO. ‏Obelisk بنت مدينة محدش فيها بيبص لفوق. أنا محتاج Runners.\n\nالأول، افتح خط مع الريلاي بتاعي. الباسورد هو الحاجة الوحيدة اللي ميقدروش يبيعوهالك: إنك تكون AWAKE.\n\nبعدها ورّيني إنك بتفهم بين السطور. ولما تبقى جاهز، انزل الشارع. سايبلك حاجة.',
      },
      quests: [
        {
          id: 'l1-handshake',
          kind: 'terminal',
          title: { en: 'HANDSHAKE', ar: 'المصافحة' },
          brief: { en: "Open a secure line to ZERO's relay. Type help if you're lost.", ar: 'افتح خط آمن مع ريلاي ZERO. اكتب help لو تايه.' },
          xp: 150,
          fragment: 'W',
          answers: ['e9a7fb1952a23108aa2f5e707af6aec7af9c05bc99f3a3f00c4e03a888742310'],
          terminal: {
            banner: [
              { en: 'GHOST//SHELL v0.49 — unregistered copy', ar: 'GHOST//SHELL v0.49 — نسخة غير مسجّلة' },
              { en: "Type 'help' to see commands.", ar: "اكتب 'help' عشان تشوف الأوامر." },
            ],
            nodes: [
              { id: 'obelisk-feed', status: 'firewall' },
              { id: 'relay-0', status: 'target' },
              { id: 'city-cam-77', status: 'firewall' },
            ],
            success: [
              { en: 'LINK ESTABLISHED // relay-0', ar: 'تم الاتصال // relay-0' },
              { en: "ZERO: Good. You're awake. Most aren't.", ar: 'ZERO: حلو. انت صاحي. أغلبهم لأ.' },
            ],
          },
        },
        {
          id: 'l1-cipher',
          kind: 'puzzle',
          title: { en: 'FIRST CIPHER', ar: 'أول شفرة' },
          brief: { en: "ZERO's signature is scrambled. Every letter was pushed 3 steps forward in the alphabet.", ar: 'توقيع ZERO متلخبط. كل حرف اتزق 3 خطوات لقدام في الأبجدية.' },
          xp: 120,
          fragment: 'E',
          content: { en: 'ORRN  XS', ar: 'ORRN  XS' },
          hint: { en: 'Move each letter 3 back: O → L, R → O…', ar: 'رجّع كل حرف 3 خطوات: O ← L، R ← O…' },
          answers: ['beafc73df4b68c51f704d6f5bac68df435f76eb13dd18de3df12c8cc68dac573'],
        },
        {
          id: 'l1-signal',
          kind: 'social-find',
          platform: 'instagram',
          title: { en: 'THE SIGNAL', ar: 'الإشارة' },
          brief: { en: "ZERO hijacked our Instagram bio for the season. There's a code hiding in it.", ar: 'ZERO خطف البايو بتاعنا على إنستجرام طول الموسم. فيه كود مستخبي جواه.' },
          xp: 150,
          fragment: 'A',
          answers: ['943d26b7033eed0b5b415c3ae80915d46920225e4f9a297f096ac2d1aa47a88c'],
        },
        {
          id: 'l1-deaddrop',
          kind: 'real',
          title: { en: 'DEAD DROP', ar: 'نقطة التسليم' },
          brief: { en: 'Runner cards are hidden around the city: cafés, campuses, walls. Find one. Scan its QR with your camera or type the code on the back.', ar: 'كروت الـRunners مستخبية في المدينة: كافيهات، جامعات، حيطان. لاقي واحد. صوّر الـQR بالكاميرا أو اكتب الكود اللي ورا.' },
          xp: 250,
          fragment: 'R',
          answers: ['92b595e7e8484e85471a322274b46fb09ac594224ea9d39b90ef6391317a8119'],
        },
      ],
    },
    {
      id: 'l2',
      number: 2,
      title: { en: 'THE GRID', ar: 'الشبكة' },
      transmission: {
        en: "> INCOMING // ZERO\n\nObelisk tracks every step you take on a screen. Off-screen, you're a ghost to them. That's our advantage.\n\nI intercepted one of their camera logs, but it's locked with a word in machine tongue. Decode it. Then use it.\n\nAnd find the poster they keep tearing down. It's still out there.",
        ar: '> إشارة واردة // ZERO\n\n‏Obelisk بتتبع كل خطوة بتاخدها على الشاشة. بعيد عن الشاشة، انت شبح بالنسبالهم. ودي ميزتنا.\n\nاعترضت لوج من كاميراتهم، بس مقفول بكلمة بلغة الآلة. فكّها. وبعدين استخدمها.\n\nودوّر على البوستر اللي بيفضلوا يقطّعوه. لسه موجود برّه.',
      },
      quests: [
        {
          id: 'l2-binary',
          kind: 'puzzle',
          title: { en: 'MACHINE TONGUE', ar: 'لغة الآلة' },
          brief: { en: 'The camera log password, as the machines see it.', ar: 'باسورد لوج الكاميرا، زي ما الآلات شايفاه.' },
          xp: 120,
          fragment: 'E',
          content: { en: '01001110 01001001\n01001100 01000101', ar: '01001110 01001001\n01001100 01000101' },
          hint: { en: 'Each block is one letter in ASCII. 01001110 = N.', ar: 'كل بلوك حرف واحد بنظام ASCII. ‏01001110 = N.' },
          answers: [
            '3b1af86f9788f6d3d42ca9330d87ae66b866e00181c3a8b88ffd8ae4f3ed9fee',
            '54f1a5dec0170e00a94069944bd577d7cdbb364cadf3539771c9ff3531c2f173',
          ],
        },
        {
          id: 'l2-poster',
          kind: 'real',
          title: { en: 'TORN POSTER', ar: 'البوستر المقطوع' },
          brief: { en: "Somewhere on a campus or a street wall there's a poster of a glitched obelisk. The code is hidden in the static.", ar: 'في جامعة أو على حيطة في شارع فيه بوستر لمسلّة متشوّشة. الكود مستخبي في التشويش.' },
          xp: 250,
          fragment: 'T',
          answers: ['de6949e0381a837fd7e5d0c979876005cdd9debc5d03754a5ebf0f4fe1f418ca'],
        },
        {
          id: 'l2-trace',
          kind: 'terminal',
          title: { en: 'TRACE', ar: 'التتبّع' },
          brief: { en: 'Break into the camera node and wipe your trace. The key is the word you decoded.', ar: 'ادخل على نود الكاميرا وامسح أثرك. المفتاح هو الكلمة اللي فكّيتها.' },
          xp: 150,
          fragment: 'H',
          answers: ['01d8abf0293e1740e79d4c8580d0aeaf6524853c71437dc0e58ffc7f287a3654'],
          terminal: {
            banner: [
              { en: 'GHOST//SHELL v0.49 — relay-0 linked', ar: 'GHOST//SHELL v0.49 — متوصّل بـrelay-0' },
              { en: 'Obelisk camera grid detected.', ar: 'تم رصد شبكة كاميرات Obelisk.' },
            ],
            nodes: [
              { id: 'obelisk-feed', status: 'firewall' },
              { id: 'obelisk-cam-12', status: 'target' },
              { id: 'obelisk-cam-13', status: 'offline' },
            ],
            success: [
              { en: 'LOG WIPED // 1,204 frames deleted', ar: 'اللوج اتمسح // 1,204 فريم اتشالوا' },
              { en: "ZERO: They'll never see you coming.", ar: 'ZERO: عمرهم ما هيشوفوك جاي.' },
            ],
          },
        },
        {
          id: 'l2-broadcast',
          kind: 'social-post',
          optional: true,
          title: { en: 'BROADCAST', ar: 'البث' },
          brief: { en: 'Post one photo of something real, with no screens in it. Add #GhostSignal and your Runner tag, then submit the link.', ar: 'انشر صورة لحاجة حقيقية، من غير أي شاشة فيها. حط #GhostSignal والتاج بتاعك، وابعت اللينك.' },
          xp: 100,
        },
      ],
    },
    {
      id: 'l3',
      number: 3,
      title: { en: 'GHOSTS', ar: 'الأشباح' },
      transmission: {
        en: "> INCOMING // ZERO\n\nYou're not alone. There are others: Ghosts who never got plugged in.\n\nA Runner alone is a target. A crew is a signal.\n\nEvery card I printed for this op holds half a key. Find another Runner and put your halves together.\n\nAnd watch my tape closely. I only flash things once.",
        ar: '> إشارة واردة // ZERO\n\nانت مش لوحدك. فيه غيرك: أشباح عمرهم ما اتوصّلوا.\n\nالـRunner لوحده هدف. الكرو إشارة.\n\nكل كارت طبعته للمهمة دي فيه نص مفتاح. دوّر على Runner تاني وركّبوا النصين على بعض.\n\nوركّز في الشريط بتاعي. أنا بعرض الحاجة مرة واحدة بس.',
      },
      quests: [
        {
          id: 'l3-riddle',
          kind: 'puzzle',
          title: { en: 'GHOST RIDDLE', ar: 'لغز الشبح' },
          brief: { en: 'The Ghosts only talk to Runners who know the answer.', ar: 'الأشباح مبيكلموش غير الـRunners اللي عارفين الإجابة.' },
          xp: 120,
          fragment: 'E',
          content: {
            en: 'I have cities, but no houses.\nRivers, but no water.\nRoads, but no cars.\nObelisk wants you to forget me.',
            ar: 'عندي مدن، من غير بيوت.\nوأنهار، من غير ميّه.\nوطرق، من غير عربيات.\nObelisk عايزاك تنساني.',
          },
          hint: { en: 'People unfolded me before phones existed.', ar: 'الناس كانت بتفردني قبل ما الموبايلات تظهر.' },
          answers: [
            '70cbb7be34ea6bfaf52a12f2db6853a23b6cf66e4fbd506e5ad90c59836701e2',
            '54a6b84c918f6c49730c4cc748bbb221caee81734f4dc8be59fb06f0d2de94ac',
            '76453818f68dffbcf4627507e529c23d5887321601ade5535654b2a38f13d82e',
          ],
        },
        {
          id: 'l3-handoff',
          kind: 'real',
          title: { en: 'HANDOFF', ar: 'التسليم' },
          brief: { en: 'Handoff cards come in pairs, each with half a code. Find the Runner holding the other half, meet up, and enter both halves together.', ar: 'كروت التسليم جوز جوز، كل كارت عليه نص كود. لاقي الـRunner اللي معاه النص التاني، اتقابلوا، واكتبوا النصين مع بعض.' },
          xp: 250,
          fragment: 'S',
          answers: ['e857c3fa20561b9089b2b5cb66e23b7bb8250a8a9a163bc9d3c6a6fac3f5cbe2'],
        },
        {
          id: 'l3-tape',
          kind: 'social-find',
          platform: 'tiktok',
          title: { en: 'THE TAPE', ar: 'الشريط' },
          brief: { en: 'ZERO posted a video on our TikTok. For a single frame, a code flashes on screen.', ar: 'ZERO نزّل فيديو على التيك توك بتاعنا. في فريم واحد بس، كود بيظهر على الشاشة.' },
          xp: 150,
          fragment: 'I',
          answers: ['9904fb46d7e9e8f17cadbb26155c1239b6ea6cd26c8d5935b89434da9b62f781'],
        },
        {
          id: 'l3-recruit',
          kind: 'social-post',
          optional: true,
          title: { en: 'RECRUIT', ar: 'تجنيد' },
          brief: { en: 'Bring a Ghost into the signal. Post a story inviting a friend, with #GhostSignal and your Runner tag, then submit the link.', ar: 'دخّل شبح للإشارة. انشر ستوري بتعزم فيها صاحبك، مع #GhostSignal والتاج بتاعك، وابعت اللينك.' },
          xp: 100,
        },
      ],
    },
    {
      id: 'l4',
      number: 4,
      title: { en: 'OBELISK', ar: 'المسلّة' },
      transmission: {
        en: "> INCOMING // ZERO\n\nThey know we're coming.\n\nObelisk's firewall is tall, but every wall has a door. The gate key is everything you've learned: the river, then the map.\n\nBefore you breach, read their latest ad. Their slogans always hide more than they say.\n\nAnd grab a keycard. We scattered them across three districts.",
        ar: '> إشارة واردة // ZERO\n\nعرفوا إننا جايين.\n\nالفايرول بتاع Obelisk عالي، بس كل سور ليه باب. مفتاح البوابة هو كل اللي اتعلمته: النهر، وبعدين الخريطة.\n\nقبل ما تخترق، اقرا آخر إعلان ليهم. شعاراتهم دايمًا مخبّية أكتر من اللي بتقوله.\n\nوهات كارت مفتاح. فرّقناهم على تلات مناطق.',
      },
      quests: [
        {
          id: 'l4-acrostic',
          kind: 'puzzle',
          title: { en: 'THE AD', ar: 'الإعلان' },
          brief: { en: 'An intercepted Obelisk ad. What is it really telling you to do?', ar: 'إعلان لـObelisk اتعترض. هو بيقولك تعمل إيه بجد؟' },
          xp: 120,
          fragment: 'G',
          content: {
            en: 'Uplink your dreams, we keep them warm,\nNever mind the sky, it\'s just a storm,\nPixels are softer than the sun,\nLook down, look down, the day is done,\nUnplug? Why would anyone?\nGaze at the Feed. Obelisk is one.',
            ar: 'Uplink your dreams, we keep them warm,\nNever mind the sky, it\'s just a storm,\nPixels are softer than the sun,\nLook down, look down, the day is done,\nUnplug? Why would anyone?\nGaze at the Feed. Obelisk is one.',
          },
          hint: { en: 'Read down, not across.', ar: 'اقرا من فوق لتحت، مش بالعرض.' },
          answers: ['7a6eb2680582fca53ce92b6da4cbd51c92660eeb5571e3f2bdd8182283380399'],
        },
        {
          id: 'l4-breach',
          kind: 'terminal',
          title: { en: 'BREACH', ar: 'الاختراق' },
          brief: { en: "Breach Obelisk's gate. ZERO already told you the key.", ar: 'اخترق بوابة Obelisk. ‏ZERO قالك المفتاح خلاص.' },
          xp: 150,
          fragment: 'N',
          answers: ['0111a75e9294668cc210865f86c2bd4e445ef0f6d56c6c976ac5fd37e415e0d7'],
          terminal: {
            banner: [
              { en: 'GHOST//SHELL v0.49 — camera grid blind', ar: 'GHOST//SHELL v0.49 — الكاميرات عامية' },
              { en: 'WARNING: Obelisk perimeter ahead.', ar: 'تحذير: حدود Obelisk قدامك.' },
            ],
            nodes: [
              { id: 'obelisk-core', status: 'firewall' },
              { id: 'obelisk-gate', status: 'target' },
              { id: 'obelisk-feed', status: 'firewall' },
            ],
            success: [
              { en: 'FIREWALL DOWN // obelisk-gate open', ar: 'الفايرول وقع // obelisk-gate مفتوحة' },
              { en: "ZERO: You're inside. Don't look at the Feed. Keep moving.", ar: 'ZERO: انت جوّه. متبصّش للـFeed. كمّل.' },
            ],
          },
        },
        {
          id: 'l4-keycard',
          kind: 'real',
          title: { en: 'KEYCARD', ar: 'كارت المفتاح' },
          brief: { en: 'Black keycards are hidden in three districts. Find any one of them and enter its code.', ar: 'كروت مفاتيح سودا مستخبية في تلات مناطق. لاقي أي واحد فيهم واكتب الكود بتاعه.' },
          xp: 250,
          fragment: 'A',
          answers: ['ad376cf559f2a53c4995eee4b475f5836f9920154da28f8d2fa713c1900f6b77'],
        },
        {
          id: 'l4-static',
          kind: 'social-find',
          platform: 'instagram',
          title: { en: 'STATIC', ar: 'التشويش' },
          brief: { en: 'Our latest Instagram post looks like plain static. Zoom into the corners.', ar: 'آخر بوست لينا على إنستجرام شكله تشويش عادي. اعمل زووم على الأركان.' },
          xp: 150,
          fragment: 'L',
          answers: ['43778c380856be2446c5656e3174cace097202b85eb5f32ed744a99819339f26'],
        },
      ],
    },
    {
      id: 'l5',
      number: 5,
      title: { en: 'ZERO', ar: 'زيرو' },
      transmission: {
        en: '> INCOMING // ZERO // FINAL\n\nYou made it to the core.\n\nEvery op gave you a fragment. Put them together and you have my last passphrase, and the truth about who I am.\n\nType it into the core.\n\nThen come find us. In person.',
        ar: '> إشارة واردة // ZERO // الأخيرة\n\nوصلت للـcore.\n\nكل مهمة إدتك جزء. جمّعهم هتلاقي آخر باسورد ليا، والحقيقة عن أنا مين.\n\nاكتبه في الـcore.\n\nوبعدين تعالى دوّر علينا. وش لوش.',
      },
      quests: [
        {
          id: 'l5-core',
          kind: 'terminal',
          title: { en: 'FINAL TRANSMISSION', ar: 'الإرسال الأخير' },
          brief: { en: 'Connect to the core and enter the passphrase your fragments spell.', ar: 'اتصل بالـcore واكتب الباسورد اللي الأجزاء بتاعتك بتكوّنه.' },
          xp: 500,
          answers: ['5a06b773cf24fce38f84f5b4076714e423d85dae3420ae9df50f17d60e7fc00d'],
          terminal: {
            banner: [
              { en: 'GHOST//SHELL v0.49 — inside obelisk-gate', ar: 'GHOST//SHELL v0.49 — جوّه obelisk-gate' },
              { en: 'One node left.', ar: 'فاضل نود واحد.' },
            ],
            nodes: [
              { id: 'obelisk-feed', status: 'offline' },
              { id: 'zero-core', status: 'target' },
            ],
            success: [
              { en: 'CORE UNLOCKED', ar: 'الـcore اتفتح' },
              { en: 'ZERO: There is no ZERO.', ar: 'ZERO: مفيش حاجة اسمها ZERO.' },
              { en: 'ZERO: ZERO was every Runner who looked up.', ar: 'ZERO: ‏ZERO كان كل Runner بصّ لفوق.' },
            ],
          },
        },
        {
          id: 'l5-gathering',
          kind: 'real',
          optional: true,
          title: { en: 'THE GATHERING', ar: 'التجمّع' },
          brief: { en: 'The season finale is a real-world meetup. The code is only given at the door.', ar: 'ختام الموسم لقاء في الحقيقة. الكود بيتقال على الباب بس.' },
          xp: 300,
          answers: ['a5031d833256f4918f39e53d4503599e5de02476d0287c3672574011dc700d92'],
        },
      ],
    },
  ],
}
