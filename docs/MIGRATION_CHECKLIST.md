# SsangBak Migration Checklist

## Already Prepared Locally

- Astro static site scaffold
- 425 existing WordPress posts imported from `https://ssangbak.com/sitemap.xml`
- Existing post URLs preserved through `permalink` and `slugPath`
- Existing category URLs preserved:
  - `/category/subsidy/`
  - `/category/living-information/`
  - `/category/broadcasting/`
  - `/category/ai-job/`
  - `/category/concert-musical/`
  - `/category/ai-stocks/`
- Static build verified
- `sitemap-index.xml` generated in `dist`

## User Must Do

1. Create or choose a GitHub repository.
2. Push this project to that repository.
3. Create a Cloudflare account if you do not already have one.
4. Add `ssangbak.com` to Cloudflare.
5. Copy all current DNS records before changing nameservers.
6. Change domain nameservers at the domain registrar to Cloudflare nameservers.
7. In Cloudflare Pages, connect the GitHub repository.
8. Set build command to `npm run build`.
9. Set output directory to `dist`.
10. Test first on the Cloudflare Pages preview domain.
11. Add custom domain `ssangbak.com` only after preview verification.
12. Re-check Google Search Console, AdSense, and Daum/Naver webmaster ownership verification.

## Before Domain Cutover

- Confirm homepage opens.
- Confirm at least 30 old post URLs open with status 200.
- Confirm 6 category URLs open.
- Confirm `https://ssangbak.com/robots.txt`.
- Confirm `https://ssangbak.com/sitemap-index.xml`.
- Confirm images load.
- Confirm AdSense code is added before switching traffic.
- Keep the old WordPress hosting active for at least 7 to 14 days after cutover.

## Current Limitation

Images are currently referenced from the old WordPress `/wp-content/uploads/` URLs. Before shutting down WordPress hosting, copy images into this project or move them to a stable asset host such as Cloudflare R2.
