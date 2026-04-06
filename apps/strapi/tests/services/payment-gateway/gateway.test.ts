/**
 * Wave 0 — Failing test suite for payment-gateway module.
 *
 * All tests MUST fail (RED state) in Wave 0 because the implementation files
 * (types/gateway.interface.ts, adapters/transbank.adapter.ts, registry.ts)
 * do not exist yet. This is intentional — tests define the contract before
 * implementation (Nyquist compliance).
 *
 * Requirements covered: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05
 */

// Prevent Transbank SDK initialization during tests
jest.mock("../../../src/services/transbank/services/transbank.service");

import { getPaymentGateway } from "../../../src/services/payment-gateway/registry";
import {
  IGatewayInitResponse,
  IGatewayCommitResponse,
  IPaymentGateway,
} from "../../../src/services/payment-gateway/types/gateway.interface";
import { TransbankAdapter } from "../../../src/services/payment-gateway/adapters/transbank.adapter";
import { TransbankService } from "../../../src/services/transbank/services/transbank.service";

// ─── Environment isolation helpers ───────────────────────────────────────────

let savedEnv: Record<string, string | undefined>;

beforeEach(() => {
  savedEnv = {
    PAYMENT_GATEWAY: process.env.PAYMENT_GATEWAY,
    WEBPAY_COMMERCE_CODE: process.env.WEBPAY_COMMERCE_CODE,
    WEBPAY_API_KEY: process.env.WEBPAY_API_KEY,
    WEBPAY_ENVIRONMENT: process.env.WEBPAY_ENVIRONMENT,
  };
});

afterEach(() => {
  // Restore env vars to pre-test state
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  jest.resetAllMocks();
});

// ─── PAY-01, PAY-02: IPaymentGateway interface and normalized response types ─

describe("IPaymentGateway interface — PAY-01, PAY-02", () => {
  it("IGatewayInitResponse has success, gatewayRef, url, error fields", () => {
    // TypeScript compile-time check: if the type is wrong, this file won't compile.
    const response: IGatewayInitResponse = {
      success: true,
      gatewayRef: "ref-123",
      url: "https://webpay.cl",
      error: undefined,
    };
    expect(response.success).toBe(true);
    expect(response.gatewayRef).toBe("ref-123");
    expect(response.url).toBe("https://webpay.cl");
  });

  it("IGatewayCommitResponse has success, response, error fields", () => {
    // TypeScript compile-time check: shape must match the interface definition.
    const response: IGatewayCommitResponse = {
      success: true,
      response: { buy_order: "order-1" },
      error: undefined,
    };
    expect(response.success).toBe(true);
    expect(response.response).toEqual({ buy_order: "order-1" });
  });

  it("IPaymentGateway requires createTransaction and commitTransaction", () => {
    // Define a local class to confirm the interface signature compiles.
    class DummyGateway implements IPaymentGateway {
      async createTransaction(
        _amount: number,
        _orderId: string,
        _sessionId: string,
        _returnUrl: string
      ): Promise<IGatewayInitResponse> {
        return { success: true, gatewayRef: "dummy-ref", url: "https://dummy" };
      }

      async commitTransaction(
        _gatewayRef: string
      ): Promise<IGatewayCommitResponse> {
        return { success: true, response: {} };
      }
    }

    const gateway: IPaymentGateway = new DummyGateway();
    expect(typeof gateway.createTransaction).toBe("function");
    expect(typeof gateway.commitTransaction).toBe("function");
  });
});

// ─── PAY-03: TransbankAdapter ─────────────────────────────────────────────────

