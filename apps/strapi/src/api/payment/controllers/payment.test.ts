import paymentController from "./payment";

// Mock logger
jest.mock("../../../utils/logtail", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock order.utils
const mockCreateAdOrder = jest.fn();
jest.mock("../utils/order.utils", () => ({
  __esModule: true,
  default: { createAdOrder: mockCreateAdOrder },
}));

// Mock general.utils
const mockGenerateFactoDocument = jest.fn();
jest.mock("../utils/general.utils", () => ({
  __esModule: true,
  default: { generateFactoDocument: mockGenerateFactoDocument },
}));

// Mock user.utils
const mockDocumentDetails = jest.fn();
jest.mock("../utils/user.utils", () => ({
  documentDetails: mockDocumentDetails,
  getCurrentUser: jest.fn(),
}));

// Mock ad.service
jest.mock("../services/ad.service", () => ({
  __esModule: true,
  default: {},
}));

// Mock free-ad.service
jest.mock("../services/free-ad.service", () => ({
  __esModule: true,
  default: {},
}));

// Mock checkout.service
jest.mock("../services/checkout.service", () => ({
  __esModule: true,
  default: {},
}));

// Mock pro.service
jest.mock("../services/pro.service", () => ({
  ProService: jest.fn(),
}));

// Mock pro-cancellation.service
jest.mock("../services/pro-cancellation.service", () => ({
  ProCancellationService: jest.fn(),
}));

// Mock ad/services/ad
jest.mock("../../ad/services/ad", () => ({
  computeSortPriority: jest.fn().mockReturnValue(0),
}));

// Mock oneclick service
const mockStartInscription = jest.fn();
const mockFinishInscription = jest.fn();
jest.mock("../../../services/oneclick", () => ({
  OneclickService: jest.fn().mockImplementation(() => ({
    startInscription: mockStartInscription,
    finishInscription: mockFinishInscription,
  })),
  buildOneclickUsername: jest.fn().mockReturnValue("user-doc123"),
}));

// Mock strapi global
const mockEntityServiceFindOne = jest.fn();
const mockEntityServiceUpdate = jest.fn();
const mockDbQueryFindOne = jest.fn();
const mockDbQueryFindMany = jest.fn();
const mockDbQueryUpdate = jest.fn();

(global as any).strapi = {
  entityService: {
    findOne: mockEntityServiceFindOne,
    update: mockEntityServiceUpdate,
    findMany: jest.fn(),
    create: jest.fn(),
  },
  db: {
    query: jest.fn().mockReturnValue({
      findOne: mockDbQueryFindOne,
      findMany: mockDbQueryFindMany.mockResolvedValue([]),
      update: mockDbQueryUpdate,
    }),
  },
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
};

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
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.APP_URL = "http://localhost:1337";
  });

  it("proCreate stores pro_pending_invoice=true when is_invoice=true in request body", async () => {
    // Arrange
    const user = {
      id: 10,
      documentId: "userdoc123456789012345",
      email: "user@example.com",
    };
    mockEntityServiceFindOne.mockResolvedValueOnce(user);
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
    await (paymentController as any).proCreate(ctx);

    // Assert
    expect(mockEntityServiceUpdate).toHaveBeenCalledWith(
      "plugin::users-permissions.user",
      user.id,
      expect.objectContaining({
        data: expect.objectContaining({
          pro_pending_invoice: true,
        }),
      })
    );
  });

  it("proCreate stores pro_pending_invoice=false when is_invoice is omitted", async () => {
    // Arrange
    const user = {
      id: 10,
      documentId: "userdoc123456789012345",
      email: "user@example.com",
    };
    mockEntityServiceFindOne.mockResolvedValueOnce(user);
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
    await (paymentController as any).proCreate(ctx);

    // Assert
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
});

describe("PaymentController: proResponse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FRONTEND_URL = "https://waldo.cl";
    process.env.PRO_MONTHLY_PRICE = "9990";
    process.env.PAYMENT_GATEWAY = "transbank";
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
    await (paymentController as any).proResponse(ctx);

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
    mockDocumentDetails.mockResolvedValueOnce({ name: "Test User", rut: "12345678-9", address: "Calle 1", address_number: 100, postal_code: "7500000" });
    mockGenerateFactoDocument.mockResolvedValueOnce({ id: "facto-doc-2" });
    mockCreateAdOrder.mockResolvedValueOnce({
      success: true,
      order: { documentId: "order-doc-id-456" },
    });

    const ctx = makeCtx({
      query: { TBK_TOKEN: "tbk-test-token" },
    });

    // Act
    await (paymentController as any).proResponse(ctx);

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
    mockDocumentDetails.mockResolvedValueOnce({ name: "Test User", rut: "12345678-9", address: "Calle 1", address_number: 100, postal_code: "7500000" });
    mockGenerateFactoDocument.mockResolvedValueOnce({ id: "facto-doc-3" });
    mockCreateAdOrder.mockResolvedValueOnce({
      success: true,
      order: { documentId: "order-doc-id-789" },
    });

    const ctx = makeCtx({
      query: { TBK_TOKEN: "tbk-test-token" },
    });

    // Act
    await (paymentController as any).proResponse(ctx);

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
    mockDocumentDetails.mockResolvedValueOnce({ name: "Test User", rut: "12345678-9", address: "Calle 1", address_number: 100, postal_code: "7500000" });
    mockGenerateFactoDocument.mockResolvedValueOnce({ id: "facto-doc-4" });
    // Simulate order creation failure
    mockCreateAdOrder.mockRejectedValueOnce(new Error("Order creation failed"));

    const ctx = makeCtx({
      query: { TBK_TOKEN: "tbk-test-token" },
    });

    // Act
    await (paymentController as any).proResponse(ctx);

    // Assert: fallback redirect
    expect(ctx.redirect).toHaveBeenCalledWith(
      "https://waldo.cl/pro/gracias"
    );
  });
});
