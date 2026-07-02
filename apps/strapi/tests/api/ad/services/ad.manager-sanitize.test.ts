/**
 * Regression test for the manager-role user-data leak.
 *
 * getAdvertisements() (used by activeAds/pendingAds/archivedAds/bannedAds/
 * rejectedAds/draftAds) and findBySlug() both had a branch that returned the
 * raw ad — including the seller's password hash and reset/confirmation
 * tokens — whenever the caller was a manager. `isManager` should only
 * bypass the ownership filter; it must never skip sanitizeAdForPublic.
 *
 * AAA pattern. Mirrors ad.service.saveDraft.test.ts factory style:
 * adServiceFactory({ strapi }).
 */

// ─── Mock email/CRM/logger side effects pulled in by ad.ts's module scope ────

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

const rawUser = {
  id: 7,
  documentId: "user-doc-1",
  username: "carlosperezbozo",
  email: "carlosperezbozo@gmail.com",
  password: "$2a$10$abcdefghijklmnopqrstuvwxyz",
  resetPasswordToken: "reset-token-value",
  confirmationToken: "confirm-token-value",
  rut: "15.715.383-8",
  address: "Maipú",
  birthdate: "1983-08-13",
};

const rawAd = {
  id: 77,
  documentId: "ad-doc-1",
  name: "Lavadora industrial",
  slug: "lavadora-industrial",
  active: true,
  banned: false,
  rejected: false,
  remaining_days: 30,
  draft: false,
  user: rawUser,
  order: null,
  ad_featured_reservation: null,
  details: null,
  gallery: [],
};

const mockDbFindMany = jest.fn();
const mockDbCount = jest.fn();
const mockDbFindOne = jest.fn();

const mockDbQuery = jest.fn(() => ({
  findMany: mockDbFindMany,
  count: mockDbCount,
  findOne: mockDbFindOne,
}));

(global as unknown as { strapi: object }).strapi = {
  contentType: jest.fn().mockReturnValue({}),
  db: { query: mockDbQuery },
};

type Ad = Record<string, unknown>;
type ActiveAdsResult = { data: Ad[]; meta: { pagination: unknown } };
type FindBySlugResult = { ad: Ad; access: { role: string } } | null;

type AdService = {
  activeAds: (
    _options: Record<string, unknown>,
    _isManager: boolean,
    _userId: number | null,
  ) => Promise<ActiveAdsResult>;
  findBySlug: (
    _slug: string,
    _userId?: number | null,
  ) => Promise<FindBySlugResult>;
};

describe("manager-role responses never leak raw user fields", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("activeAds(isManager=true) strips password/tokens from ad.user", async () => {
    // Arrange
    mockDbFindMany.mockResolvedValueOnce([rawAd]);
    mockDbCount.mockResolvedValueOnce(1);
    const adService = adServiceFactory({ strapi }) as unknown as AdService;

    // Act
    const result = await adService.activeAds({}, true, null);

    // Assert
    const returnedUser = result.data[0].user as Record<string, unknown>;
    expect(returnedUser.password).toBeUndefined();
    expect(returnedUser.resetPasswordToken).toBeUndefined();
    expect(returnedUser.confirmationToken).toBeUndefined();
    expect(returnedUser.rut).toBeUndefined();
    expect(returnedUser.username).toBe("carlosperezbozo");
    expect(returnedUser.email).toBe("carlosperezbozo@gmail.com");
  });

  it("findBySlug returns sanitized ad.user for a manager", async () => {
    // Arrange
    mockDbFindOne
      .mockResolvedValueOnce({ ...rawAd, active: true }) // ad lookup
      .mockResolvedValueOnce({
        id: 42,
        role: { name: "manager" },
      }); // user-role lookup
    const adService = adServiceFactory({ strapi }) as unknown as AdService;

    // Act
    const result = await adService.findBySlug("lavadora-industrial", 42);

    // Assert
    expect(result?.access.role).toBe("manager");
    const returnedUser = result?.ad.user as Record<string, unknown>;
    expect(returnedUser.password).toBeUndefined();
    expect(returnedUser.resetPasswordToken).toBeUndefined();
    expect(returnedUser.username).toBe("carlosperezbozo");
  });
});
