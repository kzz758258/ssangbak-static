import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import he from "he";
import TurndownService from "turndown";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const postsDir = path.join(rootDir, "src", "content", "posts");
const manifestPath = path.join(rootDir, "src", "content", "import-manifest.json");
const site = "https://ssangbak.com";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-"
});

turndown.keep(["iframe"]);
turndown.remove(["script", "style", "noscript"]);

function frontmatter(value) {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replace(/\r?\n/g, " ")
    .trim();
}

function mdFileName(url) {
  const { pathname } = new URL(url);
  const cleanPath = decodeURIComponent(pathname).replace(/^\/|\/$/g, "");
  const last = cleanPath.split("/").filter(Boolean).at(-1) || "home";
  const ascii = last
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");

  if (ascii) return `${ascii}.md`;
  const hash = crypto.createHash("sha1").update(cleanPath).digest("hex").slice(0, 12);
  return `post-${hash}.md`;
}

function slugPath(url) {
  return decodeURIComponent(new URL(url).pathname).replace(/^\/|\/$/g, "");
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 SsangBakStaticImporter/0.1"
    }
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${url}`);
  }

  return res.text();
}

async function getSitemapUrls() {
  const sitemapIndex = await fetchText(`${site}/sitemap.xml`);
  const $ = cheerio.load(sitemapIndex, { xmlMode: true });
  const postSitemaps = $("sitemap loc")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((url) => /post-sitemap\d+\.xml$/.test(url));

  const urls = [];
  for (const sitemapUrl of postSitemaps) {
    const xml = await fetchText(sitemapUrl);
    const sitemap = cheerio.load(xml, { xmlMode: true });
    sitemap("url").each((_, el) => {
      const loc = sitemap(el).find("loc").first().text().trim();
      const lastmod = sitemap(el).find("lastmod").first().text().trim();
      if (loc && new URL(loc).pathname !== "/") urls.push({ loc, lastmod });
    });
  }

  return urls;
}

function extractPost(html, url, lastmod) {
  const $ = cheerio.load(html);
  const article = $("article").first();
  const scope = article.length ? article : $("main").first();

  scope.find("script, style, noscript, .sharedaddy, .jp-relatedposts, nav, form").remove();

  const title =
    he.decode($("meta[property='og:title']").attr("content") || scope.find("h1").first().text() || $("title").text())
      .replace(/\s+\|?\s*SsangBak\s*$/i, "")
      .trim();

  const description = he.decode(
    $("meta[name='description']").attr("content") ||
      $("meta[property='og:description']").attr("content") ||
      scope.find("p").first().text()
  )
    .replace(/\s+/g, " ")
    .trim();

  const pubDate =
    $("meta[property='article:published_time']").attr("content") ||
    scope.find("time[datetime]").first().attr("datetime") ||
    lastmod ||
    new Date().toISOString();

  const updatedDate = $("meta[property='article:modified_time']").attr("content") || lastmod || pubDate;
  const heroImage = $("meta[property='og:image']").attr("content") || "";

  scope.find("h1").first().remove();
  const contentSource = scope.find(".entry-content").length ? scope.find(".entry-content").first() : scope;
  const markdown = turndown.turndown(contentSource.html() || "").trim();

  return {
    title,
    description,
    pubDate,
    updatedDate,
    permalink: new URL(url).pathname,
    slugPath: slugPath(url),
    heroImage,
    originalUrl: url,
    markdown
  };
}

async function importPost(item, index, total) {
  const html = await fetchText(item.loc);
  const post = extractPost(html, item.loc, item.lastmod);
  const filename = mdFileName(item.loc);
  const outputPath = path.join(postsDir, filename);

  const body = `---\ntitle: "${frontmatter(post.title)}"\ndescription: "${frontmatter(post.description)}"\npubDate: "${post.pubDate}"\nupdatedDate: "${post.updatedDate}"\npermalink: "${frontmatter(post.permalink)}"\nslugPath: "${frontmatter(post.slugPath)}"\ncategories: []\ntags: []\nheroImage: "${frontmatter(post.heroImage)}"\noriginalUrl: "${frontmatter(post.originalUrl)}"\n---\n\n${post.markdown}\n`;

  await fs.writeFile(outputPath, body, "utf8");
  console.log(`[${index + 1}/${total}] ${post.title}`);
  return { url: item.loc, file: path.relative(rootDir, outputPath), title: post.title };
}

async function main() {
  await fs.mkdir(postsDir, { recursive: true });
  const urls = await getSitemapUrls();
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : urls.length;
  const selected = urls.slice(0, Number.isFinite(limit) ? limit : urls.length);

  const imported = [];
  for (let i = 0; i < selected.length; i += 1) {
    try {
      imported.push(await importPost(selected[i], i, selected.length));
      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch (error) {
      console.error(`Failed: ${selected[i].loc}`);
      console.error(error);
    }
  }

  await fs.writeFile(
    manifestPath,
    JSON.stringify({ importedAt: new Date().toISOString(), count: imported.length, imported }, null, 2),
    "utf8"
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
