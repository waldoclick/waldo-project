import { describe, expect, it } from "vitest";
import { getReadTime } from "../../app/utils/readTime";

describe("getReadTime", () => {
  it("returns 1 (fallback) for empty string", () => {
    expect(getReadTime("")).toBe(1);
  });

  it("returns 1 (fallback) for null", () => {
    expect(getReadTime(null)).toBe(1);
  });

  it("returns 1 (fallback) for undefined", () => {
    expect(getReadTime(undefined)).toBe(1);
  });

  it("returns 1 for a string with only markdown/html punctuation", () => {
    expect(getReadTime("### *** --- <br/> ()")).toBe(1);
  });

  it("returns 1 for exactly 200 words (~200 wpm)", () => {
    const body = Array.from({ length: 200 }, () => "palabra").join(" ");
    expect(getReadTime(body)).toBe(1);
  });

  it("returns 2 for 201 words (ceil at ~200 wpm)", () => {
    const body = Array.from({ length: 201 }, () => "palabra").join(" ");
    expect(getReadTime(body)).toBe(2);
  });

  it("strips html tags before counting words", () => {
    const body = "<p>uno dos tres</p><strong>cuatro</strong>";
    // 4 words → ceil(4/200) = 1
    expect(getReadTime(body)).toBe(1);
  });

  it("strips markdown tokens before counting words", () => {
    const body = "# Título\n\n**uno** _dos_ [tres](http://x) `cuatro`";
    expect(getReadTime(body)).toBe(1);
  });

  it("counts a large body into multiple minutes", () => {
    const body = Array.from({ length: 600 }, () => "palabra").join(" ");
    // ceil(600/200) = 3
    expect(getReadTime(body)).toBe(3);
  });
});
