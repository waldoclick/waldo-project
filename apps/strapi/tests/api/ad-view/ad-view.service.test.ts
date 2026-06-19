/**
 * ad-view service — unit tests
 *
 * Tests for recordView: per-visitor/ad/day dedupe, row creation,
 * visitor_hash determinism, and error-swallowing.
 *
 * Pattern: jest.mock the @strapi/strapi factory so the inner factory function
 * is called directly and recordView is accessible without Strapi machinery.
 *
 * The mock strapi.db is STATEFUL (in-memory rows[] + multi-ad lookup) so the
 * cross-ad test (Test B) genuinely proves the fix — a fixed-return mock would
 * pass regardless of the hash recipe and be a tautology.
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

type ViewRow = {
  ad: number;
  viewed_at: Date;
  visitor_hash: string;
  source: string;
  viewer: number | null;
};

/**
 * Build a STATEFUL mock strapi.db.query:
 *  - "api::ad.ad".findOne({where:{documentId}}) returns the matching ad record
 *    from a multi-ad map ("ad-A" → {id:10}, "ad-B" → {id:20}).
 *  - "api::ad-view.ad-view".create({data}) pushes data onto an in-memory rows[].
 *  - "api::ad-view.ad-view".findMany({where}) returns rows filtered by the where
 *    it RECEIVES — matched on visitor_hash AND ad (the where.ad guard). This is
 *    what makes the cross-ad test real: drop adDocumentId from the hash and the
 *    second-ad row would collide on visitor_hash → deduped → Test B fails.
 */
function buildStatefulMockStrapi() {
  const ads: Record<string, { id: number; documentId: string }> = {
    "ad-A": { id: 10, documentId: "ad-A" },
    "ad-B": { id: 20, documentId: "ad-B" },
  };

  const rows: ViewRow[] = [];

  const mockCreate = jest
    .fn()
    .mockImplementation(({ data }: { data: ViewRow }) => {
      rows.push(data);
      return Promise.resolve({ id: rows.length });
    });

  const mockFindMany = jest
    .fn()
    .mockImplementation(({ where }: { where: Record<string, unknown> }) => {
      const filtered = rows.filter((r) => {
        const matchesHash = r.visitor_hash === where.visitor_hash;
        const matchesAd = where.ad === undefined || r.ad === where.ad;
        return matchesHash && matchesAd;
      });
      return Promise.resolve(filtered);
    });

  const mockFindOne = jest
    .fn()
    .mockImplementation(({ where }: { where: { documentId: string } }) => {
      return Promise.resolve(ads[where.documentId] ?? null);
    });

  const mockDbQuery = jest.fn().mockImplementation((uid: string) => {
    if (uid === "api::ad.ad") {
      return { findOne: mockFindOne };
    }
    if (uid === "api::ad-view.ad-view") {
      return { findMany: mockFindMany, create: mockCreate };
    }
    return {};
  });

  return {
    mockStrapi: { db: { query: mockDbQuery } },
    rows,
    mockCreate,
    mockFindMany,
    mockFindOne,
    mockDbQuery,
  };
}

function makeService(mockStrapi: unknown) {
  return (
    serviceFactory as (opts: { strapi: unknown }) => { recordView: Function }
  )({ strapi: mockStrapi });
}

// ─── tests ──────────────────────────────────────────────────────────────────

describe("ad-view service — recordView", () => {
  // Test A: dedup holds — same visitor, same ad, same day → exactly ONE row
  it("creates only one row when the same visitor views the same ad twice in one day", async () => {
    const { mockStrapi, mockCreate } = buildStatefulMockStrapi();
    const service = makeService(mockStrapi);

    await service.recordView("ad-A", null, "detail", "1.2.3.4", "Mozilla/5.0");
    await service.recordView("ad-A", null, "detail", "1.2.3.4", "Mozilla/5.0");

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

  // Test B: THE BUG FIX — same visitor, DIFFERENT ad, same day → TWO rows
  it("creates a new row when the same visitor views a different ad the same day", async () => {
    const { mockStrapi, mockCreate, rows } = buildStatefulMockStrapi();
    const service = makeService(mockStrapi);

    await service.recordView("ad-A", null, "detail", "1.2.3.4", "Mozilla/5.0");
    await service.recordView("ad-B", null, "detail", "1.2.3.4", "Mozilla/5.0");

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(rows.map((r) => r.ad).sort((a, b) => a - b)).toEqual([10, 20]);
  });

  // Test C: different visitor, same ad → TWO rows
  it("creates a new row when a different visitor views the same ad", async () => {
    const { mockStrapi, mockCreate, rows } = buildStatefulMockStrapi();
    const service = makeService(mockStrapi);

    await service.recordView("ad-A", null, "detail", "1.1.1.1", "Mozilla/5.0");
    await service.recordView("ad-A", null, "detail", "2.2.2.2", "Mozilla/5.0");

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(rows.every((r) => r.ad === 10)).toBe(true);
  });

  // Test D: hash recipe pinned — visitor_hash === sha256(ip|ua|adDocumentId|day)
  it("computes visitor_hash as sha256(ip|ua|adDocumentId|yyyy-mm-dd)", async () => {
    const { mockStrapi, mockCreate } = buildStatefulMockStrapi();
    const service = makeService(mockStrapi);

    const ip = "10.0.0.1";
    const ua = "TestAgent/1.0";
    const adDocumentId = "ad-A";
    const day = new Date().toISOString().slice(0, 10);

    await service.recordView(adDocumentId, null, "detail", ip, ua);

    const expected = crypto
      .createHash("sha256")
      .update(`${ip}|${ua}|${adDocumentId}|${day}`)
      .digest("hex");

    const callArg = mockCreate.mock.calls[0][0];
    expect(callArg.data.visitor_hash).toBe(expected);
  });

  // Test E: error from DB layer is swallowed (tracking never breaks the ad page)
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
    const service = makeService(errStrapi);

    await expect(
      service.recordView("ad-A", null, "detail", "1.2.3.4", "Mozilla/5.0"),
    ).resolves.toBeUndefined();
  });
});
