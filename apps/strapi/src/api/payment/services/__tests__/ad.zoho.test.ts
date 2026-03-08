/**
 * TDD tests for ad.service.ts Zoho CRM wiring.
 *
 * Tests the floating promise pattern that fires after processPaidWebpay
 * confirms a Transbank payment. The Zoho sync must be non-blocking so
 * the adResponse controller can redirect immediately after the method returns.
 *
 * Requirements covered: DEAL-03, EVT-03
 */

// ─── Mock heavy dependencies to prevent import-time errors ───────────────────

jest.mock("../../../../services/transbank");
jest.mock("../../utils");
jest.mock("../../../../utils/logtail");
jest.mock("../../../../services/mjml");
jest.mock("../../../ad/services/ad");

// ─── Mock the payment-gateway barrel ─────────────────────────────────────────

jest.mock("../../../../services/payment-gateway", () => ({
  getPaymentGateway: jest.fn().mockReturnValue({
    commitTransaction: jest.fn().mockResolvedValue({
      success: true,
      response: {
        status: "AUTHORIZED",
        buy_order: "order-ad-1-user-1",
        amount: 1000,
      },
    }),
  }),
}));

// ─── Mock the Zoho service barrel ────────────────────────────────────────────

jest.mock("../../../../services/zoho", () => ({
  zohoService: {
    findContact: jest.fn(),
    createDeal: jest.fn().mockResolvedValue("deal-zoho-id-2"),
    updateContactStats: jest.fn().mockResolvedValue(undefined),
  },
}));

import { getPaymentGateway } from "../../../../services/payment-gateway";
import { zohoService } from "../../../../services/zoho";
import adService from "../ad.service";
import PaymentUtils from "../../utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Flush microtask queue so floating promises run */
const flushPromises = () => new Promise((r) => setTimeout(r, 0));

// ─── Test setup ──────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();

  // Reset the gateway mock with fresh spies
  const mockGateway = {
    commitTransaction: jest.fn().mockResolvedValue({
      success: true,
      response: {
        status: "AUTHORIZED",
        buy_order: "order-ad-1-user-1",
        amount: 1000,
      },
    }),
  };
  (getPaymentGateway as jest.Mock).mockReturnValue(mockGateway);

  // Default mock for extractIdsFromMeta
  (PaymentUtils.general.extractIdsFromMeta as jest.Mock).mockReturnValue({
    userId: "user-1",
    adId: "1",
  });

  // Default mock for PaymentUtils.ad.getAdById — includes user.email
  (PaymentUtils.ad.getAdById as jest.Mock).mockResolvedValue({
    success: true,
    ad: {
      id: 1,
      user: { id: "user-1", email: "buyer@example.com" },
      details: { pack: "paid", featured: false },
    },
  });

  // Default mock for adReservation
  (
    PaymentUtils.adReservation.getAdReservationAvailable as jest.Mock
  ).mockResolvedValue({
    success: true,
    adReservation: { id: "res-1", total_days: 30 },
  });

  // Default mock for updateAdReservation
  (PaymentUtils.ad.updateAdReservation as jest.Mock).mockResolvedValue({
    success: true,
  });

  // Reset zohoService mocks
  (zohoService.findContact as jest.Mock).mockResolvedValue({
    id: "contact-zoho-2",
  });
  (zohoService.createDeal as jest.Mock).mockResolvedValue("deal-zoho-id-2");
  (zohoService.updateContactStats as jest.Mock).mockResolvedValue(undefined);
});

// ─── DEAL-03 / EVT-03: Zoho wiring in processPaidWebpay ─────────────────────

describe("processPaidWebpay — Zoho CRM wiring (DEAL-03, EVT-03)", () => {
  it("Test 1 — Contact found → createDeal called with correct payload", async () => {
    (zohoService.findContact as jest.Mock).mockResolvedValue({
      id: "contact-zoho-2",
    });

    await adService.processPaidWebpay("ad-token");
    await flushPromises();

    expect(zohoService.findContact).toHaveBeenCalledWith("buyer@example.com");
    expect(zohoService.createDeal).toHaveBeenCalledWith(
      expect.objectContaining({
        dealName: expect.any(String),
        amount: 1000,
        contactId: "contact-zoho-2",
        type: "Ad Payment",
        closingDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        leadSource: "Website",
      })
    );
  });

  it("Test 2 — Contact found → updateContactStats called with Total_Spent__c only (no Packs_Purchased__c)", async () => {
    (zohoService.findContact as jest.Mock).mockResolvedValue({
      id: "contact-zoho-2",
    });

    await adService.processPaidWebpay("ad-token");
    await flushPromises();

    expect(zohoService.updateContactStats).toHaveBeenCalledWith(
      "contact-zoho-2",
      { Total_Spent__c: 1000 }
    );

    // Ensure Packs_Purchased__c is NOT included — ad_paid is not a pack purchase
    const statsCall = (zohoService.updateContactStats as jest.Mock).mock
      .calls[0];
    expect(statsCall[1]).not.toHaveProperty("Packs_Purchased__c");
  });

  it("Test 3 — Contact not found → no createDeal, method returns success", async () => {
    (zohoService.findContact as jest.Mock).mockResolvedValue(null);

    const result = await adService.processPaidWebpay("ad-token");
    await flushPromises();

    expect(zohoService.createDeal).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it("Test 4 — Zoho sync is non-blocking (method returns before Zoho resolves)", async () => {
    // findContact never resolves — if the method awaits it, this test will hang
    (zohoService.findContact as jest.Mock).mockReturnValue(
      new Promise(() => {})
    );

    const result = await adService.processPaidWebpay("ad-token");

    // Must complete immediately without hanging
    expect(result.success).toBe(true);
  });

  it("Test 5 — findContact throws → processPaidWebpay still returns success", async () => {
    (zohoService.findContact as jest.Mock).mockRejectedValue(
      new Error("network error")
    );

    const result = await adService.processPaidWebpay("ad-token");
    await flushPromises();

    expect(result.success).toBe(true);
  });
});
