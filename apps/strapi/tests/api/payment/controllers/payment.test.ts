// Mock logger
jest.mock("../../../../src/utils/logtail", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock order.utils — use jest.fn() inside factory so hoisting works
jest.mock("../../../../src/api/payment/utils/order.utils", () => ({
  __esModule: true,
  default: { createAdOrder: jest.fn() },
}));

// Mock general.utils
jest.mock("../../../../src/api/payment/utils/general.utils", () => ({
  __esModule: true,
  default: { generateFactoDocument: jest.fn() },
}));

// Mock user.utils
jest.mock("../../../../src/api/payment/utils/user.utils", () => ({
  documentDetails: jest.fn(),
  getCurrentUser: jest.fn().mockResolvedValue({
    id: 10,
    documentId: "userdoc123456789012345",
    email: "user@example.com",
  }),
}));

// Mock ad.service
jest.mock("../../../../src/api/payment/services/ad.service", () => ({
  __esModule: true,
  default: {},
}));

// Mock free-ad.service
jest.mock("../../../../src/api/payment/services/free-ad.service", () => ({
  __esModule: true,
  default: {},
}));

// Mock checkout.service
jest.mock("../../../../src/api/payment/services/checkout.service", () => ({
  __esModule: true,
  default: {},
}));

// Mock pro.service
jest.mock("../../../../src/api/payment/services/pro.service", () => ({
  ProService: jest.fn(),
}));

// Mock pro-cancellation.service
jest.mock(
  "../../../../src/api/payment/services/pro-cancellation.service",
  () => ({
    ProCancellationService: jest.fn(),
  })
);

// Mock ad/services/ad
jest.mock("../../../../src/api/ad/services/ad", () => ({
  computeSortPriority: jest.fn().mockReturnValue(0),
}));

// Mock oneclick service
jest.mock("../../../../src/services/oneclick", () => ({
  OneclickService: jest.fn().mockImplementation(() => ({
    startInscription: jest.fn(),
    finishInscription: jest.fn(),
    authorizeCharge: jest.fn(),
  })),
  buildOneclickUsername: jest.fn().mockReturnValue("user-doc123"),
}));

// Import after mocks are declared (jest.mock hoisting handles the rest)
import paymentController from "../../../../src/api/payment/controllers/payment";
import orderUtilsDefault from "../../../../src/api/payment/utils/order.utils";
import generalUtilsDefault from "../../../../src/api/payment/utils/general.utils";
import * as userUtils from "../../../../src/api/payment/utils/user.utils";
import { OneclickService } from "../../../../src/services/oneclick";

// Typed references to the mock functions
const mockCreateAdOrder = orderUtilsDefault.createAdOrder as jest.Mock;
const mockGenerateFactoDocument =
  generalUtilsDefault.generateFactoDocument as jest.Mock;
const mockDocumentDetails = userUtils.documentDetails as jest.Mock;
const mockGetCurrentUser = userUtils.getCurrentUser as jest.Mock;

// Mock strapi global
const mockDbQueryFindOne = jest.fn();
const mockDbQueryFindMany = jest.fn().mockResolvedValue([]);
const mockDbQueryUpdate = jest.fn();
const mockSubProUpdate = jest.fn();
const mockSubProCreate = jest.fn();
const mockSubProFindOne = jest.fn();
const mockUserUpdate = jest.fn();
const mockSubPayCreate = jest.fn();
const mockDbQuery = jest.fn().mockImplementation((uid: string) => {
  if (uid === "api::subscription-pro.subscription-pro") {
    return {
      findOne: mockSubProFindOne,
      update: mockSubProUpdate,
      create: mockSubProCreate,
    };
  }
  if (uid === "plugin::users-permissions.user") {
    return { update: mockUserUpdate, findOne: mockDbQueryFindOne };
  }
  if (uid === "api::ad.ad") {
    return { findMany: mockDbQueryFindMany, update: mockDbQueryUpdate };
  }
  return {
    findOne: mockDbQueryFindOne,
    findMany: mockDbQueryFindMany,
    update: mockDbQueryUpdate,
  };
});

const mockDocumentsCreate = jest.fn();
Object.assign(global, {
  strapi: {
    db: {
      query: mockDbQuery,
    },
    documents: jest.fn().mockImplementation(() => ({
      create: mockDocumentsCreate,
    })),
    log: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    },
  },
});

