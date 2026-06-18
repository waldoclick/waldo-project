// Zero-dependency static server for the design mockups (.dc.html).
// Served on :3002 as part of `pnpm dev` so the mockups can be opened in a browser.
import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize, extname } from "node:path";

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3002;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function listing() {
  const entries = await readdir(ROOT);
  const pages = entries.filter((f) => f.endsWith(".dc.html")).sort();
  const links = pages
    .map(
      (f) =>
        `<li><a href="/${encodeURIComponent(f)}">${f.replace(".dc.html", "")}</a></li>`,
    )
    .join("");
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Waldo · Maquetas</title>
<style>body{font-family:system-ui,sans-serif;background:#faf9f7;color:#26252b;max-width:640px;margin:48px auto;padding:0 24px}
h1{font-size:22px}ul{list-style:none;padding:0}li{margin:6px 0}
a{display:block;padding:12px 16px;background:#fff;border:1px solid #ece9e4;border-radius:8px;text-decoration:none;color:#26252b;font-weight:600}
a:hover{background:#f6f4f1}</style>
<h1>Maquetas Waldo (design)</h1><ul>${links}</ul>`;
}

const server = createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url || "/").split("?")[0]);
    if (url === "/" || url === "") {
      const body = await listing();
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(body);
      return;
    }
    // Resolve inside ROOT only (no path traversal)
    const filePath = normalize(join(ROOT, url));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    const info = await stat(filePath).catch(() => null);
    if (!info || !info.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const data = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[extname(filePath).toLowerCase()] || "application/octet-stream",
    });
    res.end(data);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server error: " + (error?.message || error));
  }
});

server.listen(PORT, () => {
  console.log(`🎨 design mockups → http://localhost:${PORT}`);
});
