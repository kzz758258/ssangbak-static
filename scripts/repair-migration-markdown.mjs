import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "src", "content", "posts");

const tableStarts = new Set([
  "구분",
  "항목",
  "공연 회차",
  "예매 구분",
  "인증 단계",
  "경기 일시",
  "추천 구역",
  "선물 종류",
  "마스크 등급",
  "출발지",
  "시대 구분",
  "기업 구분",
  "취급 기관 유형"
]);

const shortBrokenCta = /^\s*👉\s*(?!\[)(?!.*\]\().{2,48}\s*$/;

function cleanCell(value) {
  return value
    .replace(/^\s+|\s+$/g, "")
    .replace(/\|/g, "\\|")
    .replace(/\*\*(.*?)\*\*/g, "**$1**");
}

function normalized(value) {
  return value.replace(/\*\*/g, "").trim();
}

function isCellLine(line) {
  const text = line.trim();
  if (!text) return false;
  if (/^(---|```|>|[-*]\s+|\d+\.\s+|#{1,6}\s+)/.test(text)) return false;
  if (/^!\[/.test(text) || /^\[.*\]\(.*\)$/.test(text)) return false;
  if (text.length > 90) return false;
  if (/[.?!。！？]$/.test(text) && text.length > 24) return false;
  return true;
}

function paragraphCells(lines, start) {
  const cells = [];
  let i = start;

  while (i < lines.length) {
    while (i < lines.length && lines[i].trim() === "") i += 1;
    if (i >= lines.length || !isCellLine(lines[i])) break;

    const cell = lines[i].trim();
    if (cells.length > 0 && tableStarts.has(normalized(cell)) && cells.length % 2 === 0) break;
    cells.push(cell);
    i += 1;

    if (i < lines.length && lines[i].trim() !== "") break;
  }

  return { cells, end: i };
}

function chooseColumnCount(cells) {
  const first = normalized(cells[0]);
  const second = normalized(cells[1] ?? "");
  const third = normalized(cells[2] ?? "");
  const firstTwoBold = /^\*\*.*\*\*$/.test(cells[0] ?? "") && /^\*\*.*\*\*$/.test(cells[1] ?? "");
  const firstFourBold = [0, 1, 2, 3].every((index) => /^\*\*.*\*\*$/.test(cells[index] ?? ""));

  if (firstFourBold && cells.length >= 8 && cells.length % 4 === 0) return 4;
  if (firstTwoBold) return cells.length % 2 === 0 ? 2 : 0;
  if (["출발지", "항목", "인증 단계", "추천 구역", "선물 종류", "마스크 등급"].includes(first)) {
    return cells.length % 2 === 0 ? 2 : 0;
  }
  if (first === "구분" && second && third && cells.length >= 6 && cells.length % 3 === 0) return 3;
  if (cells.length >= 4 && cells.length % 2 === 0) return 2;
  return 0;
}

function toMarkdownTable(cells, columnCount) {
  let header = cells.slice(0, columnCount);
  let body = cells.slice(columnCount);

  if (columnCount === 2 && tableStarts.has(normalized(cells[0])) && !tableStarts.has(normalized(cells[1]))) {
    header = ["구분", "내용"];
    body = cells;
  }

  const rows = [];
  for (let i = 0; i < body.length; i += columnCount) {
    const row = body.slice(i, i + columnCount);
    if (row.length === columnCount) rows.push(row);
  }

  return [
    `| ${header.map(cleanCell).join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cleanCell).join(" | ")} |`)
  ];
}

function repairTables(content) {
  const lines = content.split(/\r?\n/);
  const output = [];
  let tableCount = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const text = normalized(lines[i]);

    if (tableStarts.has(text)) {
      const { cells, end } = paragraphCells(lines, i);
      const columnCount = chooseColumnCount(cells);

      if (columnCount && cells.length >= columnCount * 2) {
        output.push(...toMarkdownTable(cells, columnCount));
        tableCount += 1;
        i = end - 1;
        continue;
      }
    }

    output.push(lines[i]);
  }

  return { content: output.join("\n"), tableCount };
}

function removeBrokenCtas(content) {
  let removed = 0;
  const lines = content.split(/\r?\n/).filter((line) => {
    if (!shortBrokenCta.test(line)) return true;
    const text = line.trim();
    if (text.includes("**") || /[.:：,，]/.test(text)) return true;
    removed += 1;
    return false;
  });

  return { content: lines.join("\n"), removed };
}

const files = fs.readdirSync(POSTS_DIR).filter((file) => file.endsWith(".md"));
const changed = [];
let totalTables = 0;
let totalCtas = 0;

for (const file of files) {
  const fullPath = path.join(POSTS_DIR, file);
  const before = fs.readFileSync(fullPath, "utf8");
  const ctaResult = removeBrokenCtas(before);
  const tableResult = repairTables(ctaResult.content);

  if (tableResult.content !== before) {
    fs.writeFileSync(fullPath, tableResult.content);
    changed.push(file);
    totalTables += tableResult.tableCount;
    totalCtas += ctaResult.removed;
  }
}

console.log(`changed files: ${changed.length}`);
console.log(`repaired tables: ${totalTables}`);
console.log(`removed broken ctas: ${totalCtas}`);
for (const file of changed.slice(0, 40)) console.log(`- ${file}`);
if (changed.length > 40) console.log(`...and ${changed.length - 40} more`);
