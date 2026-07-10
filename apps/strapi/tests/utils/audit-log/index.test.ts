jest.mock("../../../src/utils/logtail", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import logger from "../../../src/utils/logtail";
import {
  logAuditInfo,
  logAuditWarn,
  logAuditError,
} from "../../../src/utils/audit-log";

const mockLoggerInfo = logger.info as jest.Mock;
const mockLoggerWarn = logger.warn as jest.Mock;
const mockLoggerError = logger.error as jest.Mock;

describe("utils/audit-log", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("logAuditInfo", () => {
    it("calls logger.info with the { actor, actor_type, data } envelope", () => {
      // Arrange
      const message = "msg";
      const meta = {
        actor: 7,
        actor_type: "admin::user" as const,
        data: { foo: 1 },
      };

      // Act
      logAuditInfo(message, meta);

      // Assert
      expect(mockLoggerInfo).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfo).toHaveBeenCalledWith("msg", {
        actor: 7,
        actor_type: "admin::user",
        data: { foo: 1 },
      });
      expect(mockLoggerWarn).not.toHaveBeenCalled();
      expect(mockLoggerError).not.toHaveBeenCalled();
    });

    it("defaults data to {} when omitted", () => {
      // Arrange
      const meta = { actor: "system" as const, actor_type: "system" as const };

      // Act
      logAuditInfo("system msg", meta);

      // Assert
      expect(mockLoggerInfo).toHaveBeenCalledWith("system msg", {
        actor: "system",
        actor_type: "system",
        data: {},
      });
    });
  });

  describe("logAuditWarn", () => {
    it("calls logger.warn (not logger.info) with the envelope", () => {
      // Arrange
      const meta = {
        actor: 42,
        actor_type: "plugin::users-permissions.user" as const,
        data: { orderId: 1 },
      };

      // Act
      logAuditWarn("warn msg", meta);

      // Assert
      expect(mockLoggerWarn).toHaveBeenCalledTimes(1);
      expect(mockLoggerWarn).toHaveBeenCalledWith("warn msg", {
        actor: 42,
        actor_type: "plugin::users-permissions.user",
        data: { orderId: 1 },
      });
      expect(mockLoggerInfo).not.toHaveBeenCalled();
      expect(mockLoggerError).not.toHaveBeenCalled();
    });
  });

  describe("logAuditError", () => {
    it("calls logger.error (not logger.info) with the envelope", () => {
      // Arrange
      const meta = {
        actor: "system" as const,
        actor_type: "system" as const,
        data: { reason: "failure" },
      };

      // Act
      logAuditError("error msg", meta);

      // Assert
      expect(mockLoggerError).toHaveBeenCalledTimes(1);
      expect(mockLoggerError).toHaveBeenCalledWith("error msg", {
        actor: "system",
        actor_type: "system",
        data: { reason: "failure" },
      });
      expect(mockLoggerInfo).not.toHaveBeenCalled();
      expect(mockLoggerWarn).not.toHaveBeenCalled();
    });
  });
});