const makeCtx = (overrides: Record<string, unknown> = {}) => ({
  state: { user: { id: 10 } },
  request: { body: { data: {} } },
  redirect: jest.fn(),
  throw: jest.fn(),
  status: 200,
  body: null,
  query: {},
  ...overrides,
});

describe("PaymentController: proCreate", () => {
  let mockStartInscription: jest.Mock;
  let mockFinishInscription: jest.Mock;

  const defaultUser = {
    id: 10,
    documentId: "userdoc123456789012345",
    email: "user@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.APP_URL = "http://localhost:1337";

    // Reset OneclickService mock instance methods
    mockStartInscription = jest.fn();
    mockFinishInscription = jest.fn();
    (
      OneclickService as jest.MockedClass<typeof OneclickService>
    ).mockImplementation(
      () =>
        ({
          startInscription: mockStartInscription,
          finishInscription: mockFinishInscription,
        } as unknown as OneclickService)
    );

    // Re-setup getCurrentUser since clearAllMocks clears its return value
    mockGetCurrentUser.mockResolvedValue(defaultUser);

    // Re-attach strapi mock (cleared by clearAllMocks)
    mockDbQueryFindMany.mockResolvedValue([]);
    mockDbQuery.mockImplementation((uid: string) => {
      if (uid === "api::subscription-pro.subscription-pro") {
        return {
          findOne: mockSubProFindOne,
          update: mockSubProUpdate,
          create: mockSubProCreate,
        };
      }
      if (uid === "plugin::users-permissions.user") {
        return { update: mockUserUpdate, findOne: mockDbQueryFindOne };
      }
      if (uid === "api::ad.ad") {
        return { findMany: mockDbQueryFindMany, update: mockDbQueryUpdate };
      }
      return {
        findOne: mockDbQueryFindOne,
        findMany: mockDbQueryFindMany,
        update: mockDbQueryUpdate,
      };
    });
    (
      strapi as unknown as { documents: jest.Mock }
    ).documents.mockImplementation(() => ({
      create: mockDocumentsCreate,
    }));
  });

  it("proCreate stores pending_invoice=true on subscription-pro when is_invoice=true in request body", async () => {
    // Arrange
    mockStartInscription.mockResolvedValueOnce({
      success: true,
      token: "tbk-token-abc",
      urlWebpay: "https://webpay.cl/start",
    });
    // No existing subscription-pro — will create
    mockSubProFindOne.mockResolvedValueOnce(null);
    mockSubProCreate.mockResolvedValueOnce({ id: 1 });

    const ctx = makeCtx({
      request: { body: { data: { is_invoice: true } } },
    });

    // Act
    await paymentController.proCreate(
      ctx as unknown as Parameters<typeof paymentController.proCreate>[0]
    );

    // Assert: pending_invoice stored on subscription-pro record
    expect(mockSubProCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          pending_invoice: true,
        }),
      })
    );
  });

  it("proCreate stores pending_invoice=false on subscription-pro when is_invoice is omitted", async () => {
    // Arrange
    mockStartInscription.mockResolvedValueOnce({
      success: true,
      token: "tbk-token-xyz",
      urlWebpay: "https://webpay.cl/start",
    });
    // No existing subscription-pro — will create
    mockSubProFindOne.mockResolvedValueOnce(null);
    mockSubProCreate.mockResolvedValueOnce({ id: 1 });

    const ctx = makeCtx({
      request: { body: { data: {} } },
    });

    // Act
    await paymentController.proCreate(
      ctx as unknown as Parameters<typeof paymentController.proCreate>[0]
    );

    // Assert: pending_invoice stored on subscription-pro record
    expect(mockSubProCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          pending_invoice: false,
        }),
      })
    );
  });
});

