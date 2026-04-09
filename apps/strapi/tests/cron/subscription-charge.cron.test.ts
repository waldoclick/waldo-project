import { SubscriptionChargeService } from "../../src/cron/subscription-charge.cron";

// Mock logger to prevent actual log output during tests
jest.mock("../../src/utils/logtail", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock OneclickService
jest.mock("../../src/services/oneclick", () => ({
  OneclickService: jest.fn().mockImplementation(() => ({
    authorizeCharge: mockAuthorizeCharge,
  })),
}));

const mockAuthorizeCharge = jest.fn();

// Mock order.utils — use jest.fn() in factory to avoid TDZ hoisting issue
jest.mock("../../src/api/payment/utils/order.utils", () => ({
  __esModule: true,
  default: { createAdOrder: jest.fn() },
}));

// Mock general.utils
jest.mock("../../src/api/payment/utils/general.utils", () => ({
  __esModule: true,
  default: { generateFactoDocument: jest.fn() },
}));

// Mock user.utils documentDetails
jest.mock("../../src/api/payment/utils/user.utils", () => ({
  documentDetails: jest.fn(),
}));

// Import mocked modules to get typed references
import orderUtilsMock from "../../src/api/payment/utils/order.utils";
import generalUtilsMock from "../../src/api/payment/utils/general.utils";
import * as userUtilsMock from "../../src/api/payment/utils/user.utils";

const mockCreateAdOrder = orderUtilsMock.createAdOrder as jest.Mock;
const mockGenerateFactoDocument =
  generalUtilsMock.generateFactoDocument as jest.Mock;
const mockDocumentDetails = userUtilsMock.documentDetails as jest.Mock;

// Mock strapi global
const mockFindMany = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDbQueryFindMany = jest.fn().mockResolvedValue([]);
const mockDbQueryUpdate = jest.fn();
const mockDbQueryFindOne = jest.fn().mockResolvedValue(null);
const mockDbQuery = jest.fn().mockImplementation((uid: string) => {
  if (uid === "api::ad.ad") {
    return {
      findMany: mockDbQueryFindMany,
      update: mockDbQueryUpdate,
    };
  }
  // subscription-pro and others
  return {
    findOne: mockDbQueryFindOne,
    findMany: mockDbQueryFindMany,
    update: mockDbQueryUpdate,
  };
});

Object.assign(global, {
  strapi: {
    entityService: {
      findMany: mockFindMany,
      create: mockCreate,
      update: mockUpdate,
    },
    db: {
      query: mockDbQuery,
    },
    log: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    },
  },
});

// Sample user data — tbk_user lives in subscription_pro (canonical source after migration)
const makeUser = (
  overrides: Partial<{
    id: number;
    documentId: string;
    subscription_pro: { tbk_user: string; pending_invoice?: boolean } | null;
  }> = {}
) => ({
  id: 42,
  documentId: "abc123xyz456789012345678",
  subscription_pro: { tbk_user: "tbk-user-stored-token" },
  ...overrides,
});

