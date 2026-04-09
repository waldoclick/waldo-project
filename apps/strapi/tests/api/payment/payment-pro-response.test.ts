import PaymentController from "../../../src/api/payment/controllers/payment";
import type { Context } from "koa";

// Mock logger to prevent log output during tests
jest.mock("../../../src/utils/logtail", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock OneclickService
const mockFinishInscription = jest.fn();
const mockAuthorizeCharge = jest.fn();
jest.mock("../../../src/services/oneclick", () => ({
  OneclickService: jest.fn().mockImplementation(() => ({
    finishInscription: mockFinishInscription,
    authorizeCharge: mockAuthorizeCharge,
    startInscription: jest.fn(),
  })),
  buildOneclickUsername: jest.fn().mockReturnValue("oneclick-username"),
}));

// Mock order utils
jest.mock("../../../src/api/payment/utils/order.utils", () => ({
  __esModule: true,
  default: { createAdOrder: jest.fn() },
}));

// Mock general utils
jest.mock("../../../src/api/payment/utils/general.utils", () => ({
  __esModule: true,
  default: {
    generateFactoDocument: jest.fn(),
    PaymentDetails: jest.fn(),
  },
}));

// Mock user utils
jest.mock("../../../src/api/payment/utils/user.utils", () => ({
  documentDetails: jest.fn(),
  getCurrentUser: jest.fn(),
}));

// Mock computeSortPriority
jest.mock("../../../src/api/ad/services/ad", () => ({
  computeSortPriority: jest.fn().mockReturnValue(0),
}));

import orderUtilsMock from "../../../src/api/payment/utils/order.utils";
import generalUtilsMock from "../../../src/api/payment/utils/general.utils";
import * as userUtilsMock from "../../../src/api/payment/utils/user.utils";

const mockCreateAdOrder = orderUtilsMock.createAdOrder as jest.Mock;
const mockGenerateFactoDocument =
  generalUtilsMock.generateFactoDocument as jest.Mock;
const mockDocumentDetails = userUtilsMock.documentDetails as jest.Mock;

// Mock strapi global — use routing pattern to dispatch by UID
const mockSubProFindOne = jest.fn();
const mockAdFindMany = jest.fn().mockResolvedValue([]);
const mockEntityServiceCreate = jest.fn();
const mockEntityServiceUpdate = jest.fn();

const mockDbQuery = jest.fn().mockImplementation((uid: string) => {
  if (uid === "api::subscription-pro.subscription-pro") {
    return { findOne: mockSubProFindOne };
  }
  if (uid === "api::ad.ad") {
    return {
      findMany: mockAdFindMany,
      update: jest.fn().mockResolvedValue({}),
    };
  }
  return {};
});

Object.assign(global, {
  strapi: {
    entityService: {
      create: mockEntityServiceCreate,
      update: mockEntityServiceUpdate,
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

// Helpers
function makeTbkToken(value = "TBK-TOKEN-ABC123") {
  return value;
}

function makeSubPro(
  overrides: Partial<{
    id: number;
    pending_invoice: boolean;
    user: { id: number; documentId: string };
  }> = {}
) {
  return {
    id: 10,
    pending_invoice: false,
    user: { id: 42, documentId: "abc123xyz456789012345678" },
    ...overrides,
  };
}

function makeContext(
  queryParams: Record<string, string> = {}
): Partial<Context> & { redirect: jest.Mock } {
  return {
    query: queryParams,
    request: { body: { data: {} } } as unknown as Context["request"],
    state: { user: { id: 42 } },
    redirect: jest.fn(),
    throw: jest.fn() as unknown as Context["throw"],
    body: undefined,
    status: 200,
  };
}

function makeFinishInscriptionSuccess(tbkUser = "stored-tbk-user-token") {
  return {
    success: true,
    tbkUser,
    cardType: "Visa",
    last4CardDigits: "4321",
  };
}

function makeAuthorizeChargeSuccess() {
  return {
    success: true,
    authorizationCode: "AUTH-PRO-001",
    responseCode: 0,
    rawResponse: {
      details: [{ response_code: 0, authorization_code: "AUTH-PRO-001" }],
    },
  };
}

describe("proResponse charge-before-activate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PRO_MONTHLY_PRICE = "9990";
    process.env.FRONTEND_URL = "https://waldo.cl";
    mockAdFindMany.mockResolvedValue([]);
  });

  describe("successful inscription + charge", () => {
    it("should call authorizeCharge BEFORE updating user pro_status", async () => {
      // Arrange
      const tbkToken = makeTbkToken();
      const ctx = makeContext({ TBK_TOKEN: tbkToken });
      const subPro = makeSubPro();

      mockFinishInscription.mockResolvedValueOnce(
        makeFinishInscriptionSuccess()
      );
      mockSubProFindOne.mockResolvedValueOnce(subPro);
      mockAuthorizeCharge.mockResolvedValueOnce(makeAuthorizeChargeSuccess());
      mockEntityServiceUpdate.mockResolvedValue({});
      mockEntityServiceCreate.mockResolvedValueOnce({
        id: 200,
        documentId: "payment-doc-id",
      });
      mockDocumentDetails.mockResolvedValueOnce({ name: "Test User" });
      mockGenerateFactoDocument.mockResolvedValueOnce({ id: "facto-1" });
      mockCreateAdOrder.mockResolvedValueOnce({
        success: true,
        order: { documentId: "order-pro-1" },
      });

      // Act
      await PaymentController.proResponse(ctx as unknown as Context);

      // Assert: authorizeCharge was called
      expect(mockAuthorizeCharge).toHaveBeenCalledWith(
        subPro.user.documentId,
        "stored-tbk-user-token",
        expect.any(Number),
        expect.stringContaining("pro-inscription-"),
        expect.stringContaining("c-")
      );

      // Assert: user pro_status update came AFTER authorizeCharge
      const authorizeChargeCallOrder =
        mockAuthorizeCharge.mock.invocationCallOrder[0];
      const userUpdateCalls = mockEntityServiceUpdate.mock.calls.filter(
        (call) => call[0] === "plugin::users-permissions.user"
      );
      expect(userUpdateCalls.length).toBeGreaterThan(0);
      const userUpdateCallOrder =
        mockEntityServiceUpdate.mock.invocationCallOrder[
          mockEntityServiceUpdate.mock.calls.indexOf(userUpdateCalls[0])
        ];
      expect(authorizeChargeCallOrder).toBeLessThan(userUpdateCallOrder);
    });

    it("should update subscription-pro record with card data after successful charge", async () => {
      // Arrange
      const tbkToken = makeTbkToken();
      const ctx = makeContext({ TBK_TOKEN: tbkToken });
      const subPro = makeSubPro();

      mockFinishInscription.mockResolvedValueOnce(
        makeFinishInscriptionSuccess("tbk-card-token-xyz")
      );
      mockSubProFindOne.mockResolvedValueOnce(subPro);
      mockAuthorizeCharge.mockResolvedValueOnce(makeAuthorizeChargeSuccess());
      mockEntityServiceUpdate.mockResolvedValue({});
      mockEntityServiceCreate.mockResolvedValueOnce({ id: 200 });
      mockDocumentDetails.mockResolvedValueOnce({ name: "Test User" });
      mockGenerateFactoDocument.mockResolvedValueOnce({ id: "facto-1" });
      mockCreateAdOrder.mockResolvedValueOnce({
        success: true,
        order: { documentId: "order-pro-1" },
      });

      // Act
      await PaymentController.proResponse(ctx as unknown as Context);

      // Assert: subscription-pro updated with tbk_user, card data, inscription_token cleared
      expect(mockEntityServiceUpdate).toHaveBeenCalledWith(
        "api::subscription-pro.subscription-pro",
        subPro.id,
        expect.objectContaining({
          data: expect.objectContaining({
            tbk_user: "tbk-card-token-xyz",
            card_type: "Visa",
            card_last4: "4321",
            inscription_token: null,
          }),
        })
      );
    });

    it("should set pro_status to active only after charge succeeds — does NOT include pro_expires_at", async () => {
      // Arrange
      const tbkToken = makeTbkToken();
      const ctx = makeContext({ TBK_TOKEN: tbkToken });
      const subPro = makeSubPro();

      mockFinishInscription.mockResolvedValueOnce(
        makeFinishInscriptionSuccess()
      );
      mockSubProFindOne.mockResolvedValueOnce(subPro);
      mockAuthorizeCharge.mockResolvedValueOnce(makeAuthorizeChargeSuccess());
      mockEntityServiceUpdate.mockResolvedValue({});
      mockEntityServiceCreate.mockResolvedValueOnce({ id: 200 });
      mockDocumentDetails.mockResolvedValueOnce({ name: "Test User" });
      mockGenerateFactoDocument.mockResolvedValueOnce({ id: "facto-1" });
      mockCreateAdOrder.mockResolvedValueOnce({
        success: true,
        order: { documentId: "order-pro-1" },
      });

      // Act
      await PaymentController.proResponse(ctx as unknown as Context);

      // Assert: user updated with pro_status=active only
      const userUpdateCall = mockEntityServiceUpdate.mock.calls.find(
        (call) => call[0] === "plugin::users-permissions.user"
      );
      expect(userUpdateCall).toBeDefined();
      expect(userUpdateCall![2].data).toEqual(
        expect.objectContaining({ pro_status: "active" })
      );
      // Must NOT include pro_expires_at (field no longer exists on user)
      expect(userUpdateCall![2].data).not.toHaveProperty("pro_expires_at");
    });

    it("should create first subscription-payment with period_end and status=approved", async () => {
      // Arrange
      const tbkToken = makeTbkToken();
      const ctx = makeContext({ TBK_TOKEN: tbkToken });
      const subPro = makeSubPro();

      mockFinishInscription.mockResolvedValueOnce(
        makeFinishInscriptionSuccess()
      );
      mockSubProFindOne.mockResolvedValueOnce(subPro);
      mockAuthorizeCharge.mockResolvedValueOnce(makeAuthorizeChargeSuccess());
      mockEntityServiceUpdate.mockResolvedValue({});
      mockEntityServiceCreate.mockResolvedValueOnce({ id: 200 });
      mockDocumentDetails.mockResolvedValueOnce({ name: "Test User" });
      mockGenerateFactoDocument.mockResolvedValueOnce({ id: "facto-1" });
      mockCreateAdOrder.mockResolvedValueOnce({
        success: true,
        order: { documentId: "order-pro-1" },
      });

      // Act
      await PaymentController.proResponse(ctx as unknown as Context);

      // Assert: subscription-payment created with period_end and all required fields
      expect(mockEntityServiceCreate).toHaveBeenCalledWith(
        "api::subscription-payment.subscription-payment",
        expect.objectContaining({
          data: expect.objectContaining({
            user: subPro.user.id,
            status: "approved",
            period_start: expect.any(String),
            period_end: expect.any(String),
            amount: expect.any(Number),
            charge_attempts: 1,
          }),
        })
      );
    });

    it("should redirect to /pro/pagar/gracias with order documentId on success", async () => {
      // Arrange
      const tbkToken = makeTbkToken();
      const ctx = makeContext({ TBK_TOKEN: tbkToken });
      const subPro = makeSubPro();

      mockFinishInscription.mockResolvedValueOnce(
        makeFinishInscriptionSuccess()
      );
      mockSubProFindOne.mockResolvedValueOnce(subPro);
      mockAuthorizeCharge.mockResolvedValueOnce(makeAuthorizeChargeSuccess());
      mockEntityServiceUpdate.mockResolvedValue({});
      mockEntityServiceCreate.mockResolvedValueOnce({ id: 200 });
      mockDocumentDetails.mockResolvedValueOnce({ name: "Test User" });
      mockGenerateFactoDocument.mockResolvedValueOnce({ id: "facto-1" });
      mockCreateAdOrder.mockResolvedValueOnce({
        success: true,
        order: { documentId: "pro-order-doc-id" },
      });

      // Act
      await PaymentController.proResponse(ctx as unknown as Context);

      // Assert: redirect to /pro/pagar/gracias with the order documentId
      expect(ctx.redirect).toHaveBeenCalledWith(
        "https://waldo.cl/pro/pagar/gracias?order=pro-order-doc-id"
      );
    });
  });

  describe("charge failure", () => {
    it("should NOT activate user when charge fails", async () => {
      // Arrange
      const tbkToken = makeTbkToken();
      const ctx = makeContext({ TBK_TOKEN: tbkToken });
      const subPro = makeSubPro();

      mockFinishInscription.mockResolvedValueOnce(
        makeFinishInscriptionSuccess()
      );
      mockSubProFindOne.mockResolvedValueOnce(subPro);
      mockAuthorizeCharge.mockResolvedValueOnce({
        success: false,
        responseCode: -8,
        rawResponse: { details: [{ response_code: -8 }] },
      });

      // Act
      await PaymentController.proResponse(ctx as unknown as Context);

      // Assert: user was NOT updated (pro_status remains unchanged)
      const userUpdateCall = mockEntityServiceUpdate.mock.calls.find(
        (call) => call[0] === "plugin::users-permissions.user"
      );
      expect(userUpdateCall).toBeUndefined();
    });

    it("should NOT update subscription-pro with card data when charge fails", async () => {
      // Arrange
      const tbkToken = makeTbkToken();
      const ctx = makeContext({ TBK_TOKEN: tbkToken });
      const subPro = makeSubPro();

      mockFinishInscription.mockResolvedValueOnce(
        makeFinishInscriptionSuccess()
      );
      mockSubProFindOne.mockResolvedValueOnce(subPro);
      mockAuthorizeCharge.mockResolvedValueOnce({
        success: false,
        responseCode: -8,
        rawResponse: {},
      });

      // Act
      await PaymentController.proResponse(ctx as unknown as Context);

      // Assert: subscription-pro was NOT updated with card data
      const subProUpdateCall = mockEntityServiceUpdate.mock.calls.find(
        (call) => call[0] === "api::subscription-pro.subscription-pro"
      );
      expect(subProUpdateCall).toBeUndefined();
    });

    it("should redirect to /pro/error?reason=charge-failed when charge fails", async () => {
      // Arrange
      const tbkToken = makeTbkToken();
      const ctx = makeContext({ TBK_TOKEN: tbkToken });
      const subPro = makeSubPro();

      mockFinishInscription.mockResolvedValueOnce(
        makeFinishInscriptionSuccess()
      );
      mockSubProFindOne.mockResolvedValueOnce(subPro);
      mockAuthorizeCharge.mockResolvedValueOnce({
        success: false,
        responseCode: -8,
        rawResponse: {},
      });

      // Act
      await PaymentController.proResponse(ctx as unknown as Context);

      // Assert
      expect(ctx.redirect).toHaveBeenCalledWith(
        "https://waldo.cl/pro/error?reason=charge-failed"
      );
    });
  });

  describe("inscription failure", () => {
    it("should redirect to /pro/error?reason=rejected when finishInscription fails", async () => {
      // Arrange
      const tbkToken = makeTbkToken();
      const ctx = makeContext({ TBK_TOKEN: tbkToken });

      mockFinishInscription.mockResolvedValueOnce({
        success: false,
        tbkUser: null,
      });

      // Act
      await PaymentController.proResponse(ctx as unknown as Context);

      // Assert
      expect(ctx.redirect).toHaveBeenCalledWith(
        "https://waldo.cl/pro/error?reason=rejected"
      );
      expect(mockAuthorizeCharge).not.toHaveBeenCalled();
    });

    it("should redirect to /pro/error?reason=cancelled when TBK_TOKEN is missing", async () => {
      // Arrange — no TBK_TOKEN in query params
      const ctx = makeContext({});

      // Act
      await PaymentController.proResponse(ctx as unknown as Context);

      // Assert
      expect(ctx.redirect).toHaveBeenCalledWith(
        "https://waldo.cl/pro/error?reason=cancelled"
      );
      expect(mockFinishInscription).not.toHaveBeenCalled();
      expect(mockAuthorizeCharge).not.toHaveBeenCalled();
    });
  });
});
