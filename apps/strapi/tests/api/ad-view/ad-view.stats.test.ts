/**
 * ad-view service — stats aggregation unit tests (05-08)
 *
 * Tests for getAdStats (14-day series + total + contacts + conversion + avgPerDay)
 * and getUserTotalViews (sum of views over the requesting user's active ads).
 *
 * TDD RED: these tests are written BEFORE the implementation.
 *
 * Pattern mirrors ad-view.service.test.ts: mock @strapi/strapi factory, call
 * the inner factory fn directly, mock strapi.db.query per UID.
 *
 * Total vs series semantics:
 *   - total = all-time count of ad-view rows for the ad (via db.query.count)
 *   - series = per-day buckets within the last `days` window (via db.query.findMany)
 *   - In fixtures below every row is placed inside the window → sum(series) === total.
 */

jest.mock("@strapi/strapi", () => ({
  factories: {
    createCoreService: (
      _uid: string,
      fn: (opts: { strapi: unknown }) => unknown,
    ) => fn,
  },
}));

jest.mock("../../../src/utils/logtail/index", () => ({
  default: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

import serviceFactory from "../../../src/api/ad-view/services/ad-view";

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Produces a UTC day key string (yyyy-mm-dd) for a Date offset by `daysAgo` days. */
function utcDay(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 86400000);
  return d.toISOString().slice(0, 10);
}

/** Produces a Date at the start (00:00:00 UTC) for a day `daysAgo` ago. */
function utcDayStart(daysAgo: number): Date {
  return new Date(`${utcDay(daysAgo)}T00:00:00.000Z`);
}

type AdStatsResult = {
  total: number;
  series: number[];
  contacts: number;
  conversion: number;
  avgPerDay: number;
};

type ServiceType = {
  recordView: (...args: unknown[]) => Promise<void>;
  getAdStats: (adDocumentId: string, days?: number) => Promise<AdStatsResult>;
  getUserTotalViews: (userId: number) => Promise<number>;
};

// Double-cast helper to avoid TS2352 when the source type doesn't overlap yet
function asService(fn: unknown): (opts: { strapi: unknown }) => ServiceType {
  return fn as (opts: { strapi: unknown }) => ServiceType;
}

/**
 * Builds a mock strapi instance with per-UID routing suitable for stats tests.
 *
 * @param adRecord   - the ad row returned by api::ad.ad findOne (null → not found)
 * @param viewRows   - rows returned by api::ad-view.ad-view findMany (windowed)
 * @param totalViews - count returned by api::ad-view.ad-view count (all-time)
 * @param contactCount - count returned by api::ad-contact.ad-contact count
 * @param activeAdIds  - ids returned by api::ad.ad findMany (active ads for user)
 */
function buildMockStrapi(opts: {
  adRecord?: Record<string, unknown> | null;
  viewRows?: Array<{ id: number; viewed_at: Date }>;
  totalViews?: number;
  contactCount?: number;
  activeAdIds?: number[];
}) {
  const {
    adRecord = { id: 10, documentId: "ad-doc-1", user: { id: 99 } },
    viewRows = [],
    totalViews = viewRows.length,
    contactCount = 0,
    activeAdIds = [],
  } = opts;

  const mockAdFindOne = jest.fn().mockResolvedValue(adRecord);
  const mockAdFindMany = jest
    .fn()
    .mockResolvedValue(
      activeAdIds.map((id) => ({ id, documentId: `doc-${id}` })),
    );
  const mockViewFindMany = jest.fn().mockResolvedValue(viewRows);
  const mockViewCount = jest.fn().mockResolvedValue(totalViews);
  const mockContactCount = jest.fn().mockResolvedValue(contactCount);

  const mockDbQuery = jest.fn().mockImplementation((uid: string) => {
    if (uid === "api::ad.ad") {
      return { findOne: mockAdFindOne, findMany: mockAdFindMany };
    }
    if (uid === "api::ad-view.ad-view") {
      return {
        findMany: mockViewFindMany,
        count: mockViewCount,
        // recordView also uses create — provide a no-op to avoid undefined errors
        create: jest.fn().mockResolvedValue({ id: 1 }),
      };
    }
    if (uid === "api::ad-contact.ad-contact") {
      return { count: mockContactCount };
    }
    return {};
  });

  return {
    mockStrapi: { db: { query: mockDbQuery }, log: { warn: jest.fn() } },
    mockAdFindOne,
    mockAdFindMany,
    mockViewFindMany,
    mockViewCount,
    mockContactCount,
    mockDbQuery,
  };
}

// ─── getAdStats ───────────────────────────────────────────────────────────────

describe("ad-view service — getAdStats", () => {
  // Test 1: series.length === days and sum(series) === total (fixtures within window)
  it("returns series of length=days and sum(series) === total when all views are in the window", async () => {
    const DAYS = 14;
    // 5 view rows spread across 3 different days within the window
    const viewRows = [
      { id: 1, viewed_at: utcDayStart(0) },   // today
      { id: 2, viewed_at: utcDayStart(0) },   // today (second view)
      { id: 3, viewed_at: utcDayStart(3) },   // 3 days ago
      { id: 4, viewed_at: utcDayStart(7) },   // 7 days ago
      { id: 5, viewed_at: utcDayStart(13) },  // 13 days ago (within 14-day window)
    ];
    const { mockStrapi } = buildMockStrapi({ viewRows, totalViews: 5 });
    const service = asService(serviceFactory)({ strapi: mockStrapi });

    const result = await service.getAdStats("ad-doc-1", DAYS);

    expect(result.series).toHaveLength(DAYS);
    // All fixtures are within the window → sum(series) === total
    const seriesSum = result.series.reduce((a, b) => a + b, 0);
    expect(seriesSum).toBe(result.total);
    expect(result.total).toBe(5);
  });

  // Test 2: series is ordered oldest→newest; last element is today's bucket
  it("returns series ordered oldest-to-newest with today as the last element", async () => {
    const DAYS = 7;
    // Place 2 views today and 1 view 6 days ago (first bucket in the 7-day window)
    const viewRows = [
      { id: 1, viewed_at: utcDayStart(0) },
      { id: 2, viewed_at: utcDayStart(0) },
      { id: 3, viewed_at: utcDayStart(6) },
    ];
    const { mockStrapi } = buildMockStrapi({ viewRows, totalViews: 3 });
    const service = asService(serviceFactory)({ strapi: mockStrapi });

    const result = await service.getAdStats("ad-doc-1", DAYS);

    expect(result.series).toHaveLength(DAYS);
    // Last element = today's count (2 views today)
    expect(result.series[DAYS - 1]).toBe(2);
    // First element = 6-days-ago count (1 view)
    expect(result.series[0]).toBe(1);
    // No views on days 1-5 ago
    for (let i = 1; i < DAYS - 1; i++) {
      expect(result.series[i]).toBe(0);
    }
  });

  // Test 3: conversion = round(contacts/total*100), contacts count, avgPerDay
  it("calculates conversion, contacts, and avgPerDay correctly", async () => {
    const DAYS = 14;
    // 10 total views, 2 contacts → conversion = round(2/10*100) = 20
    const viewRows = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      viewed_at: utcDayStart(i % DAYS),
    }));
    const { mockStrapi } = buildMockStrapi({
      viewRows,
      totalViews: 10,
      contactCount: 2,
    });
    const service = asService(serviceFactory)({ strapi: mockStrapi });

    const result = await service.getAdStats("ad-doc-1", DAYS);

    expect(result.total).toBe(10);
    expect(result.contacts).toBe(2);
    expect(result.conversion).toBe(20); // round(2/10*100) = 20
    expect(result.avgPerDay).toBe(1); // round(10/14) = 1
  });

  // Test 4: zero views → no division by zero, correct shape returned
  it("returns all zeros when the ad has no views", async () => {
    const DAYS = 14;
    const { mockStrapi } = buildMockStrapi({
      viewRows: [],
      totalViews: 0,
      contactCount: 0,
    });
    const service = asService(serviceFactory)({ strapi: mockStrapi });

    const result = await service.getAdStats("ad-doc-1", DAYS);

    expect(result.total).toBe(0);
    expect(result.series).toHaveLength(DAYS);
    expect(result.series.every((v) => v === 0)).toBe(true);
    expect(result.contacts).toBe(0);
    expect(result.conversion).toBe(0); // no division by zero
    expect(result.avgPerDay).toBe(0);
  });

  // Test 4b: ad not found → returns zero shape without throwing
  it("returns zero shape when the ad documentId does not exist", async () => {
    const DAYS = 14;
    const { mockStrapi } = buildMockStrapi({ adRecord: null });
    const service = asService(serviceFactory)({ strapi: mockStrapi });

    const result = await service.getAdStats("nonexistent-doc", DAYS);

    expect(result.total).toBe(0);
    expect(result.series).toHaveLength(DAYS);
    expect(result.conversion).toBe(0);
    expect(result.contacts).toBe(0);
    expect(result.avgPerDay).toBe(0);
  });
});

// ─── getUserTotalViews ────────────────────────────────────────────────────────

describe("ad-view service — getUserTotalViews", () => {
  // Test 5: sums views for the user's active ads
  it("returns the total ad-view count for a user's active ads", async () => {
    const { mockStrapi } = buildMockStrapi({
      activeAdIds: [10, 20, 30],
      totalViews: 42,
    });
    const service = asService(serviceFactory)({ strapi: mockStrapi });

    const total = await service.getUserTotalViews(99);

    expect(total).toBe(42);
    // Should query active ads filtered by user
    expect(mockStrapi.db.query("api::ad.ad").findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          user: 99,
          active: true,
        }),
      }),
    );
  });

  // Test 5b: user has no active ads → returns 0 without querying ad-view
  it("returns 0 immediately when the user has no active ads (guards empty $in)", async () => {
    const { mockStrapi, mockViewCount } = buildMockStrapi({
      activeAdIds: [],
      totalViews: 0,
    });
    const service = asService(serviceFactory)({ strapi: mockStrapi });

    const total = await service.getUserTotalViews(99);

    expect(total).toBe(0);
    // Should NOT call view count when there are no active ads
    expect(mockViewCount).not.toHaveBeenCalled();
  });
});
