/**
 * Article controller
 */

import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";
import { searchNews } from "../../../services/tavily";
import { generateArticleDraft } from "../../../services/ai-provider";
import {
  extractFromUrl,
  uploadImagesFromUrls,
} from "../../../services/article-source";

const { ApplicationError } = errors;

// Prompt template moved to the backend from the frontend (D-06).
// The frontend (LightBoxArticles.vue) previously built this and sent it with the request.
// Now the backend builds the full prompt and picks the provider — the client sends domain data only.
const ARTICLE_PROMPT_TEMPLATE = `You are an industrial news editor writing for a blog about industrial assets and productive sectors.

You will receive the title, content, source URL, and publication date of a real news article.

Your task is to rewrite the news as an original article suitable for a professional audience interested in industrial sectors.

Requirements:

1. The article MUST be written in Spanish.

2. Rewrite the information completely in your own words.
   Do NOT copy sentences from the original text.

3. Preserve the main facts and meaning of the news but improve clarity and readability.

4. Structure the article as:

* title
* header (2–3 sentence introduction)
* body (4–6 paragraphs)

5. The body MUST be written using **Markdown only**.

* Use paragraphs separated by line breaks.
* Highlight important keywords using **bold**.
* DO NOT use HTML tags.

6. The response MUST be **valid JSON only**. Do not include explanations, markdown wrappers, or additional text.

JSON format:

{
"title": "string",
"header": "string",
"body": "string",
"seo_title": "string",
"seo_description": "string"
}`;

export default factories.createCoreController(
  "api::article.article",
  ({ strapi }) => ({
    /**
     * Search for news sources via Tavily.
     * Returns domain-shaped results under the `sources` key (D-09).
     *
     * @route GET /api/articles/sources?q=...
     */
    async sources(ctx) {
      const q = (ctx.query.q as string | undefined)?.trim();

      if (!q) {
        ctx.badRequest("Missing required query param: q");
        return;
      }

      try {
        const result = await searchNews(q, 10);
        ctx.body = { sources: result.news };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        strapi.log.error(`[article/sources] ${message}`);
        throw new ApplicationError(message);
      }
    },

    /**
     * Generate an article draft from a selected news source.
     * Prompt is built on the backend (D-06). Returns { text } only — no persistence (D-08).
     *
     * @route POST /api/articles/generate
     */
    async generate(ctx) {
      const body = ctx.request.body as {
        source?: {
          title?: string;
          link?: string;
          snippet?: string;
          date?: string;
        };
      };

      const source = body?.source;
      if (!source || !source.link?.trim() || !source.snippet?.trim()) {
        ctx.badRequest("Missing required field: source");
        return;
      }

      // Fetch the source page HTML: gives the AI the full article (not just the
      // short Tavily snippet) and yields the images for cover/gallery. Degrades
      // to the snippet with no images if the fetch fails.
      let articleContent = source.snippet;
      let imageUrls: string[] = [];
      try {
        const extracted = await extractFromUrl(source.link);
        if (extracted.content.length > source.snippet.length) {
          articleContent = extracted.content;
        }
        imageUrls = extracted.images;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        strapi.log.warn(
          `[article/generate] source fetch failed, using snippet (${source.link}): ${message}`,
        );
      }

      // Build the full prompt the same way the frontend did (LightBoxArticles.vue lines 374-380)
      const fullPrompt =
        ARTICLE_PROMPT_TEMPLATE +
        "\n\n---\n\n" +
        `Title: ${source.title ?? ""}\n` +
        `Source URL: ${source.link}\n` +
        `Date: ${source.date ?? ""}\n` +
        `Content:\n${articleContent}`;

      try {
        const result = await generateArticleDraft(fullPrompt);

        // Upload extracted images to the media library: first = cover, rest = gallery.
        const mediaIds = await uploadImagesFromUrls(imageUrls, strapi);
        const cover = mediaIds.length > 0 ? [mediaIds[0]] : [];
        const gallery = mediaIds.slice(1);

        ctx.body = { text: result.text, cover, gallery };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        strapi.log.error(`[article/generate] ${message}`);
        throw new ApplicationError(message);
      }
    },
  }),
);
