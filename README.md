# IRL — your life is the game

**Real-life quests every day. Your school vs every school.**

Every day, everyone gets the same quest: talk to a stranger, watch the sunset, feed the street cats, two hours with no phone. Do it in real life, snap a photo as proof, and earn XP for **you and your school**. Schools fight in a weekly league. XP buys real rewards from partner cafés, cinemas and gyms.

Stop being an NPC. 🤖 → 🎭 → 🌟 → 👑

## What's in this version (v0.1, demo)

- ⚡ **Daily quest**: the same quest for everyone on Earth that day (like Wordle), worth 2× XP, with a countdown to the next one
- ➕ **3 bonus quests** a day; 28 quests across 7 categories (Social, Brave, Kind, Explore, Create, Body, Mind) and 3 rarities
- 📸 **Photo proof** for every quest, compressed on the phone
- 🎉 **Share card**: a story-sized image (1080×1920) for Instagram, TikTok and WhatsApp, made in the browser
- 🏆 **School league**: weekly table of schools and of players in your school, with invite links (`?school=cu`) that pre-select your school for friends
- 📰 **Feed**: see who did today's quest, and vote ✅ Legit / 🚩 Fake
- 🎁 **Rewards**: spend XP, get a redeem code
- 🔥 Streaks, levels (NPC → Side Character → Main Character → Legend)
- 🇪🇬 **Arabic and English**, with full right-to-left layout

> **Demo mode:** other players, schools' points and rewards are sample data, clearly labeled in the app. Your own progress is real but only saved on your device. The next step is a real backend (see roadmap).

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install      # once, downloads the libraries
npm run dev      # starts the app at http://localhost:5173
```

Open it in your browser. To see it like a phone, press F12 and click the phone icon.

Other commands:

```bash
npm run build    # checks types and makes the final website in dist/
npm run lint     # finds common mistakes
npm run preview  # serves the built dist/ folder
```

## How the code is organized

```
src/
  App.tsx              the bottom tabs and which screen is shown
  screens/             one file per screen: Onboarding, Today, Feed, League, Rewards, Profile
  components/          reusable pieces: quest cards, the proof sheet, buttons, popups
  data/
    quests.ts          ← all quests live here. Add yours!
    schools.ts         the starter list of schools/universities
    rewards.ts         the reward shop
  lib/
    i18n.ts            every piece of text, in English and Arabic
    game.ts            game rules: XP, levels, streaks, today's quests
    store.ts           what the app saves (profile, quests done, rewards)
    StoreProvider.tsx  the code that changes and saves that data
    demo.ts            SAMPLE data for the league and feed (delete when the backend exists)
    media.ts           photo compression, share card drawing, invite links
```

**Easy first changes:** add a quest in `src/data/quests.ts`, add a school in `src/data/schools.ts`, or change any text in `src/lib/i18n.ts`.

## Roadmap

1. **Real backend** (Supabase): accounts, real players, real league points, photo storage, so friends actually see each other
2. **Put it online** (Vercel, Netlify or GitHub Pages, all free) so anyone can open it from a link
3. **AI proof check**: an AI looks at each photo and confirms it matches the quest, so the league stays fair
4. **Real partners**: cafés, gyms and brands give rewards in exchange for reaching students
5. **Moderation and safety**: reporting, age-appropriate quests, no faces of strangers
6. **Install as an app** (PWA), then the app stores
