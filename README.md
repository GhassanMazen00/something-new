# Basira website

The website for Basira (بصيرة): business analysis for small and medium companies. It explains our services by department, the data each one needs, how we protect that data, and how we work. English and Arabic.

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

## Put it online (free)

Upload the `dist/` folder to Cloudflare Pages, Netlify or GitHub Pages. The site loads nothing from other companies: fonts are hosted with the site, and there are no cookies or trackers.
