import axios from "axios";
import fs from "fs";
import os from "os";
import path from "path";
import type { Core } from "@strapi/strapi";
import type { ArticleSourceContent } from "./article-source.types";

const FETCH_TIMEOUT_MS = 15000;
const MAX_CONTENT_CHARS = 8000;
const MAX_IMAGES = 6;
// Skip obvious non-content images (logos, icons, sprites, tracking pixels, avatars).
const IMAGE_BLOCKLIST =
  /(logo|icon|sprite|favicon|avatar|placeholder|pixel|tracking|1x1|spacer|advert|banner|gravatar)/i;

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; WaldoBot/1.0; +https://waldo.click)",
  Accept: "text/html,application/xhtml+xml",
};

/** Resolve a possibly-relative image URL against the page URL. Returns null if invalid. */
const toAbsoluteUrl = (raw: string, base: string): string | null => {
  try {
    const u = new URL(raw, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
};

const isLikelyContentImage = (url: string): boolean => {
  if (IMAGE_BLOCKLIST.test(url)) return false;
  if (url.startsWith("data:")) return false;
  // Keep common raster formats; drop svg (usually icons/logos).
  return (
    /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(url) ||
    /\/(media|wp-content|uploads|images?)\//i.test(url)
  );
};

/**
 * Fetch the HTML of a news URL and extract readable text + image URLs.
 * og:image / twitter:image come first (the main photo → cover), then in-body <img>.
 */
export const extractFromUrl = async (
  url: string,
): Promise<ArticleSourceContent> => {
  const { data: html } = await axios.get<string>(url, {
    timeout: FETCH_TIMEOUT_MS,
    responseType: "text",
    headers: BROWSER_HEADERS,
    maxContentLength: 10 * 1024 * 1024,
  });

  const images: string[] = [];
  const pushImage = (raw: string | undefined) => {
    if (!raw) return;
    const abs = toAbsoluteUrl(raw.trim(), url);
    if (abs && isLikelyContentImage(abs) && !images.includes(abs)) {
      images.push(abs);
    }
  };

  // 1. og:image / twitter:image (main image → becomes cover)
  const metaRegex =
    /<meta[^>]+(?:property|name)=["'](?:og:image(?::url)?|twitter:image)["'][^>]*>/gi;
  for (const tag of html.match(metaRegex) ?? []) {
    const content = tag.match(/content=["']([^"']+)["']/i)?.[1];
    pushImage(content);
  }

  // 2. In-body <img> sources (becomes gallery)
  const imgRegex = /<img[^>]+>/gi;
  for (const tag of html.match(imgRegex) ?? []) {
    const src = tag.match(
      /(?:data-src|data-lazy-src|src)=["']([^"']+)["']/i,
    )?.[1];
    pushImage(src);
    if (images.length >= MAX_IMAGES) break;
  }

  // 3. Readable text: drop script/style/head, strip tags, collapse whitespace.
  const body = html.replace(/<head[\s\S]*?<\/head>/i, "");
  const text = body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    content: text.slice(0, MAX_CONTENT_CHARS),
    images: images.slice(0, MAX_IMAGES),
  };
};

/**
 * Download each image URL and upload it to the Strapi media library.
 * Returns the created media file ids (failed downloads/uploads are skipped).
 */
export const uploadImagesFromUrls = async (
  urls: string[],
  strapi: Core.Strapi,
): Promise<number[]> => {
  const ids: number[] = [];
  for (const url of urls) {
    try {
      const { data, headers } = await axios.get<ArrayBuffer>(url, {
        timeout: FETCH_TIMEOUT_MS,
        responseType: "arraybuffer",
        headers: BROWSER_HEADERS,
        maxContentLength: 15 * 1024 * 1024,
      });

      const mimetype =
        (headers["content-type"] as string | undefined)?.split(";")[0] ??
        "image/jpeg";
      if (!mimetype.startsWith("image/")) continue;

      const ext = mimetype.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
      const safeName = `news-${path.basename(new URL(url).pathname) || "image"}`
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/\.[a-z0-9]+$/i, "");
      const buffer = Buffer.from(data);
      const tmpPath = path.join(
        os.tmpdir(),
        `${safeName}-${ids.length}.${ext}`,
      );
      fs.writeFileSync(tmpPath, buffer);

      try {
        const uploaded = (await strapi
          .plugin("upload")
          .service("upload")
          .upload({
            data: {},
            files: {
              filepath: tmpPath,
              originalFileName: `${safeName}.${ext}`,
              mimetype,
              size: buffer.length,
            },
          })) as Array<{ id: number }>;

        if (uploaded?.[0]?.id) ids.push(uploaded[0].id);
      } finally {
        fs.rmSync(tmpPath, { force: true });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      strapi.log.warn(
        `[article-source] image upload skipped (${url}): ${message}`,
      );
    }
  }
  return ids;
};
