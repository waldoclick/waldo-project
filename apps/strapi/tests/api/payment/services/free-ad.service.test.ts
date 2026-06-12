// Mock logger to prevent log output during tests
jest.mock("../../../../src/utils/logtail", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock PaymentUtils barrel — all ad and adReservation methods as jest.fn()
jest.mock("../../../../src/api/payment/utils", () => ({
  __esModule: true,
  default: {
    ad: {
      getAdById: jest.fn(),
      updateAdReservation: jest.fn(),
      updateAdDates: jest.fn(),
      publishAd: jest.fn(),
    },
    adReservation: {
      getAdReservationAvailable: jest.fn(),
    },
  },
}));

// Mock mjml email sender — non-fatal, must not affect test outcomes
jest.mock("../../../../src/services/mjml", () => ({
  sendMjmlEmail: jest.fn().mockResolvedValue(undefined),
}));

import freeAdService from "../../../../src/api/payment/services/free-ad.service";
import PaymentUtils from "../../../../src/api/payment/utils";

// Typed access to mocks
const mockGetAdById = PaymentUtils.ad.getAdById as jest.Mock;
const mockUpdateAdReservation = PaymentUtils.ad
  .updateAdReservation as jest.Mock;
const mockUpdateAdDates = PaymentUtils.ad.updateAdDates as jest.Mock;
const mockPublishAd = PaymentUtils.ad.publishAd as jest.Mock;
const mockGetAdReservationAvailable = PaymentUtils.adReservation
  .getAdReservationAvailable as jest.Mock;

// Minimal strapi global stub required by service internals
beforeEach(() => {
  jest.clearAllMocks();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).strapi = {
    log: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  };
  process.env.FRONTEND_URL = "https://waldo.click";
  process.env.ADMIN_EMAILS = "admin@waldo.click";
});

// ─── Helper factories ─────────────────────────────────────────────────────────

function makeForeignAd() {
  return {
    id: 1,
    slug: "test-ad",
    user: {
      id: 999,
      email: "other@example.cl",
      firstname: "Other",
      lastname: "User",
    },
  };
}

function makeOwnedAd(userId: number | string = 123) {
  return {
    id: 1,
    slug: "test-ad",
    user: {
      id: userId,
      email: "owner@example.cl",
      firstname: "Owner",
      lastname: "User",
    },
  };
}

function makeReservation(total_days = 15) {
  return {
    success: true,
    adReservation: { id: 5, total_days },
  };
}

// ─── Test suites ──────────────────────────────────────────────────────────────

describe("processFreeAd — ownership guard (SEC-IDOR-FREEAD)", () => {
  it("returns forbidden and performs no mutation when ad belongs to another user", async () => {
    // Arrange
    mockGetAdById.mockResolvedValue({ success: true, ad: makeForeignAd() });
    const userId = "123";

    // Act
    const result = await freeAdService.processFreeAd(1, userId, "free");

    // Assert
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Forbidden/);
    expect(mockUpdateAdReservation).not.toHaveBeenCalled();
    expect(mockPublishAd).not.toHaveBeenCalled();
    expect(mockUpdateAdDates).not.toHaveBeenCalled();
  });

  it("proceeds and publishes when ad belongs to the calling user", async () => {
    // Arrange
    mockGetAdById.mockResolvedValue({
      success: true,
      ad: makeOwnedAd(123),
    });
    mockGetAdReservationAvailable.mockResolvedValue(makeReservation(15));
    mockUpdateAdReservation.mockResolvedValue({ success: true });
    mockPublishAd.mockResolvedValue({ success: true });
    const userId = "123";

    // Act
    const result = await freeAdService.processFreeAd(1, userId, "free");

    // Assert
    expect(result.success).toBe(true);
    expect(mockPublishAd).toHaveBeenCalledWith(1);
  });

  it("handles string/number id mismatch as same owner (String-safe compare)", async () => {
    // Arrange: ad user.id is a number (123), userId is a string ("123")
    mockGetAdById.mockResolvedValue({
      success: true,
      ad: makeOwnedAd(123),
    });
    mockGetAdReservationAvailable.mockResolvedValue(makeReservation(15));
    mockUpdateAdReservation.mockResolvedValue({ success: true });
    mockPublishAd.mockResolvedValue({ success: true });
    const userId = "123"; // string

    // Act
    const result = await freeAdService.processFreeAd(1, userId, "free");

    // Assert: String("123") === String(123) → same owner → publishes
    expect(result.success).toBe(true);
    expect(mockPublishAd).toHaveBeenCalledWith(1);
  });
});
