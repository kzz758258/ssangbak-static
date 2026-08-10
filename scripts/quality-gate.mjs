import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const postsRoot = path.join(root, "src", "content", "posts");

function changedPostFiles() {
  const commands = [
    ["diff", "--name-only", "--diff-filter=ACMR", "--", "src/content/posts/*.md"],
    ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "--", "src/content/posts/*.md"],
    ["ls-files", "--others", "--exclude-standard", "--", "src/content/posts/*.md"]
  ];
  return [...new Set(commands.flatMap((args) => {
    const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
    return result.stdout.split(/\r?\n/).map((file) => file.trim()).filter(Boolean);
  }))];
}

const requested = process.argv.slice(2);
const files = (requested.length > 0 ? requested : changedPostFiles())
  .map((file) => path.resolve(root, file))
  .filter((file) => file.startsWith(postsRoot) && file.endsWith(".md"));

if (files.length === 0) {
  console.log("변경된 글이 없어 콘텐츠 품질 검사를 건너뜁니다.");
  process.exit(0);
}

const prohibited = [
  "알아보겠습니다",
  "알아보는 시간을",
  "다양한 측면에서",
  "도움이 되셨길 바랍니다",
  "저도 처음에는",
  "제가 직접 해보니"
];

function imageDimensions(buffer) {
  if (buffer.length >= 24 && buffer.toString("ascii", 1, 4) === "PNG") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer.length >= 16 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    let offset = 12;
    while (offset + 8 <= buffer.length) {
      const type = buffer.toString("ascii", offset, offset + 4);
      const size = buffer.readUInt32LE(offset + 4);
      const data = offset + 8;
      if (type === "VP8X" && data + 10 <= buffer.length) {
        return {
          width: 1 + buffer.readUIntLE(data + 4, 3),
          height: 1 + buffer.readUIntLE(data + 7, 3)
        };
      }
      if (type === "VP8 " && data + 10 <= buffer.length) {
        return {
          width: buffer.readUInt16LE(data + 6) & 0x3fff,
          height: buffer.readUInt16LE(data + 8) & 0x3fff
        };
      }
      if (type === "VP8L" && data + 5 <= buffer.length) {
        const bits = buffer.readUInt32LE(data + 1);
        return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
      }
      offset = data + size + (size % 2);
    }
  }

  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1];
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
      }
      if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue; }
      const size = buffer.readUInt16BE(offset + 2);
      if (size < 2) break;
      offset += 2 + size;
    }
  }

  return null;
}

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
  const heroImage = frontmatter.match(/^heroImage:\s*["'](.+?)["']\s*$/m)?.[1] || "";
  const thumbnailTextValue = frontmatter.match(/^thumbnailText:\s*\[(.*?)\]\s*$/m)?.[1] || "";
  const thumbnailText = [...thumbnailTextValue.matchAll(/["'](.+?)["']/g)].map((match) => match[1]);
  const thumbnailReviewed = /^thumbnailReviewed:\s*true\s*$/m.test(frontmatter);

  if (!/^title:\s*".+"/m.test(frontmatter)) errors.push("제목이 없습니다.");
  if (!/^description:\s*".+"/m.test(frontmatter)) errors.push("메타 설명이 없습니다.");
  if (!/^updatedDate:\s*".+"/m.test(frontmatter)) errors.push("최종 확인일(updatedDate)이 없습니다.");
  if (sourceCount < 2) errors.push("공식 출처를 최소 2개 frontmatter sources에 등록하세요.");
  if (words < 500) errors.push(`본문 정보량이 부족합니다(${words}단어, 최소 500단어).`);
  if (h2Count < 5) errors.push(`H2가 부족합니다(${h2Count}개, 최소 5개).`);
  if (tableCount < 1) errors.push("판정표 또는 핵심 요약 표가 없습니다.");
  if (ctaCount < 1) warnings.push("실제 공식 행동이 있는 글이라면 CTA를 1회 추가하세요. 억지 CTA는 넣지 않습니다.");
  if (faqCount < 4) errors.push(`실제 질문형 FAQ가 부족합니다(${faqCount}개, 최소 4개).`);
  if (decisionSignals < 2) errors.push("대상·예외·주의·변경 등 판단 정보가 충분하지 않습니다.");
  if (!/확인 기준일|최종 확인/.test(body)) warnings.push("본문에도 정보 확인 기준일을 표시하면 좋습니다.");
  if (!heroImage) {
    errors.push("대표 썸네일(heroImage)이 없습니다.");
  } else if (heroImage.startsWith("/")) {
    const imagePath = path.join(root, "public", heroImage.replace(/^\/+/, ""));
    if (!fs.existsSync(imagePath)) {
      errors.push(`대표 썸네일 파일이 없습니다: ${heroImage}`);
    } else {
      const image = fs.readFileSync(imagePath);
      const dimensions = imageDimensions(image);
      if (image.length < 70_000) errors.push(`썸네일 파일이 지나치게 작습니다(${Math.round(image.length / 1024)}KB, 최소 70KB).`);
      if (!dimensions) {
        errors.push("썸네일 크기를 확인할 수 없는 파일 형식입니다.");
      } else {
        const ratio = dimensions.width / dimensions.height;
        if (dimensions.width < 1500 || dimensions.height < 840) {
          errors.push(`썸네일 해상도가 부족합니다(${dimensions.width}×${dimensions.height}, 최소 1500×840).`);
        }
        if (Math.abs(ratio - (16 / 9)) > 0.03) {
          errors.push(`썸네일 비율이 16:9가 아닙니다(${dimensions.width}×${dimensions.height}).`);
        }
      }
    }
  }
  if (thumbnailText.length < 2 || thumbnailText.length > 3) errors.push("썸네일 제목을 thumbnailText에 2~3줄로 기록하세요.");
  if (!thumbnailReviewed) errors.push("썸네일 육안 검수 후 thumbnailReviewed: true를 기록하세요.");

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
