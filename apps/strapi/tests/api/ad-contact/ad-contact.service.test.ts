/**
 * ad-contact service — unit tests
 *
 * Tests for getUserTotalContacts: empty active ads → 0 (guard),
 * non-empty active ads → summed count from ad-contact rows.
 *
 * Pattern: jest.mock the @strapi/strapi factory so the inner factory
 * function is called directly and methods are accessible without Strapi
 * machinery. Mirrors apps/strapi/tests/api/ad-view/ad-view.service.test.ts.
 */

// Mock the @strapi/strapi factory — return the inner factory function as the service object
jest.mock("@strapi/strapi", () => ({
  factories: {
    createCoreService: (_uid: string, fn: (opts: { strapi: unknown }) => unknown) => fn,
  },
}));

// Mock logtail to avoid winston / DailyRotateFile side effects in tests
jest.mock("../../../src/utils/logtail/index", () => ({
  default: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

import serviceFactory from "../../../src/api/ad-contact/services/ad-contact";

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Build a minimal mock strapi scoped to getUserTotalContacts queries:
 * - api::ad.ad  → findMany (returns activeAds)
 * - api::ad-contact.ad-contact → count (returns contactCount)
 */
function buildMockStrapi(overrides: {
  activeAds?: Array<{ id: number }>;
  contactCount?: number;
}) {
  const activeAds = overrides.activeAds ?? [];
  const contactCount = overrides.contactCount ?? 0;

  const mockCount = jest.fn().mockResolvedValue(contactCount);
  const mockAdFindMany = jest.fn().mockResolvedValue(activeAds);

  const mockDbQuery = jest.fn().mockImplementation((uid: string) => {
    if (uid === "api::ad.ad") {
      return { findMany: mockAdFindMany };
    }
    if (uid === "api::ad-contact.ad-contact") {
      return { count: mockCount };
    }
    return {};
  });

  return {
    mockStrapi: { db: { query: mockDbQuery } },
    mockCount,
    mockAdFindMany,
    mockDbQuery,
  };
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe("ad-contact service — getUserTotalContacts", () => {
  // Test 1: user with no active ads → returns 0 without querying ad-contact
  it("returns 0 when the user has no active ads (guard: $in: [] not called)", async () => {
    const { mockStrapi, mockCount } = buildMockStrapi({ activeAds: [] });
    const service = (
      serviceFactory as (opts: { strapi: unknown }) => {
        getUserTotalContacts: (userId: number) => Promise<number>;
      }
    )({ strapi: mockStrapi });

    const result = await service.getUserTotalContacts(1);

    expect(result).toBe(0);
    // count must NOT be called — guard prevents $in: [] query
    expect(mockCount).not.toHaveBeenCalled();
  });

  // Test 2: user with active ads → returns summed contact count
  it("returns the total contact count across the user's active ads", async () => {
    const activeAds = [{ id: 10 }, { id: 20 }, { id: 30 }];
    const contactCount = 42;
    const { mockStrapi, mockCount } = buildMockStrapi({ activeAds, contactCount });
    const service = (
      serviceFactory as (opts: { strapi: unknown }) => {
        getUserTotalContacts: (userId: number) => Promise<number>;
      }
    )({ strapi: mockStrapi });

    const result = await service.getUserTotalContacts(7);

    expect(result).toBe(42);
    // count was called with the active ad ids
    expect(mockCount).toHaveBeenCalledTimes(1);
    expect(mockCount).toHaveBeenCalledWith({
      where: { ad: { $in: [10, 20, 30] } },
    });
  });
});
