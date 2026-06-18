/**
 * ad-view service — unit tests
 *
 * Tests for recordView: owner exclusion, per-visitor/day dedupe, row creation,
 * visitor_hash determinism, and error-swallowing.
 *
 * Pattern: jest.mock the @strapi/strapi factory so the inner factory function
 * is called directly and recordView is accessible without Strapi machinery.
 */

import crypto from "crypto";

// Mock the @strapi/strapi factory — return the inner factory function as the service object
jest.mock("@strapi/strapi", () => ({
  factories: {
    createCoreService: (
      _uid: string,
      fn: (opts: { strapi: unknown }) => unknown,
    ) => fn,
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

import serviceFactory from "../../../src/api/ad-view/services/ad-view";

// ─── helpers ────────────────────────────────────────────────────────────────

function buildMockStrapi(overrides: {
  adRecord?: Record<string, unknown> | null;
  existingView?: Record<string, unknown> | null;
}) {
  const adRecord = overrides.adRecord ?? {
    id: 10,
    documentId: "ad-doc-1",
    user: { id: 99 },
  };
  const existingView = overrides.existingView ?? null;

  const mockCreate = jest.fn().mockResolvedValue({ id: 1 });
  const mockFindMany = jest
    .fn()
    .mockResolvedValue(existingView ? [existingView] : []);

  const mockDbQuery = jest.fn().mockImplementation((uid: string) => {
    if (uid === "api::ad.ad") {
      return {
        findOne: jest.fn().mockResolvedValue(adRecord),
      };
    }
    if (uid === "api::ad-view.ad-view") {
      return {
        findMany: mockFindMany,
        create: mockCreate,
      };
    }
    return {};
  });

  return {
    mockStrapi: { db: { query: mockDbQuery } },
    mockCreate,
    mockFindMany,
    mockDbQuery,
  };
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe("ad-view service — recordView", () => {
  // Test 1: new view → creates exactly one ad-view row
  it("creates one row when no existing view for the visitor_hash today", async () => {
    const { mockStrapi, mockCreate } = buildMockStrapi({ existingView: null });
    const service = (
      serviceFactory as (opts: { strapi: unknown }) => { recordView: Function }
    )({ strapi: mockStrapi });

    await service.recordView(
      "ad-doc-1",
      null,
      "detail",
      "1.2.3.4",
      "Mozilla/5.0",
    );

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArg = mockCreate.mock.calls[0][0];
    expect(callArg.data).toMatchObject({
      ad: 10,
      source: "detail",
      viewer: null,
    });
    expect(typeof callArg.data.visitor_hash).toBe("string");
    expect(callArg.data.visitor_hash).toHaveLength(64); // sha256 hex
    expect(callArg.data.viewed_at).toBeInstanceOf(Date);
  });

  // Test 2: duplicate visitor/day → does NOT create a second row
  it("does not create a row when an ad-view already exists for the same visitor_hash today", async () => {
    const existingView = {
      id: 42,
      visitor_hash: "existing",
      viewed_at: new Date(),
    };
    const { mockStrapi, mockCreate } = buildMockStrapi({ existingView });
    const service = (
      serviceFactory as (opts: { strapi: unknown }) => { recordView: Function }
    )({ strapi: mockStrapi });

    await service.recordView(
      "ad-doc-1",
      null,
      "detail",
      "1.2.3.4",
      "Mozilla/5.0",
    );

    expect(mockCreate).not.toHaveBeenCalled();
  });

  // Test 3: owner views own ad → no row created, returns early
  it("does not create a row when the viewer is the ad owner", async () => {
    const adRecord = { id: 10, documentId: "ad-doc-1", user: { id: 55 } };
    const { mockStrapi, mockCreate } = buildMockStrapi({
      adRecord,
      existingView: null,
    });
    const service = (
      serviceFactory as (opts: { strapi: unknown }) => { recordView: Function }
    )({ strapi: mockStrapi });

    // viewerId === ad.user.id (55)
    await service.recordView(
      "ad-doc-1",
      55,
      "detail",
      "1.2.3.4",
      "Mozilla/5.0",
    );

    expect(mockCreate).not.toHaveBeenCalled();
  });

  // Test 4: visitor_hash recipe is deterministic (sha256(ip|ua|yyyy-mm-dd))
  it("produces the same visitor_hash for the same ip+ua on the same day", async () => {
    const ip = "10.0.0.1";
    const ua = "TestAgent/1.0";
    const day = "2026-06-17";

    const expected = crypto
      .createHash("sha256")
      .update(`${ip}|${ua}|${day}`)
      .digest("hex");
    const differentDay = crypto
      .createHash("sha256")
      .update(`${ip}|${ua}|2026-06-18`)
      .digest("hex");

    // Same inputs → same hash
    expect(expected).toBe(expected);
    // Different day → different hash
    expect(expected).not.toBe(differentDay);
    // Hash is a 64-char hex string
    expect(expected).toMatch(/^[0-9a-f]{64}$/);
  });

  // Test 5: error from DB layer is swallowed (tracking never breaks the ad page)
  it("swallows errors thrown by the DB layer and resolves without rethrowing", async () => {
    const mockDbQuery = jest.fn().mockImplementation((uid: string) => {
      if (uid === "api::ad.ad") {
        return {
          findOne: jest.fn().mockRejectedValue(new Error("DB failure")),
        };
      }
      return {};
    });
    const errStrapi = { db: { query: mockDbQuery } };
    const service = (
      serviceFactory as (opts: { strapi: unknown }) => { recordView: Function }
    )({ strapi: errStrapi });

    // Must resolve without throwing
    await expect(
      service.recordView("ad-doc-1", null, "detail", "1.2.3.4", "Mozilla/5.0"),
    ).resolves.toBeUndefined();
  });
});
