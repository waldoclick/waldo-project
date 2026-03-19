import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// ─── Hoisted mocks ────────────────────────────────────────────────────────
const { mockSetToken, mockFetchUser, mockApiClient } = vi.hoisted(() => ({
  mockSetToken: vi.fn(),
  mockFetchUser: vi.fn().mockResolvedValue(),
  mockApiClient: vi.fn().mockResolvedValue({ jwt: "test-jwt", user: {} }),
}));

// ─── Mock #imports ────────────────────────────────────────────────────────
vi.mock("#imports", () => ({
  useStrapiAuth: () => ({ setToken: mockSetToken, fetchUser: mockFetchUser }),
  useStrapiUser: () => ({ value: null }),
  useRuntimeConfig: () => ({ public: { googleClientId: "test-client-id" } }),
  useRoute: () => ({ path: "/" }),
}));

// ─── Mock useApiClient ─────────────────────────────────────────────────────
vi.mock("@/composables/useApiClient", () => ({
  useApiClient: () => mockApiClient,
}));

describe("google-one-tap.client.ts plugin", () => {
  let capturedCallback:
    | ((response: { credential: string }) => Promise<void>)
    | null = null;
  const mockInitialize = vi.fn((config: Record<string, unknown>) => {
    capturedCallback = config.callback as (response: {
      credential: string;
    }) => Promise<void>;
  });
  const mockPrompt = vi.fn();

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    capturedCallback = null;
    vi.stubGlobal("google", {
      accounts: { id: { initialize: mockInitialize, prompt: mockPrompt } },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const loadPlugin = async () => {
    // Import the plugin module (will fail if file doesn't exist — RED)
    const mod = await import("@/plugins/google-one-tap.client");
    const pluginFn = mod.default;
    // Execute the plugin (simulates Nuxt startup)
    await pluginFn({ provide: vi.fn() } as unknown as Parameters<
      typeof pluginFn
    >[0]);
    // Allow any microtasks/ticks to settle
    await new Promise((r) => setTimeout(r, 0));
  };

  it("calls POST /auth/google-one-tap with credential when GIS callback fires", async () => {
    await loadPlugin();
    expect(capturedCallback).not.toBeNull();
    await capturedCallback!({ credential: "google-credential-token" });
    expect(mockApiClient).toHaveBeenCalledWith(
      "auth/google-one-tap",
      expect.objectContaining({
        method: "POST",
        body: { credential: "google-credential-token" },
      }),
    );
  });

  it("calls setToken(jwt) with the JWT from Strapi response", async () => {
    await loadPlugin();
    await capturedCallback!({ credential: "google-credential-token" });
    expect(mockSetToken).toHaveBeenCalledWith("test-jwt");
  });

  it("calls fetchUser() after setToken()", async () => {
    await loadPlugin();
    await capturedCallback!({ credential: "google-credential-token" });
    expect(mockFetchUser).toHaveBeenCalledOnce();
    const setOrder = mockSetToken.mock.invocationCallOrder[0]!;
    const fetchOrder = mockFetchUser.mock.invocationCallOrder[0]!;
    expect(fetchOrder).toBeGreaterThan(setOrder);
  });
});
