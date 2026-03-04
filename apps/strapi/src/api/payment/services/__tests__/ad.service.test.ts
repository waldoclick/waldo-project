/**
 * Wave 0 — Failing test suite for ad.service.ts call site wiring.
 *
 * All tests MUST fail (RED state) because ad.service.ts currently imports
 * TransbankServices directly instead of calling getPaymentGateway().
 * This is intentional — tests define the behavioral contract before the
 * implementation is refactored in Wave 1 (Nyquist compliance).
 *
 * Requirements covered: WIRE-01
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
    createTransaction: jest.fn().mockResolvedValue({
      success: true,
      gatewayRef: "ref-123",
      url: "https://webpay.cl/redirect",
    }),
    commitTransaction: jest.fn().mockResolvedValue({
      success: true,
      response: { status: "AUTHORIZED", buy_order: "order-123", amount: 1000 },
    }),
  }),
}));

import { getPaymentGateway } from "../../../../services/payment-gateway";
import adService from "../ad.service";
import PaymentUtils from "../../utils";

// ─── Test setup ──────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();

  // Reset the gateway mock to have fresh spies each test
  const mockGateway = {
    createTransaction: jest.fn().mockResolvedValue({
      success: true,
      gatewayRef: "ref-123",
      url: "https://webpay.cl/redirect",
    }),
    commitTransaction: jest.fn().mockResolvedValue({
      success: true,
      response: { status: "AUTHORIZED", buy_order: "order-123", amount: 1000 },
    }),
  };
  (getPaymentGateway as jest.Mock).mockReturnValue(mockGateway);

  // Default mock for PaymentUtils.ad.getAdById
  (PaymentUtils.ad.getAdById as jest.Mock).mockResolvedValue({
    success: true,
    ad: {
      id: 1,
      user: { id: "user-1" },
      details: { pack: "paid", featured: false },
    },
  });

  // Default mock for PaymentUtils.general.PaymentDetails
  (PaymentUtils.general.PaymentDetails as jest.Mock).mockResolvedValue({
    amount: 1000,
    buyOrder: "order-1",
    sessionId: "session-1",
    items: [],
  });

  // Default mock for PaymentUtils.general.extractIdsFromMeta
  (PaymentUtils.general.extractIdsFromMeta as jest.Mock).mockReturnValue({
    userId: "user-1",
    adId: "1",
    isInvoice: false,
  });

  // Default mock for PaymentUtils.adReservation.getAdReservationAvailable
  (
    PaymentUtils.adReservation.getAdReservationAvailable as jest.Mock
  ).mockResolvedValue({
    success: true,
    adReservation: { id: "res-1", total_days: 30 },
  });

  // Default mock for PaymentUtils.ad.updateAdReservation
  (PaymentUtils.ad.updateAdReservation as jest.Mock).mockResolvedValue({
    success: true,
  });
});

// ─── WIRE-01: processPaidPayment ─────────────────────────────────────────────

describe("processPaidPayment — WIRE-01", () => {
  it("calls getPaymentGateway().createTransaction with correct args", async () => {
    await adService.processPaidPayment(1);

    // These assertions will FAIL in RED state because ad.service.ts calls
    // TransbankServices.transbank.createTransaction, not getPaymentGateway().createTransaction
    expect(getPaymentGateway).toHaveBeenCalled();

    const gateway = (getPaymentGateway as jest.Mock).mock.results[0]?.value;
    expect(gateway.createTransaction).toHaveBeenCalledWith(
      1000,
      "order-1",
      "session-1",
      expect.stringContaining("/api/payments/ad-response")
    );
  });

  it("returns success:true with webpay data when transaction succeeds", async () => {
    const result = (await adService.processPaidPayment(1)) as any;

    // Will FAIL in RED state: current code uses TransbankServices, not gateway
    // The shape won't match because the gateway mock isn't called
    expect(result.success).toBe(true);
    expect(result.webpay).toEqual(
      expect.objectContaining({
        success: true,
        gatewayRef: "ref-123",
        url: "https://webpay.cl/redirect",
      })
    );
  });
});

// ─── WIRE-01: processPaidWebpay ──────────────────────────────────────────────

describe("processPaidWebpay — WIRE-01", () => {
  it("calls getPaymentGateway().commitTransaction with the token", async () => {
    // Mock PaymentUtils.general.extractIdsFromMeta for the downstream call
    (PaymentUtils.general.extractIdsFromMeta as jest.Mock).mockReturnValue({
      userId: "user-1",
      adId: "1",
      isInvoice: false,
    });

    await adService.processPaidWebpay("token-abc");

    // Will FAIL in RED state because ad.service.ts calls
    // TransbankServices.transbank.commitTransaction, not getPaymentGateway().commitTransaction
    expect(getPaymentGateway).toHaveBeenCalled();

    const gateway = (getPaymentGateway as jest.Mock).mock.results[0]?.value;
    expect(gateway.commitTransaction).toHaveBeenCalledWith("token-abc");
  });

  it("returns success:true when commit is AUTHORIZED", async () => {
    (PaymentUtils.general.extractIdsFromMeta as jest.Mock).mockReturnValue({
      userId: "user-1",
      adId: "1",
      isInvoice: false,
    });

    const result = await adService.processPaidWebpay("token-abc");

    // Will FAIL in RED state because the gateway mock isn't called and the
    // current implementation uses TransbankServices which is also mocked (returns undefined)
    expect(result.success).toBe(true);
  });
});
