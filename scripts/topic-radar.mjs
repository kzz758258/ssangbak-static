import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import he from "he";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const postsDir = join(projectRoot, "src", "content", "posts");
const defaultReportDir = join(projectRoot, "reports", "topic-radar");
const defaultModel = process.env.TOPIC_RADAR_MODEL || "gpt-5.6-luna";
const KST_OFFSET = "+09:00";

function radarQueriesFor(date) {
  const [year, month] = date.split("-");
  const monthLabel = `${Number(month)}월`;
  return [
    `정부 지원금 신청 환급 세금 ${year}`,
    `생활정보 할인 쿠폰 환불 교통 ${year}`,
    `콘서트 예매 일정 내한 공연 ${year}`,
    `스포츠 중계 일정 월드컵 야구 ${year}`,
    `${monthLabel} 신청 기간 마감 혜택 ${year}`
  ];
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

function dateInKorea(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function cleanText(value = "") {
  return he.decode(String(value))
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractXmlTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return cleanText(match?.[1] || "");
}

function parseRss(xml, query) {
  return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => {
    const item = match[1];
    return {
      title: extractXmlTag(item, "title"),
      url: extractXmlTag(item, "link"),
      publishedAt: extractXmlTag(item, "pubDate"),
      source: extractXmlTag(item, "source") || "Google News RSS",
      query,
      channel: "rss"
    };
  }).filter((item) => item.title && item.url);
}

async function fetchGoogleNewsRss(query) {
  const url = new URL("https://news.google.com/rss/search");
  url.searchParams.set("q", query);
  url.searchParams.set("hl", "ko");
  url.searchParams.set("gl", "KR");
  url.searchParams.set("ceid", "KR:ko");
  const response = await fetch(url, {
    headers: { "user-agent": "SsangBakTopicRadar/1.0 (+https://ssangbak.com)" }
  });
  if (!response.ok) throw new Error(`Google News RSS ${response.status}: ${query}`);
  return parseRss(await response.text(), query);
}

async function fetchNaverNews(query) {
  if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) return [];
  const url = new URL("https://openapi.naver.com/v1/search/news.json");
  url.searchParams.set("query", query);
  url.searchParams.set("display", "30");
  url.searchParams.set("sort", "date");
  const response = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET
    }
  });
  if (!response.ok) throw new Error(`Naver News API ${response.status}: ${query}`);
  const data = await response.json();
  return (data.items || []).map((item) => ({
    title: cleanText(item.title),
    url: item.originallink || item.link,
    publishedAt: item.pubDate,
    source: "Naver News Search",
    query,
    channel: "naver"
  })).filter((item) => item.title && item.url);
}