describe("SubscriptionChargeService", () => {
  let service: SubscriptionChargeService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PRO_MONTHLY_PRICE = "9990";
    service = new SubscriptionChargeService();
  });

  describe("CHRG-01: chargeExpiredSubscriptions queries due subscription-payment records", () => {
    it("queries subscription-payment records with period_end <= today and status=approved, then calls authorizeCharge for each", async () => {
      // Arrange
      const user = makeUser();
      const duePayment = { id: 1, period_end: "2026-02-20", user };
      // Step 1: due payments from subscription-payment
      // Step 2: retry candidates (failed with charge_attempts < 3)
      // Step 3: exhausted records (charge_attempts >= 3)
      // Step 4: expired cancelled payments
      mockFindMany
        .mockResolvedValueOnce([duePayment]) // Step 1: due subscription payments
        .mockResolvedValueOnce([]) // Step 2: retry candidates
        .mockResolvedValueOnce([]) // Step 3: exhausted candidates
        .mockResolvedValueOnce([]); // Step 4: expired cancelled payments

      mockAuthorizeCharge.mockResolvedValueOnce({
        success: true,
        authorizationCode: "AUTH123",
        responseCode: 0,
        rawResponse: {
          details: [{ response_code: 0, authorization_code: "AUTH123" }],
        },
      });
      mockCreate.mockResolvedValueOnce({ id: 1 });

      // Act
      const result = await service.chargeExpiredSubscriptions();

      // Assert
      expect(result.success).toBe(true);
      expect(mockFindMany).toHaveBeenCalledWith(
        "api::subscription-payment.subscription-payment",
        expect.objectContaining({
          filters: expect.objectContaining({
            status: { $eq: "approved" },
            period_end: { $lte: expect.any(String) },
            user: { pro_status: { $eq: "active" } },
          }),
        })
      );
      expect(mockAuthorizeCharge).toHaveBeenCalledWith(
        user.documentId,
        user.subscription_pro!.tbk_user,
        9990,
        expect.stringContaining("pro-42-"),
        expect.stringContaining("c-42-")
      );
    });
  });

  describe("CHRG-01b: Users with missing subscription_pro.tbk_user are skipped", () => {
    it("skips user and logs warn when subscription_pro is null", async () => {
      // Arrange
      const userNoSubPro = makeUser({ subscription_pro: null });
      const duePayment = {
        id: 1,
        period_end: "2026-02-20",
        user: userNoSubPro,
      };
      mockFindMany
        .mockResolvedValueOnce([duePayment]) // Step 1: due payments
        .mockResolvedValueOnce([]) // Step 2: retry candidates
        .mockResolvedValueOnce([]) // Step 3: exhausted candidates
        .mockResolvedValueOnce([]); // Step 4: expired cancelled payments

      // Act
      const result = await service.chargeExpiredSubscriptions();

      // Assert: skipped, no charge attempted
      expect(result.success).toBe(true);
      expect(mockAuthorizeCharge).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("skips user and logs warn when subscription_pro.tbk_user is falsy", async () => {
      // Arrange
      const userEmptyTbk = makeUser({ subscription_pro: { tbk_user: "" } });
      const duePayment = {
        id: 1,
        period_end: "2026-02-20",
        user: userEmptyTbk,
      };
      mockFindMany
        .mockResolvedValueOnce([duePayment]) // Step 1: due payments
        .mockResolvedValueOnce([]) // Step 2: retry candidates
        .mockResolvedValueOnce([]) // Step 3: exhausted candidates
        .mockResolvedValueOnce([]); // Step 4: expired cancelled payments

      // Act
      const result = await service.chargeExpiredSubscriptions();

      // Assert: skipped, no charge attempted
      expect(result.success).toBe(true);
      expect(mockAuthorizeCharge).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe("CHRG-02: Successful charge creates approved subscription-payment with period_end", () => {
    it("creates subscription-payment with status=approved and period_end — does NOT update user pro_status (already active)", async () => {
      // Arrange
      const user = makeUser();
      const duePayment = { id: 1, period_end: "2026-02-20", user };
      mockFindMany
        .mockResolvedValueOnce([duePayment]) // Step 1: due payments
        .mockResolvedValueOnce([]) // Step 2: retry candidates
        .mockResolvedValueOnce([]) // Step 3: exhausted candidates
        .mockResolvedValueOnce([]); // Step 4: expired cancelled payments

      const authResponse = {
        success: true,
        authorizationCode: "AUTH456",
        responseCode: 0,
        rawResponse: {
          details: [{ response_code: 0, authorization_code: "AUTH456" }],
        },
      };
      mockAuthorizeCharge.mockResolvedValueOnce(authResponse);
      mockCreate.mockResolvedValueOnce({ id: 10 });

      // Act
      await service.chargeExpiredSubscriptions();

      // Assert: creates new approved payment record with period_end
      expect(mockCreate).toHaveBeenCalledWith(
        "api::subscription-payment.subscription-payment",
        expect.objectContaining({
          data: expect.objectContaining({
            user: user.id,
            amount: 9990,
            status: "approved",
            authorization_code: "AUTH456",
            response_code: 0,
            charge_attempts: 1,
            period_end: expect.any(String),
          }),
        })
      );

      // Assert: NO user update for period extension (cron no longer writes pro_expires_at on user)
      expect(mockUpdate).not.toHaveBeenCalledWith(
        "plugin::users-permissions.user",
        user.id,
        expect.objectContaining({
          data: expect.objectContaining({
            pro_status: "active",
          }),
        })
      );
    });
  });

  describe("CHRG-03 (first failure): Failed charge creates subscription-payment with status=failed and period_end", () => {
    it("creates failed payment record with charge_attempts=1, next_charge_attempt=tomorrow, and period_end", async () => {
      // Arrange
      const user = makeUser();
      const duePayment = { id: 1, period_end: "2026-02-20", user };
      mockFindMany
        .mockResolvedValueOnce([duePayment]) // Step 1: due payments
        .mockResolvedValueOnce([]) // Step 2: retry candidates
        .mockResolvedValueOnce([]) // Step 3: exhausted candidates
        .mockResolvedValueOnce([]); // Step 4: expired cancelled payments

      mockAuthorizeCharge.mockResolvedValueOnce({
        success: false,
        responseCode: -8,
        rawResponse: { details: [{ response_code: -8 }] },
      });
      mockCreate.mockResolvedValueOnce({ id: 20 });

      // Act
      await service.chargeExpiredSubscriptions();

      // Assert
      expect(mockCreate).toHaveBeenCalledWith(
        "api::subscription-payment.subscription-payment",
        expect.objectContaining({
          data: expect.objectContaining({
            status: "failed",
            charge_attempts: 1,
            next_charge_attempt: expect.any(String),
            period_end: expect.any(String),
          }),
        })
      );

      // next_charge_attempt should be tomorrow (1 day from today)
      const createCall = mockCreate.mock.calls[0][1];
      const nextAttemptDate = new Date(createCall.data.next_charge_attempt);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(nextAttemptDate.toISOString().split("T")[0]).toBe(
        tomorrow.toISOString().split("T")[0]
      );
    });
  });

  describe("CHRG-03 (retry): Finds failed payments with charge_attempts < 3 and retries authorize", () => {
    it("retries failed payment, updates record on success with period_end — does NOT update user pro_status", async () => {
      // Arrange
      const user = makeUser();
      const failedPayment = {
        id: 99,
        documentId: "failedpaymentdocid12345",
        charge_attempts: 1,
        next_charge_attempt: "2026-03-19",
        period_start: "2026-02-20",
        period_end: "2026-03-01",
        user: {
          id: user.id,
          documentId: user.documentId,
          subscription_pro: { tbk_user: user.subscription_pro!.tbk_user },
        },
      };
      mockFindMany
        .mockResolvedValueOnce([]) // Step 1: no new due payments (isolates retry test)
        .mockResolvedValueOnce([failedPayment]) // Step 2: retry candidates
        .mockResolvedValueOnce([]) // Step 3: exhausted candidates
        .mockResolvedValueOnce([]); // Step 4: expired cancelled payments

      mockAuthorizeCharge.mockResolvedValueOnce({
        success: true,
        authorizationCode: "RETRY-AUTH",
        responseCode: 0,
        rawResponse: {
          details: [{ response_code: 0, authorization_code: "RETRY-AUTH" }],
        },
      });
      mockUpdate.mockResolvedValueOnce({});

      // Act
      await service.chargeExpiredSubscriptions();

      // Assert: updates existing record to approved with period_end
      expect(mockUpdate).toHaveBeenCalledWith(
        "api::subscription-payment.subscription-payment",
        failedPayment.id,
        expect.objectContaining({
          data: expect.objectContaining({
            status: "approved",
            authorization_code: "RETRY-AUTH",
            period_end: expect.any(String),
          }),
        })
      );

      // Assert: cron does NOT update user pro_status on retry success (user is already active)
      expect(mockUpdate).not.toHaveBeenCalledWith(
        "plugin::users-permissions.user",
        user.id,
        expect.anything()
      );
    });
  });

  describe("CHRG-03 (deactivation): After 3 failed attempts, deactivates user", () => {
    it("sets pro_status=inactive after 3 failures — does NOT set pro_expires_at or tbk_user on user", async () => {
      // Arrange
      const user = makeUser();
      const exhaustedPayment = {
        id: 77,
        documentId: "exhaustedpaymentdoc12345",
        charge_attempts: 3,
        status: "failed",
        user: { id: user.id, documentId: user.documentId },
      };
      mockFindMany
        .mockResolvedValueOnce([]) // Step 1: no new due payments
        .mockResolvedValueOnce([]) // Step 2: no retry candidates
        .mockResolvedValueOnce([exhaustedPayment]) // Step 3: deactivation candidates
        .mockResolvedValueOnce([]); // Step 4: expired cancelled payments

      mockUpdate.mockResolvedValueOnce({}).mockResolvedValueOnce({});

      // Act
      await service.chargeExpiredSubscriptions();

      // Assert: deactivates user using pro_status only (pro_expires_at and tbk_user not touched on user)
      expect(mockUpdate).toHaveBeenCalledWith(
        "plugin::users-permissions.user",
        user.id,
        expect.objectContaining({
          data: expect.objectContaining({
            pro_status: "inactive",
          }),
        })
      );

      // Assert: user update does NOT include pro_expires_at or tbk_user
      const userUpdateCall = mockUpdate.mock.calls.find(
        (call) => call[0] === "plugin::users-permissions.user"
      );
      expect(userUpdateCall).toBeDefined();
      expect(userUpdateCall![2].data).not.toHaveProperty("pro_expires_at");
      expect(userUpdateCall![2].data).not.toHaveProperty("tbk_user");

      // Assert: marks payment record as deactivated
      expect(mockUpdate).toHaveBeenCalledWith(
        "api::subscription-payment.subscription-payment",
        exhaustedPayment.id,
        expect.objectContaining({
          data: expect.objectContaining({
            status: "deactivated",
          }),
        })
      );
    });
  });

  describe("CANC-04: Step 4 cancelled-expiry sweep", () => {
    it("finds subscription-payment records with status=approved, period_end <= today, and user pro_status=cancelled — deactivates user with pro_status=inactive", async () => {
      // Arrange
      const cancelledUser = { id: 55, documentId: "cancelleduserid12345678" };
      const cancelledPayment = { id: 100, user: cancelledUser };
      mockFindMany
        .mockResolvedValueOnce([]) // Step 1: no due payments
        .mockResolvedValueOnce([]) // Step 2: no retry candidates
        .mockResolvedValueOnce([]) // Step 3: no exhausted candidates
        .mockResolvedValueOnce([cancelledPayment]); // Step 4: expired cancelled payments

      mockUpdate.mockResolvedValueOnce({});

      // Act
      const result = await service.chargeExpiredSubscriptions();

      // Assert
      expect(result.success).toBe(true);
      expect(mockFindMany).toHaveBeenCalledWith(
        "api::subscription-payment.subscription-payment",
        expect.objectContaining({
          filters: expect.objectContaining({
            status: { $eq: "approved" },
            period_end: { $lte: expect.any(String) },
            user: { pro_status: { $eq: "cancelled" } },
          }),
        })
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        "plugin::users-permissions.user",
        cancelledUser.id,
        expect.objectContaining({
          data: expect.objectContaining({
            pro_status: "inactive",
          }),
        })
      );

      // Assert: user update does NOT include pro_expires_at or tbk_user
      const userUpdateCall = mockUpdate.mock.calls.find(
        (call) => call[0] === "plugin::users-permissions.user"
      );
      expect(userUpdateCall).toBeDefined();
      expect(userUpdateCall![2].data).not.toHaveProperty("pro_expires_at");
      expect(userUpdateCall![2].data).not.toHaveProperty("tbk_user");
    });

    it("does NOT call authorizeCharge for cancelled users (card already deleted)", async () => {
      // Arrange
      const cancelledUser = { id: 55, documentId: "cancelleduserid12345678" };
      const cancelledPayment = { id: 100, user: cancelledUser };
      mockFindMany
        .mockResolvedValueOnce([]) // Step 1: no due payments
        .mockResolvedValueOnce([]) // Step 2: no retry candidates
        .mockResolvedValueOnce([]) // Step 3: no exhausted candidates
        .mockResolvedValueOnce([cancelledPayment]); // Step 4: expired cancelled payments

      mockUpdate.mockResolvedValueOnce({});

      // Act
      await service.chargeExpiredSubscriptions();

      // Assert: authorizeCharge must never be called for cancelled users
      expect(mockAuthorizeCharge).not.toHaveBeenCalled();
    });

    it("Step 4 returns empty when no expired cancelled payments exist", async () => {
      // Arrange — Step 4 returns empty (no expired cancelled payments)
      mockFindMany
        .mockResolvedValueOnce([]) // Step 1: no due payments
        .mockResolvedValueOnce([]) // Step 2: no retry candidates
        .mockResolvedValueOnce([]) // Step 3: no exhausted candidates
        .mockResolvedValueOnce([]); // Step 4: no expired cancelled payments

      // Act
      const result = await service.chargeExpiredSubscriptions();

      // Assert: no updates performed
      expect(result.success).toBe(true);
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("recalculates sort_priority for deactivated cancelled users' ads", async () => {
      // Arrange
      const cancelledUser = { id: 55, documentId: "cancelleduserid12345678" };
      const cancelledPayment = { id: 100, user: cancelledUser };
      const mockAd = {
        id: 100,
        sort_priority: 0,
        ad_featured_reservation: null,
        user: { id: 55, pro_status: "cancelled" },
      };
      mockFindMany
        .mockResolvedValueOnce([]) // Step 1: no due payments
        .mockResolvedValueOnce([]) // Step 2: no retry candidates
        .mockResolvedValueOnce([]) // Step 3: no exhausted candidates
        .mockResolvedValueOnce([cancelledPayment]); // Step 4: expired cancelled payments

      mockUpdate.mockResolvedValueOnce({});
      mockDbQueryFindMany.mockResolvedValueOnce([mockAd]);
      mockDbQueryUpdate.mockResolvedValueOnce({});

      // Act
      await service.chargeExpiredSubscriptions();

      // Assert: strapi.db.query was used to find and potentially update the ad
      expect(mockDbQuery).toHaveBeenCalledWith("api::ad.ad");
    });

    it("deduplicates users when multiple cancelled payment records exist for same user", async () => {
      // Arrange — two payment records for same cancelled user
      const cancelledUser = { id: 55, documentId: "cancelleduserid12345678" };
      const cancelledPayment1 = { id: 100, user: cancelledUser };
      const cancelledPayment2 = { id: 101, user: cancelledUser };
      mockFindMany
        .mockResolvedValueOnce([]) // Step 1
        .mockResolvedValueOnce([]) // Step 2
        .mockResolvedValueOnce([]) // Step 3
        .mockResolvedValueOnce([cancelledPayment1, cancelledPayment2]); // Step 4

      mockUpdate.mockResolvedValue({});

      // Act
      await service.chargeExpiredSubscriptions();

      // Assert: user update called only once despite two payment records
      const userUpdateCalls = mockUpdate.mock.calls.filter(
        (call) => call[0] === "plugin::users-permissions.user"
      );
      expect(userUpdateCalls).toHaveLength(1);
    });
  });

  describe("chargeUser order+Facto creation", () => {
    it("chargeUser creates order + Facto document on successful charge", async () => {
      // Arrange
      const user = makeUser();
      const duePayment = { id: 1, period_end: "2026-02-20", user };
      mockFindMany
        .mockResolvedValueOnce([duePayment]) // Step 1: due payments
        .mockResolvedValueOnce([]) // Step 2: retry candidates
        .mockResolvedValueOnce([]) // Step 3: exhausted candidates
        .mockResolvedValueOnce([]); // Step 4: expired cancelled payments

      mockAuthorizeCharge.mockResolvedValueOnce({
        success: true,
        authorizationCode: "AUTH-ORDER",
        responseCode: 0,
        rawResponse: {
          details: [{ response_code: 0, authorization_code: "AUTH-ORDER" }],
        },
      });
      mockCreate.mockResolvedValueOnce({ id: 50 });
      mockDocumentDetails.mockResolvedValueOnce({
        name: "Test User",
        rut: "12345678-9",
        address: "Calle 1",
        address_number: 100,
        postal_code: "7500000",
      });
      mockGenerateFactoDocument.mockResolvedValueOnce({ id: "facto-cron-1" });
      mockCreateAdOrder.mockResolvedValueOnce({
        success: true,
        order: { documentId: "order-cron-1" },
      });

      // Act
      await service.chargeExpiredSubscriptions();

      // Assert
      expect(mockDocumentDetails).toHaveBeenCalledWith(user.id, false);
      expect(mockGenerateFactoDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          isInvoice: false,
          items: expect.arrayContaining([
            expect.objectContaining({ name: "Suscripcion PRO mensual" }),
          ]),
        })
      );
      expect(mockCreateAdOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 9990,
          userId: user.id,
          is_invoice: false,
        })
      );
    });

    it("creates subscription-payment with period_end even when order creation fails", async () => {
      // Arrange
      const user = makeUser();
      const duePayment = { id: 1, period_end: "2026-02-20", user };
      mockFindMany
        .mockResolvedValueOnce([duePayment]) // Step 1: due payments
        .mockResolvedValueOnce([]) // Step 2: retry candidates
        .mockResolvedValueOnce([]) // Step 3: exhausted candidates
        .mockResolvedValueOnce([]); // Step 4: expired cancelled payments

      mockAuthorizeCharge.mockResolvedValueOnce({
        success: true,
        authorizationCode: "AUTH-FAIL-ORDER",
        responseCode: 0,
        rawResponse: {
          details: [
            { response_code: 0, authorization_code: "AUTH-FAIL-ORDER" },
          ],
        },
      });
      mockCreate.mockResolvedValueOnce({ id: 51 });
      mockDocumentDetails.mockResolvedValueOnce({
        name: "Test User",
        rut: "12345678-9",
        address: "Calle 1",
        address_number: 100,
        postal_code: "7500000",
      });
      // Simulate Facto/order failure
      mockGenerateFactoDocument.mockRejectedValueOnce(
        new Error("Facto service unavailable")
      );

      // Act
      const result = await service.chargeExpiredSubscriptions();

      // Assert: cron still succeeds
      expect(result.success).toBe(true);

      // Assert: subscription-payment was created with period_end (before the order failure)
      expect(mockCreate).toHaveBeenCalledWith(
        "api::subscription-payment.subscription-payment",
        expect.objectContaining({
          data: expect.objectContaining({
            period_end: expect.any(String),
          }),
        })
      );
    });
  });

  describe("CHRG-04: PRO_MONTHLY_PRICE env var", () => {
    it("throws a descriptive error if PRO_MONTHLY_PRICE is not set", async () => {
      // Arrange
      delete process.env.PRO_MONTHLY_PRICE;

      // Act
      const result = await service.chargeExpiredSubscriptions();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/PRO_MONTHLY_PRICE/);
    });

    it("uses the amount from PRO_MONTHLY_PRICE env var when calling authorizeCharge", async () => {
      // Arrange
      process.env.PRO_MONTHLY_PRICE = "14990";
      const user = makeUser();
      const duePayment = { id: 1, period_end: "2026-02-20", user };
      mockFindMany
        .mockResolvedValueOnce([duePayment]) // Step 1: due payments
        .mockResolvedValueOnce([]) // Step 2: retry candidates
        .mockResolvedValueOnce([]) // Step 3: exhausted candidates
        .mockResolvedValueOnce([]); // Step 4: expired cancelled payments

      mockAuthorizeCharge.mockResolvedValueOnce({
        success: true,
        authorizationCode: "AUTH789",
        responseCode: 0,
        rawResponse: {},
      });
      mockCreate.mockResolvedValueOnce({ id: 30 });

      // Act
      await service.chargeExpiredSubscriptions();

      // Assert
      expect(mockAuthorizeCharge).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        14990,
        expect.any(String),
        expect.any(String)
      );
    });
  });
});
