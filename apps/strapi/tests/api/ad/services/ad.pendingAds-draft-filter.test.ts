/**
 * Regression test for pendingAds() ↔ count()'s "review" bucket parity.
 *
 * The `/api/ads/count` "review" bucket (controllers/ad.ts) and the
 * "Pendientes" list (services/ad.ts pendingAds()) must apply the exact same
 * where-clause, or the dashboard badge count and the list length diverge.
 * A draft ad matching every other pending criterion (active:false,
 * banned:false, rejected:false, remaining_days>0, has a featured
 * reservation) used to show up in the list while the badge — which already
 * filtered draft:false — did not count it (found in staging: badge said 1,
 * list showed 2).
 *
 * AAA pattern. Mirrors ad.service.saveDraft.test.ts factory style:
 * adServiceFactory({ strapi }).
 */

jest.mock("../../../../src/services/mjml", () => ({
  sendMjmlEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../../../src/services/zoho", () => ({
  zohoService: {
    findContact: jest.fn().mockResolvedValue(null),
    updateContactStats: jest.fn().mockResolvedValue({}),
    createDeal: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock("../../../../src/utils/logtail", () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import adServiceFactory from "../../../../src/api/ad/services/ad";

const mockDbFindMany = jest.fn();
const mockDbCount = jest.fn();

const mockDbQuery = jest.fn(() => ({
  findMany: mockDbFindMany,
  count: mockDbCount,
}));

(global as unknown as { strapi: object }).strapi = {
  contentType: jest.fn().mockReturnValue({}),
  db: { query: mockDbQuery },
};

type AdService = {
  pendingAds: (
    _options: Record<string, unknown>,
    _isManager: boolean,
    _userId: number | null,
  ) => Promise<{ data: unknown[]; meta: { pagination: unknown } }>;
};

describe("pendingAds() where-clause matches the count() review bucket", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbFindMany.mockResolvedValue([]);
    mockDbCount.mockResolvedValue(0);
  });

  it("filters out drafts (draft: { $eq: false }), same as count()'s review bucket", async () => {
    // Arrange
    const adService = adServiceFactory({ strapi }) as unknown as AdService;

    // Act
    await adService.pendingAds({}, true, null);

    // Assert — both findMany and count must receive the review-bucket filter set
    const findManyWhere = mockDbFindMany.mock.calls[0][0].where;
    const countWhere = mockDbCount.mock.calls[0][0].where;

    for (const where of [findManyWhere, countWhere]) {
      expect(where).toMatchObject({
        active: { $eq: false },
        banned: { $eq: false },
        rejected: { $eq: false },
        draft: { $eq: false },
        remaining_days: { $gt: 0 },
        ad_reservation: { $ne: null },
      });
    }
  });
});
