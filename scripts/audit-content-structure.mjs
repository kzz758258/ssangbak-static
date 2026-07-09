import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const postsDir = path.join(root, "src", "content", "posts");
const outFile = path.join(root, "docs", "CONTENT_STRUCTURE_AUDIT.md");

const categories = [
  ["지원금·정부정책", ["지원금", "수당", "바우처", "급여", "복지", "환급", "신청", "청년", "소상공인", "근로장려금", "장학금", "육아", "보조금"]],
  ["생활정보", ["생활", "카드", "발급", "조회", "등록", "방법", "청소", "보험", "운전", "교통", "건강", "병원", "약국", "통신", "모바일"]],
  ["금융·세금", ["계좌", "ISA", "연금", "ETF", "세금", "세액", "소득", "금융", "투자", "주식", "배당", "금값", "환율", "대출"]],
  ["공연·콘서트·뮤지컬", ["콘서트", "뮤지컬", "공연", "티켓", "티켓팅", "예매", "전시", "페스티벌", "축제", "라인업", "내한"]],
  ["방송·스포츠", ["방송", "중계", "스포츠", "야구", "축구", "월드컵", "순위", "경기", "투표", "다시보기", "참가자"]],
  ["AI·직업", ["AI 직업", "인공지능", "채용", "취업", "직무", "커리어", "자동화", "삼성", "하이닉스"]],
  ["AI·주식", ["AI 관련주", "반도체", "소프트웨어", "에너지", "수혜주", "투자", "주가", "종목"]],
  ["여행·축제", ["여행", "숙박", "축제", "관광", "페스타", "셔틀", "벚꽃", "케이블카", "지역", "할인"]]
];

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const data = {};

  for (const line of match[1].split(/\r?\n/)) {
    const entry = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!entry) continue;
    let value = entry[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[entry[1]] = value;
  }

  return { data, body: match[2] };
}

function inferCategory(post) {
  const text = `${post.title} ${post.description} ${post.slug}`.toLowerCase();
  let best = "생활정보";
  let bestScore = 0;

  for (const [name, keywords] of categories) {
    const score = keywords.reduce((total, keyword) => {
      return text.includes(keyword.toLowerCase()) ? total + 1 : total;
    }, 0);
    if (score > bestScore) {
      best = name;
      bestScore = score;
    }
  }

  return best;
}

function titleKey(title) {
  return title
    .replace(/[0-9]{4}/g, "")
    .replace(/[^\p{Script=Hangul}A-Za-z0-9]+/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2)
    .slice(0, 5)
    .join(" ");
}

const files = (await fs.readdir(postsDir)).filter((file) => file.endsWith(".md"));
const posts = [];

for (const file of files) {
  const raw = await fs.readFile(path.join(postsDir, file), "utf8");
  const { data, body } = parseFrontmatter(raw);
  const title = data.title ?? file.replace(/\.md$/, "");
  const description = data.description ?? "";
  const wordishCount = body.split(/\s+/).filter(Boolean).length;
  const headingCount = (body.match(/^#{2,3}\s+/gm) ?? []).length;
  const imageCount = (body.match(/!\[[^\]]*\]\([^)]+\)/g) ?? []).length + (data.heroImage ? 1 : 0);
  const ctaCount = (body.match(/^\[[^\]]+\]\([^)]+\)$/gm) ?? []).length;
  const category = inferCategory({ title, description, slug: data.slugPath ?? file });

  posts.push({
    file,
    title,
    description,
    permalink: data.permalink ?? "",
    category,
    wordishCount,
    headingCount,
    imageCount,
    ctaCount,
    titleKey: titleKey(title)
  });
}

const categoryCounts = new Map();
for (const post of posts) {
  categoryCounts.set(post.category, (categoryCounts.get(post.category) ?? 0) + 1);
}

const thinPosts = posts
  .filter((post) => post.wordishCount < 450 || post.headingCount < 2)
  .sort((a, b) => a.wordishCount - b.wordishCount)
  .slice(0, 80);

const noImagePosts = posts.filter((post) => post.imageCount === 0).slice(0, 80);

const duplicateGroups = Object.values(
  posts.reduce((groups, post) => {
    if (!post.titleKey) return groups;
    groups[post.titleKey] ??= [];
    groups[post.titleKey].push(post);
    return groups;
  }, {})
)
  .filter((group) => group.length >= 2)
  .sort((a, b) => b.length - a.length)
  .slice(0, 30);

function table(rows, columns) {
  const header = `| ${columns.join(" |")} |`;
  const divider = `| ${columns.map(() => "---").join(" |")} |`;
  const body = rows.map((row) => `| ${columns.map((column) => String(row[column] ?? "").replaceAll("|", "\\|")).join(" |")} |`);
  return [header, divider, ...body].join("\n");
}

const categoryRows = [...categoryCounts.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([category, count]) => ({ category, count }));

const report = `# Content structure audit

Generated: ${new Date().toISOString()}

## Summary

- Total posts: ${posts.length}
- Posts flagged as thin or weakly structured: ${posts.filter((post) => post.wordishCount < 450 || post.headingCount < 2).length}
- Posts without detected images: ${posts.filter((post) => post.imageCount === 0).length}
- Potential duplicate title groups: ${duplicateGroups.length}

## Category distribution

${table(categoryRows, ["category", "count"])}

## Recommended order

1. Keep existing titles, body text, and URLs unchanged for now.
2. Use the new category hubs and related-post blocks to strengthen crawl paths.
3. Review thin or weakly structured posts below before rewriting anything.
4. Merge or rewrite only the groups with clear overlap after checking Naver traffic.
5. Apply the high-quality publishing template to all new posts first.

## Thin or weakly structured posts

${table(
  thinPosts.map((post) => ({
    title: post.title,
    category: post.category,
    words: post.wordishCount,
    headings: post.headingCount,
    url: post.permalink
  })),
  ["title", "category", "words", "headings", "url"]
)}

## Posts without detected images

${table(
  noImagePosts.map((post) => ({
    title: post.title,
    category: post.category,
    url: post.permalink
  })),
  ["title", "category", "url"]
)}

## Potential duplicate groups

${duplicateGroups
  .map((group) => {
    return `### ${group[0].titleKey}\n\n${table(
      group.map((post) => ({
        title: post.title,
        category: post.category,
        url: post.permalink
      })),
      ["title", "category", "url"]
    )}`;
  })
  .join("\n\n")}
`;

await fs.mkdir(path.dirname(outFile), { recursive: true });
await fs.writeFile(outFile, report);
console.log(`Wrote ${path.relative(root, outFile)}`);
