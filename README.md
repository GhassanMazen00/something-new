# Clearline Analytics website

The website for Clearline Analytics: business analysis for small and medium companies. It explains our services by department, the data each one needs, how we protect that data, and how we work. English and Arabic.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173  (add ?lang=ar for Arabic)
npm run build    # the finished site, in dist/
```

## Change things

- **All text** (English and Arabic): `src/content.ts`
- **Email and WhatsApp**: `CONTACT` at the top of `src/content.ts`. Replace the placeholder email before launch.
- **Colours and sizes**: the top of `src/styles.css`

## Put it online (free, GitHub Pages)

Every push builds the site automatically (`.github/workflows/deploy.yml`) and publishes it to the `gh-pages` branch.

One-time setting: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `gh-pages` → Save.** Folder `/ (root)` or `/docs` both work.

Don't point Pages at `main` or this branch directly: that serves the raw source code, which shows a white screen.

The site loads nothing from other companies: fonts are hosted with the site, and there are no cookies or trackers.
