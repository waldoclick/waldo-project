import { migrateSubscriptionPro } from "../../src/bootstrap/migrate-subscription-pro";

// Mock logger to prevent actual log output during tests
jest.mock("../../src/utils/logtail", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Import logger to assert on log calls
import logger from "../../src/utils/logtail";

// Mock strapi global
const mockUserFindMany = jest.fn();
const mockSubProFindOne = jest.fn();
const mockCreate = jest.fn();

// db.query factory: routes to uid-specific mock implementations
const mockDbQuery = jest.fn().mockImplementation((uid: string) => {
  if (uid === "plugin::users-permissions.user") {
    return { findMany: mockUserFindMany };
  }
  if (uid === "api::subscription-pro.subscription-pro") {
    return { findOne: mockSubProFindOne };
  }
  return {};
});

Object.assign(global, {
  strapi: {
    entityService: {
      create: mockCreate,
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

describe("migrateSubscriptionPro", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("active and cancelled users with tbk_user get subscription-pro records", () => {
    it("creates a subscription-pro record for each user with tbk_user set", async () => {
      // Arrange
      const activeUser = {
        id: 1,
        tbk_user: "tbk-token-active",
        pro_card_type: "Visa Débito",
        pro_card_last4: "1234",
        pro_inscription_token: "insc-token-active",
        pro_pending_invoice: false,
      };
      const cancelledUser = {
        id: 2,
        tbk_user: "tbk-token-cancelled",
        pro_card_type: "Mastercard Crédito",
        pro_card_last4: "5678",
        pro_inscription_token: "insc-token-cancelled",
        pro_pending_invoice: true,
      };
      mockUserFindMany.mockResolvedValueOnce([activeUser, cancelledUser]);
      // No existing subscription-pro records for either user
      mockSubProFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ id: 100 });

      // Act
      await migrateSubscriptionPro();

      // Assert: create called twice, once per user
      expect(mockCreate).toHaveBeenCalledTimes(2);

      // Assert: correct field mapping for active user
      expect(mockCreate).toHaveBeenCalledWith(
        "api::subscription-pro.subscription-pro",
        expect.objectContaining({
          data: expect.objectContaining({
            user: activeUser.id,
            tbk_user: activeUser.tbk_user,
            card_type: activeUser.pro_card_type,
            card_last4: activeUser.pro_card_last4,
            inscription_token: activeUser.pro_inscription_token,
            pending_invoice: false,
          }),
        })
      );

      // Assert: correct field mapping for cancelled user
      expect(mockCreate).toHaveBeenCalledWith(
        "api::subscription-pro.subscription-pro",
        expect.objectContaining({
          data: expect.objectContaining({
            user: cancelledUser.id,
            tbk_user: cancelledUser.tbk_user,
            card_type: cancelledUser.pro_card_type,
            card_last4: cancelledUser.pro_card_last4,
            inscription_token: cancelledUser.pro_inscription_token,
            pending_invoice: true,
          }),
        })
      );
    });
  });

  describe("users without tbk_user are excluded from migration", () => {
    it("findMany where clause includes tbk_user $notNull filter", async () => {
      // Arrange
      mockUserFindMany.mockResolvedValueOnce([]);

      // Act
      await migrateSubscriptionPro();

      // Assert: query includes $notNull filter — users without tbk_user never appear in results
      expect(mockUserFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tbk_user: { $notNull: true },
          }),
        })
      );
    });
  });

  describe("idempotency — skip users who already have a subscription-pro record", () => {
    it("does NOT call create for a user who already has a subscription-pro record", async () => {
      // Arrange
      const migratedUser = {
        id: 10,
        tbk_user: "tbk-already-migrated",
        pro_card_type: "Visa",
        pro_card_last4: "9999",
        pro_inscription_token: "insc-existing",
        pro_pending_invoice: false,
      };
      const newUser = {
        id: 11,
        tbk_user: "tbk-new-user",
        pro_card_type: null,
        pro_card_last4: null,
        pro_inscription_token: null,
        pro_pending_invoice: false,
      };
      mockUserFindMany.mockResolvedValueOnce([migratedUser, newUser]);
      // migratedUser has an existing subscription-pro, newUser does not
      mockSubProFindOne
        .mockResolvedValueOnce({ id: 50, tbk_user: "tbk-already-migrated" }) // existing for migratedUser
        .mockResolvedValueOnce(null); // none for newUser
      mockCreate.mockResolvedValue({ id: 200 });

      // Act
      await migrateSubscriptionPro();

      // Assert: create called only once (for newUser, not migratedUser)
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(
        "api::subscription-pro.subscription-pro",
        expect.objectContaining({
          data: expect.objectContaining({
            user: newUser.id,
            tbk_user: newUser.tbk_user,
          }),
        })
      );
    });
  });

  describe("empty result set — no users to migrate", () => {
    it("does not call create when findMany returns empty array", async () => {
      // Arrange
      mockUserFindMany.mockResolvedValueOnce([]);

      // Act
      await migrateSubscriptionPro();

      // Assert
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("logs info reporting no PRO users to migrate when result set is empty", async () => {
      // Arrange
      mockUserFindMany.mockResolvedValueOnce([]);

      // Act
      await migrateSubscriptionPro();

      // Assert: info log contains expected message
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("no PRO users to migrate")
      );
    });
  });

  describe("publishedAt is set on created records", () => {
    it("includes publishedAt in the created subscription-pro data", async () => {
      // Arrange
      const user = {
        id: 99,
        tbk_user: "tbk-pub-test",
        pro_card_type: null,
        pro_card_last4: null,
        pro_inscription_token: null,
        pro_pending_invoice: null,
      };
      mockUserFindMany.mockResolvedValueOnce([user]);
      mockSubProFindOne.mockResolvedValueOnce(null);
      mockCreate.mockResolvedValue({ id: 300 });

      // Act
      await migrateSubscriptionPro();

      // Assert: publishedAt is a Date object
      expect(mockCreate).toHaveBeenCalledWith(
        "api::subscription-pro.subscription-pro",
        expect.objectContaining({
          data: expect.objectContaining({
            publishedAt: expect.any(Date),
          }),
        })
      );
    });
  });
});
