import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// ─── Hoisted mocks (referenced inside vi.mock factory) ───────────────────
const { mockUser, mockRoutePath } = vi.hoisted(() => ({
  mockUser: { value: null as unknown },
  mockRoutePath: { value: "/" },
}));

// ─── Mock #imports ────────────────────────────────────────────────────────
vi.mock("#imports", () => ({
  useStrapiUser: () => mockUser,
  useRoute: () => ({ path: mockRoutePath.value }),
}));

// ─── Mock window.google ───────────────────────────────────────────────────
const mockPrompt = vi.fn();

describe("useGoogleOneTap — promptIfEligible()", () => {
  beforeEach(() => {
    vi.resetModules();
    mockUser.value = null;
    mockRoutePath.value = "/";
    vi.stubGlobal("google", {
      accounts: { id: { prompt: mockPrompt } },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("does NOT call prompt() when user is authenticated", async () => {
    mockUser.value = { id: 1, email: "user@test.com" };
    const { useGoogleOneTap } = await import("@/composables/useGoogleOneTap");
    const { promptIfEligible } = useGoogleOneTap();
    promptIfEligible();
    expect(mockPrompt).not.toHaveBeenCalled();
  });

  it.each(["/cuenta/perfil", "/pagar/index", "/anunciar/crear", "/packs"])(
    "does NOT call prompt() on private route: %s",
    async (path) => {
      mockUser.value = null;
      mockRoutePath.value = path;
      const { useGoogleOneTap } = await import("@/composables/useGoogleOneTap");
      const { promptIfEligible } = useGoogleOneTap();
      promptIfEligible();
      expect(mockPrompt).not.toHaveBeenCalled();
    },
  );

  it("calls prompt() for unauthenticated user on public route", async () => {
    mockUser.value = null;
    mockRoutePath.value = "/";
    const { useGoogleOneTap } = await import("@/composables/useGoogleOneTap");
    const { promptIfEligible } = useGoogleOneTap();
    promptIfEligible();
    expect(mockPrompt).toHaveBeenCalledOnce();
  });
});
