import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted() so mock variables are initialized before vi.mock() factory runs
const { mockClient, mockExecute } = vi.hoisted(() => ({
  mockClient: vi.fn(),
  mockExecute: vi.fn(),
}));

vi.mock("#imports", () => ({
  useStrapiClient: () => mockClient,
  useNuxtApp: () => ({ $recaptcha: { execute: mockExecute } }),
}));

// Import after mock
const { useApiClient } = await import("@/composables/useApiClient");

describe("useApiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.mockResolvedValue({ ok: true });
    mockExecute.mockResolvedValue("test-token-abc");
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
      useStrapiClient: () => mockClient,
      useNuxtApp: () => ({}), // no $recaptcha
    }));
    // Re-import with new mock
    vi.resetModules();
    const { useApiClient: useApiClientSSR } = await import("@/composables/useApiClient");
    const apiClient = useApiClientSSR();
    await expect(
      apiClient("/auth/local", { method: "POST", body: {} }),
    ).resolves.toEqual({ ok: true });
  });
});
