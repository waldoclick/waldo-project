import registerAuditLogSubscriber from "../../src/subscribers/audit-log.subscriber";

// Mock strapi global
const mockAuditCreate = jest.fn().mockResolvedValue({ id: 1 });
const mockDbQuery = jest.fn().mockReturnValue({ create: mockAuditCreate });
const mockRequestContextGet = jest.fn();
const mockLogError = jest.fn();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let capturedMap: Record<string, (event: any) => Promise<void>>;

const mockDbLifecyclesSubscribe = jest.fn((map) => {
  capturedMap = map;
});

const mockStrapi = {
  db: {
    query: mockDbQuery,
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
    mockAuditCreate.mockResolvedValue({ id: 1 });
    mockDbQuery.mockReturnValue({ create: mockAuditCreate });
    registerAuditLogSubscriber(mockStrapi);
  });

  describe("Test 1: admin-authenticated afterCreate writes one audit row", () => {
    it("writes an audit row with action=create and actor_type=admin::user", async () => {
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
      await capturedMap.afterCreate(event);

      // Assert
      expect(mockDbQuery).toHaveBeenCalledWith("api::audit-log.audit-log");
      expect(mockAuditCreate).toHaveBeenCalledTimes(1);
      expect(mockAuditCreate).toHaveBeenCalledWith({
        data: {
          action: "create",
          content_type_uid: "api::ad.ad",
          record_id: 123,
          record_document_id: "abcxyz",
          actor_id: 7,
          actor_type: "admin::user",
        },
      });
    });
  });

  describe("Test 2: afterUpdate and afterDelete write rows pulling record_id/record_document_id from event.result", () => {
    it("afterUpdate writes action=update using event.result, not params.where", async () => {
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
      await capturedMap.afterUpdate(event);

      // Assert
      expect(mockAuditCreate).toHaveBeenCalledWith({
        data: {
          action: "update",
          content_type_uid: "api::ad.ad",
          record_id: 123,
          record_document_id: "abcxyz",
          actor_id: 42,
          actor_type: "plugin::users-permissions.user",
        },
      });
    });

    it("afterDelete writes action=delete using event.result, not params.where", async () => {
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
      await capturedMap.afterDelete(event);

      // Assert
      expect(mockAuditCreate).toHaveBeenCalledWith({
        data: {
          action: "delete",
          content_type_uid: "api::ad.ad",
          record_id: 123,
          record_document_id: "abcxyz",
          actor_id: 42,
          actor_type: "plugin::users-permissions.user",
        },
      });
    });
  });

  describe("Test 3: context-less write is tagged system", () => {
    it("writes actor_type=system and actor_id=null when requestContext.get() returns undefined", async () => {
      // Arrange
      mockRequestContextGet.mockReturnValue(undefined);
      const event = {
        model: { uid: "api::ad.ad" },
        result: { id: 5, documentId: "seed-doc" },
        params: {},
      };

      // Act
      await capturedMap.afterCreate(event);

      // Assert
      expect(mockAuditCreate).toHaveBeenCalledWith({
        data: {
          action: "create",
          content_type_uid: "api::ad.ad",
          record_id: 5,
          record_document_id: "seed-doc",
          actor_id: null,
          actor_type: "system",
        },
      });
    });
  });

  describe("Test 4: writes to the audit-log content-type itself never trigger a further audit row", () => {
    it("returns early without calling strapi.db.query when event.model.uid is api::audit-log.audit-log", async () => {
      // Arrange
      mockRequestContextGet.mockReturnValue({
        state: { user: { id: 7 }, auth: { strategy: { name: "admin" } } },
      });
      const event = {
        model: { uid: "api::audit-log.audit-log" },
        result: { id: 1, documentId: "self-doc" },
        params: {},
      };

      // Act
      await capturedMap.afterCreate(event);

      // Assert
      expect(mockAuditCreate).not.toHaveBeenCalled();
    });
  });

  describe("Test 5: audit handler failure never breaks the original business write", () => {
    it("resolves without throwing and logs the error when the audit create call rejects", async () => {
      // Arrange
      mockRequestContextGet.mockReturnValue({
        state: { user: { id: 7 }, auth: { strategy: { name: "admin" } } },
      });
      mockAuditCreate.mockRejectedValueOnce(new Error("db fail"));
      const event = {
        model: { uid: "api::ad.ad" },
        result: { id: 123, documentId: "abcxyz" },
        params: {},
      };

      // Act & Assert
      await expect(capturedMap.afterCreate(event)).resolves.not.toThrow();
      expect(mockLogError).toHaveBeenCalledTimes(1);
    });
  });
});
