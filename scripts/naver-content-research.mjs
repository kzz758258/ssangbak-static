import { createHmac } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import he from "he";

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

function cleanText(value = "") {
  return he.decode(String(value))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countValue(value) {
  if (typeof value === "number") return value;
  if (String(value).startsWith("<")) return 5;
  return Number(String(value).replace(/,/g, "")) || 0;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function shiftDate(date, days) {
  const shifted = new Date(date);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted;
}

function sleep(milliseconds) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
}

function requireEnv() {
  const names = [
    "NAVER_CLIENT_ID",
    "NAVER_CLIENT_SECRET",
    "NAVER_SEARCHAD_API_KEY",
    "NAVER_SEARCHAD_SECRET_KEY",
    "NAVER_SEARCHAD_CUSTOMER_ID"
  ];
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
}

async function fetchSearchAdKeywords(keyword) {
  const path = "/keywordstool";
  const timestamp = Date.now().toString();
  const signature = createHmac("sha256", process.env.NAVER_SEARCHAD_SECRET_KEY)
    .update(`${timestamp}.GET.${path}`)
    .digest("base64");
  const url = new URL(`https://api.searchad.naver.com${path}`);
  url.searchParams.set("hintKeywords", keyword.replace(/\s+/g, ""));
  url.searchParams.set("showDetail", "1");
  const response = await fetch(url, {
    headers: {
      "X-Timestamp": timestamp,
      "X-API-KEY": process.env.NAVER_SEARCHAD_API_KEY,
      "X-Customer": process.env.NAVER_SEARCHAD_CUSTOMER_ID,
      "X-Signature": signature
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Search Ads ${response.status}: ${data.message || keyword}`);
  return (data.keywordList || [])
    .map((item) => ({
      keyword: item.relKeyword,
      monthlyPc: countValue(item.monthlyPcQcCnt),
      monthlyMobile: countValue(item.monthlyMobileQcCnt),
      monthlyTotal: countValue(item.monthlyPcQcCnt) + countValue(item.monthlyMobileQcCnt),
      competition: item.compIdx || "",
      averagePcClicks: Number(item.monthlyAvePcClkCnt) || 0,
      averageMobileClicks: Number(item.monthlyAveMobileClkCnt) || 0
    }))
    .sort((left, right) => right.monthlyTotal - left.monthlyTotal);
}

async function fetchNaverSearch(keyword, type, sort = "sim") {
  const url = new URL(`https://openapi.naver.com/v1/search/${type}.json`);
  url.searchParams.set("query", keyword);
  url.searchParams.set("display", "10");
  url.searchParams.set("sort", sort);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET
      }
    });
    const data = await response.json();
    if (response.ok) {
      return (data.items || []).map((item) => ({
        title: cleanText(item.title),
        description: cleanText(item.description),
        url: item.originallink || item.link,
        publishedAt: item.pubDate || item.postdate || ""
      }));
    }
    if (response.status !== 429 || attempt === 3) {
      throw new Error(`Naver ${type} ${response.status}: ${data.errorMessage || keyword}`);
    }
    await sleep(600 * (attempt + 1));
  }
  return [];
}

