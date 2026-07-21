# SsangBak Static

Astro + Cloudflare Pages target for `https://ssangbak.com`.

## Commands

```bash
npm install
npm run import:ssangbak
npm run topic-radar
npm run build
npm run dev
```

## Daily topic radar

Generate a dated report of monetizable article opportunities using current news signals, OpenAI web research, and duplicate checks against existing posts:

```bash
npm run topic-radar
```

Required environment variable:

- `OPENAI_API_KEY`

Copy `.env.example` to `.env` and enter the key there, or set it as an operating-system environment variable. The `.env` file is excluded from Git.

Optional environment variables:

- `TOPIC_RADAR_MODEL` (default: `gpt-5.6-luna`)
- `NAVER_CLIENT_ID` and `NAVER_CLIENT_SECRET`

Reports are written to `reports/topic-radar/YYYY-MM-DD.md` with a machine-readable JSON file beside them. The radar only recommends topics; it does not publish posts automatically.

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
