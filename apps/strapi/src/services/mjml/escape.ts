/**
 * Escapes HTML-significant characters in user-supplied strings before they are
 * rendered into MJML/nunjucks email templates (nunjucks autoescape is intentionally
 * false for server-built transactional HTML — escape at the boundary instead).
 */
export const escapeHtml = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};