function loadExistingPosts() {
  return readdirSync(postsDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const markdown = readFileSync(join(postsDir, name), "utf8");
      return {
        file: name,
        title: markdown.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] || basename(name, ".md"),
        pubDate: markdown.match(/^pubDate:\s*["']?(.+?)["']?\s*$/m)?.[1] || "",
        permalink: markdown.match(/^permalink:\s*["']?(.+?)["']?\s*$/m)?.[1] || ""
      };
    });
}

function keywordTokens(value) {
  return new Set(String(value).toLowerCase()
    .replace(/20\d{2}/g, " ")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 2)
    .filter((token) => !["총정리", "방법", "관련", "가이드", "확인", "신청"].includes(token)));
}

function similarity(left, right) {
  const a = keywordTokens(left);
  const b = keywordTokens(right);
  const tokenOverlap = a.size && b.size
    ? [...a].filter((token) => b.has(token)).length / Math.max(a.size, b.size)
    : 0;
  const normalize = (value) => String(value).toLowerCase()
    .replace(/20\d{2}/g, "")
    .replace(/총정리|완벽|가이드|방법|관련|확인/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
  const ngrams = (value, size = 2) => {
    const normalized = normalize(value);
    return new Set(Array.from({ length: Math.max(0, normalized.length - size + 1) }, (_, index) => normalized.slice(index, index + size)));
  };
  const leftGrams = ngrams(left);
  const rightGrams = ngrams(right);
  const gramOverlap = leftGrams.size && rightGrams.size
    ? (2 * [...leftGrams].filter((gram) => rightGrams.has(gram)).length) / (leftGrams.size + rightGrams.size)
    : 0;
  return Math.max(tokenOverlap, gramOverlap);
}

function nearestExisting(title, posts) {
  return posts
    .map((post) => ({ ...post, similarity: similarity(title, post.title) }))
    .sort((a, b) => b.similarity - a.similarity)[0];
}

function dedupeHeadlines(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.title.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function safePublicUrl(value) {
  try {
    const url = new URL(value);
    if (!new Set(["http:", "https:"]).has(url.protocol)) return null;
    const hostname = url.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.endsWith(".local")) return null;
    return url;
  } catch {
    return null;
  }
}

async function validateSource(source) {
  const url = safePublicUrl(source.url);
  if (!url) return { ...source, valid: false, status: 0, finalUrl: "", validationNote: "invalid URL" };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "SsangBakTopicRadar/1.0 (+https://ssangbak.com)" }
    });
    await response.body?.cancel();
    return {
      ...source,
      valid: response.ok,
      status: response.status,
      finalUrl: response.url || source.url,
      validationNote: response.ok ? "" : `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      ...source,
      valid: false,
      status: 0,
      finalUrl: "",
      validationNote: error.name === "AbortError" ? "timeout" : "fetch failed"
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function validateTopicSources(topics) {
  const flattened = topics.flatMap((topic, topicIndex) =>
    topic.sources.map((source, sourceIndex) => ({ topicIndex, sourceIndex, source }))
  );
  const results = [];
  for (let index = 0; index < flattened.length; index += 6) {
    results.push(...await Promise.all(flattened.slice(index, index + 6).map(async (entry) => ({
      ...entry,
      source: await validateSource(entry.source)
    }))));
  }
  return topics.map((topic, topicIndex) => ({
    ...topic,
    sources: results.filter((result) => result.topicIndex === topicIndex).map((result) => result.source)
  }));
}

async function collectSignals(queries) {
  const settled = await Promise.allSettled(queries.flatMap((query) => [
    fetchGoogleNewsRss(query),
    fetchNaverNews(query)
  ]));
  const signals = settled.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const errors = settled
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason?.message || String(result.reason));
  return { signals: dedupeHeadlines(signals).slice(0, 120), errors };
}

function topicSchema() {
  const score = { type: "integer", minimum: 0, maximum: 100 };
  return {
    type: "object",
    additionalProperties: false,
    required: ["summary", "topics"],
    properties: {
      summary: { type: "string" },
      topics: {
        type: "array",
        minItems: 8,
        maxItems: 12,
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "keyword", "title", "category", "topicType", "action", "whyNow", "readerValue",
            "demandSignal", "monetizationSignal", "competitionAngle", "publishBy", "subKeywords",
            "demandScore", "freshnessScore", "monetizationScore", "longevityScore", "siteFitScore",
            "sourceTrustScore", "riskLevel", "riskNote", "existingPost", "sources"
          ],
          properties: {
            keyword: { type: "string" },
            title: { type: "string" },
            category: { type: "string", enum: ["subsidy", "living-information", "entertainment-sports"] },
            topicType: { type: "string", enum: ["breaking", "seasonal", "evergreen", "refresh"] },
            action: { type: "string", enum: ["new", "refresh"] },
            whyNow: { type: "string" },
            readerValue: { type: "string" },
            demandSignal: { type: "string" },
            monetizationSignal: { type: "string" },
            competitionAngle: { type: "string" },
            publishBy: { type: "string" },
            subKeywords: { type: "array", minItems: 3, maxItems: 8, items: { type: "string" } },
            demandScore: score,
            freshnessScore: score,
            monetizationScore: score,
            longevityScore: score,
            siteFitScore: score,
            sourceTrustScore: score,
            riskLevel: { type: "string", enum: ["low", "medium", "high"] },
            riskNote: { type: "string" },
            existingPost: { type: "string" },
            sources: {
              type: "array",
              minItems: 2,
              maxItems: 5,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["title", "url", "sourceType"],
                properties: {
                  title: { type: "string" },
                  url: { type: "string" },
                  sourceType: { type: "string", enum: ["official", "news", "trend"] }
                }
              }
            }
          }
        }
      }
    }
  };
}

function extractResponseText(response) {
  if (typeof response.output_text === "string") return response.output_text;
  return (response.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text)
    .join("");
}

async function analyzeTopics({ date, signals, existingPosts, model }) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required.");
  const signalText = signals.map((item, index) =>
    `${index + 1}. [${item.channel}/${item.source}] ${item.title} | ${item.publishedAt} | ${item.url}`
  ).join("\n");
  const existingText = existingPosts.map((post) => `${post.title} | ${post.permalink}`).join("\n");
  const prompt = `You are the editorial topic analyst for SsangBak, a Korean practical-information site.

Today in Korea: ${date} (${KST_OFFSET})
Site categories: subsidy, living-information, entertainment-sports.

Goal:
Select 8-12 Korean article opportunities that can earn sustainable search traffic and ad revenue. Balance urgent demand with durable evergreen demand. Use the supplied discovery headlines only as leads, then use web search to verify timing and find direct primary sources whenever possible.

Hard rules:
- Do not invent numeric search volume, CPC, benefits, dates, eligibility, schedules, or event facts.
- Scores are relative editorial estimates from 0-100, not measured search volume.
- At least one source per time-sensitive topic should be official whenever an official source exists.
- Source URLs must be real pages you checked, not homepages or fabricated URLs.
- RSS/news text is discovery material only. Recommend an original service article with concrete reader actions, tables, comparisons, deadlines, or checklists.
- Avoid near-duplicate new articles. Use action=refresh when an existing SsangBak article should be updated instead.
- Prefer topics with a clear Korean search query, actionable intent, a useful angle, and enough source evidence.
- Exclude rumor-only celebrity stories, graphic incidents, pure opinion, medical diagnosis, investment recommendations, and topics whose key facts cannot be verified.
- Include a mix of breaking, seasonal, evergreen, and refresh opportunities.
- Keep Korean titles natural and informative, not sensational clickbait.
- publishBy must be an ISO date/time with +09:00 for urgent topics or a concise Korean window for evergreen topics. For a known deadline, recommend publishing early enough to be useful (normally at least 3 business days before it), never on or after the deadline.

Discovery headlines:
${signalText || "No RSS/API headlines were available. Use web search conservatively."}

Existing SsangBak titles for deduplication:
${existingText}`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: "low" },
      tools: [{ type: "web_search" }],
      input: prompt,
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "ssangbak_topic_radar",
          strict: true,
          schema: topicSchema()
        }
      }
    })
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI Responses API ${response.status}: ${message.slice(0, 1000)}`);
  }
  const data = await response.json();
  const text = extractResponseText(data);
  if (!text) throw new Error("OpenAI response did not contain output text.");
  return { analysis: JSON.parse(text), responseId: data.id || "", model: data.model || model };
}

