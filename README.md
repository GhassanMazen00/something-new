# IRL // GHOST SIGNAL

**A season-based quest game played in the real world and on the internet.**

Neo-Cairo, 2049. Nobody looks up anymore. A hacker called ZERO is recruiting Runners.

Each **season** tells its own story. Each season has **levels**; finish a level's ops to unlock the next. Every op has to be **proven**:

| Op type | How it's proven |
|---|---|
| `>_` **Terminal** | Hack a node in the in-app terminal (`help`, `scan`, `connect`) and enter the passphrase |
| `#` **Cipher** | Crack a puzzle shown in the app (Caesar, binary, riddles, hidden messages) |
| `@` **Social // Find** | Find a code hidden on the official Instagram / TikTok (bio, one video frame, a post's corner) |
| `@` **Social // Post** | Post publicly with your personal Runner tag (`#GSXXXXXX`), submit the link for verification |
| `◎` **Real world** | Find a physical item (card, poster, keycard...) and scan its QR or type its code |

Main ops drop **fragments**: letters of ZERO's final passphrase. Collect them, crack the core, clear the season. Finishing levels unlocks **real-world loot** (stickers, codes, keycards, pins, patches) that players claim from you in person.

## Run it

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

`npm run build` makes the final website in `dist/`. `npm run lint` checks for common mistakes.

## Game Master (you)

Open the app with **`#gm`** at the end of the link (e.g. `http://localhost:5173/#gm`):

1. **Code forge**: pick a quest, type or generate a code. You get the hash to add to the quest, and a **QR code to print** on the item. Scanning that QR with any phone camera opens the app and claims the code automatically.
2. **Verify a claim**: when a Runner comes for their loot, type their Runner ID and the reward. Their screen must show the same claim code.

Or from the terminal: `node scripts/hash.mjs s1 l1-deaddrop YOUR-CODE`

All Season 1 answers and test codes are in [`gm/SEASON-01-ANSWERS.md`](gm/SEASON-01-ANSWERS.md). **Replace the real-world codes with your own before printing anything.**

## Before launch

- [ ] Put your Instagram and TikTok handles in `src/config.ts`
- [ ] Change `claimSalt` in `src/config.ts` to random text
- [ ] Make your own real-world codes with `#gm` and swap the hashes in `src/data/season1.ts`
- [ ] Set the season end date (`endsAt` in `src/data/season1.ts`)
- [ ] Put the bio code, TikTok frame code and static post on your accounts

## How the code is organized

```
src/
  config.ts              your handles, hashtag, claim salt
  data/
    season1.ts           ← the whole Season 1 story, levels and quests
    seasons.ts           list of seasons, the Season 2 teaser, and the loot
    types.ts             what a season / level / quest looks like
  screens/               Boot, Ops (map), LevelView, Log, Scan, Loot, Id, GameMaster
  components/            Terminal, QuestSheet (every quest type), ui (neon panels, buttons, glitch text)
  lib/
    verify.ts            how answers are checked (SHA-256 hashes, never plain text)
    game.ts              rules: unlocking levels, fragments, ranks, loot
    store.ts             what the app saves
    i18n.ts              every piece of text in English and Arabic
    share.ts             the share card image
gm/                      your private answer sheet
scripts/hash.mjs         make a code hash from the terminal
```

**New season:** copy `src/data/season1.ts` to `season2.ts`, write the new story, and add it to `SEASONS` in `src/data/seasons.ts`.

## What's honest about v0.2

- Progress is saved **on the player's device**. No accounts yet.
- Answers are checked **in the browser** with hashes. A determined hacker could still brute-force short answers, so real anti-cheat (one-time codes per card, rate limits) needs the backend.
- **Social // Post** proofs are collected but wait as "pending": the verification step needs the backend.

## Roadmap

1. **Backend** (Supabase): accounts, live leaderboard per season, one-time codes per physical item, social-post review queue for the Game Master
2. **Put it online** (free on Vercel / Netlify / GitHub Pages) so QR codes work from anywhere
3. **Auto-verification bot** for social posts
4. **Phone apps** (iOS / Android)
