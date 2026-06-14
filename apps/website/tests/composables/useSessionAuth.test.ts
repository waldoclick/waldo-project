import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// ─── Shared mock state ────────────────────────────────────────────────────────
const userRef = { value: null as unknown };
const mockClient = vi.fn();
const mockFetch = vi.fn();
const setCookieSpy = vi.fn();

describe("useSessionAuth", () => {
  beforeEach(() => {
    userRef.value = null;
    vi.clearAllMocks();
    vi.resetModules();

    // Stub Nuxt auto-imports (globals)
    vi.stubGlobal("useState", (_key: string, init: () => unknown) => {
      return userRef.value !== null ? userRef : { value: init() };
    });
    vi.stubGlobal("useSessionUser", () => userRef);
    vi.stubGlobal("useApiClient", () => mockClient);
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: { baseUrl: "http://localhost:3000" },
    }));
    vi.stubGlobal("$fetch", mockFetch);

    // Spy on document.cookie setter to assert no cookie write occurs
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get: () => "",
      set: setCookieSpy,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    // Restore document.cookie
    Object.defineProperty(document, "cookie", {
      configurable: true,
      writable: true,
      value: "",
    });
  });

  describe("fetchUser()", () => {
    it("sets user.value to the resolved user and returns it on success", async () => {
      const fakeUser = { id: 1, email: "test@example.com", username: "test" };
      mockClient.mockResolvedValue(fakeUser);

      const { useSessionAuth } = await import("@/composables/useSessionAuth");
      const { fetchUser } = useSessionAuth();

      const result = await fetchUser();

      expect(result).toEqual(fakeUser);
      expect(userRef.value).toEqual(fakeUser);
    });

    it("sets user.value to null and returns null on 401/rejection", async () => {
      userRef.value = { id: 1, email: "prev@example.com" };
      mockClient.mockRejectedValue(new Error("401 Unauthorized"));

      const { useSessionAuth } = await import("@/composables/useSessionAuth");
      const { fetchUser } = useSessionAuth();

      const result = await fetchUser();

      expect(result).toBeNull();
      expect(userRef.value).toBeNull();
    });

    it("CRITICAL: does NOT write to document.cookie on 401 rejection", async () => {
      mockClient.mockRejectedValue(new Error("401 Unauthorized"));

      const { useSessionAuth } = await import("@/composables/useSessionAuth");
      const { fetchUser } = useSessionAuth();

      await fetchUser();

      // No cookie side effect — this is the regression guard for the logout bug
      expect(setCookieSpy).not.toHaveBeenCalled();
    });

    it("CRITICAL: does NOT call $fetch on rejection (no token clearing)", async () => {
      mockClient.mockRejectedValue(new Error("401 Unauthorized"));

      const { useSessionAuth } = await import("@/composables/useSessionAuth");
      const { fetchUser } = useSessionAuth();

      await fetchUser();

      // $fetch should not be called during fetchUser — it's only for logout
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("calls useApiClient to fetch users/me with populate params", async () => {
      const fakeUser = { id: 1, email: "test@example.com" };
      mockClient.mockResolvedValue(fakeUser);

      const { useSessionAuth } = await import("@/composables/useSessionAuth");
      const { fetchUser } = useSessionAuth();

      await fetchUser();

      expect(mockClient).toHaveBeenCalledWith(
        "users/me",
        expect.objectContaining({
          params: expect.objectContaining({
            populate: expect.arrayContaining(["role", "commune"]),
          }),
        }),
      );
    });
  });

  describe("logout()", () => {
    it("POSTs to /api/auth/logout", async () => {
      mockFetch.mockResolvedValue({ success: true });

      const { useSessionAuth } = await import("@/composables/useSessionAuth");
      const { logout } = useSessionAuth();

      await logout();

      expect(mockFetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
      });
    });

    it("sets user.value to null after logout", async () => {
      userRef.value = { id: 1, email: "user@example.com" };
      mockFetch.mockResolvedValue({ success: true });

      const { useSessionAuth } = await import("@/composables/useSessionAuth");
      const { logout } = useSessionAuth();

      await logout();

      expect(userRef.value).toBeNull();
    });
  });

  describe("getProviderAuthenticationUrl()", () => {
    it("returns correct URL for google provider", async () => {
      const { useSessionAuth } = await import("@/composables/useSessionAuth");
      const { getProviderAuthenticationUrl } = useSessionAuth();

      const url = getProviderAuthenticationUrl("google");

      expect(url).toBe("http://localhost:3000/api/connect/google");
    });

    it("returns correct URL for facebook provider", async () => {
      const { useSessionAuth } = await import("@/composables/useSessionAuth");
      const { getProviderAuthenticationUrl } = useSessionAuth();

      const url = getProviderAuthenticationUrl("facebook");

      expect(url).toBe("http://localhost:3000/api/connect/facebook");
    });
  });
});
