# SEO audit and improvement plan

## Immediate findings

- Imported WordPress plugin residue left standalone `[Toggle](#)` and table-of-contents artifacts in posts. This looked broken to users and diluted the main content.
- WordPress-style button links were imported as plain links, so important CTA actions lost visual weight.
- Many thumbnails and inline images still referenced the old WordPress upload paths. After the domain moved to the static site, those assets needed to exist in the static build.
- Post pages lacked visible generated table of contents, article structured data, breadcrumb structured data, and richer social metadata.
- The homepage rendered every imported post, which made the first page heavier than necessary.
- Imported posts currently have weak category/topic structure. This limits crawl paths, topical clustering, and internal linking.

## Completed in this pass

- Restored local static media under `/wp-content/uploads/`.
- Removed imported TOC toggle residue from all markdown posts.
- Added automatic post table of contents from headings.
- Styled standalone article links as CTA buttons while keeping in-page anchor links normal.
- Added article and breadcrumb JSON-LD to post pages.
- Added canonical, robots, Open Graph, Twitter card, publish time, and modified time metadata.
- Reduced homepage listing to recent posts for a lighter entry page.

## Google-aligned next work

- Rebuild topic/category pages around real clusters such as policy support, living info, concerts, sports, AI jobs, and finance.
- Add related-post and previous/next internal links based on category and keyword similarity.
- Audit thin or overlapping posts, then merge, redirect, or improve them.
- Add FAQ sections only where the body actually contains useful Q&A, and use FAQ structured data selectively.
- Improve image alt text and captions for the most important traffic pages.
- Submit and monitor sitemap in Google Search Console, then inspect representative URLs from each category.
- Track Search Console states such as discovered, crawled not indexed, duplicate, and alternate page with canonical.

## References

- Google Search Essentials: https://developers.google.com/search/docs/essentials
- SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Structured data: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Image SEO: https://developers.google.com/search/docs/appearance/google-images
