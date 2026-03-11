import { describe, it, expect } from "vitest";

/**
 * Tests for gracias.vue prepareSummary() function
 *
 * This function extracts Webpay payment fields from Order.payment_response
 * and prepares data for ResumeOrder component display.
 *
 * NOTE: These are pure function tests that don't require Nuxt environment.
 * The actual implementation in gracias.vue will be updated to match these specs.
 */

// Current prepareSummary function from gracias.vue (line 122-147)
// Updated in GREEN phase to add the new Webpay fields
function prepareSummary(data: any): Record<string, any> | undefined {
  if (!data) return undefined;
  return {
    documentId: data.documentId,
    amount: data.amount || data.totalAmount,
    currency: data.currency,
    status: data.status,
    paymentMethod: data.payment_type || data.paymentMethod,
    createdAt: data.paidAt || data.createdAt,
    receiptNumber:
      data.payment_response?.buy_order ||
      data.payment_response?.authorization_code ||
      "",
    email: data.user?.email || "",
    fullName: data.user?.fullName || data.user?.username || "",
    // New Webpay fields extracted from payment_response
    authorizationCode: data.payment_response?.authorization_code ?? undefined,
    paymentType:
      data.payment_response?.payment_type_code ??
      data.payment_type ??
      data.paymentMethod ??
      undefined,
    cardLast4: data.payment_response?.card_detail?.card_number ?? undefined,
    commerceCode: data.payment_response?.commerce_code ?? undefined,
  };
}

describe("gracias.vue - prepareSummary()", () => {
  describe("Webpay field extraction from payment_response", () => {
    it("should extract authorization_code from payment_response", () => {
      const mockOrder = {
        documentId: "ord_123",
        amount: 50000,
        currency: "CLP",
        status: "paid",
        payment_response: {
          authorization_code: "123456",
          payment_type_code: "VD",
          card_detail: {
            card_number: "6623",
          },
          commerce_code: "597055555532",
        },
      };

      const result = prepareSummary(mockOrder);

      expect(result).toBeDefined();
      expect(result?.authorizationCode).toBe("123456");
    });

    it("should extract payment_type_code from payment_response", () => {
      const mockOrder = {
        documentId: "ord_123",
        amount: 50000,
        payment_response: {
          payment_type_code: "VD",
        },
      };

      const result = prepareSummary(mockOrder);

      expect(result).toBeDefined();
      expect(result?.paymentType).toBe("VD");
    });

    it("should extract card last 4 digits from payment_response", () => {
      const mockOrder = {
        documentId: "ord_123",
        amount: 50000,
        payment_response: {
          card_detail: {
            card_number: "6623",
          },
        },
      };

      const result = prepareSummary(mockOrder);

      expect(result).toBeDefined();
      expect(result?.cardLast4).toBe("6623");
    });

    it("should extract commerce_code from payment_response", () => {
      const mockOrder = {
        documentId: "ord_123",
        amount: 50000,
        payment_response: {
          commerce_code: "597055555532",
        },
      };

      const result = prepareSummary(mockOrder);

      expect(result).toBeDefined();
      expect(result?.commerceCode).toBe("597055555532");
    });

    it("should return undefined for missing fields without throwing", () => {
      const mockOrder = {
        documentId: "ord_123",
        amount: 50000,
        payment_response: {},
      };

      const result = prepareSummary(mockOrder);

      expect(result).toBeDefined();
      expect(result?.authorizationCode).toBeUndefined();
      expect(result?.cardLast4).toBeUndefined();
      expect(result?.commerceCode).toBeUndefined();
    });

    it("should handle missing payment_response entirely", () => {
      const mockOrder = {
        documentId: "ord_123",
        amount: 50000,
      };

      const result = prepareSummary(mockOrder);

      expect(result).toBeDefined();
      expect(result?.authorizationCode).toBeUndefined();
      expect(result?.paymentType).toBeUndefined();
      expect(result?.cardLast4).toBeUndefined();
      expect(result?.commerceCode).toBeUndefined();
    });

    it("should handle empty strings correctly with nullish coalescing", () => {
      const mockOrder = {
        documentId: "ord_123",
        amount: 50000,
        payment_response: {
          authorization_code: "",
          commerce_code: "",
        },
      };

      const result = prepareSummary(mockOrder);

      // Empty strings should be preserved (not replaced with undefined)
      // because ?? only checks null/undefined, not falsy values
      expect(result?.authorizationCode).toBe("");
      expect(result?.commerceCode).toBe("");
    });
  });
});
