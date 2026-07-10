jest.mock("../../src/utils/audit-log", () => ({
  __esModule: true,
  logAuditInfo: jest.fn(),
  logAuditWarn: jest.fn(),
  logAuditError: jest.fn(),
}));

import { logAuditInfo } from "../../src/utils/audit-log";
import registerAuditLogSubscriber from "../../src/subscribers/audit-log.subscriber";

const mockLogAuditInfo = logAuditInfo as jest.Mock;

// Mock strapi global
const mockRequestContextGet = jest.fn();
const mockLogError = jest.fn();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let capturedMap: Record<string, (event: any) => void>;

const mockDbLifecyclesSubscribe = jest.fn((map) => {
  capturedMap = map;
});

const mockStrapi = {
  db: {
    lifecycles: {
      subscribe: mockDbLifecyclesSubscribe,
    },
  },
  requestContext: {
    get: mockRequestContextGet,
  },
  log: {
    error: mockLogError,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe("audit-log.subscriber", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    registerAuditLogSubscriber(mockStrapi);
  });

  describe("Test 1: admin-authenticated afterCreate calls logAuditInfo", () => {
    it("calls logAuditInfo with action=create and actor_type=admin::user", () => {
      // Arrange
      mockRequestContextGet.mockReturnValue({
        state: { user: { id: 7 }, auth: { strategy: { name: "admin" } } },
      });
      const event = {
        model: { uid: "api::ad.ad" },
        result: { id: 123, documentId: "abcxyz" },
        params: { where: { id: 99 } },
      };

      // Act
      capturedMap.afterCreate(event);

      // Assert
      expect(mockLogAuditInfo).toHaveBeenCalledTimes(1);
      expect(mockLogAuditInfo).toHaveBeenCalledWith(
        "Audit create: api::ad.ad",
        {
          actor: 7,
          actor_type: "admin::user",
          data: {
            content_type_uid: "api::ad.ad",
            record_id: 123,
            record_document_id: "abcxyz",
          },
        },
      );
    });
  });

  describe("Test 2: afterUpdate and afterDelete call logAuditInfo pulling record_id/record_document_id from event.result", () => {
    it("afterUpdate calls logAuditInfo with action=update using event.result, not params.where", () => {
      // Arrange
      mockRequestContextGet.mockReturnValue({
        state: {
          user: { id: 42 },
          auth: { strategy: { name: "users-permissions" } },
        },
      });
      const event = {
        model: { uid: "api::ad.ad" },
        result: { id: 123, documentId: "abcxyz" },
        params: { where: { id: 99 } },
      };

      // Act
      capturedMap.afterUpdate(event);

      // Assert
      expect(mockLogAuditInfo).toHaveBeenCalledWith(
        "Audit update: api::ad.ad",
        {
          actor: 42,
          actor_type: "plugin::users-permissions.user",
          data: {
            content_type_uid: "api::ad.ad",
            record_id: 123,
            record_document_id: "abcxyz",
          },
        },
      );
    });

    it("afterDelete calls logAuditInfo with action=delete using event.result, not params.where", () => {
      // Arrange
      mockRequestContextGet.mockReturnValue({
        state: {
          user: { id: 42 },
          auth: { strategy: { name: "users-permissions" } },
        },
      });
      const event = {
        model: { uid: "api::ad.ad" },
        result: { id: 123, documentId: "abcxyz" },
        params: { where: { id: 99 } },
      };

      // Act
      capturedMap.afterDelete(event);

      // Assert
      expect(mockLogAuditInfo).toHaveBeenCalledWith(
        "Audit delete: api::ad.ad",
        {
          actor: 42,
          actor_type: "plugin::users-permissions.user",
          data: {
            content_type_uid: "api::ad.ad",
            record_id: 123,
            record_document_id: "abcxyz",
          },
        },
      );
    });
  });

  describe("Test 3: context-less write is tagged system", () => {
    it("calls logAuditInfo with actor=system and actor_type=system when requestContext.get() returns undefined", () => {
      // Arrange
      mockRequestContextGet.mockReturnValue(undefined);
      const event = {
        model: { uid: "api::ad.ad" },
        result: { id: 5, documentId: "seed-doc" },
        params: {},
      };

      // Act
      capturedMap.afterCreate(event);

      // Assert
      expect(mockLogAuditInfo).toHaveBeenCalledWith(
        "Audit create: api::ad.ad",
        {
          actor: "system",
          actor_type: "system",
          data: {
            content_type_uid: "api::ad.ad",
            record_id: 5,
            record_document_id: "seed-doc",
          },
        },
      );
    });
  });

  describe("Test 4: audit handler failure never breaks the original business write", () => {
    it("does not throw and logs the error when logAuditInfo throws", () => {
      // Arrange
      mockRequestContextGet.mockReturnValue({
        state: { user: { id: 7 }, auth: { strategy: { name: "admin" } } },
      });
      mockLogAuditInfo.mockImplementationOnce(() => {
        throw new Error("logger fail");
      });
      const event = {
        model: { uid: "api::ad.ad" },
        result: { id: 123, documentId: "abcxyz" },
        params: {},
      };

      // Act & Assert
      expect(() => capturedMap.afterCreate(event)).not.toThrow();
      expect(mockLogError).toHaveBeenCalledTimes(1);
    });
  });
});
