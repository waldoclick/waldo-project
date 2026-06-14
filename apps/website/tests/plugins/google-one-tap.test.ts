import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// ─── Hoisted mocks ────────────────────────────────────────────────────────
const { mockApiClient, mockRoutePath } = vi.hoisted(() => ({
  mockApiClient: vi.fn().mockResolvedValue({ jwt: "test-jwt", user: {} }),
  mockRoutePath: { value: "/" },
}));

// ─── Mock #imports ────────────────────────────────────────────────────────
vi.mock("#imports", () => ({
  useRuntimeConfig: () => ({ public: { googleClientId: "test-client-id" } }),
  useRoute: () => ({ path: mockRoutePath.value }),
}));

// ─── Mock #app ──────────────────────────────────────────────────────────────
const mockReloadNuxtApp = vi.fn();
vi.mock("#app", () => ({
  defineNuxtPlugin: (fn: (..._args: unknown[]) => unknown) => fn,
  reloadNuxtApp: mockReloadNuxtApp,
}));

// ─── Mock useApiClient ─────────────────────────────────────────────────────
vi.mock("@/composables/useApiClient", () => ({
  useApiClient: () => mockApiClient,
}));

describe("google-one-tap.client.ts plugin", () => {
  let capturedCallback:
    | ((_response: { credential: string }) => Promise<void>)
    | null = null;
  const mockInitialize = vi.fn((config: Record<string, unknown>) => {
    capturedCallback = config.callback as (_response: {
      credential: string;
    }) => Promise<void>;
  });
  const mockPrompt = vi.fn();

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    capturedCallback = null;
    mockRoutePath.value = "/";
    vi.stubGlobal("google", {
      accounts: { id: { initialize: mockInitialize, prompt: mockPrompt } },
    });
    // useSessionUser is a Nuxt auto-import used as a global in the plugin
    vi.stubGlobal("useSessionUser", () => ({ value: null }));
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

  it("calls reloadNuxtApp() after successful authentication", async () => {
    await loadPlugin();
    await capturedCallback!({ credential: "google-credential-token" });
    expect(mockReloadNuxtApp).toHaveBeenCalledOnce();
  });

  it("does NOT call reloadNuxtApp() when the API call throws", async () => {
    mockApiClient.mockRejectedValueOnce(new Error("auth failed"));
    await loadPlugin();
    await capturedCallback!({ credential: "google-credential-token" });
    expect(mockReloadNuxtApp).not.toHaveBeenCalled();
  });

  it("does not prompt on /onboarding route (INTEG-01)", async () => {
    mockRoutePath.value = "/onboarding";
    await loadPlugin();
    expect(mockPrompt).not.toHaveBeenCalled();
  });

  it("does not prompt on /onboarding/thankyou route (INTEG-01)", async () => {
    mockRoutePath.value = "/onboarding/thankyou";
    await loadPlugin();
    expect(mockPrompt).not.toHaveBeenCalled();
  });
});
