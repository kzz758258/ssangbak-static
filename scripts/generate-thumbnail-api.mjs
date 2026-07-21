import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = value;
    index += 1;
  }
  return args;
}

function usage(message) {
  if (message) console.error(`\n${message}\n`);
  console.error(`Usage:
  npm run thumbnail:api -- \\
    --post src/content/posts/example.md \\
    --copy "첫째 줄|둘째 줄|셋째 줄" \\
    --scene "기사 주제를 보여주는 현실적인 장면"

Options:
  --post       Markdown post used for title/slug metadata
  --copy       Exact 2-3 lines to render, separated with |
  --scene      Concrete visual subject and setting
  --quality    low, medium, high, or auto (default: medium)
  --size       gpt-image-2 size (default: 2048x1152)
  --out        Preview output path
  --force      Replace an existing preview file
  --dry-run    Print the API payload without making a request
`);
  process.exit(1);
}

function readFrontmatter(postPath) {
  const markdown = readFileSync(postPath, "utf8");
  const title = markdown.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? "";
  const slug = markdown.match(/^slugPath:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? basename(postPath, ".md");
  const category = markdown.match(/^category:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? "living-information";
  return { title, slug, category };
}

function findPython() {
  if (process.env.THUMBNAIL_PYTHON) return process.env.THUMBNAIL_PYTHON;

  const bundled = join(
    homedir(),
    ".cache",
    "codex-runtimes",
    "codex-primary-runtime",
    "dependencies",
    "python",
    process.platform === "win32" ? "python.exe" : "bin/python",
  );
  if (existsSync(bundled)) return bundled;
  return process.platform === "win32" ? "python" : "python3";
}

const args = parseArgs(process.argv.slice(2));
if (!args.post || !args.copy || !args.scene) usage("--post, --copy, and --scene are required.");
if (!process.env.OPENAI_API_KEY) usage("OPENAI_API_KEY is not available in this process.");

const quality = args.quality ?? "medium";
const size = args.size ?? "2048x1152";
if (!new Set(["low", "medium", "high", "auto"]).has(quality)) usage(`Unsupported quality: ${quality}`);

const postPath = resolve(args.post);
if (!existsSync(postPath)) usage(`Post not found: ${postPath}`);

const metadata = readFrontmatter(postPath);
const copyLines = String(args.copy).split("|").map((line) => line.trim()).filter(Boolean);
if (copyLines.length < 2 || copyLines.length > 3) usage("--copy must contain exactly 2 or 3 lines separated with |.");

const exactCopy = copyLines.map((line, index) => `Line ${index + 1}: "${line}"`).join("\n");
const prompt = `Use case: ads-marketing
Asset type: a finished 16:9 Korean editorial article thumbnail for SsangBak
Article title: ${metadata.title}
Category: ${metadata.category}

Primary request:
Create the entire finished thumbnail in one generation, including the Korean headline. The result must look art-directed by a senior Korean editorial designer, not like an AI startup banner, a presentation slide, or a generic template.

Scene/backdrop:
${args.scene}

Text (verbatim):
Render only the following Korean headline, with every character and spacing exactly as written:
${exactCopy}

Typography:
The headline is the main visual subject and occupies about 55-62% of the canvas. Use bold, professionally kerned Korean display typography with a confident hierarchy, natural integration with the scene, crisp edges, and high contrast at small thumbnail size. Keep all lines inside generous safe margins. Do not add captions, labels, dates, logos, or any other text.

Style and composition:
High-impact Korean news and practical-information editorial design. Use a restrained two- or three-color palette, one strong accent color, a recognizable realistic scene, and decisive contrast. The image and typography must share the same lighting, texture, depth, and visual language. Original design only; do not copy a specific reference layout.

Constraints:
16:9 landscape. Exact Korean text is mandatory. No separate text-overlay look. No glossy 3D icons, floating coins, cute mascots, startup gradients, fake app UI, bank logos, card-company logos, watermarks, or extra words. Any document or screen in the scene must use blank geometric lines only, with absolutely no readable text, pseudo-text, letters, numbers, or gibberish. Avoid excessive decorative effects and overcrowding.`;

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(args.out ?? join(projectRoot, "output", "imagegen", `${metadata.slug}-api.jpeg`));
const promptPath = resolve(projectRoot, "tmp", "imagegen", `${metadata.slug}.prompt.txt`);
mkdirSync(dirname(outputPath), { recursive: true });
mkdirSync(dirname(promptPath), { recursive: true });
writeFileSync(promptPath, prompt, "utf8");

const codexHome = process.env.CODEX_HOME || join(homedir(), ".codex");
const imageGenerator = join(codexHome, "skills", ".system", "imagegen", "scripts", "image_gen.py");
if (!existsSync(imageGenerator)) usage(`Bundled image generator not found: ${imageGenerator}`);

const commandArgs = [
  imageGenerator,
  "generate",
  "--model", "gpt-image-2",
  "--prompt-file", promptPath,
  "--size", size,
  "--quality", quality,
  "--output-format", "jpeg",
  "--output-compression", "92",
  "--out", outputPath,
  "--no-augment",
];
if (args.force) commandArgs.push("--force");
if (args["dry-run"]) commandArgs.push("--dry-run");

console.log(`Generating ${size} ${quality} preview...`);
console.log(`Prompt: ${promptPath}`);
console.log(`Output: ${outputPath}`);

const result = spawnSync(findPython(), commandArgs, {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
