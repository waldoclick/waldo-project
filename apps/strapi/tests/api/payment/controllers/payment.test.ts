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
const mockEntityServiceFindOne = jest.fn();
const mockEntityServiceUpdate = jest.fn();
const mockDbQueryFindOne = jest.fn();
const mockDbQueryFindMany = jest.fn().mockResolvedValue([]);
const mockDbQueryUpdate = jest.fn();
const mockDbQuery = jest.fn().mockReturnValue({
  findOne: mockDbQueryFindOne,
  findMany: mockDbQueryFindMany,
  update: mockDbQueryUpdate,
});

Object.assign(global, {
  strapi: {
    entityService: {
      findOne: mockEntityServiceFindOne,
      update: mockEntityServiceUpdate,
      findMany: jest.fn(),
      create: jest.fn(),
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
    mockDbQuery.mockReturnValue({
      findOne: mockDbQueryFindOne,
      findMany: mockDbQueryFindMany,
      update: mockDbQueryUpdate,
    });
  });

  it("proCreate stores pro_pending_invoice=true when is_invoice=true in request body", async () => {
    // Arrange
    mockStartInscription.mockResolvedValueOnce({
      success: true,
      token: "tbk-token-abc",
      urlWebpay: "https://webpay.cl/start",
    });
    mockEntityServiceUpdate.mockResolvedValueOnce({});

    const ctx = makeCtx({
      request: { body: { data: { is_invoice: true } } },
    });

    // Act
    await paymentController.proCreate(
      ctx as unknown as Parameters<typeof paymentController.proCreate>[0]
    );

    // Assert
    expect(mockEntityServiceUpdate).toHaveBeenCalledWith(
      "plugin::users-permissions.user",
      defaultUser.id,
      expect.objectContaining({
        data: expect.objectContaining({
          pro_pending_invoice: true,
        }),
      })
    );
  });

  it("proCreate stores pro_pending_invoice=false when is_invoice is omitted", async () => {
    // Arrange
    mockStartInscription.mockResolvedValueOnce({
      success: true,
      token: "tbk-token-xyz",
      urlWebpay: "https://webpay.cl/start",
    });
    mockEntityServiceUpdate.mockResolvedValueOnce({});

    const ctx = makeCtx({
      request: { body: { data: {} } },
    });

    // Act
    await paymentController.proCreate(
      ctx as unknown as Parameters<typeof paymentController.proCreate>[0]
    );

    // Assert
    expect(mockEntityServiceUpdate).toHaveBeenCalledWith(
      "plugin::users-permissions.user",
      defaultUser.id,
      expect.objectContaining({
        data: expect.objectContaining({
          pro_pending_invoice: false,
        }),
      })
    );
  });
});

describe("PaymentController: proResponse", () => {
  let mockStartInscription: jest.Mock;
  let mockFinishInscription: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FRONTEND_URL = "https://waldo.cl";
    process.env.PRO_MONTHLY_PRICE = "9990";
    process.env.PAYMENT_GATEWAY = "transbank";

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

    mockDbQueryFindMany.mockResolvedValue([]);
    mockDbQuery.mockReturnValue({
      findOne: mockDbQueryFindOne,
      findMany: mockDbQueryFindMany,
      update: mockDbQueryUpdate,
    });
  });

  it("proResponse creates order + Facto document after successful inscription", async () => {
    // Arrange
    const user = {
      id: 10,
      documentId: "userdoc123456789012345",
      pro_pending_invoice: false,
    };
    mockFinishInscription.mockResolvedValueOnce({
      success: true,
      tbkUser: "tbk-user-stored",
      cardType: "Visa",
      last4CardDigits: "1234",
    });
    mockDbQueryFindOne.mockResolvedValueOnce(user);
    mockEntityServiceUpdate.mockResolvedValueOnce({});
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
        items: expect.arrayContaining([
          expect.objectContaining({ name: "Suscripcion PRO mensual" }),
        ]),
      })
    );
  });

  it("proResponse redirects to /pro/pagar/gracias?order={documentId}", async () => {
    // Arrange
    const user = {
      id: 10,
      documentId: "userdoc123456789012345",
      pro_pending_invoice: false,
    };
    mockFinishInscription.mockResolvedValueOnce({
      success: true,
      tbkUser: "tbk-user-stored",
      cardType: "Visa",
      last4CardDigits: "1234",
    });
    mockDbQueryFindOne.mockResolvedValueOnce(user);
    mockEntityServiceUpdate.mockResolvedValueOnce({});
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

  it("proResponse clears pro_pending_invoice after use", async () => {
    // Arrange
    const user = {
      id: 10,
      documentId: "userdoc123456789012345",
      pro_pending_invoice: true,
    };
    mockFinishInscription.mockResolvedValueOnce({
      success: true,
      tbkUser: "tbk-user-stored",
      cardType: "Visa",
      last4CardDigits: "1234",
    });
    mockDbQueryFindOne.mockResolvedValueOnce(user);
    mockEntityServiceUpdate.mockResolvedValueOnce({});
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

    // Assert: the user update call includes pro_pending_invoice: false
    expect(mockEntityServiceUpdate).toHaveBeenCalledWith(
      "plugin::users-permissions.user",
      user.id,
      expect.objectContaining({
        data: expect.objectContaining({
          pro_pending_invoice: false,
        }),
      })
    );
  });

  it("proResponse still redirects to /pro/gracias if order creation fails", async () => {
    // Arrange
    const user = {
      id: 10,
      documentId: "userdoc123456789012345",
      pro_pending_invoice: false,
    };
    mockFinishInscription.mockResolvedValueOnce({
      success: true,
      tbkUser: "tbk-user-stored",
      cardType: "Visa",
      last4CardDigits: "1234",
    });
    mockDbQueryFindOne.mockResolvedValueOnce(user);
    mockEntityServiceUpdate.mockResolvedValueOnce({});
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
