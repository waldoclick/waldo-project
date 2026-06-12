import { describe, it, expect } from "vitest";

// useSanitize.ts uses only 'marked' (no Nuxt auto-imports), so import directly.
const { useSanitize } = await import("@/composables/useSanitize");

describe("useSanitize — XSS regression (SEC2-XSS)", () => {
  const { sanitizeRich, sanitizeStrict, sanitizeText, parseMarkdown } =
    useSanitize();

  // Test 1 — unquoted event handler: the regex branch only matches quoted handlers
  // so <svg onload=alert(1)> survives the current SSR sanitizer.
  it("sanitizeRich strips unquoted event handler <svg onload=alert(1)>", () => {
    const result = sanitizeRich("<svg onload=alert(1)>safe text</svg>");
    expect(result).not.toContain("onload");
    expect(result).not.toContain("<svg");
    expect(result).toContain("safe text");
  });

  // Test 2 — script tag stripped by sanitizeStrict
  it("sanitizeStrict strips <script> tag and leaves plain text", () => {
    const result = sanitizeStrict("<script>alert(1)</script>hi");
    expect(result).not.toContain("<script");
    expect(result).toContain("hi");
  });

  // Test 3 — parseMarkdown with raw HTML block containing XSS
  it("parseMarkdown strips raw HTML block <svg onload=alert(1)>", () => {
    const result = parseMarkdown("<svg onload=alert(1)>");
    expect(result).not.toContain("onload");
    expect(result).not.toContain("svg");
    expect(result.trim()).toBe("");
  });

  // Test 4 — parseMarkdown strips inline HTML with event handler but keeps text
  it("parseMarkdown strips onclick from inline HTML but keeps text content", () => {
    const result = parseMarkdown("text <b onclick=x>bold</b> after");
    expect(result).toContain("text");
    expect(result).toContain("bold");
    expect(result).toContain("after");
    expect(result).not.toContain("onclick");
    expect(result).not.toMatch(/<b\s/);
  });

  // Test 5 — parseMarkdown still renders Markdown formatting
  it("parseMarkdown renders **bold** as <strong>bold</strong>", () => {
    const result = parseMarkdown("**bold**");
    expect(result).toContain("<strong>bold</strong>");
  });

  // Test 6 — allowed tags pass through sanitizeText
  it("sanitizeText keeps allowed tags like <strong>", () => {
    const result = sanitizeText("<strong>x</strong>");
    expect(result).toContain("<strong>");
  });
});
