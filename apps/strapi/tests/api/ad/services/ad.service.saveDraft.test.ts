/**
 * Characterization + injection tests for ad.service saveDraft (Wave 0 regression gate).
 *
 * Covers CODACY-FIX ad/services/ad.ts:1142 (`adId = ad.ad_id as number | undefined`
 * is uncoerced HTTP payload → NoSQL operator-injection on the UPDATE ownership/where path).
 *
 * Test map:
 *   1. CREATE branch — payload without ad_id → strapi.service().create called, db update NOT called. (PASSES NOW)
 *   2. UPDATE branch — numeric ad_id, matching owner → db.query findOne/update called with where.id === number. (PASSES NOW)
 *   3. INJECTION — ad_id = { $gt: 0 } → update must NOT be called.
 *      RED by design until 01-02 applies `Number(ad.ad_id)`:
 *        - Today: `ad.ad_id as number` passes the object through, `!adId` is false (truthy object),
 *          so the UPDATE branch runs and `update()` IS called → assertion fails (RED).
 *        - After 01-02: `Number({$gt:0})` === NaN, `!adId` is true, the CREATE branch runs,
 *          `update()` is never called → assertion passes (GREEN).
 *
 * AAA pattern. Mirrors ad.compute-status.test.ts factory style: adServiceFactory({ strapi }).
 */

// ─── Mock email service ───────────────────────────────────────────────────────

jest.mock("../../../../src/services/mjml", () => ({
  sendMjmlEmail: jest.fn().mockResolvedValue(undefined),
}));

// ─── Mock Zoho service ───────────────────────────────────────────────────────

jest.mock("../../../../src/services/zoho", () => ({
  zohoService: {
    findContact: jest.fn().mockResolvedValue(null),
    updateContactStats: jest.fn().mockResolvedValue({}),
    createDeal: jest.fn().mockResolvedValue({}),
  },
}));

// ─── Mock logger ─────────────────────────────────────────────────────────────

jest.mock("../../../../src/utils/logtail", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// ─── Import factory (after mocks) ────────────────────────────────────────────

import adServiceFactory from "../../../../src/api/ad/services/ad";

// ─── Typed mock references ────────────────────────────────────────────────────

const mockServiceCreate = jest.fn();
const mockDbFindOne = jest.fn();
const mockDbUpdate = jest.fn();

const mockDbQuery = jest.fn(() => ({
  findOne: mockDbFindOne,
  update: mockDbUpdate,
}));

const mockService = jest.fn(() => ({
  create: mockServiceCreate,
}));

(global as unknown as { strapi: object }).strapi = {
  contentType: jest.fn().mockReturnValue({}),
  service: mockService,
  db: { query: mockDbQuery },
};

type SaveDraftResult = { success: boolean; id?: number; message?: string };

type AdService = {
  saveDraft: (
    _ad: Record<string, unknown>,
    _userId: string,
  ) => Promise<SaveDraftResult>;
};

const basePayload = {
  name: "Excavadora CAT",
  description: "Equipo en buen estado",
  price: "1000000",
  currency: "CLP",
};

describe("ad.service saveDraft", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockServiceCreate.mockResolvedValue({ id: 101 });
    mockDbUpdate.mockResolvedValue({});
  });

  it("CREATE branch: payload without ad_id calls create, never calls update", async () => {
    // Arrange
    const adService = adServiceFactory({ strapi }) as unknown as AdService;

    // Act
    const result = await adService.saveDraft({ ...basePayload }, "7");

    // Assert
    expect(mockServiceCreate).toHaveBeenCalledTimes(1);
    expect(mockDbUpdate).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true, id: 101 });
  });

  it("UPDATE branch: numeric ad_id with matching owner re-checks ownership then updates with where.id === that number", async () => {
    // Arrange
    mockDbFindOne.mockResolvedValue({ id: 42, user: { id: 7 } });
    const adService = adServiceFactory({ strapi }) as unknown as AdService;

    // Act
    const result = await adService.saveDraft(
      { ...basePayload, ad_id: 42 },
      "7",
    );

    // Assert — ownership re-check queried id 42
    expect(mockDbFindOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 42 } }),
    );
    // Assert — update targeted the same scalar id, create NOT used
    expect(mockDbUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 42 } }),
    );
    expect(mockServiceCreate).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true, id: 42 });
  });

  it("INJECTION (RED until 01-02): ad_id = { $gt: 0 } must NOT reach an update with an operator object", async () => {
    // Arrange — ownership lookup would match if the UPDATE branch is (wrongly) entered
    mockDbFindOne.mockResolvedValue({ id: 99, user: { id: 7 } });
    const adService = adServiceFactory({ strapi }) as unknown as AdService;

    // Act — operator-injection payload as the ad id
    await adService.saveDraft({ ...basePayload, ad_id: { $gt: 0 } }, "7");

    // Assert — RED by design until 01-02 applies Number(ad.ad_id):
    //   Today `ad.ad_id as number` keeps the object, `!adId` is falsy → UPDATE branch
    //   runs and update() IS called (assertion fails).
    //   After 01-02 `Number({$gt:0})` === NaN → CREATE branch → update() never called.
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });
});
