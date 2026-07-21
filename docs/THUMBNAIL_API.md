# Thumbnail API workflow

SsangBak thumbnails are generated as complete images through OpenAI Images API. The image model renders the Korean headline as part of the composition; no code-based text overlay is used.

## Requirements

- `OPENAI_API_KEY` must be available as an environment variable.
- The Codex image generation skill and bundled Python runtime must be installed.
- Never store an API key in this repository.

## Generate a draft

```powershell
npm run thumbnail:api -- `
  --post src/content/posts/property-tax-card-benefits.md `
  --copy "2026 재산세|카드혜택 비교|캐시백 vs 무이자" `
  --scene "A realistic Korean apartment complex, a property-tax notice, an unbranded payment card, and a calculator arranged as a dramatic editorial photograph" `
  --quality medium
```

Drafts are written to `output/imagegen/` and are not published automatically. Inspect Korean spelling, composition, cropping, and visual quality before moving an approved result into `public/wp-content/uploads/`.

Use `--quality high --force` only after the prompt direction is approved. High-quality output takes longer and costs more than a medium draft.

## Rules

- Use two or three short headline lines.
- Pass headline text verbatim through `--copy`, separated by `|`.
- Describe a concrete, recognizable scene through `--scene`.
- Reject any output with misspelled Korean, extra text, fake logos, illegible microtext, or a generic AI/3D appearance.
- Do not automatically replace a live thumbnail. Publication requires visual approval.
