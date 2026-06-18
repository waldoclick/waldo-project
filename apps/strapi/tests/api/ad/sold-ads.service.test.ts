/**
 * Tests for the soldAds service method (08-04).
 *
 * AAA pattern. Verifies the seller "Vendidos"/down-ads filter shape:
 *   active:false, banned:false, rejected:false, draft:false, remaining_days:0,
 *   scoped by the seller's username, with pagination honored.
 *
 * Mirrors ad.compute-status.test.ts harness (strapi global stub + logtail
 * __esModule default mock so the service never dies in the catch block).
 */

// ─── Mock strapi global ───────────────────────────────────────────────────────
const mockFindMany = jest.fn().mockResolvedValue([]);
const mockCount = jest.fn().mockResolvedValue(0);

(global as unknown as { strapi: object }).strapi = {
  contentType: jest.fn().mockReturnValue({}),
  db: {
    query: jest.fn().mockReturnValue({
      findMany: mockFindMany,
      count: mockCount,
      findOne: jest.fn().mockResolvedValue(null),
    }),
  },
  // ad-view / ad-contact batch count services return empty maps (no N+1)
  service: jest.fn().mockReturnValue({
    getViewCountsByAdIds: jest.fn().mockResolvedValue({}),
    getContactCountsByAdIds: jest.fn().mockResolvedValue({}),
  }),
};

// ─── Mock email / zoho / logger side-effects ─────────────────────────────────
jest.mock("../../../src/services/mjml", () => ({
  sendMjmlEmail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../../../src/services/zoho", () => ({
  zohoService: {
    findContact: jest.fn().mockResolvedValue(null),
    updateContactStats: jest.fn().mockResolvedValue({}),
    createDeal: jest.fn().mockResolvedValue({}),
  },
}));
jest.mock("../../../src/utils/logtail", () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

// ─── Import the service factory ──────────────────────────────────────────────
import adServiceFactory from "../../../src/api/ad/services/ad";

const service = adServiceFactory({
  strapi: (global as unknown as { strapi: object }).strapi,
} as never) as unknown as {
  soldAds: (
    _options: Record<string, unknown>,
    _isManager: boolean,
    _userId: number | null,
  ) => Promise<unknown>;
};

describe("soldAds service (08-04)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);
  });

  it("builds a where filter for down ads scoped by username", async () => {
    // Arrange
    const options = {
      filters: { user: { username: { $eq: "gabo" } } },
      page: 1,
      pageSize: 25,
    };

    // Act
    await service.soldAds(options, true, null);

    // Assert — findMany received the merged default + username filters
    expect(mockFindMany).toHaveBeenCalledTimes(1);
    const findManyArg = mockFindMany.mock.calls[0][0] as {
      where: Record<string, unknown>;
    };
    expect(findManyArg.where).toMatchObject({
      active: { $eq: false },
      banned: { $eq: false },
      rejected: { $eq: false },
      draft: { $eq: false },
      remaining_days: { $eq: 0 },
      user: { username: { $eq: "gabo" } },
    });

    // count uses the same where shape
    const countArg = mockCount.mock.calls[0][0] as {
      where: Record<string, unknown>;
    };
    expect(countArg.where).toMatchObject({
      draft: { $eq: false },
      user: { username: { $eq: "gabo" } },
    });
  });

  it("honors pagination (limit/offset) for page 2", async () => {
    // Arrange
    const options = {
      filters: { user: { username: { $eq: "gabo" } } },
      page: 2,
      pageSize: 10,
    };

    // Act
    await service.soldAds(options, true, null);

    // Assert
    const findManyArg = mockFindMany.mock.calls[0][0] as {
      limit: number;
      offset: number;
    };
    expect(findManyArg.limit).toBe(10);
    expect(findManyArg.offset).toBe(10);
  });
});
