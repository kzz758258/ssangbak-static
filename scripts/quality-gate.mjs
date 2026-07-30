import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const postsRoot = path.join(root, "src", "content", "posts");

function changedPostFiles() {
  const result = spawnSync(
    "git",
    ["diff", "--name-only", "--diff-filter=ACMR", "--", "src/content/posts/*.md"],
    { cwd: root, encoding: "utf8" }
  );

  return result.stdout
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter(Boolean);
}

const requested = process.argv.slice(2);
const files = (requested.length > 0 ? requested : changedPostFiles())
  .map((file) => path.resolve(root, file))
  .filter((file) => file.startsWith(postsRoot) && file.endsWith(".md"));

if (files.length === 0) {
  console.error("검사할 글이 없습니다. 글 경로를 인수로 전달하세요.");
  process.exit(1);
}

const prohibited = [
  "알아보겠습니다",
  "알아보는 시간을",
  "다양한 측면에서",
  "도움이 되셨길 바랍니다",
  "저도 처음에는",
  "제가 직접 해보니"
];

const results = [];

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const frontmatterMatch = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const errors = [];
  const warnings = [];

  if (!frontmatterMatch) {
    results.push({ file, errors: ["frontmatter가 없습니다."], warnings });
    continue;
  }

  const frontmatter = frontmatterMatch[1];
  const body = frontmatterMatch[2];
  const words = body.split(/\s+/).filter(Boolean).length;
  const h2Count = (body.match(/^##\s+/gm) ?? []).length;
  const tableCount = (body.match(/^\|\s*---/gm) ?? []).length;
  const ctaCount = (body.match(/^\[[^\]]+\]\(https?:\/\/[^)]+\)$/gm) ?? []).length;
  const sourceCount = (frontmatter.match(/^\s*-\s+title:\s+/gm) ?? []).length;
  const faqIndex = body.search(/^##\s+.*FAQ|^##\s+자주 묻는 질문/m);
  const faqBody = faqIndex >= 0 ? body.slice(faqIndex) : "";
  const faqCount = (faqBody.match(/^###\s+/gm) ?? []).length;
  const decisionSignals = ["대상", "제외", "불가", "주의", "예외", "준비", "실패", "변경", "취소"]
    .filter((signal) => body.includes(signal)).length;

  if (!/^title:\s*".+"/m.test(frontmatter)) errors.push("제목이 없습니다.");
  if (!/^description:\s*".+"/m.test(frontmatter)) errors.push("메타 설명이 없습니다.");
  if (!/^updatedDate:\s*".+"/m.test(frontmatter)) errors.push("최종 확인일(updatedDate)이 없습니다.");
  if (sourceCount < 2) errors.push("공식 출처를 최소 2개 frontmatter sources에 등록하세요.");
  if (words < 500) errors.push(`본문 정보량이 부족합니다(${words}단어, 최소 500단어).`);
  if (h2Count < 5) errors.push(`H2가 부족합니다(${h2Count}개, 최소 5개).`);
  if (tableCount < 1) errors.push("판정표 또는 핵심 요약 표가 없습니다.");
  if (ctaCount < 1) errors.push("공식 행동 CTA가 없습니다.");
  if (faqCount < 4) errors.push(`실제 질문형 FAQ가 부족합니다(${faqCount}개, 최소 4개).`);
  if (decisionSignals < 2) errors.push("대상·예외·주의·변경 등 판단 정보가 충분하지 않습니다.");
  if (!/확인 기준일|최종 확인/.test(body)) warnings.push("본문에도 정보 확인 기준일을 표시하면 좋습니다.");

  for (const phrase of prohibited) {
    if (body.includes(phrase)) errors.push(`금지 또는 검증 불가능한 표현이 있습니다: "${phrase}"`);
  }

  results.push({ file, errors, warnings });
}

for (const result of results) {
  console.log(`\n${path.relative(root, result.file)}`);
  for (const error of result.errors) console.error(`  ERROR: ${error}`);
  for (const warning of result.warnings) console.warn(`  WARN: ${warning}`);
  if (result.errors.length === 0) console.log("  PASS");
}

const errorCount = results.reduce((total, result) => total + result.errors.length, 0);
console.log(`\n${results.length}개 글 검사, 오류 ${errorCount}개`);
process.exit(errorCount > 0 ? 1 : 0);
