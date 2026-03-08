/**
 * TDD tests for AdStatus type and computeAdStatus() changes.
 *
 * These tests verify the new "draft" status behavior:
 *   - draft: true → "draft" is returned first, before any other check
 *   - draft: true + active: true → "draft" still wins
 *   - existing conditions (active, archived, etc.) → unchanged
 *   - old "abandoned" path → now falls through to "unknown"
 *   - AdStatus type has "draft", does NOT have "abandoned"
 *
 * Phase 52, Plan 02 — BACK-03, BACK-04, BACK-05
 */

// ─── Mock strapi global ───────────────────────────────────────────────────────

(global as unknown as { strapi: object }).strapi = {
  contentType: jest.fn().mockReturnValue({}),
  query: jest.fn().mockReturnValue({
    findOne: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue({}),
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
  }),
  db: {
    query: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    }),
  },
};

// ─── Mock email service ───────────────────────────────────────────────────────

jest.mock("../../../../services/mjml", () => ({
  sendMjmlEmail: jest.fn().mockResolvedValue(undefined),
}));

// ─── Mock Zoho service ───────────────────────────────────────────────────────

jest.mock("../../../../services/zoho", () => ({
  zohoService: {
    findContact: jest.fn().mockResolvedValue(null),
    updateContactStats: jest.fn().mockResolvedValue({}),
    createDeal: jest.fn().mockResolvedValue({}),
  },
}));

// ─── Mock logger ─────────────────────────────────────────────────────────────

jest.mock("../../../../utils/logtail", () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

// We test computeAdStatus indirectly via findOne which calls it
// But the function is not exported — we'll test via the service's findOne
// to verify the observable behaviour of the status field.

// However, since computeAdStatus is a module-level function, we need
// to test it through the service. We do this by mocking strapi.db.query
// to return the ad object and calling findOne on the service.

describe("computeAdStatus — draft status", () => {
  // We import the service module and use its exported factory
  // Since the service uses factories.createCoreService we need to test
  // via the service object itself.

  let adService: {
    findOne: (
      id: string | number,
      options?: object
    ) => Promise<{ status: string } | null>;
    draftAds: (options?: object) => Promise<unknown>;
    abandonedAds?: (options?: object) => Promise<unknown>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const serviceModule = require("../ad");
    // factories.createCoreService returns the service factory result
    // In Strapi, the module.default is the factory call result
    // We need to call the factory with a mock strapi
    const factory = serviceModule.default;
    // Invoke with mock strapi — Strapi factories accept ({ strapi }) => ({...})
    // The export is already the result of factories.createCoreService(...)
    // which at test time just returns the methods object
    adService = factory;
  });

  test("computeAdStatus returns 'draft' when draft === true (no other fields set)", async () => {
    const mockFindOne = jest.fn().mockResolvedValue({
      id: 1,
      draft: true,
      active: false,
      banned: false,
      rejected: false,
      remaining_days: 0,
      ad_reservation: null,
    });
    (
      (global as unknown as { strapi: { db: { query: jest.Mock } } }).strapi.db
        .query as jest.Mock
    ).mockReturnValue({
      findOne: mockFindOne,
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    });

    const result = await adService.findOne(1);
    expect(result?.status).toBe("draft");
  });

  test("computeAdStatus returns 'draft' when draft === true AND active === true (draft wins)", async () => {
    const mockFindOne = jest.fn().mockResolvedValue({
      id: 2,
      draft: true,
      active: true,
      banned: false,
      rejected: false,
      remaining_days: 5,
      ad_reservation: null,
    });
    (
      (global as unknown as { strapi: { db: { query: jest.Mock } } }).strapi.db
        .query as jest.Mock
    ).mockReturnValue({
      findOne: mockFindOne,
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    });

    const result = await adService.findOne(2);
    expect(result?.status).toBe("draft");
  });

  test("computeAdStatus still returns 'active' when draft is false/absent and conditions match", async () => {
    const mockFindOne = jest.fn().mockResolvedValue({
      id: 3,
      draft: false,
      active: true,
      banned: false,
      rejected: false,
      remaining_days: 5,
      ad_reservation: { id: 1 },
    });
    (
      (global as unknown as { strapi: { db: { query: jest.Mock } } }).strapi.db
        .query as jest.Mock
    ).mockReturnValue({
      findOne: mockFindOne,
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    });

    const result = await adService.findOne(3);
    expect(result?.status).toBe("active");
  });

  test("computeAdStatus returns 'unknown' for old 'abandoned' scenario (active=false, is_paid=true, no reservation, remaining_days>0)", async () => {
    const mockFindOne = jest.fn().mockResolvedValue({
      id: 4,
      draft: false,
      active: false,
      banned: false,
      rejected: false,
      remaining_days: 5,
      ad_reservation: null,
      is_paid: true,
    });
    (
      (global as unknown as { strapi: { db: { query: jest.Mock } } }).strapi.db
        .query as jest.Mock
    ).mockReturnValue({
      findOne: mockFindOne,
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    });

    const result = await adService.findOne(4);
    // The old "abandoned" branch is removed — this should fall through to "unknown"
    expect(result?.status).toBe("unknown");
  });

  test("draftAds() method exists on the service", () => {
    expect(typeof adService.draftAds).toBe("function");
  });

  test("abandonedAds() method does NOT exist on the service", () => {
    expect(adService.abandonedAds).toBeUndefined();
  });
});
