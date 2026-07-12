import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const postsDir = path.join(root, "src", "content", "posts");
const files = fs.readdirSync(postsDir).filter((file) => file.endsWith(".md"));
const refs = [];

for (const file of files) {
  const source = fs.readFileSync(path.join(postsDir, file), "utf8");
  const hero = source.match(/^heroImage:\s*"([^"]+)"/m);
  if (hero) refs.push({ file, src: hero[1], kind: "hero" });

  for (const match of source.matchAll(/!\[[^\]]*]\(([^)]+)\)/g)) {
    refs.push({ file, src: match[1].split(/[?#]/)[0], kind: "inline" });
  }
}

const local = refs.filter((ref) => ref.src.startsWith("/"));
const remote = refs.filter((ref) => /^https?:\/\//.test(ref.src));
const missing = local.filter((ref) => {
  const relativePath = decodeURI(ref.src).replace(/^\//, "");
  return !fs.existsSync(path.join(root, "public", relativePath));
});

const postsWithMissing = new Set(missing.map((ref) => ref.file));

console.log(JSON.stringify({
  posts: files.length,
  totalImageRefs: refs.length,
  localImageRefs: local.length,
  remoteImageRefs: remote.length,
  missingLocalImageRefs: missing.length,
  postsWithMissingImages: postsWithMissing.size,
  remoteSample: remote.slice(0, 20),
  missingSample: missing.slice(0, 40)
}, null, 2));
