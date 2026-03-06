import { describe, it, expect } from "vitest";
import {
  formatFullName,
  formatAddress,
  formatBoolean,
  formatDays,
  getPaymentMethod,
} from "../../app/utils/string";

describe("String Utilities", () => {
  describe("formatFullName", () => {
    it("should format first and last name", () => {
      expect(formatFullName("John", "Doe")).toBe("John Doe");
    });
    it("should format only first name", () => {
      expect(formatFullName("John")).toBe("John");
    });
    it("should format only last name", () => {
      expect(formatFullName(undefined, "Doe")).toBe("Doe");
    });
    it("should handle null values", () => {
      expect(formatFullName(null, null)).toBe("--");
    });
    it("should handle empty strings", () => {
      expect(formatFullName("", "")).toBe("--");
    });
  });

  describe("formatAddress", () => {
    it("should format address with number", () => {
      expect(formatAddress("Main St", "123")).toBe("Main St 123");
    });
    it("should format address without number", () => {
      expect(formatAddress("Main St")).toBe("Main St");
    });
    it("should handle number as number type", () => {
      expect(formatAddress("Main St", 123)).toBe("Main St 123");
    });
    it("should return -- if address is missing", () => {
      expect(formatAddress(null)).toBe("--");
    });
  });

  describe("formatBoolean", () => {
    it("should return Sí for true", () => {
      expect(formatBoolean(true)).toBe("Sí");
    });
    it("should return No for false", () => {
      expect(formatBoolean(false)).toBe("No");
    });
    it("should return No for undefined", () => {
      expect(formatBoolean()).toBe("No");
    });
  });

  describe("formatDays", () => {
    it("should format days with suffix", () => {
      expect(formatDays(5)).toBe("5 días");
    });
    it("should handle 0 days", () => {
      expect(formatDays(0)).toBe("0 días");
    });
    it("should return -- for null/undefined", () => {
      expect(formatDays(null)).toBe("--");
      expect(formatDays()).toBe("--");
    });
  });

  describe("getPaymentMethod", () => {
    it("should format webpay as WebPay", () => {
      expect(getPaymentMethod("webpay")).toBe("WebPay");
    });
    it("should return other methods as is", () => {
      expect(getPaymentMethod("cash")).toBe("cash");
    });
    it("should return -- for null/undefined", () => {
      expect(getPaymentMethod(null)).toBe("--");
      expect(getPaymentMethod()).toBe("--");
    });
  });
});