describe("PaymentController: proResponse", () => {
  let mockStartInscription: jest.Mock;
  let mockFinishInscription: jest.Mock;
  let mockAuthorizeCharge: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FRONTEND_URL = "https://waldo.cl";
    process.env.PRO_MONTHLY_PRICE = "9990";
    process.env.PAYMENT_GATEWAY = "transbank";

    mockStartInscription = jest.fn();
    mockFinishInscription = jest.fn();
    mockAuthorizeCharge = jest.fn().mockResolvedValue({
      success: true,
      authorizationCode: "AUTH-TEST-001",
      responseCode: 0,
      rawResponse: {
        details: [{ response_code: 0, authorization_code: "AUTH-TEST-001" }],
      },
    });
    (
      OneclickService as jest.MockedClass<typeof OneclickService>
    ).mockImplementation(
      () =>
        ({
          startInscription: mockStartInscription,
          finishInscription: mockFinishInscription,
          authorizeCharge: mockAuthorizeCharge,
        } as unknown as OneclickService)
    );

    mockDbQueryFindMany.mockResolvedValue([]);
    mockDbQuery.mockImplementation((uid: string) => {
      if (uid === "api::subscription-pro.subscription-pro") {
        return {
          findOne: mockSubProFindOne,
          update: mockSubProUpdate,
          create: mockSubProCreate,
        };
      }
      if (uid === "plugin::users-permissions.user") {
        return { update: mockUserUpdate, findOne: mockDbQueryFindOne };
      }
      if (uid === "api::ad.ad") {
        return { findMany: mockDbQueryFindMany, update: mockDbQueryUpdate };
      }
      return {
        findOne: mockDbQueryFindOne,
        findMany: mockDbQueryFindMany,
        update: mockDbQueryUpdate,
      };
    });
    (
      strapi as unknown as { documents: jest.Mock }
    ).documents.mockImplementation(() => ({
      create: mockDocumentsCreate,
    }));
  });

  it("proResponse creates order + Facto document after successful inscription", async () => {
    // Arrange — subscription-pro record with populated user
    const subPro = {
      id: 5,
      pending_invoice: false,
      user: { id: 10, documentId: "userdoc123456789012345" },
    };
    mockFinishInscription.mockResolvedValueOnce({
      success: true,
      tbkUser: "tbk-user-stored",
      cardType: "Visa",
      last4CardDigits: "1234",
    });
    mockSubProFindOne.mockResolvedValueOnce(subPro);
    mockSubProUpdate.mockResolvedValueOnce({});
    mockDocumentsCreate.mockResolvedValueOnce({ documentId: "payment-doc-1" });
    mockUserUpdate.mockResolvedValueOnce({});
    mockDocumentDetails.mockResolvedValueOnce({
      name: "Test User",
      rut: "12345678-9",
      address: "Calle 1",
      address_number: 100,
      postal_code: "7500000",
    });
    mockGenerateFactoDocument.mockResolvedValueOnce({ id: "facto-doc-1" });
    mockCreateAdOrder.mockResolvedValueOnce({
      success: true,
      order: { documentId: "order-doc-id-123" },
    });

    const ctx = makeCtx({
      query: { TBK_TOKEN: "tbk-test-token" },
    });

    // Act
    await paymentController.proResponse(
      ctx as unknown as Parameters<typeof paymentController.proResponse>[0]
    );

    // Assert
    expect(mockDocumentDetails).toHaveBeenCalledWith(subPro.user.id, false);
    expect(mockGenerateFactoDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        isInvoice: false,
        items: expect.arrayContaining([
          expect.objectContaining({
            name: expect.stringContaining("Suscripcion PRO"),
          }),
        ]),
      })
    );
    expect(mockCreateAdOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: expect.any(Number),
        userId: subPro.user.id,
        is_invoice: false,
      })
    );
  });

  it("proResponse redirects to /pro/pagar/gracias?order={documentId}", async () => {
    // Arrange — subscription-pro record with populated user
    const subPro = {
      id: 5,
      pending_invoice: false,
      user: { id: 10, documentId: "userdoc123456789012345" },
    };
    mockFinishInscription.mockResolvedValueOnce({
      success: true,
      tbkUser: "tbk-user-stored",
      cardType: "Visa",
      last4CardDigits: "1234",
    });
    mockSubProFindOne.mockResolvedValueOnce(subPro);
    mockSubProUpdate.mockResolvedValueOnce({});
    mockDocumentsCreate.mockResolvedValueOnce({ documentId: "payment-doc-2" });
    mockUserUpdate.mockResolvedValueOnce({});
    mockDocumentDetails.mockResolvedValueOnce({
      name: "Test User",
      rut: "12345678-9",
      address: "Calle 1",
      address_number: 100,
      postal_code: "7500000",
    });
    mockGenerateFactoDocument.mockResolvedValueOnce({ id: "facto-doc-2" });
    mockCreateAdOrder.mockResolvedValueOnce({
      success: true,
      order: { documentId: "order-doc-id-456" },
    });

    const ctx = makeCtx({
      query: { TBK_TOKEN: "tbk-test-token" },
    });

    // Act
    await paymentController.proResponse(
      ctx as unknown as Parameters<typeof paymentController.proResponse>[0]
    );

    // Assert
    expect(ctx.redirect).toHaveBeenCalledWith(
      "https://waldo.cl/pro/pagar/gracias?order=order-doc-id-456"
    );
  });

  it("proResponse reads pending_invoice from subscription-pro for Facto document", async () => {
    // Arrange — subscription-pro has pending_invoice=true
    const subPro = {
      id: 5,
      pending_invoice: true,
      user: { id: 10, documentId: "userdoc123456789012345" },
    };
    mockFinishInscription.mockResolvedValueOnce({
      success: true,
      tbkUser: "tbk-user-stored",
      cardType: "Visa",
      last4CardDigits: "1234",
    });
    mockSubProFindOne.mockResolvedValueOnce(subPro);
    mockSubProUpdate.mockResolvedValueOnce({});
    mockDocumentsCreate.mockResolvedValueOnce({ documentId: "payment-doc-3" });
    mockUserUpdate.mockResolvedValueOnce({});
    mockDocumentDetails.mockResolvedValueOnce({
      name: "Test User",
      rut: "12345678-9",
      address: "Calle 1",
      address_number: 100,
      postal_code: "7500000",
    });
    mockGenerateFactoDocument.mockResolvedValueOnce({ id: "facto-doc-3" });
    mockCreateAdOrder.mockResolvedValueOnce({
      success: true,
      order: { documentId: "order-doc-id-789" },
    });

    const ctx = makeCtx({
      query: { TBK_TOKEN: "tbk-test-token" },
    });

    // Act
    await paymentController.proResponse(
      ctx as unknown as Parameters<typeof paymentController.proResponse>[0]
    );

    // Assert: invoice preference (true) read from subscription-pro, passed to documentDetails
    expect(mockDocumentDetails).toHaveBeenCalledWith(subPro.user.id, true);
  });

  it("proResponse still redirects to /pro/gracias if order creation fails", async () => {
    // Arrange
    const subPro = {
      id: 5,
      pending_invoice: false,
      user: { id: 10, documentId: "userdoc123456789012345" },
    };
    mockFinishInscription.mockResolvedValueOnce({
      success: true,
      tbkUser: "tbk-user-stored",
      cardType: "Visa",
      last4CardDigits: "1234",
    });
    mockSubProFindOne.mockResolvedValueOnce(subPro);
    mockSubProUpdate.mockResolvedValueOnce({});
    mockDocumentsCreate.mockResolvedValueOnce({ documentId: "payment-doc-4" });
    mockUserUpdate.mockResolvedValueOnce({});
    mockDocumentDetails.mockResolvedValueOnce({
      name: "Test User",
      rut: "12345678-9",
      address: "Calle 1",
      address_number: 100,
      postal_code: "7500000",
    });
    mockGenerateFactoDocument.mockResolvedValueOnce({ id: "facto-doc-4" });
    // Simulate order creation failure
    mockCreateAdOrder.mockRejectedValueOnce(new Error("Order creation failed"));

    const ctx = makeCtx({
      query: { TBK_TOKEN: "tbk-test-token" },
    });

    // Act
    await paymentController.proResponse(
      ctx as unknown as Parameters<typeof paymentController.proResponse>[0]
    );

    // Assert: fallback redirect
    expect(ctx.redirect).toHaveBeenCalledWith("https://waldo.cl/pro/gracias");
  });
});
