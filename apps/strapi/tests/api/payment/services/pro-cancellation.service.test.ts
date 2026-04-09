import { ProCancellationService } from "../../../../src/api/payment/services/pro-cancellation.service";

// Mock logger
jest.mock("../../../../src/utils/logtail", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock OneclickService
const mockDeleteInscription = jest.fn();
jest.mock("../../../../src/services/oneclick", () => ({
  OneclickService: jest.fn().mockImplementation(() => ({
    deleteInscription: mockDeleteInscription,
  })),
}));

// Mock strapi global — service uses strapi.db.query for subscription-pro reads
const mockSubProFindOne = jest.fn();
const mockSubProEntityUpdate = jest.fn();
const mockUserEntityUpdate = jest.fn();

// Factory that routes db.query calls to uid-specific mocks
const mockDbQuery = jest.fn().mockImplementation((uid: string) => {
  if (uid === "api::subscription-pro.subscription-pro") {
    return { findOne: mockSubProFindOne };
  }
  return {};
});

Object.assign(global, {
  strapi: {
    entityService: {
      update: jest
        .fn()
        .mockImplementation((uid: string, _id: number, _params: unknown) => {
          if (uid === "api::subscription-pro.subscription-pro") {
            return mockSubProEntityUpdate(uid, _id, _params);
          }
          return mockUserEntityUpdate(uid, _id, _params);
        }),
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

describe("ProCancellationService", () => {
  let service: ProCancellationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProCancellationService();
  });

  describe("cancelSubscription", () => {
    const userId = 42;
    const userDocumentId = "abc123xyz456789012345678";

    it("fetches tbk_user from subscription-pro, calls deleteInscription, clears subscription-pro tbk_user, updates user with pro_status=cancelled and tbk_user=null, returns { success: true }", async () => {
      // Arrange
      mockSubProFindOne.mockResolvedValueOnce({
        id: 10,
        tbk_user: "tbk-token-xyz",
      });
      mockDeleteInscription.mockResolvedValueOnce({ success: true });
      mockSubProEntityUpdate.mockResolvedValueOnce({});
      mockUserEntityUpdate.mockResolvedValueOnce({});

      // Act
      const result = await service.cancelSubscription(userId, userDocumentId);

      // Assert
      expect(result.success).toBe(true);
      expect(mockDbQuery).toHaveBeenCalledWith(
        "api::subscription-pro.subscription-pro"
      );
      expect(mockSubProFindOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user: { id: userId } },
        })
      );
      expect(mockDeleteInscription).toHaveBeenCalledWith(
        "tbk-token-xyz",
        userDocumentId
      );
      // subscription-pro tbk_user is cleared
      expect(mockSubProEntityUpdate).toHaveBeenCalledWith(
        "api::subscription-pro.subscription-pro",
        10,
        expect.objectContaining({
          data: expect.objectContaining({
            tbk_user: null,
          }),
        })
      );
      // User is updated with pro_status=cancelled and tbk_user=null (dual-write)
      expect(mockUserEntityUpdate).toHaveBeenCalledWith(
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
      mockSubProFindOne.mockResolvedValueOnce({
        id: 10,
        tbk_user: "tbk-token-xyz",
      });
      mockDeleteInscription.mockResolvedValueOnce({ success: true });
      mockSubProEntityUpdate.mockResolvedValueOnce({});
      mockUserEntityUpdate.mockResolvedValueOnce({});

      // Act
      await service.cancelSubscription(userId, userDocumentId);

      // Assert: user update must NOT include pro_expires_at
      const userUpdateCall = mockUserEntityUpdate.mock.calls[0];
      const updateData = userUpdateCall[2].data;
      expect(updateData).not.toHaveProperty("pro_expires_at");
    });

    it("returns { success: false, error } when subscription-pro record has no tbk_user (no active inscription)", async () => {
      // Arrange — subscription-pro exists but tbk_user is null
      mockSubProFindOne.mockResolvedValueOnce({ id: 10, tbk_user: null });

      // Act
      const result = await service.cancelSubscription(userId, userDocumentId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("User has no active inscription");
      expect(mockDeleteInscription).not.toHaveBeenCalled();
      expect(mockSubProEntityUpdate).not.toHaveBeenCalled();
      expect(mockUserEntityUpdate).not.toHaveBeenCalled();
    });

    it("returns { success: false, error } when subscription-pro record does not exist", async () => {
      // Arrange — no subscription-pro record for this user
      mockSubProFindOne.mockResolvedValueOnce(null);

      // Act
      const result = await service.cancelSubscription(userId, userDocumentId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe("User has no active inscription");
      expect(mockDeleteInscription).not.toHaveBeenCalled();
    });

    it("proceeds with cancellation and sets pro_status=cancelled even if Transbank deleteInscription fails", async () => {
      // Arrange
      mockSubProFindOne.mockResolvedValueOnce({
        id: 10,
        tbk_user: "tbk-token-xyz",
      });
      mockDeleteInscription.mockResolvedValueOnce({
        success: false,
        error: new Error("Transbank unavailable"),
      });
      mockSubProEntityUpdate.mockResolvedValueOnce({});
      mockUserEntityUpdate.mockResolvedValueOnce({});

      // Act
      const result = await service.cancelSubscription(userId, userDocumentId);

      // Assert: cancellation proceeds regardless of Transbank failure
      expect(result.success).toBe(true);
      expect(mockUserEntityUpdate).toHaveBeenCalledWith(
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
      mockSubProFindOne.mockResolvedValueOnce({
        id: 10,
        tbk_user: "tbk-token-xyz",
      });
      mockDeleteInscription.mockResolvedValueOnce({ success: true });
      mockSubProEntityUpdate.mockResolvedValueOnce({});
      mockUserEntityUpdate.mockResolvedValueOnce({});

      // Act
      await service.cancelSubscription(userId, userDocumentId);

      // Assert: must be 'cancelled' not 'canceled'
      const userUpdateCall = mockUserEntityUpdate.mock.calls[0];
      expect(userUpdateCall[2].data.pro_status).toBe("cancelled");
    });

    it("queries subscription-pro with correct uid (api::subscription-pro.subscription-pro)", async () => {
      // Arrange
      mockSubProFindOne.mockResolvedValueOnce({ id: 10, tbk_user: "tok" });
      mockDeleteInscription.mockResolvedValueOnce({ success: true });
      mockSubProEntityUpdate.mockResolvedValueOnce({});
      mockUserEntityUpdate.mockResolvedValueOnce({});

      // Act
      await service.cancelSubscription(userId, userDocumentId);

      // Assert: correct UID used for db.query
      expect(mockDbQuery).toHaveBeenCalledWith(
        "api::subscription-pro.subscription-pro"
      );
    });
  });
});
