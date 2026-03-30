import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";

const mockFetch = vi.fn().mockResolvedValue({});
const mockTokenRef = ref<string | null>("test-jwt");

// Stub global $fetch
vi.stubGlobal("$fetch", mockFetch);
// Stub useSessionToken as a global (Nuxt auto-import is not available in vitest)
vi.stubGlobal("useSessionToken", () => mockTokenRef);

vi.mock("#imports", () => ({
  useRuntimeConfig: () => ({
    public: {
      strapi: {
        url: "http://test:1337",
        prefix: "/api",
        cookieName: "waldo_jwt",
        cookie: {},
      },
    },
  }),
}));

import { useSessionClient } from "~/app/composables/useSessionClient";

describe("useSessionClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({});
    mockTokenRef.value = "test-jwt";
  });

  it("serializes nested params with qs bracket notation", async () => {
    const client = useSessionClient();
    await client("/articles", {
      params: { filters: { documentId: { $eq: "abc123" } } },
    });

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    // qs with encodeValuesOnly: true produces bracket notation without encoding keys
    // Verifies bracket notation (not [object Object]) — the actual correct serialization
    expect(calledUrl).toContain("filters[documentId][$eq]=abc123");
    // params must be deleted from fetchOptions (serialized into URL)
    const calledOptions = mockFetch.mock.calls[0][1] as Record<string, unknown>;
    expect(calledOptions.params).toBeUndefined();
  });

  it("injects Authorization Bearer header when token is present", async () => {
    const client = useSessionClient();
    await client("/test");

    const calledOptions = mockFetch.mock.calls[0][1] as {
      headers: Record<string, string>;
    };
    expect(calledOptions.headers.Authorization).toBe("Bearer test-jwt");
  });

  it("does NOT inject Authorization header when token is null", async () => {
    mockTokenRef.value = null;
    const client = useSessionClient();
    await client("/test");

    const calledOptions = mockFetch.mock.calls[0][1] as {
      headers: Record<string, string>;
    };
    expect(calledOptions.headers.Authorization).toBeUndefined();
  });

  it("passes baseURL from runtimeConfig", async () => {
    const client = useSessionClient();
    await client("/test");

    const calledOptions = mockFetch.mock.calls[0][1] as { baseURL: string };
    expect(calledOptions.baseURL).toBe("http://test:1337/api");
  });
});
