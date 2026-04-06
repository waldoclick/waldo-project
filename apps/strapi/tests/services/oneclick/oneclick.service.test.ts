import { OneclickService } from "../../../src/services/oneclick/services/oneclick.service";
import { buildOneclickUsername } from "../../../src/services/oneclick/types/oneclick.types";

// Mock transbank-sdk to isolate OneclickService from actual SDK calls
jest.mock("transbank-sdk", () => {
  const mockStart = jest.fn();
  const mockFinish = jest.fn();
  const mockAuthorize = jest.fn();
  const mockDelete = jest.fn();

  return {
    Oneclick: {
      MallInscription: jest.fn().mockImplementation(() => ({
        start: mockStart,
        finish: mockFinish,
        delete: mockDelete,
      })),
      MallTransaction: jest.fn().mockImplementation(() => ({
        authorize: mockAuthorize,
      })),
    },
    Options: jest.fn(),
    Environment: {
      Integration: "integration",
      Production: "production",
    },
    TransactionDetail: jest
      .fn()
      .mockImplementation((amount, commerceCode, buyOrder) => ({
        amount,
        commerceCode,
        buyOrder,
      })),
    __mockStart: mockStart,
    __mockFinish: mockFinish,
    __mockAuthorize: mockAuthorize,
    __mockDelete: mockDelete,
  };
});

