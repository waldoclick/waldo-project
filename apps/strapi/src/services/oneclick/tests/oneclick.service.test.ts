import { OneclickService } from "../services/oneclick.service";
import { buildOneclickUsername } from "../types/oneclick.types";

// Mock transbank-sdk to isolate OneclickService from actual SDK calls
jest.mock("transbank-sdk", () => {
  const mockStart = jest.fn();
  const mockFinish = jest.fn();

  return {
    Oneclick: {
      MallInscription: jest.fn().mockImplementation(() => ({
        start: mockStart,
        finish: mockFinish,
      })),
    },
    Options: jest.fn(),
    Environment: {
      Integration: "integration",
      Production: "production",
    },
    __mockStart: mockStart,
    __mockFinish: mockFinish,
  };
});

// Mock logger to prevent actual log output during tests
jest.mock("../../../utils/logtail", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe("OneclickService", () => {
  let service: OneclickService;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const transbankSdk = require("transbank-sdk");

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
        urlWebpay: mockUrl,
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
        tbkUser: mockTbkUser,
        cardType: mockCardType,
        last4CardDigits: mockLast4,
        responseCode: 0,
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
