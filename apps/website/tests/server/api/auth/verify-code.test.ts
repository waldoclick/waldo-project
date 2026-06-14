import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock factories (hoisted so they're available before module evaluation) ---
const { mockCreateError, mockDefineEventHandler } = vi.hoisted(() => {
  const mockCreateError = (opts: Record<string, unknown>) =>
    Object.assign(new Error(String(opts.statusMessage ?? "")), opts);
  const mockDefineEventHandler = (fn: (event: unknown) => unknown) => fn;
  return { mockCreateError, mockDefineEventHandler };
});

// --- Nitro/h3 globals ---
const mockReadBody = vi.fn();
const mockSetCookie = vi.fn();
const mockGetHeader = vi.fn();
const mockUseRuntimeConfig = vi.fn();
const mockFetch = vi.fn();

vi.stubGlobal("defineEventHandler", mockDefineEventHandler);
vi.stubGlobal("createError", mockCreateError);
vi.stubGlobal("readBody", mockReadBody);
vi.stubGlobal("setCookie", mockSetCookie);
vi.stubGlobal("getHeader", mockGetHeader);
vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);
vi.stubGlobal("$fetch", mockFetch);

// --- Mock verifyRecaptchaToken ---
const mockVerifyRecaptchaToken = vi.fn();
vi.mock("~/server/utils/recaptcha", () => ({
  verifyRecaptchaToken: (...args: unknown[]) =>
    mockVerifyRecaptchaToken(...args),
}));

import verifyCodeHandler from "../../../../server/api/auth/verify-code.post";

type Handler = (event: unknown) => Promise<unknown>;

describe("verify-code route", () => {
  beforeEach(() => {
    mockReadBody.mockReset();
    mockSetCookie.mockReset();
    mockGetHeader.mockReset();
    mockUseRuntimeConfig.mockReset();
    mockFetch.mockReset();
    mockVerifyRecaptchaToken.mockReset();
  });

  it("calls verifyRecaptchaToken BEFORE $fetch to Strapi when recaptchaEnabled is true", async () => {
    mockUseRuntimeConfig.mockReturnValue({
      recaptchaEnabled: true,
      recaptchaSecretKey: "test-secret",
      proxySecretWeb: "proxy-key",
    });
    mockGetHeader.mockReturnValue("test-recaptcha-token");
    mockReadBody.mockResolvedValue({ pendingToken: "abc", code: "123456" });

    let recaptchaOrder = 0;
    let fetchOrder = 0;
    let orderCounter = 0;

    mockVerifyRecaptchaToken.mockImplementation(async () => {
      recaptchaOrder = ++orderCounter;
    });
    mockFetch.mockImplementation(async () => {
      fetchOrder = ++orderCounter;
      return { jwt: "test-jwt-token", user: { id: 1, email: "test@test.com" } };
    });

    await (verifyCodeHandler as Handler)({});

    expect(mockVerifyRecaptchaToken).toHaveBeenCalledOnce();
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(recaptchaOrder).toBeLessThan(fetchOrder);
  });

  it("skips verifyRecaptchaToken when recaptchaEnabled is false", async () => {
    mockUseRuntimeConfig.mockReturnValue({
      recaptchaEnabled: false,
      recaptchaSecretKey: "test-secret",
      proxySecretWeb: "proxy-key",
    });
    mockReadBody.mockResolvedValue({ pendingToken: "abc", code: "123456" });
    mockFetch.mockResolvedValue({ jwt: "test-jwt-token", user: { id: 1 } });

    await (verifyCodeHandler as Handler)({});

    expect(mockVerifyRecaptchaToken).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("returns { user } and does NOT include jwt in response", async () => {
    const testUser = { id: 1, email: "test@test.com" };
    mockUseRuntimeConfig.mockReturnValue({
      recaptchaEnabled: false,
      proxySecretWeb: "proxy-key",
    });
    mockReadBody.mockResolvedValue({ pendingToken: "abc", code: "123456" });
    mockFetch.mockResolvedValue({ jwt: "secret-jwt", user: testUser });

    const result = (await (verifyCodeHandler as Handler)({})) as Record<
      string,
      unknown
    >;

    expect(result).toHaveProperty("user", testUser);
    expect(result).not.toHaveProperty("jwt");
  });

  it("sets waldo_jwt httpOnly cookie with correct options", async () => {
    const event = {};
    mockUseRuntimeConfig.mockReturnValue({
      recaptchaEnabled: false,
      proxySecretWeb: "proxy-key",
    });
    mockReadBody.mockResolvedValue({ pendingToken: "abc", code: "123456" });
    mockFetch.mockResolvedValue({ jwt: "the-real-jwt", user: { id: 1 } });

    await (verifyCodeHandler as Handler)(event);

    expect(mockSetCookie).toHaveBeenCalledWith(
      event,
      "waldo_jwt",
      "the-real-jwt",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 604800,
      }),
    );
  });
});
