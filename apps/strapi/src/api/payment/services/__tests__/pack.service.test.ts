/**
 * Wave 0 — Failing test suite for pack.service.ts call site wiring.
 *
 * All tests MUST fail (RED state) because pack.service.ts currently imports
 * TransbankServices directly instead of calling getPaymentGateway().
 * This is intentional — tests define the behavioral contract before the
 * implementation is refactored in Wave 1 (Nyquist compliance).
 *
 * Requirements covered: WIRE-02
 */

// ─── Mock heavy dependencies to prevent import-time errors ───────────────────

jest.mock("../../../../services/transbank");
jest.mock("../../utils");
jest.mock("../../../../utils/logtail");

// ─── Mock the payment-gateway barrel ─────────────────────────────────────────

jest.mock("../../../../services/payment-gateway", () => ({
  getPaymentGateway: jest.fn().mockReturnValue({
    createTransaction: jest.fn().mockResolvedValue({
      success: true,
      gatewayRef: "ref-456",
      url: "https://webpay.cl/redirect",
    }),
    commitTransaction: jest.fn().mockResolvedValue({
      success: true,
      response: {
        status: "AUTHORIZED",
        buy_order: "order-pack-1-1-false",
        amount: 5000,
      },
    }),
  }),
}));

import { getPaymentGateway } from "../../../../services/payment-gateway";
import packService from "../pack.service";
import PaymentUtils from "../../utils";

// ─── Test setup ──────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();

  // Reset gateway mock with fresh spies each test
  const mockGateway = {
    createTransaction: jest.fn().mockResolvedValue({
      success: true,
      gatewayRef: "ref-456",
      url: "https://webpay.cl/redirect",
    }),
    commitTransaction: jest.fn().mockResolvedValue({
      success: true,
      response: {
        status: "AUTHORIZED",
        buy_order: "order-pack-1-1-false",
        amount: 5000,
      },
    }),
  };
  (getPaymentGateway as jest.Mock).mockReturnValue(mockGateway);

  // Default mock for PaymentUtils.adPack.getAdPack
  (PaymentUtils.adPack.getAdPack as jest.Mock).mockResolvedValue({
    success: true,
    data: {
      id: 1,
      price: 5000,
      total_ads: 2,
      total_days: 30,
      total_features: 1,
    },
  });

  // Default mocks for reservation creation
  (
    PaymentUtils.adReservation.createAdReservation as jest.Mock
  ).mockResolvedValue({ success: true });
  (
    PaymentUtils.adFeaturedReservation.createAdFeaturedReservation as jest.Mock
  ).mockResolvedValue({ success: true });

  // Default mock for extractIdsFromMeta
  (PaymentUtils.general.extractIdsFromMeta as jest.Mock).mockReturnValue({
    userId: "user-1",
    adId: "1",
    isInvoice: false,
  });
});

// ─── WIRE-02: packPurchase ────────────────────────────────────────────────────

describe("packPurchase — WIRE-02", () => {
  it("calls getPaymentGateway().createTransaction with correct args", async () => {
    await packService.packPurchase(1, "user-1", false);

    // Will FAIL in RED state because pack.service.ts calls
    // TransbankServices.transbank.createTransaction, not getPaymentGateway().createTransaction
    expect(getPaymentGateway).toHaveBeenCalled();

    const gateway = (getPaymentGateway as jest.Mock).mock.results[0]?.value;
    expect(gateway.createTransaction).toHaveBeenCalledWith(
      5000,
      expect.stringContaining("order-"),
      expect.stringContaining("session-"),
      expect.stringContaining("/api/payments/pack-response")
    );
  });

  it("returns webpay response from gateway", async () => {
    const result = (await packService.packPurchase(1, "user-1", false)) as any;

    // Will FAIL in RED state: current code uses TransbankServices, not gateway
    // The webpay field won't have gatewayRef because the gateway mock isn't called
    expect(result.success).toBe(true);
    expect(result.webpay).toEqual(
      expect.objectContaining({
        success: true,
        gatewayRef: "ref-456",
        url: expect.stringContaining("webpay.cl"),
      })
    );
  });
});

// ─── WIRE-02: processPaidWebpay ──────────────────────────────────────────────

describe("processPaidWebpay — WIRE-02", () => {
  it("calls getPaymentGateway().commitTransaction with the token", async () => {
    await packService.processPaidWebpay("pack-token");

    // Will FAIL in RED state because pack.service.ts calls
    // TransbankServices.transbank.commitTransaction, not getPaymentGateway().commitTransaction
    expect(getPaymentGateway).toHaveBeenCalled();

    const gateway = (getPaymentGateway as jest.Mock).mock.results[0]?.value;
    expect(gateway.commitTransaction).toHaveBeenCalledWith("pack-token");
  });

  it("returns success:true when AUTHORIZED", async () => {
    const result = await packService.processPaidWebpay("pack-token");

    // Will FAIL in RED state because the gateway mock isn't called and the
    // current implementation uses TransbankServices which is mocked to return undefined
    expect(result.success).toBe(true);
  });
});
