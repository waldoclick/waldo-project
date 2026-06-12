import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

// Configure marked to suppress all raw HTML block and inline tokens.
// MUST be at module top-level (not inside the composable) — marked.use() is
// called once at module load; calling it per-component would stack duplicates.
// Pitfall 1 (RESEARCH.md): marked.use inside composable = duplicate extensions.
marked.use({
  renderer: {
    // Block-level raw HTML (e.g. <svg onload=x>) → suppress entirely
    html() {
      return "";
    },
  },
  walkTokens(token) {
    // Inline raw HTML tokens inside paragraphs → clear so they render nothing
    if (token.type === "html") {
      token.text = "";
      token.raw = "";
    }
  },
});

export const useSanitize = () => {
  // Single isomorphic code path: DOMPurify works on server (via JSDOM) and client.
  // Replaces the old regex SSR branch that missed unquoted event handlers
  // such as <svg onload=alert(1)>.
  const sanitizeHTML = (
    html: string,
    allowedTags: string[] = [],
    allowedAttrs: string[] = [],
  ): string => {
    if (!html) return "";

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttrs,
      KEEP_CONTENT: true,
    });
  };

  /**
   * Sanitiza HTML permitiendo solo etiquetas seguras para contenido de texto
   * Ideal para títulos, descripciones y contenido de texto
   */
  const sanitizeText = (html: string): string => {
    return sanitizeHTML(html, ["strong", "em", "b", "i", "u", "br", "p"], []);
  };

  /**
   * Sanitiza HTML permitiendo más etiquetas para contenido rico
   * Ideal para descripciones de productos, contenido de artículos
   */
  const sanitizeRich = (html: string): string => {
    return sanitizeHTML(
      html,
      [
        "strong",
        "em",
        "b",
        "i",
        "u",
        "br",
        "p",
        "div",
        "span",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "blockquote",
        "a",
      ],
      ["href", "target", "rel"],
    );
  };

  /**
   * Sanitiza HTML de forma estricta, solo texto plano
   * Ideal para datos que vienen de usuarios
   */
  const sanitizeStrict = (html: string): string => {
    return sanitizeHTML(html, [], []);
  };

  /**
   * Sanitiza HTML permitiendo solo etiquetas de formato básico
   * Ideal para contenido que puede tener formato pero debe ser seguro
   */
  const sanitizeBasic = (html: string): string => {
    return sanitizeHTML(html, ["strong", "em", "br"], []);
  };

  /**
   * Converts Markdown (from Strapi richtext fields) to sanitized HTML.
   * Raw HTML in markdown source is suppressed by the module-level marked.use()
   * override before sanitizeRich runs DOMPurify over the output.
   */
  const parseMarkdown = (markdown: string): string => {
    if (!markdown) return "";
    const html = marked.parse(markdown, { async: false }) as string;
    return sanitizeRich(html);
  };

  return {
    sanitizeText,
    sanitizeRich,
    sanitizeStrict,
    sanitizeBasic,
    parseMarkdown,
  };
};