describe("TransbankAdapter — PAY-03", () => {
  beforeEach(() => {
    process.env.WEBPAY_COMMERCE_CODE = "test-code";
    process.env.WEBPAY_API_KEY = "test-key";
  });

  it("createTransaction delegates to TransbankService and maps token to gatewayRef", async () => {
    const mockCreate = jest
      .spyOn(TransbankService.prototype, "createTransaction")
      .mockResolvedValue({
        success: true,
        token: "tk-abc",
        url: "https://webpay.cl",
      });

    const adapter = new TransbankAdapter();
    const result = await adapter.createTransaction(
      1000,
      "order-1",
      "session-1",
      "https://return.url"
    );

    expect(mockCreate).toHaveBeenCalledWith(
      1000,
      "order-1",
      "session-1",
      "https://return.url"
    );
    expect(result).toEqual({
      success: true,
      gatewayRef: "tk-abc",
      url: "https://webpay.cl",
      error: undefined,
    });
  });

  it("commitTransaction delegates to TransbankService passing gatewayRef as token", async () => {
    const mockCommit = jest
      .spyOn(TransbankService.prototype, "commitTransaction")
      .mockResolvedValue({
        success: true,
        response: { status: "AUTHORIZED" },
      });

    const adapter = new TransbankAdapter();
    const result = await adapter.commitTransaction("ref-xyz");

    expect(mockCommit).toHaveBeenCalledWith("ref-xyz");
    expect(result.success).toBe(true);
  });

  it("createTransaction returns error shape when TransbankService fails", async () => {
    jest
      .spyOn(TransbankService.prototype, "createTransaction")
      .mockResolvedValue({
        success: false,
        error: "SDK error",
      });

    const adapter = new TransbankAdapter();
    const result = await adapter.createTransaction(
      500,
      "order-2",
      "session-2",
      "https://return.url"
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("SDK error");
  });
});

// ─── PAY-04: getPaymentGateway registry ──────────────────────────────────────

describe("getPaymentGateway registry — PAY-04", () => {
  beforeEach(() => {
    process.env.WEBPAY_COMMERCE_CODE = "test-code";
    process.env.WEBPAY_API_KEY = "test-key";
  });

  it("returns TransbankAdapter when PAYMENT_GATEWAY=transbank", () => {
    process.env.PAYMENT_GATEWAY = "transbank";
    const gateway = getPaymentGateway();
    expect(gateway).toBeInstanceOf(TransbankAdapter);
  });

  it("returns TransbankAdapter when PAYMENT_GATEWAY is not set (default)", () => {
    delete process.env.PAYMENT_GATEWAY;
    const gateway = getPaymentGateway();
    expect(gateway).toBeInstanceOf(TransbankAdapter);
  });

  it("throws with descriptive error for unknown gateway", () => {
    process.env.PAYMENT_GATEWAY = "stripe";
    expect(() => getPaymentGateway()).toThrow(/stripe/);
    expect(() => getPaymentGateway()).toThrow(/transbank/);
  });
});

// ─── PAY-05: env var validation ───────────────────────────────────────────────

describe("env var validation — PAY-05", () => {
  it("throws when WEBPAY_COMMERCE_CODE is missing", () => {
    process.env.WEBPAY_API_KEY = "test-key";
    delete process.env.WEBPAY_COMMERCE_CODE;
    expect(() => getPaymentGateway()).toThrow(/WEBPAY_COMMERCE_CODE/);
  });

  it("throws when WEBPAY_API_KEY is missing", () => {
    process.env.WEBPAY_COMMERCE_CODE = "test-code";
    delete process.env.WEBPAY_API_KEY;
    expect(() => getPaymentGateway()).toThrow(/WEBPAY_API_KEY/);
  });

  it("does not throw when WEBPAY_ENVIRONMENT is absent (it has a default)", () => {
    process.env.WEBPAY_COMMERCE_CODE = "test-code";
    process.env.WEBPAY_API_KEY = "test-key";
    delete process.env.WEBPAY_ENVIRONMENT;
    expect(() => getPaymentGateway()).not.toThrow();
  });

  it("throws when both mandatory vars are missing", () => {
    delete process.env.WEBPAY_COMMERCE_CODE;
    delete process.env.WEBPAY_API_KEY;
    expect(() => getPaymentGateway()).toThrow(/WEBPAY_COMMERCE_CODE/);
    expect(() => getPaymentGateway()).toThrow(/WEBPAY_API_KEY/);
  });
});
