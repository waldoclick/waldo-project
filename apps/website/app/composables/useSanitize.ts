import sanitizeHtml from "sanitize-html";
import { marked } from "marked";

// Suppress raw HTML blocks and inline HTML tokens in markdown output.
// Called once at module level — calling inside the composable would stack duplicates.
marked.use({
  renderer: {
    html() {
      return "";
    },
  },
  walkTokens(token) {
    if (token.type === "html") {
      token.text = "";
      token.raw = "";
    }
  },
});

const TEXT_TAGS = ["strong", "em", "b", "i", "u", "br", "p"];
const RICH_TAGS = [
  ...TEXT_TAGS,
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
];

export const useSanitize = () => {
  const sanitizeHTML = (
    html: string,
    allowedTags: string[] = [],
    allowedAttrs: string[] = [],
  ): string => {
    if (!html) return "";
    const attrsMap: sanitizeHtml.IOptions["allowedAttributes"] = {};
    if (allowedAttrs.length > 0) {
      for (const tag of allowedTags) {
        attrsMap[tag] = allowedAttrs;
      }
    }
    return sanitizeHtml(html, { allowedTags, allowedAttributes: attrsMap });
  };

  const sanitizeText = (html: string): string =>
    sanitizeHTML(html, TEXT_TAGS, []);

  const sanitizeRich = (html: string): string =>
    sanitizeHTML(html, RICH_TAGS, ["href", "target", "rel"]);

  const sanitizeStrict = (html: string): string => sanitizeHTML(html, [], []);

  const sanitizeBasic = (html: string): string =>
    sanitizeHTML(html, ["strong", "em", "br"], []);

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
