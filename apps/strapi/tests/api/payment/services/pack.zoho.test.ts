/**
 * TDD tests for Zoho CRM wiring in PackService.processPaidWebpay()
 *
 * Tests verify that after a successful Transbank pack payment confirmation,
 * the service correctly wires to Zoho CRM:
 *   - findContact(email) is called
 *   - If contact found: createDeal + updateContactStats are called with correct payloads
 *   - If contact null: no createDeal, returns success:true
 *   - If Zoho throws: error is caught, payment flow returns success:true
 *
 * Requirements covered: DEAL-02, EVT-03
 */

// ─── Mock strapi global before imports ───────────────────────────────────────

interface MockStrapi {
  entityService: {
    findOne: jest.Mock;
  };
}

(global as unknown as { strapi: MockStrapi }).strapi = {
  entityService: {
    findOne: jest.fn().mockResolvedValue({ email: "user@example.com" }),
  },
};

// ─── Mock heavy dependencies ─────────────────────────────────────────────────

jest.mock("../../../../src/services/payment-gateway", () => ({
  getPaymentGateway: jest.fn().mockReturnValue({
    commitTransaction: jest.fn().mockResolvedValue({
      success: true,
      response: {
        status: "AUTHORIZED",
        buy_order: "order-user-1-1-false",
        amount: 5000,
      },
    }),
  }),
}));

jest.mock("../../../../src/api/payment/utils");
jest.mock("../../../../src/utils/logtail");

jest.mock("../../../../src/services/zoho", () => ({
  zohoService: {
    findContact: jest.fn(),
    createDeal: jest.fn().mockResolvedValue("deal-zoho-id-1"),
    updateContactStats: jest.fn().mockResolvedValue(undefined),
  },
}));

import { getPaymentGateway } from "../../../../src/services/payment-gateway";
import { zohoService } from "../../../../src/services/zoho";
import packService from "../../../../src/api/payment/services/pack.service";
import PaymentUtils from "../../../../src/api/payment/utils";

// ─── Test setup ──────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();

  // Re-configure payment gateway mock (clearAllMocks clears call history but
  // the factory-level mockReturnValue persists — re-set explicitly for clarity)
  const mockGateway = {
    commitTransaction: jest.fn().mockResolvedValue({
      success: true,
      response: {
        status: "AUTHORIZED",
        buy_order: "order-user-1-1-false",
        amount: 5000,
      },
    }),
  };
  (getPaymentGateway as jest.Mock).mockReturnValue(mockGateway);

  // Configure PaymentUtils auto-mock methods
  (PaymentUtils.general.extractIdsFromMeta as jest.Mock).mockReturnValue({
    userId: "user-1",
    adId: "1",
    isInvoice: false,
  });
  (PaymentUtils.adPack.getAdPack as jest.Mock).mockResolvedValue({
    success: true,
    data: {
      id: 1,
      name: "Pack 2 avisos",
      price: 5000,
      total_ads: 2,
      total_days: 30,
      total_features: 1,
    },
  });
  (
    PaymentUtils.adReservation.createAdReservation as jest.Mock
  ).mockResolvedValue({ success: true });
  (
    PaymentUtils.adFeaturedReservation.createAdFeaturedReservation as jest.Mock
  ).mockResolvedValue({ success: true });

  // Reset strapi global mock
  (
    global as unknown as { strapi: MockStrapi }
  ).strapi.entityService.findOne.mockResolvedValue({
    email: "user@example.com",
  });

  // Default: contact found
  (zohoService.findContact as jest.Mock).mockResolvedValue({
    id: "contact-zoho-1",
  });
  (zohoService.createDeal as jest.Mock).mockResolvedValue("deal-zoho-id-1");
  (zohoService.updateContactStats as jest.Mock).mockResolvedValue(undefined);
});

// ─── DEAL-02 / EVT-03: Zoho wiring in processPaidWebpay ──────────────────────

interface ProcessPaidWebpayResult {
  success: boolean;
  message?: string;
  error?: unknown;
}

describe("processPaidWebpay — Zoho CRM wiring", () => {
  it("Test 1 — Contact found: calls createDeal with correct payload", async () => {
    await packService.processPaidWebpay("pack-token");

    expect(zohoService.createDeal).toHaveBeenCalledWith({
      dealName: "Pack 2 avisos",
      amount: 5000,
      contactId: "contact-zoho-1",
      type: "Pack Purchase",
      closingDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      leadSource: "Website",
    });
  });

  it("Test 2 — Contact found: calls updateContactStats with correct payload", async () => {
    await packService.processPaidWebpay("pack-token");

    expect(zohoService.updateContactStats).toHaveBeenCalledWith(
      "contact-zoho-1",
      {
        Total_Spent__c: 5000,
        Packs_Purchased__c: 1,
      }
    );
  });

  it("Test 3 — Contact not found: skips createDeal and returns success:true", async () => {
    (zohoService.findContact as jest.Mock).mockResolvedValue(null);

    const result = (await packService.processPaidWebpay(
      "pack-token"
    )) as ProcessPaidWebpayResult;

    expect(zohoService.createDeal).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it("Test 4 — findContact throws: processPaidWebpay still returns success:true", async () => {
    (zohoService.findContact as jest.Mock).mockRejectedValue(
      new Error("Zoho unavailable")
    );

    const result = (await packService.processPaidWebpay(
      "pack-token"
    )) as ProcessPaidWebpayResult;

    expect(result.success).toBe(true);
  });
});
