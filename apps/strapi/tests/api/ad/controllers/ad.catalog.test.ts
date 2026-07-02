/**
 * Regression test for the /api/ads/catalog public data leak.
 *
 * catalog() previously called activeAds(options, true, null), where the
 * `true` (isManager) also skipped sanitizeAdForPublic downstream — leaking
 * user password hashes and tokens on this unauthenticated route. It must
 * always call activeAds with isManager=false.
 */

// ─── Capture the controller extension via factories mock ─────────────────────
let capturedExtension: Record<string, (..._args: unknown[]) => unknown> = {};
jest.mock("@strapi/strapi", () => ({
  factories: {
    createCoreController: jest.fn(
      (_uid: string, fn: (..._args: unknown[]) => unknown) => {
        capturedExtension = fn({
          strapi: (global as unknown as { strapi: object }).strapi,
        }) as Record<string, (..._args: unknown[]) => unknown>;
        return capturedExtension;
      },
    ),
  },
}));

// ─── Mock strapi global ───────────────────────────────────────────────────────
const mockActiveAds = jest.fn();

(global as unknown as { strapi: object }).strapi = {
  service: jest.fn().mockReturnValue({ activeAds: mockActiveAds }),
};

// ─── Import controller (triggers jest.mock side effects) ─────────────────────
import "../../../../src/api/ad/controllers/ad";

function makeCtx(overrides: Partial<object> = {}) {
  return {
    query: {},
    throw: jest.fn(),
    ...overrides,
  };
}

describe("catalog controller handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls activeAds with isManager=false and userId=null", async () => {
    // Arrange
    mockActiveAds.mockResolvedValueOnce({ data: [], meta: {} });
    const ctx = makeCtx({ query: { pagination: { pageSize: "1" } } });

    // Act
    await capturedExtension.catalog(ctx);

    // Assert
    expect(mockActiveAds).toHaveBeenCalledWith(expect.any(Object), false, null);
  });
});
