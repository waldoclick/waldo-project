/**
 * Wave 0 — Failing test suite for payment.controller.ts (packResponse).
 *
 * Tests MUST fail (RED state) because:
 *   - WIRE-04: packResponse is missing `return` after `ctx.redirect` on failure,
 *     so documentDetails and createAdOrder ARE called even when payment fails.
 *   - WIRE-03: payment_method is hardcoded as "webpay" instead of reading
 *     process.env.PAYMENT_GATEWAY ?? "transbank".
 *
 * Requirements covered: WIRE-03, WIRE-04
 */

// ─── Mock all dependencies to prevent import-time errors ─────────────────────

jest.mock("../../services/ad.service");
jest.mock("../../services/pack.service");
jest.mock("../../utils/order.utils");
jest.mock("../../utils/user.utils");
jest.mock("../../utils/general.utils");
jest.mock("../../../../utils/logtail");
jest.mock("../../services/pro.service");

import packService from "../../services/pack.service";
import adService from "../../services/ad.service";
import OrderUtils from "../../utils/order.utils";
import { documentDetails } from "../../utils/user.utils";
import generalUtils from "../../utils/general.utils";
import controller from "../payment";

// ─── Minimal Koa context factory ─────────────────────────────────────────────

function makeCtx(overrides: Record<string, any> = {}) {
  return {
    query: { token_ws: "test-token" },
    state: { user: { id: "user-1" } },
    request: { body: { data: {} } },
    redirect: jest.fn(),
    body: undefined as any,
    status: 200,
    ...overrides,
  };
}

// ─── Test setup ──────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── WIRE-04: packResponse failure path ──────────────────────────────────────

describe("packResponse — WIRE-04", () => {
  it("does not call documentDetails or createAdOrder when payment fails", async () => {
    // Arrange: payment gateway returns failure
    (packService.processPaidWebpay as jest.Mock).mockResolvedValue({
      success: false,
      error: "Payment rejected",
    });

    const ctx = makeCtx();

    // Act: call the packResponse handler
    await (controller as any).packResponse(ctx);

    // Assert: should redirect to error page
    expect(ctx.redirect).toHaveBeenCalledWith(
      expect.stringContaining("/packs/error")
    );

    // These will FAIL in RED state because the controller is missing `return`
    // after ctx.redirect on failure — so it falls through and calls these:
    expect(documentDetails).not.toHaveBeenCalled();
    expect(OrderUtils.createAdOrder).not.toHaveBeenCalled();
  });
});

// ─── WIRE-03: payment_method env var wiring ───────────────────────────────────

describe("packResponse — WIRE-03", () => {
  it("passes PAYMENT_GATEWAY env var as payment_method, not hardcoded webpay", async () => {
    // Arrange: set env var to a custom gateway name
    process.env.PAYMENT_GATEWAY = "test-gateway";

    (packService.processPaidWebpay as jest.Mock).mockResolvedValue({
      success: true,
      webpay: { amount: 1000, buy_order: "order-1", status: "AUTHORIZED" },
      userId: "user-1",
      isInvoice: false,
      pack: { id: 1, name: "Pack Basic", price: 1000 },
    });

    (documentDetails as jest.Mock).mockResolvedValue({
      name: "Test User",
      rut: "12345678-9",
      address: "Test Street",
      address_number: 123,
      postal_code: "12345",
    });

    (generalUtils.generateFactoDocument as jest.Mock).mockResolvedValue({
      id: "doc-1",
    });

    (OrderUtils.createAdOrder as jest.Mock).mockResolvedValue({
      order: { id: 99 },
    });

    const ctx = makeCtx();

    // Act
    await (controller as any).packResponse(ctx);

    // Assert: createAdOrder should be called with env var value, NOT "webpay"
    // This will FAIL in RED state because payment_method is hardcoded as "webpay"
    expect(OrderUtils.createAdOrder).toHaveBeenCalledWith(
      expect.objectContaining({ payment_method: "test-gateway" })
    );

    expect(OrderUtils.createAdOrder).not.toHaveBeenCalledWith(
      expect.objectContaining({ payment_method: "webpay" })
    );

    // Cleanup
    delete process.env.PAYMENT_GATEWAY;
  });

  it("defaults to transbank when PAYMENT_GATEWAY is not set", async () => {
    // Arrange: ensure env var is not set
    delete process.env.PAYMENT_GATEWAY;

    (packService.processPaidWebpay as jest.Mock).mockResolvedValue({
      success: true,
      webpay: { amount: 1000, buy_order: "order-1", status: "AUTHORIZED" },
      userId: "user-1",
      isInvoice: false,
      pack: { id: 1, name: "Pack Basic", price: 1000 },
    });

    (documentDetails as jest.Mock).mockResolvedValue({
      name: "Test User",
      rut: "12345678-9",
      address: "Test Street",
      address_number: 123,
      postal_code: "12345",
    });

    (generalUtils.generateFactoDocument as jest.Mock).mockResolvedValue({
      id: "doc-1",
    });

    (OrderUtils.createAdOrder as jest.Mock).mockResolvedValue({
      order: { id: 99 },
    });

    const ctx = makeCtx();

    // Act
    await (controller as any).packResponse(ctx);

    // Assert: should use "transbank" as default, NOT "webpay"
    // This will FAIL in RED state because payment_method is hardcoded as "webpay"
    expect(OrderUtils.createAdOrder).toHaveBeenCalledWith(
      expect.objectContaining({ payment_method: "transbank" })
    );

    expect(OrderUtils.createAdOrder).not.toHaveBeenCalledWith(
      expect.objectContaining({ payment_method: "webpay" })
    );
  });
});
