import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock $fetch for Google siteverify calls
const mockFetch = vi.fn();
vi.stubGlobal("$fetch", mockFetch);

// Mock h3 utilities
vi.mock("h3", () => ({
  createError: vi.fn((opts) =>
    Object.assign(new Error(opts.statusMessage), opts),
  ),
}));

// Import the utility functions
import {
  verifyRecaptchaToken,
  isRecaptchaProtectedRoute,
} from "~/server/utils/recaptcha";

describe("isRecaptchaProtectedRoute — method-based guard", () => {
  it("returns true for POST requests", () => {
    expect(isRecaptchaProtectedRoute("any/path", "POST")).toBe(true);
  });

  it("returns true for PUT requests", () => {
    expect(isRecaptchaProtectedRoute("any/path", "PUT")).toBe(true);
  });

  it("returns true for DELETE requests", () => {
    expect(isRecaptchaProtectedRoute("any/path", "DELETE")).toBe(true);
  });

  it("returns false for GET requests", () => {
    expect(isRecaptchaProtectedRoute("any/path", "GET")).toBe(false);
  });

  it("returns false for PATCH requests", () => {
    expect(isRecaptchaProtectedRoute("any/path", "PATCH")).toBe(false);
  });

  it("is case-insensitive for method names", () => {
    expect(isRecaptchaProtectedRoute("any/path", "post")).toBe(true);
    expect(isRecaptchaProtectedRoute("any/path", "delete")).toBe(true);
    expect(isRecaptchaProtectedRoute("any/path", "get")).toBe(false);
  });
});

describe("verifyRecaptchaToken", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws 400 when token is undefined", async () => {
    await expect(
      verifyRecaptchaToken(undefined, "fake-secret"),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 400 when token is empty string", async () => {
    await expect(verifyRecaptchaToken("", "fake-secret")).rejects.toMatchObject(
      { statusCode: 400 },
    );
  });

  it("throws 400 when token is only whitespace", async () => {
    await expect(
      verifyRecaptchaToken("   ", "fake-secret"),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("resolves when Google returns success=true and score > 0.5", async () => {
    mockFetch.mockResolvedValueOnce({ success: true, score: 0.9 });
    await expect(
      verifyRecaptchaToken("valid-token", "fake-secret"),
    ).resolves.toBeUndefined();
  });

  it("throws 400 when Google returns score <= 0.5 (low score)", async () => {
    mockFetch.mockResolvedValueOnce({ success: true, score: 0.4 });
    await expect(
      verifyRecaptchaToken("low-score-token", "fake-secret"),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 400 when Google returns success=false", async () => {
    mockFetch.mockResolvedValueOnce({
      success: false,
      score: 0,
      "error-codes": ["invalid-input-response"],
    });
    await expect(
      verifyRecaptchaToken("bad-token", "fake-secret"),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("logs a warning when verification fails", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({
      success: false,
      score: 0,
      "error-codes": ["invalid-input-response"],
    });
    await expect(
      verifyRecaptchaToken("bad-token", "fake-secret"),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[recaptcha] Verification failed"),
    );
    warnSpy.mockRestore();
  });
});
