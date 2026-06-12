import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock $fetch for Google siteverify calls
const mockFetch = vi.fn();
vi.stubGlobal("$fetch", mockFetch);

// Mock h3 utilities (same pattern as recaptcha-proxy.test.ts)
vi.mock("h3", () => ({
  getHeader: vi.fn(),
  createError: vi.fn((opts) =>
    Object.assign(new Error(opts.statusMessage), opts),
  ),
  proxyRequest: vi.fn().mockResolvedValue({}),
  defineEventHandler: vi.fn((fn) => fn),
}));

import { verifyRecaptchaToken } from "~/server/utils/recaptcha";

describe("SEC2-AUTH: verifyRecaptchaToken — hostname binding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RECAPTCHA_ALLOWED_HOSTNAMES = "waldo.click,www.waldo.click";
  });

  afterEach(() => {
    delete process.env.RECAPTCHA_ALLOWED_HOSTNAMES;
  });

  // Test A: hostname mismatch rejected
  it("Test A (hostname mismatch rejected): throws 400 when siteverify returns disallowed hostname", async () => {
    // Arrange — valid score but disallowed hostname
    mockFetch.mockResolvedValueOnce({
      success: true,
      score: 0.9,
      hostname: "evil.example.com",
    });

    // Act + Assert
    await expect(
      verifyRecaptchaToken("some-token", "fake-secret"),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  // Test C: valid hostname passes
  it("Test C (valid hostname passes): resolves when siteverify returns allowed hostname", async () => {
    // Arrange — valid score and allowed hostname
    mockFetch.mockResolvedValueOnce({
      success: true,
      score: 0.9,
      hostname: "waldo.click",
    });

    // Act + Assert
    await expect(
      verifyRecaptchaToken("some-token", "fake-secret"),
    ).resolves.toBeUndefined();
  });

  // Pre-existing: missing token still rejects
  it("throws 400 when token is missing", async () => {
    await expect(
      verifyRecaptchaToken(undefined, "fake-secret"),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  // Pre-existing: low score still rejects
  it("throws 400 when score <= 0.5 (before hostname check)", async () => {
    mockFetch.mockResolvedValueOnce({
      success: true,
      score: 0.4,
      hostname: "waldo.click",
    });
    await expect(
      verifyRecaptchaToken("some-token", "fake-secret"),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  // www.waldo.click is also allowed
  it("resolves when hostname is www.waldo.click (second allowed entry)", async () => {
    mockFetch.mockResolvedValueOnce({
      success: true,
      score: 0.9,
      hostname: "www.waldo.click",
    });
    await expect(
      verifyRecaptchaToken("some-token", "fake-secret"),
    ).resolves.toBeUndefined();
  });
});
