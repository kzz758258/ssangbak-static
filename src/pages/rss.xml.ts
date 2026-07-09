import { getCollection } from "astro:content";

const site = "https://ssangbak.com";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const posts = (await getCollection("posts"))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, 100);

  const items = posts
    .map((post) => {
      const url = new URL(post.data.permalink, site).toString();
      const description = post.data.description ?? post.data.title;

      return `
        <item>
          <title>${escapeXml(post.data.title)}</title>
          <link>${escapeXml(url)}</link>
          <guid isPermaLink="true">${escapeXml(url)}</guid>
          <description>${escapeXml(description)}</description>
          <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
        </item>`;
    })
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>SsangBak</title>
    <link>${site}/</link>
    <description>지원금, 정책, 생활정보를 정리하는 SsangBak 최신 글</description>
    <language>ko-KR</language>
    ${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8"
    }
  });
}
