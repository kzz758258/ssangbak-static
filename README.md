# SsangBak Static

Astro + Cloudflare Pages target for `https://ssangbak.com`.

## Commands

```bash
npm install
npm run import:ssangbak
npm run build
npm run dev
```

## Structure

- `src/content/posts/`: imported Markdown posts
- `scripts/import-ssangbak.mjs`: imports existing public WordPress posts from the Rank Math sitemap
- `src/pages/[...slug].astro`: preserves original post URLs
- `src/pages/category/[...slug].astro`: preserves existing category URLs
- `dist/`: static build output for Cloudflare Pages

## Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `24` or latest Cloudflare-supported LTS
