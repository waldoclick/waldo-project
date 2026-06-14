import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// ─── Shared mock state ────────────────────────────────────────────────────────
const mockGetProviderAuthenticationUrl = vi.fn();
const hrefSetterSpy = vi.fn();

describe("useProviders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    mockGetProviderAuthenticationUrl.mockImplementation(
      (provider: string) => `http://localhost:3000/api/connect/${provider}`,
    );

    // Stub Nuxt auto-imports (globals)
    vi.stubGlobal("useSessionAuth", () => ({
      getProviderAuthenticationUrl: mockGetProviderAuthenticationUrl,
    }));
    vi.stubGlobal("$fetch", vi.fn());

    // Spy on window.location.href setter to assert whether a navigation occurs
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        get href() {
          return "http://localhost:3000/";
        },
        set href(value: string) {
          hrefSetterSpy(value);
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("redirectToProvider()", () => {
    it("navigates for an allowed provider (google)", async () => {
      const { useProviders } = await import("@/composables/useProviders");
      const { redirectToProvider } = useProviders();

      redirectToProvider("google");

      // Allowed provider → URL resolved and href assigned
      expect(mockGetProviderAuthenticationUrl).toHaveBeenCalledWith("google");
      expect(hrefSetterSpy).toHaveBeenCalledWith(
        "http://localhost:3000/api/connect/google",
      );
    });

    it("does NOT navigate for a disallowed provider (RED until 01-05)", async () => {
      const { useProviders } = await import("@/composables/useProviders");
      const { redirectToProvider } = useProviders();

      redirectToProvider("evil://x");

      // RED by design until 01-05 adds the allowlist guard:
      //   Today redirectToProvider assigns window.location.href unconditionally
      //   → hrefSetterSpy IS called → assertion fails (RED).
      //   After 01-05 a ['google','facebook'] allowlist returns early for any other
      //   value → href is never assigned → assertion passes (GREEN).
      expect(hrefSetterSpy).not.toHaveBeenCalled();
    });
  });
});