function finalizeTopics(topics, existingPosts) {
  return topics.map((topic) => {
    const claimedExisting = topic.existingPost
      ? existingPosts.find((post) => post.permalink === topic.existingPost || post.permalink === `${topic.existingPost}/`)
      : null;
    const nearest = claimedExisting
      ? { ...claimedExisting, similarity: similarity(`${topic.keyword} ${topic.title}`, claimedExisting.title) }
      : nearestExisting(`${topic.keyword} ${topic.title}`, existingPosts);
    const action = topic.action === "new" && nearest?.similarity >= 0.35
      ? "refresh"
      : topic.action;
    const duplicatePenalty = action === "new" && nearest?.similarity >= 0.45
      ? Math.round(nearest.similarity * 35)
      : 0;
    const riskPenalty = topic.riskLevel === "high" ? 12 : topic.riskLevel === "medium" ? 5 : 0;
    const invalidSourceCount = topic.sources.filter((source) => !source.valid).length;
    const sourcePenalty = invalidSourceCount * 8;
    const score = Math.max(0, Math.min(100, Math.round(
      topic.demandScore * 0.24 +
      topic.freshnessScore * 0.18 +
      topic.monetizationScore * 0.18 +
      topic.longevityScore * 0.16 +
      topic.siteFitScore * 0.16 +
      topic.sourceTrustScore * 0.08 -
      duplicatePenalty -
      riskPenalty -
      sourcePenalty
    )));
    return {
      ...topic,
      action,
      actionAdjusted: action !== topic.action,
      score,
      nearestExistingTitle: nearest?.title || "",
      nearestExistingPermalink: nearest?.permalink || "",
      similarity: nearest?.similarity || 0,
      duplicatePenalty,
      riskPenalty,
      sourcePenalty
    };
  }).sort((a, b) => b.score - a.score);
}

