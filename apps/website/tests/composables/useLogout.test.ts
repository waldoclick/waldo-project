import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock all stores and Nuxt auto-imports
const mockAdReset = vi.fn();
const mockHistoryReset = vi.fn();
const mockMeReset = vi.fn();
const mockUserReset = vi.fn();
const mockAdsReset = vi.fn();
const mockAppReset = vi.fn();
const mockFetch = vi.fn().mockResolvedValue({ success: true });
const mockNavigateTo = vi.fn();
const mockDisableAutoSelect = vi.fn();

vi.mock("@/stores/ad.store", () => ({
  useAdStore: () => ({ $reset: mockAdReset }),
}));
vi.mock("@/stores/history.store", () => ({
  useHistoryStore: () => ({ $reset: mockHistoryReset }),
}));
vi.mock("@/stores/me.store", () => ({
  useMeStore: () => ({ reset: mockMeReset }),
}));
vi.mock("@/stores/user.store", () => ({
  useUserStore: () => ({ reset: mockUserReset }),
}));
vi.mock("@/stores/ads.store", () => ({
  useAdsStore: () => ({ reset: mockAdsReset }),
}));
vi.mock("@/stores/app.store", () => ({
  useAppStore: () => ({ $reset: mockAppReset }),
}));
vi.mock("#imports", () => ({
  navigateTo: mockNavigateTo,
}));

vi.stubGlobal("$fetch", mockFetch);
vi.stubGlobal("useSessionUser", () => ({ value: null }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mockFetch.mockResolvedValue({ success: true });
});

describe("useLogout", () => {
  it("calls all 6 store resets on logout()", async () => {
    const { useLogout } = await import("@/composables/useLogout");
    const { logout } = useLogout();

    await logout();

    expect(mockAdReset).toHaveBeenCalledOnce();
    expect(mockHistoryReset).toHaveBeenCalledOnce();
    expect(mockMeReset).toHaveBeenCalledOnce();
    expect(mockUserReset).toHaveBeenCalledOnce();
    expect(mockAdsReset).toHaveBeenCalledOnce();
    expect(mockAppReset).toHaveBeenCalledOnce();
  });

  it("calls POST /api/auth/logout then navigateTo('/')", async () => {
    const { useLogout } = await import("@/composables/useLogout");
    const { logout } = useLogout();

    await logout();

    expect(mockFetch).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
    });
    expect(mockNavigateTo).toHaveBeenCalled();

    const fetchOrder = mockFetch.mock.invocationCallOrder[0]!;
    const navOrder = mockNavigateTo.mock.invocationCallOrder[0]!;
    expect(navOrder).toBeGreaterThan(fetchOrder);
  });

  it("calls all store resets before POST /api/auth/logout", async () => {
    const { useLogout } = await import("@/composables/useLogout");
    const { logout } = useLogout();

    await logout();

    const fetchOrder = mockFetch.mock.invocationCallOrder[0]!;
    expect(mockAdReset.mock.invocationCallOrder[0]!).toBeLessThan(fetchOrder);
    expect(mockHistoryReset.mock.invocationCallOrder[0]!).toBeLessThan(
      fetchOrder,
    );
    expect(mockMeReset.mock.invocationCallOrder[0]!).toBeLessThan(fetchOrder);
    expect(mockUserReset.mock.invocationCallOrder[0]!).toBeLessThan(fetchOrder);
    expect(mockAdsReset.mock.invocationCallOrder[0]!).toBeLessThan(fetchOrder);
    expect(mockAppReset.mock.invocationCallOrder[0]!).toBeLessThan(fetchOrder);
  });

  it("calls navigateTo with exactly '/'", async () => {
    const { useLogout } = await import("@/composables/useLogout");
    const { logout } = useLogout();

    await logout();

    expect(mockNavigateTo).toHaveBeenCalledWith("/");
  });
});

describe("GTAP-12: disableAutoSelect() before POST /api/auth/logout", () => {
  beforeEach(() => {
    vi.stubGlobal("google", {
      accounts: { id: { disableAutoSelect: mockDisableAutoSelect } },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.stubGlobal("$fetch", mockFetch);
    vi.stubGlobal("useSessionUser", () => ({ value: null }));
  });

  it("calls disableAutoSelect() before POST /api/auth/logout", async () => {
    const { useLogout } = await import("@/composables/useLogout");
    const { logout } = useLogout();
    await logout();

    expect(mockDisableAutoSelect).toHaveBeenCalledOnce();
    const disableOrder = mockDisableAutoSelect.mock.invocationCallOrder[0]!;
    const fetchOrder = mockFetch.mock.invocationCallOrder[0]!;
    expect(disableOrder).toBeLessThan(fetchOrder);
  });
});
