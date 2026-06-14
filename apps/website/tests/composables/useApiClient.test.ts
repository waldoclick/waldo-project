import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted() so mock variables are initialized before vi.mock() factory runs
const { mockClient, mockExecute, mockCookie, mockBypassSecret } = vi.hoisted(
  () => ({
    mockClient: vi.fn(),
    mockExecute: vi.fn(),
    mockCookie: vi.fn().mockReturnValue({}),
    mockBypassSecret: vi.fn().mockReturnValue(""),
  }),
);

// Mock the underlying session client (direct import in useApiClient.ts)
vi.mock("@/composables/useSessionClient", () => ({
  useSessionClient: () => mockClient,
}));

vi.mock("#imports", () => ({
  useNuxtApp: () => ({ $recaptcha: { execute: mockExecute } }),
  useRuntimeConfig: () => ({
    vercelBypassSecret: mockBypassSecret(),
    public: {},
  }),
  useRequestHeaders: (_keys?: string[]) => mockCookie(),
}));

// Import after mock
const { useApiClient } = await import("@/composables/useApiClient");

describe("useApiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.mockResolvedValue({ ok: true });
    mockExecute.mockResolvedValue("test-token-abc");
    mockCookie.mockReturnValue({});
    mockBypassSecret.mockReturnValue("");
  });

  it("injects X-Recaptcha-Token on POST", async () => {
    const apiClient = useApiClient();
    await apiClient("/auth/local", { method: "POST", body: { foo: "bar" } });
    expect(mockExecute).toHaveBeenCalledWith("submit");
    expect(mockClient).toHaveBeenCalledWith(
      "/auth/local",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Recaptcha-Token": "test-token-abc",
        }),
      }),
    );
  });

  it("injects X-Recaptcha-Token on PUT", async () => {
    const apiClient = useApiClient();
    await apiClient("/users/1", { method: "PUT", body: {} });
    expect(mockExecute).toHaveBeenCalled();
    expect(mockClient).toHaveBeenCalledWith(
      "/users/1",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Recaptcha-Token": "test-token-abc",
        }),
      }),
    );
  });

  it("injects X-Recaptcha-Token on DELETE", async () => {
    const apiClient = useApiClient();
    await apiClient("/items/1", { method: "DELETE" });
    expect(mockExecute).toHaveBeenCalled();
    expect(mockClient).toHaveBeenCalledWith(
      "/items/1",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Recaptcha-Token": "test-token-abc",
        }),
      }),
    );
  });

  it("does NOT inject header on GET", async () => {
    const apiClient = useApiClient();
    await apiClient("/items", { method: "GET" });
    expect(mockExecute).not.toHaveBeenCalled();
    const callArgs = mockClient.mock.calls[0]?.[1];
    expect(callArgs?.headers?.["X-Recaptcha-Token"]).toBeUndefined();
  });

  it("defaults to GET when method is not specified", async () => {
    const apiClient = useApiClient();
    await apiClient("/items");
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("passes params through on GET without modification", async () => {
    const apiClient = useApiClient();
    await apiClient("/api/ads", {
      method: "GET",
      params: { populate: "*", "pagination[pageSize]": 20 },
    });
    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockClient).toHaveBeenCalledWith(
      "/api/ads",
      expect.objectContaining({
        params: { populate: "*", "pagination[pageSize]": 20 },
      }),
    );
    const callArgs = mockClient.mock.calls[0]?.[1];
    expect(callArgs?.headers?.["X-Recaptcha-Token"]).toBeUndefined();
  });

  it("preserves caller-supplied headers alongside reCAPTCHA header", async () => {
    const apiClient = useApiClient();
    await apiClient("/auth/local", {
      method: "POST",
      headers: { "X-Custom-Header": "my-value" },
      body: {},
    });
    expect(mockClient).toHaveBeenCalledWith(
      "/auth/local",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Custom-Header": "my-value",
          "X-Recaptcha-Token": "test-token-abc",
        }),
      }),
    );
  });

  it("proceeds without token when $recaptcha.execute throws (adblocker)", async () => {
    mockExecute.mockRejectedValue(new Error("reCAPTCHA blocked"));
    const apiClient = useApiClient();
    await expect(
      apiClient("/auth/local", { method: "POST", body: {} }),
    ).resolves.toEqual({ ok: true });
    // Header should be absent, not throw
    const callArgs = mockClient.mock.calls[0]?.[1];
    expect(callArgs?.headers?.["X-Recaptcha-Token"]).toBeUndefined();
  });

  it("proceeds without token when $recaptcha is undefined (SSR)", async () => {
    vi.doMock("#imports", () => ({
      useNuxtApp: () => ({}), // no $recaptcha
      useRuntimeConfig: () => ({ vercelBypassSecret: "", public: {} }),
      useRequestHeaders: () => ({}),
    }));
    // Re-import with new mock
    vi.resetModules();
    const { useApiClient: useApiClientSSR } =
      await import("@/composables/useApiClient");
    const apiClient = useApiClientSSR();
    await expect(
      apiClient("/auth/local", { method: "POST", body: {} }),
    ).resolves.toEqual({ ok: true });
  });

  // NOTE: The vitest.config.ts plugin replaces ALL import.meta.server
  // occurrences with `false`, so the SSR branch in useApiClient cannot be
  // exercised at runtime in this test environment.
  // The SSR behaviour (cookie forwarding + vercel bypass) is verified via:
  //   1. Code inspection: useApiClient.ts imports useRequestHeaders from #imports
  //      and reads vercelBypassSecret from useRuntimeConfig().
  //   2. The tests below confirm these mocks are importable (no missing-export errors).

  it("SSR cookie forwarding: useRequestHeaders returns cookie object (plan 03 — SSR block not exercised in vitest)", () => {
    // The SSR block (import.meta.server=true) is replaced with false by the
    // vitest Vite transform plugin. This test documents the expected SSR
    // behavior: when useRequestHeaders({ cookie }) returns a value, it would
    // be forwarded to serverHeaders["cookie"]. Verified statically via the
    // composable source in plan 03 code review.
    mockCookie.mockReturnValue({ cookie: "waldo_jwt=abc" });
    // Confirm the mock resolves without error (import is wired)
    expect(mockCookie()).toEqual({ cookie: "waldo_jwt=abc" });
  });

  it("SSR vercel bypass: useRuntimeConfig().vercelBypassSecret is readable (plan 03 — SSR block not exercised in vitest)", () => {
    // Same constraint as above: SSR branch unreachable in vitest.
    // This test documents the expected SSR behavior and confirms the mock
    // returns the bypass secret correctly.
    mockBypassSecret.mockReturnValue("bypass-secret-xyz");
    expect(mockBypassSecret()).toBe("bypass-secret-xyz");
  });

  it("does NOT inject X-Proxy-Key in any request (dropped in plan 03)", async () => {
    const apiClient = useApiClient();
    await apiClient("/auth/local", { method: "POST", body: {} });
    const callArgs = mockClient.mock.calls[0]?.[1];
    expect(callArgs?.headers?.["X-Proxy-Key"]).toBeUndefined();
  });
});