// Mock logger to prevent actual log output during tests
jest.mock("../../../src/utils/logtail", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

interface TransbankSdkMock {
  __mockStart: jest.Mock;
  __mockFinish: jest.Mock;
  __mockAuthorize: jest.Mock;
  __mockDelete: jest.Mock;
}

describe("OneclickService", () => {
  let service: OneclickService;
  const transbankSdk = jest.requireMock<TransbankSdkMock>("transbank-sdk");

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OneclickService();
  });

  describe("startInscription", () => {
    it("calls inscription.start and returns success with token and urlWebpay", async () => {
      // Arrange
      const mockToken = "mock-token-abc123";
      const mockUrl = "https://webpay.transbank.cl/oneclick/initTransaction";
      transbankSdk.__mockStart.mockResolvedValueOnce({
        token: mockToken,
        url_webpay: mockUrl,
      });

      // Act
      const result = await service.startInscription(
        "user-abc123",
        "test@example.com",
        "https://myapp.com/finish"
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.token).toBe(mockToken);
      expect(result.urlWebpay).toBe(mockUrl);
      expect(transbankSdk.__mockStart).toHaveBeenCalledWith(
        "user-abc123",
        "test@example.com",
        "https://myapp.com/finish"
      );
    });

    it("returns success false with error when SDK throws", async () => {
      // Arrange
      const sdkError = new Error("SDK connection failed");
      transbankSdk.__mockStart.mockRejectedValueOnce(sdkError);

      // Act
      const result = await service.startInscription(
        "user-abc123",
        "test@example.com",
        "https://myapp.com/finish"
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(sdkError);
      expect(result.token).toBeUndefined();
      expect(result.urlWebpay).toBeUndefined();
    });
  });

  describe("finishInscription", () => {
    it("calls inscription.finish and returns success with tbkUser, cardType, last4CardDigits", async () => {
      // Arrange
      const mockTbkUser = "tbk-user-xyz";
      const mockCardType = "Visa";
      const mockLast4 = "1234";
      transbankSdk.__mockFinish.mockResolvedValueOnce({
        tbk_user: mockTbkUser,
        card_type: mockCardType,
        card_number: mockLast4,
        response_code: 0,
      });

      // Act
      const result = await service.finishInscription("some-tbk-token");

      // Assert
      expect(result.success).toBe(true);
      expect(result.tbkUser).toBe(mockTbkUser);
      expect(result.cardType).toBe(mockCardType);
      expect(result.last4CardDigits).toBe(mockLast4);
      expect(transbankSdk.__mockFinish).toHaveBeenCalledWith("some-tbk-token");
    });

    it("returns success false with error when SDK throws", async () => {
      // Arrange
      const sdkError = new Error("Inscription finish failed");
      transbankSdk.__mockFinish.mockRejectedValueOnce(sdkError);

      // Act
      const result = await service.finishInscription("some-tbk-token");

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(sdkError);
      expect(result.tbkUser).toBeUndefined();
    });
  });

  describe("authorizeCharge", () => {
    const userDocumentId = "abc123xyz456789012345678";
    const tbkUser = "tbk-user-stored-token";
    const amount = 9990;
    const parentBuyOrder = "pro-42-20260320";
    const childBuyOrder = "c-42-20260320-1";

    it("calls MallTransaction.authorize with correct params and returns success when response_code is 0", async () => {
      // Arrange
      transbankSdk.__mockAuthorize.mockResolvedValueOnce({
        details: [
          {
            response_code: 0,
            authorization_code: "AUTH123",
          },
        ],
      });

      // Act
      const result = await service.authorizeCharge(
        userDocumentId,
        tbkUser,
        amount,
        parentBuyOrder,
        childBuyOrder
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.authorizationCode).toBe("AUTH123");
      expect(result.responseCode).toBe(0);
      expect(transbankSdk.__mockAuthorize).toHaveBeenCalledWith(
        buildOneclickUsername(userDocumentId),
        tbkUser,
        parentBuyOrder,
        expect.arrayContaining([
          expect.objectContaining({ amount, buyOrder: childBuyOrder }),
        ])
      );
    });

    it("returns success false when response_code is non-zero (rejected by Transbank)", async () => {
      // Arrange
      transbankSdk.__mockAuthorize.mockResolvedValueOnce({
        details: [
          {
            response_code: -8,
            authorization_code: undefined,
          },
        ],
      });

      // Act
      const result = await service.authorizeCharge(
        userDocumentId,
        tbkUser,
        amount,
        parentBuyOrder,
        childBuyOrder
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.responseCode).toBe(-8);
      expect(result.authorizationCode).toBeUndefined();
    });

    it("returns success false with error when SDK throws an exception", async () => {
      // Arrange
      const sdkError = new Error("Transbank connection timeout");
      transbankSdk.__mockAuthorize.mockRejectedValueOnce(sdkError);

      // Act
      const result = await service.authorizeCharge(
        userDocumentId,
        tbkUser,
        amount,
        parentBuyOrder,
        childBuyOrder
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(sdkError);
      expect(result.authorizationCode).toBeUndefined();
    });
  });

  describe("deleteInscription", () => {
    const tbkUserToken = "tbk-user-stored-token";
    const userDocId = "abc123xyz456789012345678";

    it("calls inscription.delete with tbkUser and buildOneclickUsername(userDocumentId) and returns { success: true }", async () => {
      // Arrange
      transbankSdk.__mockDelete.mockResolvedValueOnce(undefined);

      // Act
      const result = await service.deleteInscription(tbkUserToken, userDocId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(transbankSdk.__mockDelete).toHaveBeenCalledWith(
        tbkUserToken,
        buildOneclickUsername(userDocId)
      );
    });

    it("returns { success: false, error } when SDK throws", async () => {
      // Arrange
      const sdkError = new Error("Transbank delete failed");
      transbankSdk.__mockDelete.mockRejectedValueOnce(sdkError);

      // Act
      const result = await service.deleteInscription(tbkUserToken, userDocId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(sdkError);
    });
  });
});

describe("buildOneclickUsername", () => {
  it("returns user-{documentId} format", () => {
    // Arrange
    const documentId = "abc123xyz456";

    // Act
    const username = buildOneclickUsername(documentId);

    // Assert
    expect(username).toBe("user-abc123xyz456");
  });

  it("never exceeds 40 characters for standard Strapi documentId", () => {
    // Arrange — Strapi documentIds are 24 chars (5 + 24 = 29 total, safe)
    const documentId = "a".repeat(24);

    // Act
    const username = buildOneclickUsername(documentId);

    // Assert
    expect(username.length).toBeLessThanOrEqual(40);
    expect(username).toBe(`user-${"a".repeat(24)}`);
  });

  it("preserves the documentId in the returned username", () => {
    // Arrange
    const documentId = "someuniquestrapi24charid";

    // Act
    const username = buildOneclickUsername(documentId);

    // Assert
    expect(username).toContain(documentId);
    expect(username.startsWith("user-")).toBe(true);
  });
});