async function fetchDataLabTrend(keywords, endDate) {
  const end = shiftDate(new Date(`${endDate}T00:00:00Z`), -1);
  const start = shiftDate(end, -89);
  const groups = keywords.slice(0, 5).map((keyword) => ({
    groupName: keyword.slice(0, 20),
    keywords: [keyword]
  }));
  const response = await fetch("https://openapi.naver.com/v1/datalab/search", {
    method: "POST",
    headers: {
      "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      startDate: isoDate(start),
      endDate: isoDate(end),
      timeUnit: "date",
      keywordGroups: groups
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`DataLab ${response.status}: ${data.errorMessage || keywords[0]}`);
  return (data.results || []).map((result) => {
    const points = result.data || [];
    const recent = points.slice(-7);
    const previous = points.slice(-14, -7);
    const average = (items) => items.length
      ? items.reduce((sum, item) => sum + Number(item.ratio || 0), 0) / items.length
      : 0;
    const recentAverage = average(recent);
    const previousAverage = average(previous);
    return {
      keyword: result.title,
      recentAverage: Number(recentAverage.toFixed(2)),
      previousAverage: Number(previousAverage.toFixed(2)),
      changePercent: previousAverage
        ? Number((((recentAverage - previousAverage) / previousAverage) * 100).toFixed(1))
        : null,
      latestRatio: Number(points.at(-1)?.ratio || 0)
    };
  });
}

async function researchKeyword(keyword, date) {
  const warnings = [];
  let relatedKeywords = [];
  try {
    relatedKeywords = await fetchSearchAdKeywords(keyword);
  } catch (error) {
    warnings.push(error.message);
  }
  const trendKeywords = [
    keyword,
    ...relatedKeywords.map((item) => item.keyword)
  ].filter((item, index, list) => item && list.indexOf(item) === index).slice(0, 5);
  const searchTypes = [
    ["news", "date"],
    ["blog", "sim"],
    ["cafearticle", "sim"],
    ["kin", "sim"]
  ];
  const searchResults = {};
  for (const [type, sort] of searchTypes) {
    try {
      searchResults[type] = await fetchNaverSearch(keyword, type, sort);
    } catch (error) {
      searchResults[type] = [];
      warnings.push(error.message);
    }
    await sleep(180);
  }
  let trends = [];
  try {
    trends = await fetchDataLabTrend(trendKeywords, date);
  } catch (error) {
    warnings.push(error.message);
  }
  return {
    keyword,
    measuredAt: new Date().toISOString(),
    relatedKeywords: relatedKeywords.slice(0, 30),
    trends,
    searchResults,
    warnings
  };
}

function renderMarkdown(date, results) {
  const lines = [
    `# 네이버 콘텐츠 리서치 — ${date}`,
    "",
    "> 검색광고 월간 검색량, 데이터랩 상대 추세, 네이버 검색 결과를 합친 작성 보조 자료입니다.",
    ""
  ];
  for (const result of results) {
    lines.push(`## ${result.keyword}`, "", "### 검색량과 연관 키워드", "");
    if (!result.relatedKeywords.length) {
      lines.push("- 검색광고 연관 키워드 없음", "");
    } else {
      lines.push("| 키워드 | PC | 모바일 | 합계 | 경쟁 |", "| --- | ---: | ---: | ---: | --- |");
      result.relatedKeywords.slice(0, 15).forEach((item) => {
        lines.push(`| ${item.keyword} | ${item.monthlyPc} | ${item.monthlyMobile} | ${item.monthlyTotal} | ${item.competition} |`);
      });
      lines.push("");
    }
    lines.push("### 최근 7일 검색 추세", "");
    result.trends.forEach((item) => {
      const change = item.changePercent === null ? "비교 불가" : `${item.changePercent > 0 ? "+" : ""}${item.changePercent}%`;
      lines.push(`- ${item.keyword}: 최근 평균 ${item.recentAverage}, 이전 7일 대비 ${change}`);
    });
    lines.push("", "### 실제 검색 결과에서 반복되는 질문", "");
    for (const [type, items] of Object.entries(result.searchResults)) {
      lines.push(`#### ${type}`, "");
      items.slice(0, 5).forEach((item) => lines.push(`- [${item.title}](${item.url}) — ${item.description}`));
      lines.push("");
    }
    if (result.warnings.length) lines.push("### 경고", "", ...result.warnings.map((warning) => `- ${warning}`), "");
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.keywords) {
    console.log('Usage: node --env-file=.env scripts/naver-content-research.mjs --keywords "키워드1|키워드2" [--date YYYY-MM-DD] [--out PATH] [--json-out PATH]');
    return;
  }
  requireEnv();
  const date = args.date || new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
  const keywords = args.keywords.split("|").map((item) => item.trim()).filter(Boolean);
  const outPath = resolve(args.out || `reports/content-research/${date}.md`);
  const jsonPath = resolve(args["json-out"] || `reports/content-research/${date}.json`);
  const results = [];
  for (const keyword of keywords) {
    console.log(`Researching: ${keyword}`);
    results.push(await researchKeyword(keyword, date));
  }
  mkdirSync(dirname(outPath), { recursive: true });
  mkdirSync(dirname(jsonPath), { recursive: true });
  writeFileSync(outPath, renderMarkdown(date, results), "utf8");
  writeFileSync(jsonPath, `${JSON.stringify({ date, generatedAt: new Date().toISOString(), results }, null, 2)}\n`, "utf8");
  console.log(`Wrote ${outPath}`);
  console.log(`Wrote ${jsonPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
