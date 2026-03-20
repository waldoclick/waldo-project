import { SubscriptionChargeService } from "./subscription-charge.cron";

// Mock logger to prevent actual log output during tests
jest.mock("../utils/logtail", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock OneclickService
jest.mock("../services/oneclick", () => ({
  OneclickService: jest.fn().mockImplementation(() => ({
    authorizeCharge: mockAuthorizeCharge,
  })),
}));

const mockAuthorizeCharge = jest.fn();

// Mock strapi global
const mockFindMany = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

(global as any).strapi = {
  entityService: {
    findMany: mockFindMany,
    create: mockCreate,
    update: mockUpdate,
  },
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
};

// Sample user data
const makeUser = (
  overrides: Partial<{
    id: number;
    documentId: string;
    tbk_user: string;
    pro_expires_at: string;
  }> = {}
) => ({
  id: 42,
  documentId: "abc123xyz456789012345678",
  tbk_user: "tbk-user-stored-token",
  pro_expires_at: "2026-02-20T00:00:00.000Z",
  ...overrides,
});

describe("SubscriptionChargeService", () => {
  let service: SubscriptionChargeService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PRO_MONTHLY_PRICE = "9990";
    service = new SubscriptionChargeService();
  });

  describe("CHRG-01: chargeExpiredSubscriptions queries expired active PRO users", () => {
    it("queries users with pro_status=active and pro_expires_at <= today, then calls authorizeCharge for each", async () => {
      // Arrange
      const user = makeUser();
      // findMany call 1: expired active users
      // findMany call 2: idempotency check (no existing approved payment)
      // findMany call 3: retry candidates
      // findMany call 4: deactivation candidates
      mockFindMany
        .mockResolvedValueOnce([user]) // expired users
        .mockResolvedValueOnce([]) // idempotency check: no approved payment
        .mockResolvedValueOnce([]) // retry candidates
        .mockResolvedValueOnce([]); // deactivation candidates

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
        "plugin::users-permissions.user",
        expect.objectContaining({
          filters: expect.objectContaining({
            pro_status: { $eq: "active" },
          }),
        })
      );
      expect(mockAuthorizeCharge).toHaveBeenCalledWith(
        user.documentId,
        user.tbk_user,
        9990,
        expect.stringContaining("pro-42-"),
        expect.stringContaining("c-42-")
      );
    });
  });

  describe("CHRG-02: Successful charge creates approved subscription-payment and extends pro_expires_at", () => {
    it("creates subscription-payment with status=approved and updates user pro_expires_at +30 days", async () => {
      // Arrange
      const user = makeUser();
      mockFindMany
        .mockResolvedValueOnce([user]) // expired users
        .mockResolvedValueOnce([]) // idempotency: no approved payment
        .mockResolvedValueOnce([]) // retry candidates
        .mockResolvedValueOnce([]); // deactivation candidates

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
      mockUpdate.mockResolvedValueOnce({});

      // Act
      await service.chargeExpiredSubscriptions();

      // Assert: creates approved payment record
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
          }),
        })
      );

      // Assert: extends pro_expires_at by ~30 days
      expect(mockUpdate).toHaveBeenCalledWith(
        "plugin::users-permissions.user",
        user.id,
        expect.objectContaining({
          data: expect.objectContaining({
            pro_expires_at: expect.any(Date),
          }),
        })
      );
    });
  });

  describe("CHRG-05: Idempotency — skips user if approved payment already exists for same period_start", () => {
    it("does not call authorizeCharge if an approved subscription-payment already exists for the period", async () => {
      // Arrange
      const user = makeUser();
      const existingApprovedPayment = {
        id: 5,
        status: "approved",
        period_start: "2026-02-20",
      };
      mockFindMany
        .mockResolvedValueOnce([user]) // expired users
        .mockResolvedValueOnce([existingApprovedPayment]) // idempotency: approved payment found
        .mockResolvedValueOnce([]) // retry candidates
        .mockResolvedValueOnce([]); // deactivation candidates

      // Act
      const result = await service.chargeExpiredSubscriptions();

      // Assert
      expect(result.success).toBe(true);
      expect(mockAuthorizeCharge).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe("CHRG-03 (first failure): Failed charge creates subscription-payment with status=failed and next_charge_attempt=tomorrow", () => {
    it("creates failed payment record with charge_attempts=1 and next_charge_attempt set to tomorrow", async () => {
      // Arrange
      const user = makeUser();
      mockFindMany
        .mockResolvedValueOnce([user]) // expired users
        .mockResolvedValueOnce([]) // idempotency: no approved payment
        .mockResolvedValueOnce([]) // retry candidates
        .mockResolvedValueOnce([]); // deactivation candidates

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
    it("retries failed payment, updates record on success, and extends pro_expires_at", async () => {
      // Arrange
      const user = makeUser();
      const failedPayment = {
        id: 99,
        documentId: "failedpaymentdocid12345",
        charge_attempts: 1,
        next_charge_attempt: "2026-03-19",
        period_start: "2026-02-20",
        user: {
          id: user.id,
          documentId: user.documentId,
          tbk_user: user.tbk_user,
          pro_expires_at: user.pro_expires_at,
        },
      };
      mockFindMany
        .mockResolvedValueOnce([]) // no new expired users (empty to isolate retry test)
        .mockResolvedValueOnce([failedPayment]) // retry candidates
        .mockResolvedValueOnce([]); // deactivation candidates

      mockAuthorizeCharge.mockResolvedValueOnce({
        success: true,
        authorizationCode: "RETRY-AUTH",
        responseCode: 0,
        rawResponse: {
          details: [{ response_code: 0, authorization_code: "RETRY-AUTH" }],
        },
      });
      mockUpdate.mockResolvedValueOnce({}).mockResolvedValueOnce({});

      // Act
      await service.chargeExpiredSubscriptions();

      // Assert: updates existing record to approved
      expect(mockUpdate).toHaveBeenCalledWith(
        "api::subscription-payment.subscription-payment",
        failedPayment.id,
        expect.objectContaining({
          data: expect.objectContaining({
            status: "approved",
            authorization_code: "RETRY-AUTH",
          }),
        })
      );

      // Assert: extends pro_expires_at
      expect(mockUpdate).toHaveBeenCalledWith(
        "plugin::users-permissions.user",
        user.id,
        expect.objectContaining({
          data: expect.objectContaining({
            pro_expires_at: expect.any(Date),
          }),
        })
      );
    });
  });

  describe("CHRG-03 (deactivation): After 3 failed attempts, deactivates user", () => {
    it("sets pro_status=inactive, pro=false, pro_expires_at=null, tbk_user=null after 3 failures", async () => {
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
        .mockResolvedValueOnce([]) // no new expired users
        .mockResolvedValueOnce([]) // retry candidates (charge_attempts < 3)
        .mockResolvedValueOnce([exhaustedPayment]); // deactivation candidates (charge_attempts >= 3)

      mockUpdate.mockResolvedValueOnce({}).mockResolvedValueOnce({});

      // Act
      await service.chargeExpiredSubscriptions();

      // Assert: deactivates user
      expect(mockUpdate).toHaveBeenCalledWith(
        "plugin::users-permissions.user",
        user.id,
        expect.objectContaining({
          data: expect.objectContaining({
            pro_status: "inactive",
            pro: false,
            pro_expires_at: null,
            tbk_user: null,
          }),
        })
      );

      // Assert: marks payment as deactivated
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
      mockFindMany
        .mockResolvedValueOnce([user])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      mockAuthorizeCharge.mockResolvedValueOnce({
        success: true,
        authorizationCode: "AUTH789",
        responseCode: 0,
        rawResponse: {},
      });
      mockCreate.mockResolvedValueOnce({ id: 30 });
      mockUpdate.mockResolvedValueOnce({});

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
