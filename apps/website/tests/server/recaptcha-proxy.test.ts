import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock $fetch for Google siteverify calls
const mockFetch = vi.fn();
vi.stubGlobal("$fetch", mockFetch);

// Mock h3 utilities
vi.mock("h3", () => ({
  getHeader: vi.fn(),
  createError: vi.fn((opts) =>
    Object.assign(new Error(opts.statusMessage), opts),
  ),
  proxyRequest: vi.fn().mockResolvedValue({}),
  defineEventHandler: vi.fn((fn) => fn),
}));

// Import the utility function extracted from the proxy (see Task 1.1)
import {
  verifyRecaptchaToken,
  RECAPTCHA_PROTECTED_ROUTES,
} from "~/server/utils/recaptcha";

describe("reCAPTCHA proxy validation", () => {
  beforeEach(() => vi.clearAllMocks());

  // RCP-01: Proxy rejects missing token
  it("throws 400 when X-Recaptcha-Token header is missing", async () => {
    await expect(
      verifyRecaptchaToken(undefined, "fake-secret"),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  // RCP-02: Valid token passes
  it("resolves when Google returns success=true and score > 0.5", async () => {
    mockFetch.mockResolvedValueOnce({ success: true, score: 0.9 });
    await expect(
      verifyRecaptchaToken("valid-token", "fake-secret"),
    ).resolves.toBeUndefined();
  });

  // RCP-03: Low score rejects
  it("throws 400 when Google returns score <= 0.5", async () => {
    mockFetch.mockResolvedValueOnce({ success: true, score: 0.4 });
    await expect(
      verifyRecaptchaToken("low-score-token", "fake-secret"),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  // RCP-04/RCP-05: Protected routes list is correct
  it("includes all expected protected routes", () => {
    expect(RECAPTCHA_PROTECTED_ROUTES).toContain("auth/local");
    expect(RECAPTCHA_PROTECTED_ROUTES).toContain("auth/local/register");
    expect(RECAPTCHA_PROTECTED_ROUTES).toContain("auth/forgot-password");
    expect(RECAPTCHA_PROTECTED_ROUTES).toContain("auth/reset-password");
    expect(RECAPTCHA_PROTECTED_ROUTES).toContain("contacts");
  });
});
