/**
 * TDD tests for AdStatus type and computeAdStatus() changes.
 *
 * These tests verify the new "draft" status behavior:
 *   - draft: true → "draft" is returned first, before any other check
 *   - draft: true + active: true → "draft" still wins
 *   - existing conditions (active, archived, etc.) → unchanged
 *   - old "abandoned" path → now falls through to "unknown"
 *   - draftAds() method exists / abandonedAds() method is gone
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

// ─── Import factory ──────────────────────────────────────────────────────────

import adServiceFactory from "../ad";

// ─── Tests ────────────────────────────────────────────────────────────────────

// We test computeAdStatus indirectly via findOne which calls it.
// The function is not exported — we verify observable behaviour via the
// status field added to the returned ad.
// Pattern mirrors ad.approve.zoho.test.ts: adServiceFactory({ strapi })

type MockStrapi = {
  db: {
    query: jest.Mock;
  };
  contentType: jest.Mock;
  query: jest.Mock;
};

describe("computeAdStatus — draft status", () => {
  type AdService = {
    findOne: (
      id: string | number,
      options?: object
    ) => Promise<{ status: string } | null>;
    draftAds: (options?: object) => Promise<unknown>;
    abandonedAds?: (options?: object) => Promise<unknown>;
  };

  const mockStrapi = (global as unknown as { strapi: MockStrapi }).strapi;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("computeAdStatus returns 'draft' when draft === true (no other fields set)", async () => {
    const adService = adServiceFactory({ strapi }) as unknown as AdService;
    mockStrapi.db.query.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        draft: true,
        active: false,
        banned: false,
        rejected: false,
        remaining_days: 0,
        ad_reservation: null,
      }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    });

    const result = await adService.findOne(1);
    expect(result?.status).toBe("draft");
  });

  test("computeAdStatus returns 'draft' when draft === true AND active === true (draft wins)", async () => {
    const adService = adServiceFactory({ strapi }) as unknown as AdService;
    mockStrapi.db.query.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({
        id: 2,
        draft: true,
        active: true,
        banned: false,
        rejected: false,
        remaining_days: 5,
        ad_reservation: null,
      }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    });

    const result = await adService.findOne(2);
    expect(result?.status).toBe("draft");
  });

  test("computeAdStatus still returns 'active' when draft is false/absent and conditions match", async () => {
    const adService = adServiceFactory({ strapi }) as unknown as AdService;
    mockStrapi.db.query.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({
        id: 3,
        draft: false,
        active: true,
        banned: false,
        rejected: false,
        remaining_days: 5,
        ad_reservation: { id: 1 },
      }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    });

    const result = await adService.findOne(3);
    expect(result?.status).toBe("active");
  });

  test("computeAdStatus returns 'unknown' for old 'abandoned' scenario (active=false, is_paid=true, no reservation, remaining_days>0)", async () => {
    const adService = adServiceFactory({ strapi }) as unknown as AdService;
    mockStrapi.db.query.mockReturnValue({
      findOne: jest.fn().mockResolvedValue({
        id: 4,
        draft: false,
        active: false,
        banned: false,
        rejected: false,
        remaining_days: 5,
        ad_reservation: null,
        is_paid: true,
      }),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    });

    const result = await adService.findOne(4);
    // The old "abandoned" branch is removed — this falls through to "unknown"
    expect(result?.status).toBe("unknown");
  });

  test("draftAds() method exists on the service", () => {
    const adService = adServiceFactory({ strapi }) as unknown as AdService;
    expect(typeof adService.draftAds).toBe("function");
  });

  test("abandonedAds() method does NOT exist on the service", () => {
    const adService = adServiceFactory({ strapi }) as unknown as AdService;
    expect(adService.abandonedAds).toBeUndefined();
  });
});
