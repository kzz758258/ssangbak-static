import fs from "node:fs/promises";
import path from "node:path";
import https from "node:https";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const postsDir = path.join(rootDir, "src", "content", "posts");
const publicDir = path.join(rootDir, "public");
const oldOriginIp = "139.59.235.207";
const remoteUploadUrlPattern = /https:\/\/ssangbak\.com(\/wp-content\/uploads\/[^\s)"'<]+)/g;
const localUploadPathPattern = /(?<!https:\/\/ssangbak\.com)(\/wp-content\/uploads\/[^\s)"'<]+)/g;

function isImageLike(urlPath) {
  return /\.(avif|gif|jpe?g|png|webp|svg)(\?.*)?$/i.test(urlPath);
}

function localUploadPath(urlPath) {
  return decodeURI(urlPath.split("?")[0]);
}

function requestUpload(urlPath, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: "ssangbak.com",
        servername: "ssangbak.com",
        path: encodeURI(urlPath),
        method: "GET",
        rejectUnauthorized: false,
        lookup(_hostname, options, callback) {
          if (options?.all) {
            callback(null, [{ address: oldOriginIp, family: 4 }]);
            return;
          }
          callback(null, oldOriginIp, 4);
        },
        headers: {
          "user-agent": "Mozilla/5.0 SsangBakStaticRepair/0.1",
          accept: "image/avif,image/webp,image/png,image/jpeg,image/svg+xml,*/*"
        }
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectCount < 3) {
          res.resume();
          const redirected = new URL(res.headers.location, "https://ssangbak.com");
          requestUpload(redirected.pathname + redirected.search, redirectCount + 1).then(resolve, reject);
          return;
        }

        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`${res.statusCode} for ${urlPath}`));
          return;
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      }
    );

    req.setTimeout(20000, () => req.destroy(new Error(`Timeout for ${urlPath}`)));
    req.on("error", reject);
    req.end();
  });
}

async function downloadUpload(urlPath) {
  const cleanPath = localUploadPath(urlPath);
  const outputPath = path.join(publicDir, cleanPath);

  try {
    await fs.access(outputPath);
    return { status: "exists", path: cleanPath };
  } catch {
    // Continue to download.
  }

  const body = await requestUpload(cleanPath);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, body);
  return { status: "downloaded", path: cleanPath, bytes: body.length };
}

async function main() {
  const entries = await fs.readdir(postsDir, { withFileTypes: true });
  const markdownFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"));
  const uploadPaths = new Set();
  let cleanedFiles = 0;

  for (const file of markdownFiles) {
    const filePath = path.join(postsDir, file.name);
    let source = await fs.readFile(filePath, "utf8");

    for (const match of source.matchAll(remoteUploadUrlPattern)) {
      const urlPath = match[1];
      if (isImageLike(urlPath)) uploadPaths.add(localUploadPath(urlPath));
    }

    for (const match of source.matchAll(localUploadPathPattern)) {
      const urlPath = match[1];
      if (isImageLike(urlPath)) uploadPaths.add(localUploadPath(urlPath));
    }

    let cleaned = source
      .replace(/^\s*목차\s*\r?\n\s*\[Toggle\]\(#\)\s*(\r?\n)?/gim, "")
      .replace(/^\s*>\s*\[Toggle\]\(#\)\s*(\r?\n)?/gim, "")
      .replace(/^\s*\[Toggle\]\(#\)\s*(\r?\n)?/gim, "")
      .replace(remoteUploadUrlPattern, (_full, urlPath) => localUploadPath(urlPath));

    if (cleaned !== source) {
      await fs.writeFile(filePath, cleaned, "utf8");
      cleanedFiles += 1;
    }
  }

  let downloaded = 0;
  let failed = 0;
  for (const urlPath of uploadPaths) {
    try {
      const result = await downloadUpload(urlPath);
      if (result.status === "downloaded") downloaded += 1;
    } catch (error) {
      failed += 1;
      console.error(`Failed image: ${urlPath}`);
      console.error(error.message);
    }
  }

  console.log(
    JSON.stringify(
      {
        markdownFiles: markdownFiles.length,
        cleanedFiles,
        imageUrls: uploadPaths.size,
        downloaded,
        failed
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