function markdownEscape(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function renderReport({ date, summary, topics, model, responseId, signals, errors }) {
  const generatedAt = new Date().toISOString();
  const lines = [
    `# SsangBak 글감 레이더 — ${date}`,
    "",
    `> 생성 시각: ${generatedAt} · 모델: ${model} · 후보 신호: ${signals.length}개`,
    "> 점수는 실제 검색량이 아니라 시의성·수익성·지속성·사이트 적합도·출처 신뢰도를 합성한 상대평가입니다.",
    "",
    "## 오늘의 판단",
    "",
    summary,
    "",
    "## 우선순위",
    "",
    "| 순위 | 점수 | 유형 | 작업 | 카테고리 | 핵심 키워드 | 추천 제목 | 위험 |",
    "| ---: | ---: | --- | --- | --- | --- | --- | --- |"
  ];
  topics.forEach((topic, index) => {
    lines.push(`| ${index + 1} | ${topic.score} | ${topic.topicType} | ${topic.action} | ${topic.category} | ${markdownEscape(topic.keyword)} | ${markdownEscape(topic.title)} | ${topic.riskLevel} |`);
  });
  lines.push("", "## 상세 후보", "");
  topics.forEach((topic, index) => {
    lines.push(
      `### ${index + 1}. ${topic.title}`,
      "",
      `- **종합점수:** ${topic.score}/100`,
      `- **핵심 키워드:** ${topic.keyword}`,
      `- **유형/작업:** ${topic.topicType} / ${topic.action}`,
      `- **권장 발행 시점:** ${topic.publishBy}`,
      `- **지금 써야 하는 이유:** ${topic.whyNow}`,
      `- **독자 가치:** ${topic.readerValue}`,
      `- **수요 신호:** ${topic.demandSignal}`,
      `- **수익화 신호:** ${topic.monetizationSignal}`,
      `- **경쟁 차별화:** ${topic.competitionAngle}`,
      `- **서브 키워드:** ${topic.subKeywords.join(", ")}`,
      `- **위험도:** ${topic.riskLevel} — ${topic.riskNote}`
    );
    if (topic.nearestExistingTitle) {
      const link = topic.nearestExistingPermalink || "(링크 없음)";
      lines.push(`- **가장 유사한 기존 글:** ${topic.nearestExistingTitle} · ${link} · 유사도 ${Math.round(topic.similarity * 100)}%`);
    }
    lines.push("- **근거 자료:**");
    topic.sources.forEach((source) => {
      const state = source.valid ? `확인됨 HTTP ${source.status}` : `확인 필요: ${source.validationNote}`;
      lines.push(`  - [${source.title}](${source.finalUrl || source.url}) · ${source.sourceType} · ${state}`);
    });
    lines.push("");
  });
  lines.push(
    "## 데이터 상태",
    "",
    `- Google News RSS: 사용 (${signals.filter((item) => item.channel === "rss").length}개 신호)`,
    `- Naver News API: ${process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET ? "사용" : "키 미설정"}`,
    "- Naver DataLab: 키 미설정 시 미사용",
    "- Google Ads Keyword Planner: 자격 증명 미설정 시 미사용",
    "- Google Search Console: OAuth/서비스 계정 미설정 시 미사용",
    "- 근거 URL: 보고서 생성 시 HTTP 응답 자동 검사",
    `- OpenAI 응답 ID: ${responseId || "미기록"}`
  );
  if (errors.length) {
    lines.push("", "## 수집 경고", "", ...errors.map((error) => `- ${error}`));
  }
  lines.push(
    "",
    "## 발행 원칙",
    "",
    "이 보고서는 글감 선별용입니다. 뉴스/RSS 문장을 복사하지 말고, 실제 작성 시 공식 출처를 다시 열어 날짜·금액·대상·신청 조건을 검증해야 합니다."
  );
  return `${lines.join("\n")}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    console.log(`Usage: npm run topic-radar -- [options]

Options:
  --date YYYY-MM-DD   Report date (default: today in Asia/Seoul)
  --model MODEL       OpenAI model (default: TOPIC_RADAR_MODEL or ${defaultModel})
  --out PATH          Markdown report path
  --json-out PATH     JSON report path
  --help              Show this help`);
    return;
  }
  const date = args.date || dateInKorea();
  const requestedModel = args.model || defaultModel;
  const reportPath = resolve(args.out || join(defaultReportDir, `${date}.md`));
  const jsonPath = resolve(args["json-out"] || join(defaultReportDir, `${date}.json`));
  const existingPosts = loadExistingPosts();
  console.log(`Collecting topic signals for ${date}...`);
  const { signals, errors } = await collectSignals(radarQueriesFor(date));
  console.log(`Collected ${signals.length} unique signals. Analyzing with ${requestedModel}...`);
  const { analysis, responseId, model } = await analyzeTopics({ date, signals, existingPosts, model: requestedModel });
  console.log("Validating evidence URLs...");
  const validatedTopics = await validateTopicSources(analysis.topics);
  const topics = finalizeTopics(validatedTopics, existingPosts);
  const report = renderReport({
    date,
    summary: analysis.summary,
    topics,
    model,
    responseId,
    signals,
    errors
  });
  mkdirSync(dirname(reportPath), { recursive: true });
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(reportPath, report, "utf8");
  writeFileSync(jsonPath, `${JSON.stringify({ date, generatedAt: new Date().toISOString(), model, responseId, signals, topics }, null, 2)}\n`, "utf8");
  console.log(`Report: ${reportPath}`);
  console.log(`Data:   ${jsonPath}`);
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
