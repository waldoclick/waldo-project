/**
 * SEC2-PAYMENT — Regression tests for payment integrity in checkout.service.ts
 *
 * All 4 tests MUST fail (RED state) before Task 2 fixes are applied:
 *   - Test 1: Amount mismatch → reject, no benefit granted
 *   - Test 2: Replay/idempotency → short-circuit to existing order, no second grant
 *   - Test 3: Ad ownership → reject if ad belongs to another user
 *   - Test 4: Fail-closed price → error when AD_FEATURED_PRICE is unset
 */

// ─── Mock heavy dependencies before imports ───────────────────────────────────

jest.mock("../../../../src/utils/logtail", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock("../../../../src/services/zoho", () => ({
  zohoService: {
    findContact: jest.fn().mockResolvedValue(null),
    createDeal: jest.fn().mockResolvedValue({}),
    updateContactStats: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock("../../../../src/api/payment/utils/order.utils", () => ({
  __esModule: true,
  default: {
    createAdOrder: jest.fn().mockResolvedValue({
      success: true,
      order: { documentId: "order-doc-id-123" },
    }),
  },
}));

jest.mock("../../../../src/api/payment/utils/general.utils", () => ({
  __esModule: true,
  default: {
    generateFactoDocument: jest.fn().mockResolvedValue({}),
    PaymentDetails: jest.fn().mockResolvedValue({ items: [] }),
  },
}));

jest.mock("../../../../src/api/payment/utils/user.utils", () => ({
  documentDetails: jest.fn().mockResolvedValue({ name: "Test User" }),
}));

// Mock PaymentUtils barrel — all methods as jest.fn() so we can assert NOT called
jest.mock("../../../../src/api/payment/utils", () => ({
  __esModule: true,
  default: {
    ad: {
      getAdById: jest.fn(),
      updateAdReservation: jest.fn().mockResolvedValue({}),
      updateAdDates: jest.fn().mockResolvedValue({}),
      updateAdFeaturedReservation: jest.fn().mockResolvedValue({}),
      publishAd: jest.fn().mockResolvedValue({}),
    },
    adReservation: {
      getAdReservationAvailable: jest.fn().mockResolvedValue({
        success: true,
        adReservation: { id: 10, total_days: 30 },
      }),
      createAdReservation: jest.fn().mockResolvedValue({
        success: true,
        adReservation: { id: 10 },
      }),
    },
    adFeaturedReservation: {
      createAdFeaturedReservation: jest.fn().mockResolvedValue({
        success: true,
        adFeaturedReservation: { id: 5 },
      }),
    },
    adPack: {
      getAdPack: jest.fn(),
    },
    general: {
      extractIdsFromMeta: jest.fn(),
    },
  },
}));

// ─── Payment gateway mock ─────────────────────────────────────────────────────

const mockCommitTransaction = jest.fn();
const mockCreateTransaction = jest.fn();

jest.mock("../../../../src/services/payment-gateway", () => ({
  getPaymentGateway: jest.fn(() => ({
    commitTransaction: mockCommitTransaction,
    createTransaction: mockCreateTransaction,
  })),
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import checkoutService from "../../../../src/api/payment/services/checkout.service";
import PaymentUtils from "../../../../src/api/payment/utils";

// ─── Typed mock references ────────────────────────────────────────────────────

const mockPublishAd = PaymentUtils.ad.publishAd as jest.Mock;
const mockCreateAdReservation = PaymentUtils.adReservation
  .createAdReservation as jest.Mock;
const mockCreateAdFeaturedReservation = PaymentUtils.adFeaturedReservation
  .createAdFeaturedReservation as jest.Mock;
const mockGetAdReservationAvailable = PaymentUtils.adReservation
  .getAdReservationAvailable as jest.Mock;
const mockUpdateAdReservation = PaymentUtils.ad
  .updateAdReservation as jest.Mock;
const mockUpdateAdDates = PaymentUtils.ad.updateAdDates as jest.Mock;

// ─── strapi global stub ───────────────────────────────────────────────────────

const mockOrderFindOne = jest.fn();
const mockAdPackFindOne = jest.fn();
const mockAdFindOne = jest.fn();

const mockDbQuery = jest.fn().mockImplementation((uid: string) => {
  if (uid === "api::order.order") {
    return { findOne: mockOrderFindOne };
  }
  if (uid === "api::ad-pack.ad-pack") {
    return { findOne: mockAdPackFindOne };
  }
  if (uid === "api::ad.ad") {
    return { findOne: mockAdFindOne };
  }
  return {};
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).strapi = {
  db: {
    query: mockDbQuery,
  },
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a standard AUTHORIZED Webpay response.
 * buy_order format: "order-{userId}-{packId}-{adId}-{featured}-{isInvoice}"
 */
function makeWebpayResponse(options: {
  amount?: number;
  packId?: number;
  adId?: number;
  userId?: string;
  featured?: boolean;
  status?: string;
}) {
  const {
    amount = 5000,
    packId = 1,
    adId = 42,
    userId = "7",
    featured = false,
    status = "AUTHORIZED",
  } = options;

  const featuredFlag = featured ? 1 : 0;
  const buyOrder = `order-${userId}-${packId}-${adId}-${featuredFlag}-0`;

  return {
    success: true,
    response: {
      buy_order: buyOrder,
      amount,
      status,
      authorization_code: "AUTH-001",
    },
  };
}

// ─── Test setup ───────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();

  // Default: no existing order (idempotency not triggered)
  mockOrderFindOne.mockResolvedValue(null);

  // Default: pack record with price 5000
  mockAdPackFindOne.mockResolvedValue({ id: 1, price: 5000 });

  // Default: ad belongs to userId=7
  mockAdFindOne.mockResolvedValue({ id: 42, user: { id: 7 } });

  // Default env
  process.env.AD_FEATURED_PRICE = "3000";
  process.env.PAYMENT_GATEWAY = "transbank";
  process.env.FRONTEND_URL = "https://waldo.click";

  // Default: reservation create succeeds
  mockCreateAdReservation.mockResolvedValue({
    success: true,
    adReservation: { id: 10 },
  });
  mockCreateAdFeaturedReservation.mockResolvedValue({
    success: true,
    adFeaturedReservation: { id: 5 },
  });
  mockGetAdReservationAvailable.mockResolvedValue({
    success: true,
    adReservation: { id: 10, total_days: 30 },
  });
  mockUpdateAdReservation.mockResolvedValue({});
  mockUpdateAdDates.mockResolvedValue({});
  mockPublishAd.mockResolvedValue({});

  // Default: gateway returns AUTHORIZED with amount=5000
  mockCommitTransaction.mockResolvedValue(
    makeWebpayResponse({ amount: 5000, packId: 1, adId: 42, userId: "7" }),
  );
});

// ─── Test 1: Amount mismatch → reject, no benefit ────────────────────────────

describe("SEC2-PAYMENT Test 1 — Amount mismatch is rejected", () => {
  it("returns success:false when response.amount does not match expected pack price", async () => {
    // Arrange
    // Pack price = 5000, featured=false → expectedAmount = 5000
    // Webpay response sends amount = 1 (tampered)
    mockAdPackFindOne.mockResolvedValue({ id: 1, price: 5000 });
    process.env.AD_FEATURED_PRICE = "3000";

    mockCommitTransaction.mockResolvedValue({
      success: true,
      response: {
        buy_order: "order-7-1-42-0-0",
        amount: 1, // tampered — should be 5000
        status: "AUTHORIZED",
        authorization_code: "AUTH-001",
      },
    });

    // Act
    const result = await checkoutService.processWebpayReturn("token-abc");

    // Assert — payment should be rejected
    expect(result.success).toBe(false);

    // Assert — no benefit granted (publishAd and createAdReservation NOT called)
    expect(mockPublishAd).not.toHaveBeenCalled();
    expect(mockCreateAdReservation).not.toHaveBeenCalled();
  });
});

// ─── Test 2: Replay / idempotency ────────────────────────────────────────────

describe("SEC2-PAYMENT Test 2 — Replay is idempotent (no double grant)", () => {
  it("short-circuits to existing order.documentId and does NOT call publishAd or createAdReservation", async () => {
    // Arrange
    // An order with this buy_order already exists in the DB
    mockOrderFindOne.mockResolvedValue({
      id: 1,
      documentId: "abc123",
      buy_order: "order-7-1-42-0-0",
    });

    mockCommitTransaction.mockResolvedValue(
      makeWebpayResponse({
        amount: 5000,
        packId: 1,
        adId: 42,
        userId: "7",
        featured: false,
      }),
    );

    // Act
    const result = await checkoutService.processWebpayReturn("token-replay");

    // Assert — short-circuits to existing documentId
    expect(result.orderDocumentId).toBe("abc123");

    // Assert — no benefit granted again
    expect(mockPublishAd).not.toHaveBeenCalled();
    expect(mockCreateAdReservation).not.toHaveBeenCalled();
    expect(mockCreateAdFeaturedReservation).not.toHaveBeenCalled();
  });
});

// ─── Test 3: Ad ownership → reject if ad belongs to another user ──────────────

describe("SEC2-PAYMENT Test 3 — Ad ownership is verified", () => {
  it("returns success:false when ad.user.id does not match the paying userId", async () => {
    // Arrange
    // buy_order has adId=42, userId=7
    // But the ad is owned by user 99 — different user
    mockAdFindOne.mockResolvedValue({ id: 42, user: { id: 99 } });
    mockAdPackFindOne.mockResolvedValue({ id: 1, price: 5000 });

    mockCommitTransaction.mockResolvedValue(
      makeWebpayResponse({
        amount: 5000,
        packId: 1,
        adId: 42,
        userId: "7",
        featured: false,
      }),
    );

    // Act
    const result = await checkoutService.processWebpayReturn("token-ownership");

    // Assert — rejected due to ownership mismatch
    expect(result.success).toBe(false);

    // Assert — publishAd NOT called
    expect(mockPublishAd).not.toHaveBeenCalled();
  });
});

// ─── Test 4: Fail-closed price when AD_FEATURED_PRICE is unset ───────────────

describe("SEC2-PAYMENT Test 4 — Fail-closed on missing AD_FEATURED_PRICE", () => {
  it("throws or returns failure when AD_FEATURED_PRICE env var is not set (no 10000 fallback)", async () => {
    // Arrange
    delete process.env.AD_FEATURED_PRICE;

    // featured=1 → requires AD_FEATURED_PRICE at commit time
    mockCommitTransaction.mockResolvedValue(
      makeWebpayResponse({
        amount: 8000, // 5000 pack + 3000 featured (but env is gone)
        packId: 1,
        adId: 42,
        userId: "7",
        featured: true,
      }),
    );

    mockAdPackFindOne.mockResolvedValue({ id: 1, price: 5000 });

    // Act — service should reject or throw when AD_FEATURED_PRICE is missing
    let result: { success: boolean; message?: string } | undefined;
    let threw = false;
    try {
      result = await checkoutService.processWebpayReturn("token-noprice");
    } catch {
      threw = true;
    }

    // Assert — either threw (fail-closed) or returned success:false
    // The 10000 fallback must NOT be used silently
    if (!threw) {
      // If it didn't throw, it must have returned failure
      expect(result!.success).toBe(false);
    } else {
      // Threw — that's also acceptable fail-closed behavior
      expect(threw).toBe(true);
    }
  });
});
