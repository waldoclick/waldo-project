import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, nextTick } from "vue";
import { mount } from "@vue/test-utils";

// ─── persistedState global (required by app.store.ts) ─────────────────────
vi.stubGlobal("persistedState", { localStorage: "localStorage" });

// ─── Mock #app before importing component ─────────────────────────────────
const mockNavigateTo = vi.fn().mockResolvedValue();
vi.mock("#app", () => ({
  navigateTo: mockNavigateTo,
  useState: (_key: string, init?: () => unknown) => ref(init ? init() : null),
  useRoute: () => ({ params: {}, query: {}, path: "/" }),
  useRouter: () => ({ push: vi.fn() }),
}));

// ─── Mock store modules (direct imports in the component) ──────────────────
const mockCloseLoginLightbox = vi.fn();
const mockClearReferer = vi.fn();
const mockAppStoreInstance = {
  closeLoginLightbox: mockCloseLoginLightbox,
  getReferer: null as string | null,
  clearReferer: mockClearReferer,
};
vi.mock("@/stores/app.store", () => ({
  useAppStore: vi.fn(() => mockAppStoreInstance),
}));

const mockIsProfileComplete = vi.fn().mockResolvedValue(true);
const mockMeReset = vi.fn();
const mockMeStoreInstance = {
  isProfileComplete: mockIsProfileComplete,
  reset: mockMeReset,
};
vi.mock("@/stores/me.store", () => ({
  useMeStore: vi.fn(() => mockMeStoreInstance),
}));

// ─── Mock composables (direct imports) ────────────────────────────────────
vi.mock("@/composables/useLogger", () => ({
  useLogger: vi.fn(() => ({ logInfo: vi.fn(), logError: vi.fn() })),
}));

// ─── Nuxt auto-imported globals ───────────────────────────────────────────

// pendingToken must have a value so onMounted doesn't redirect to /login
const mockPendingToken = ref("mock-pending-token");
global.useState = vi.fn(
  (_key: string) => mockPendingToken,
) as unknown as typeof useState;
global.navigateTo = mockNavigateTo;

// API client — returns a JWT on success
const mockApiClient = vi.fn().mockResolvedValue({ jwt: "mock-jwt-token" });
global.useApiClient = vi.fn(
  () => mockApiClient,
) as unknown as typeof useApiClient;

// useStrapiAuth — fetchUser resolves without error
const mockFetchUser = vi.fn().mockResolvedValue();
const mockSetToken = vi.fn();
global.useStrapiAuth = vi.fn(() => ({
  fetchUser: mockFetchUser,
  setToken: mockSetToken,
})) as unknown as typeof useStrapiAuth;

// useStrapiUser — set to manager by default (AUTH-01); overridden per test
const mockUser = ref<{ role?: { name: string } } | null>({
  role: { name: "manager" },
});
global.useStrapiUser = vi.fn(() => mockUser) as unknown as typeof useStrapiUser;

// useSweetAlert2 — no-op for tests
global.useSweetAlert2 = vi.fn(() => ({
  Swal: { fire: vi.fn() },
})) as unknown as typeof useSweetAlert2;

// useAdAnalytics — no-op
global.useAdAnalytics = vi.fn(() => ({
  login: vi.fn(),
})) as unknown as typeof useAdAnalytics;

import FormVerifyCode from "@/components/FormVerifyCode.vue";

function mountFormVerifyCode() {
  return mount(FormVerifyCode);
}

describe("FormVerifyCode.vue — AUTH-01 and AUTH-02", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Restore global mocks after clearAllMocks
    mockPendingToken.value = "mock-pending-token";
    global.navigateTo = mockNavigateTo;
    mockNavigateTo.mockResolvedValue();

    mockApiClient.mockResolvedValue({ jwt: "mock-jwt-token" });
    global.useApiClient = vi.fn(
      () => mockApiClient,
    ) as unknown as typeof useApiClient;

    mockFetchUser.mockResolvedValue();
    mockSetToken.mockReset();
    global.useStrapiAuth = vi.fn(() => ({
      fetchUser: mockFetchUser,
      setToken: mockSetToken,
    })) as unknown as typeof useStrapiAuth;

    mockIsProfileComplete.mockResolvedValue(true);
    mockMeReset.mockReset();

    mockAppStoreInstance.getReferer = null;

    global.useSweetAlert2 = vi.fn(() => ({
      Swal: { fire: vi.fn() },
    })) as unknown as typeof useSweetAlert2;

    global.useAdAnalytics = vi.fn(() => ({
      login: vi.fn(),
    })) as unknown as typeof useAdAnalytics;
  });

  // AUTH-01: when role.name === "manager" after verify, navigateTo("/dashboard")
  it("navigates to /dashboard when role is manager after successful verification (AUTH-01)", async () => {
    mockUser.value = { role: { name: "manager" } };
    global.useStrapiUser = vi.fn(
      () => mockUser,
    ) as unknown as typeof useStrapiUser;

    const wrapper = mountFormVerifyCode();
    await nextTick();

    await (
      wrapper.vm as unknown as { handleVerify: () => Promise<void> }
    ).handleVerify();

    expect(mockNavigateTo).toHaveBeenCalledWith("/dashboard");
  });

  // AUTH-02: when role.name !== "manager", navigateTo is NOT called with "/dashboard"
  it("does NOT navigate to /dashboard when role is not manager (AUTH-02)", async () => {
    mockUser.value = { role: { name: "user" } };
    global.useStrapiUser = vi.fn(
      () => mockUser,
    ) as unknown as typeof useStrapiUser;
    mockAppStoreInstance.getReferer = null;

    const wrapper = mountFormVerifyCode();
    await nextTick();

    await (
      wrapper.vm as unknown as { handleVerify: () => Promise<void> }
    ).handleVerify();

    const calls = mockNavigateTo.mock.calls.map((c) => c[0]);
    expect(calls).not.toContain("/dashboard");
    // Should navigate to /anuncios (fallback when no referer)
    expect(mockNavigateTo).toHaveBeenCalledWith("/anuncios");
  });
});
