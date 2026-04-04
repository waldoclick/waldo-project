import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

// Mock useApiClient composable
const mockClient = vi.fn();
vi.stubGlobal("useApiClient", () => mockClient);

// Mock persistedState (used in store persist config)
vi.stubGlobal("persistedState", { localStorage: "localStorage" });

// Dynamically import the store after mocks are set up
const { usePoliciesStore } = await import("@/stores/policies.store");

describe("usePoliciesStore", () => {
  beforeEach(() => {
    // Arrange: isolate pinia state between tests
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("fetches policies from /api/policies on first call", async () => {
    // Arrange
    mockClient.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          title: "Policy 1",
          text: "<p>Content</p>",
          order: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          publishedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      meta: { pagination: { page: 1, pageSize: 50, pageCount: 1, total: 1 } },
    });
    const store = usePoliciesStore();

    // Act
    await store.loadPolicies();

    // Assert
    expect(mockClient).toHaveBeenCalledOnce();
    expect(mockClient).toHaveBeenCalledWith(
      "policies",
      expect.objectContaining({ method: "GET" }),
    );
    expect(store.policies).toHaveLength(1);
    expect(store.policies[0].title).toBe("Policy 1");
  });

  it("skips fetch when cache is fresh", async () => {
    // Arrange: store has a fresh timestamp (just now)
    const store = usePoliciesStore();
    store.lastFetchTimestamp = Date.now();
    store.policies = [
      {
        id: 1,
        title: "Cached Policy",
        text: "<p>Content</p>",
        order: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        publishedAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    // Act
    await store.loadPolicies();

    // Assert: client was NOT called because cache is still valid
    expect(mockClient).not.toHaveBeenCalled();
  });

  it("fetches again when cache is stale", async () => {
    // Arrange: store has an old timestamp (>1 hour ago)
    mockClient.mockResolvedValueOnce({
      data: [
        {
          id: 2,
          title: "Fresh Policy",
          text: "<p>Fresh content</p>",
          order: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          publishedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      meta: { pagination: { page: 1, pageSize: 50, pageCount: 1, total: 1 } },
    });
    const store = usePoliciesStore();
    store.lastFetchTimestamp = Date.now() - 3600001; // 1 hour + 1ms ago (stale)

    // Act
    await store.loadPolicies();

    // Assert: client WAS called because cache expired
    expect(mockClient).toHaveBeenCalledOnce();
    expect(store.policies[0].title).toBe("Fresh Policy");
  });
});
