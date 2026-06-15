/**
 * Types for the article-source service: fetches the HTML of a news URL,
 * extracts readable content (for the AI) and image URLs (for cover/gallery).
 */

export interface ArticleSourceContent {
  /** Plain-text content extracted from the page body (fed to the AI). */
  content: string;
  /** Absolute image URLs found in the page, og:image first, deduped. */
  images: string[];
}
