import { ProCancellationService } from "../pro-cancellation.service";

// Mock logger
jest.mock("../../../../utils/logtail", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock OneclickService
const mockDeleteInscription = jest.fn();
jest.mock("../../../../services/oneclick", () => ({
  OneclickService: jest.fn().mockImplementation(() => ({
    deleteInscription: mockDeleteInscription,
  })),
}));

// Mock strapi global
const mockFindOne = jest.fn();
const mockUpdate = jest.fn();

Object.assign(global, {
  strapi: {
    entityService: {
      findOne: mockFindOne,
      update: mockUpdate,
    },
    log: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    },
  },
});

describe("ProCancellationService", () => {
  let service: ProCancellationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProCancellationService();
  });

  describe("cancelSubscription", () => {
    const userId = 42;
    const userDocumentId = "abc123xyz456789012345678";

    it("fetches user tbk_user, calls deleteInscription, updates user with pro_status=cancelled and tbk_user=null, returns { success: true }", async () => {
      // Arrange
      mockFindOne.mockResolvedValueOnce({
        id: userId,
        tbk_user: "tbk-token-xyz",
      });
      mockDeleteInscription.mockResolvedValueOnce({ success: true });
      mockUpdate.mockResolvedValueOnce({});

      // Act
      const result = await service.cancelSubscription(userId, userDocumentId);

      // Assert
      expect(result.success).toBe(true);
      expect(mockFindOne).toHaveBeenCalledWith(
        "plugin::users-permissions.user",
        userId,
        expect.objectContaining({
          fields: expect.arrayContaining(["tbk_user"]),
        })
      );
      expect(mockDeleteInscription).toHaveBeenCalledWith(
        "tbk-token-xyz",
        userDocumentId
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        "plugin::users-permissions.user",
        userId,
        expect.objectContaining({
          data: expect.objectContaining({
            pro_status: "cancelled",
            tbk_user: null,
          }),
        })
      );
    });

    it("does NOT change pro_expires_at — period-end expiry must be preserved (CANC-02)", async () => {
      // Arrange
      mockFindOne.mockResolvedValueOnce({
        id: userId,
        tbk_user: "tbk-token-xyz",
      });
      mockDeleteInscription.mockResolvedValueOnce({ success: true });
      mockUpdate.mockResolvedValueOnce({});

      // Act
      await service.cancelSubscription(userId, userDocumentId);

      // Assert: update must NOT include pro_expires_at
      const updateCall = mockUpdate.mock.calls[0];
      const updateData = updateCall[2].data;
      expect(updateData).not.toHaveProperty("pro_expires_at");
    });

    it("returns { success: false, error } when user has no tbk_user (no active inscription)", async () => {
      // Arrange
      mockFindOne.mockResolvedValueOnce({ id: userId, tbk_user: null });

      // Act
      const result = await service.cancelSubscription(userId, userDocumentId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("User has no active inscription");
      expect(mockDeleteInscription).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("proceeds with cancellation and sets pro_status=cancelled even if Transbank deleteInscription fails", async () => {
      // Arrange
      mockFindOne.mockResolvedValueOnce({
        id: userId,
        tbk_user: "tbk-token-xyz",
      });
      mockDeleteInscription.mockResolvedValueOnce({
        success: false,
        error: new Error("Transbank unavailable"),
      });
      mockUpdate.mockResolvedValueOnce({});

      // Act
      const result = await service.cancelSubscription(userId, userDocumentId);

      // Assert: cancellation proceeds regardless of Transbank failure
      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        "plugin::users-permissions.user",
        userId,
        expect.objectContaining({
          data: expect.objectContaining({
            pro_status: "cancelled",
            tbk_user: null,
          }),
        })
      );
    });

    it("sets pro_status to 'cancelled' (British spelling, per schema enum)", async () => {
      // Arrange
      mockFindOne.mockResolvedValueOnce({
        id: userId,
        tbk_user: "tbk-token-xyz",
      });
      mockDeleteInscription.mockResolvedValueOnce({ success: true });
      mockUpdate.mockResolvedValueOnce({});

      // Act
      await service.cancelSubscription(userId, userDocumentId);

      // Assert: must be 'cancelled' not 'canceled'
      const updateCall = mockUpdate.mock.calls[0];
      expect(updateCall[2].data.pro_status).toBe("cancelled");
    });
  });
});
