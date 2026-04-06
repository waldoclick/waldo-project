import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock all stores and Nuxt auto-imports
const mockAdReset = vi.fn();
const mockHistoryReset = vi.fn();
const mockMeReset = vi.fn();
const mockUserReset = vi.fn();
const mockAdsReset = vi.fn();
const mockAppReset = vi.fn();
const mockAuthLogout = vi.fn();
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
  useStrapiAuth: () => ({ logout: mockAuthLogout }),
  navigateTo: mockNavigateTo,
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
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

  it("calls navigateTo('/') after auth logout", async () => {
    const { useLogout } = await import("@/composables/useLogout");
    const { logout } = useLogout();

    await logout();

    expect(mockAuthLogout).toHaveBeenCalled();
    expect(mockNavigateTo).toHaveBeenCalled();

    const authOrder = mockAuthLogout.mock.invocationCallOrder[0]!;
    const navOrder = mockNavigateTo.mock.invocationCallOrder[0]!;
    expect(navOrder).toBeGreaterThan(authOrder);
  });

  it("calls all store resets before auth logout", async () => {
    const { useLogout } = await import("@/composables/useLogout");
    const { logout } = useLogout();

    await logout();

    const authOrder = mockAuthLogout.mock.invocationCallOrder[0]!;
    expect(mockAdReset.mock.invocationCallOrder[0]!).toBeLessThan(authOrder);
    expect(mockHistoryReset.mock.invocationCallOrder[0]!).toBeLessThan(
      authOrder,
    );
    expect(mockMeReset.mock.invocationCallOrder[0]!).toBeLessThan(authOrder);
    expect(mockUserReset.mock.invocationCallOrder[0]!).toBeLessThan(authOrder);
    expect(mockAdsReset.mock.invocationCallOrder[0]!).toBeLessThan(authOrder);
    expect(mockAppReset.mock.invocationCallOrder[0]!).toBeLessThan(authOrder);
  });

  it("calls navigateTo with exactly '/'", async () => {
    const { useLogout } = await import("@/composables/useLogout");
    const { logout } = useLogout();

    await logout();

    expect(mockNavigateTo).toHaveBeenCalledWith("/");
  });
});

describe("GTAP-12: disableAutoSelect() before strapiLogout()", () => {
  beforeEach(() => {
    vi.stubGlobal("google", {
      accounts: { id: { disableAutoSelect: mockDisableAutoSelect } },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls disableAutoSelect() before strapiLogout()", async () => {
    const { useLogout } = await import("@/composables/useLogout");
    const { logout } = useLogout();
    await logout();

    expect(mockDisableAutoSelect).toHaveBeenCalledOnce();
    const disableOrder = mockDisableAutoSelect.mock.invocationCallOrder[0]!;
    const authOrder = mockAuthLogout.mock.invocationCallOrder[0]!;
    expect(disableOrder).toBeLessThan(authOrder);
  });
});
