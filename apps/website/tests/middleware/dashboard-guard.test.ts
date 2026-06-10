import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

// Dashboard guard uses vi.stubGlobal pattern (consistent with 109-01 STATE.md pattern)
// Stubs are set before module evaluation via global assignments.

const mockNavigateTo = vi.fn();
vi.mock("#app", () => ({
  defineNuxtRouteMiddleware: (fn: unknown) => fn,
  navigateTo: mockNavigateTo,
}));

global.defineNuxtRouteMiddleware = (fn: unknown) => fn;
global.navigateTo = mockNavigateTo;

// useStrapiToken — controls whether a JWT cookie exists
const mockStrapiToken = vi.fn(() => ({ value: null }));
vi.stubGlobal("useStrapiToken", mockStrapiToken);

// useStrapiUser — controls current user state
const mockUser = vi.fn(() => ({ value: null }));
vi.stubGlobal("useStrapiUser", mockUser);

// useStrapiAuth — provides fetchUser
const mockFetchUser = vi.fn();
vi.stubGlobal(
  "useStrapiAuth",
  vi.fn(() => ({ fetchUser: mockFetchUser })),
);

let guard: (..._args: unknown[]) => unknown = () => {};

beforeAll(async () => {
  const mod = await import("@/middleware/dashboard-guard.global");
  guard = mod.default;
});

const makeTo = (path: string) => ({ path, fullPath: path });

describe("dashboard-guard.global (GUARD-01, GUARD-02)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-sync global.navigateTo with the cleared mock
    global.navigateTo = mockNavigateTo;
    mockStrapiToken.mockReturnValue({ value: null });
    mockUser.mockReturnValue({ value: null });
    mockFetchUser.mockResolvedValue();
  });

  // Control: non-dashboard path — guard returns early, no navigation
  it("does not navigate for non-dashboard paths (control)", async () => {
    await guard(makeTo("/anuncios"), {});
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  // GUARD-01: no token, no user → navigateTo("/login")
  it("redirects to /login when user is unauthenticated at /dashboard/ads (GUARD-01)", async () => {
    mockStrapiToken.mockReturnValue({ value: null });
    mockUser.mockReturnValue({ value: null });

    await guard(makeTo("/dashboard/ads"), {});

    expect(mockNavigateTo).toHaveBeenCalledWith("/login");
  });

  // GUARD-01: has token but fetchUser fails to populate user → redirects /login
  it("redirects to /login when token exists but user cannot be fetched (GUARD-01)", async () => {
    mockStrapiToken.mockReturnValue({ value: "some-jwt" });
    // user starts null, fetchUser doesn't populate it
    mockUser.mockReturnValue({ value: null });

    await guard(makeTo("/dashboard/ads"), {});

    expect(mockNavigateTo).toHaveBeenCalledWith("/login");
  });

  // GUARD-02: logged in user with role "user" → navigateTo("/")
  it("redirects to / when authenticated user does not have manager role (GUARD-02)", async () => {
    mockUser.mockReturnValue({ value: { role: { name: "user" } } });

    await guard(makeTo("/dashboard/ads"), {});

    expect(mockNavigateTo).toHaveBeenCalledWith("/");
  });

  // GUARD-02: logged in user with role "admin" (not "manager") → navigateTo("/")
  it("redirects to / when role is admin but not manager (GUARD-02)", async () => {
    mockUser.mockReturnValue({ value: { role: { name: "admin" } } });

    await guard(makeTo("/dashboard/ads"), {});

    expect(mockNavigateTo).toHaveBeenCalledWith("/");
  });

  // Passing case: manager should NOT be redirected
  it("allows manager user through without redirecting", async () => {
    mockUser.mockReturnValue({ value: { role: { name: "manager" } } });

    await guard(makeTo("/dashboard/ads"), {});

    expect(mockNavigateTo).not.toHaveBeenCalled();
  });
});
