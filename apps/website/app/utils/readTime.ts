/**
 * Estimate reading time in minutes from an article body.
 *
 * Strips markdown/HTML tokens before counting words and assumes a reading
 * speed of ~200 words per minute. Always returns at least 1 (never 0) so the
 * UI can render "{n} min de lectura" even for empty/missing bodies.
 */
export const getReadTime = (body: string | null | undefined): number => {
  if (!body) return 1;

  const plainText = body
    // Strip HTML tags
    .replace(/<[^>]+>/g, " ")
    // Strip markdown emphasis/heading/list/link punctuation
    .replace(/[#*_>`~[\]()!-]/g, " ")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();

  if (!plainText) return 1;

  const wordCount = plainText.split(" ").filter(Boolean).length;
  const WORDS_PER_MINUTE = 200;

  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
};
