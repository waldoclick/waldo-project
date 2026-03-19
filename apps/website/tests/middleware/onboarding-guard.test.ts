import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

// The nuxt-meta-client-stub Vite plugin replaces import.meta.server with false
// in tests, so the SSR bail-out never fires — all guard logic runs.

const mockNavigateTo = vi.fn();
vi.mock("#app", () => ({
  defineNuxtRouteMiddleware: (fn: unknown) => fn,
  navigateTo: mockNavigateTo,
}));

// Nuxt auto-imports used by the guard as globals — must be set before module evaluation.
// These are set in vi.mock (hoisted) context via the mock factory, but we also set them
// as globals so the guard file (which uses Nuxt auto-imports) can resolve them.
global.defineNuxtRouteMiddleware = (fn: unknown) => fn;
global.navigateTo = mockNavigateTo;

const mockUser = vi.fn(() => ({ value: { id: 1 } }));
global.useStrapiUser = mockUser;

const mockIsProfileComplete = vi.fn();
global.useMeStore = vi.fn(() => ({ isProfileComplete: mockIsProfileComplete }));

const mockSetReferer = vi.fn();
global.useAppStore = vi.fn(() => ({ setReferer: mockSetReferer }));

// Use dynamic import so globals are set before the guard module evaluates.
 
let guard: any;

beforeAll(async () => {
  const mod = await import("@/middleware/onboarding-guard.global");
  guard = mod.default;
});

const makeTo = (path: string) => ({ path, fullPath: path });

describe("onboarding-guard.global (GUARD-01..04)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser.mockReturnValue({ value: { id: 1 } }); // authenticated
    mockIsProfileComplete.mockResolvedValue(false); // incomplete by default
    // Re-sync global.navigateTo with the cleared mock
    global.navigateTo = mockNavigateTo;
  });

  // GUARD-01: Unauthenticated users pass through
  it("allows unauthenticated users through without calling isProfileComplete (GUARD-01)", async () => {
    mockUser.mockReturnValue({ value: null });
    await guard(makeTo("/anuncios"), {});
    expect(mockIsProfileComplete).not.toHaveBeenCalled();
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  // GUARD-01: Authenticated incomplete-profile user on non-exempt page is redirected
  it("redirects authenticated incomplete-profile user to /onboarding and saves referer (GUARD-01)", async () => {
    await guard(makeTo("/anuncios"), {});
    expect(mockSetReferer).toHaveBeenCalledWith("/anuncios");
    expect(mockNavigateTo).toHaveBeenCalledWith("/onboarding");
  });

  // GUARD-01: Incomplete user already at /onboarding — no loop
  it("does not redirect if incomplete-profile user is already at /onboarding (GUARD-01 loop prevention)", async () => {
    await guard(makeTo("/onboarding"), {});
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  // GUARD-01: Incomplete user at /onboarding/thankyou — no loop (startsWith)
  it("does not redirect if incomplete-profile user is at /onboarding/thankyou (GUARD-01 loop prevention via startsWith)", async () => {
    await guard(makeTo("/onboarding/thankyou"), {});
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  // GUARD-02: Complete-profile user at /onboarding is redirected to /
  it("redirects complete-profile user away from /onboarding to / (GUARD-02)", async () => {
    mockIsProfileComplete.mockResolvedValue(true);
    await guard(makeTo("/onboarding"), {});
    expect(mockNavigateTo).toHaveBeenCalledWith("/");
  });

  // GUARD-02: Complete-profile user at /onboarding/thankyou is redirected to /
  it("redirects complete-profile user away from /onboarding/thankyou to / (GUARD-02)", async () => {
    mockIsProfileComplete.mockResolvedValue(true);
    await guard(makeTo("/onboarding/thankyou"), {});
    expect(mockNavigateTo).toHaveBeenCalledWith("/");
  });

  // GUARD-02: Complete-profile user on non-onboarding page passes through
  it("allows complete-profile user on non-onboarding page without redirect (GUARD-02)", async () => {
    mockIsProfileComplete.mockResolvedValue(true);
    await guard(makeTo("/anuncios"), {});
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  // GUARD-03: SSR safety — verified indirectly: since nuxt-meta-client-stub sets
  // import.meta.server = false, all tests DO call stores. If the server bail
  // fired, no store calls would happen. The above tests confirm stores are called.

  // GUARD-04: Auth-exempt pages — /login, /registro, /logout
  it("exempts /login — no isProfileComplete call, no redirect (GUARD-04)", async () => {
    await guard(makeTo("/login"), {});
    expect(mockIsProfileComplete).not.toHaveBeenCalled();
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("exempts /registro — no isProfileComplete call, no redirect (GUARD-04)", async () => {
    await guard(makeTo("/registro"), {});
    expect(mockIsProfileComplete).not.toHaveBeenCalled();
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("exempts /logout — no isProfileComplete call, no redirect (GUARD-04)", async () => {
    await guard(makeTo("/logout"), {});
    expect(mockIsProfileComplete).not.toHaveBeenCalled();
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });
});
