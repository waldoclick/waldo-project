import { vi, describe, it, expect, beforeEach } from "vitest";
import type { PurchaseOrderData } from "./useAdAnalytics";

// Mock the ad store
vi.mock("@/stores/ad.store", () => ({
  useAdStore: () => ({
    getAnalytics: {
      pack_selected: null,
      featured_selected: null,
    },
    updateViewItemList: vi.fn(),
    updatePackSelected: vi.fn(),
    updateFeaturedSelected: vi.fn(),
  }),
}));

// Mock window.dataLayer
const mockDataLayer: unknown[] = [];

beforeEach(() => {
  mockDataLayer.length = 0;
  Object.defineProperty(globalThis, "window", {
    value: { dataLayer: mockDataLayer },
    writable: true,
    configurable: true,
  });
});

describe("useAdAnalytics - pushEvent flow param", () => {
  it("uses 'ad_creation' as default flow when no flow param is passed", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { pushEvent } = useAdAnalytics();

    pushEvent("view_item_list", []);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "view_item_list",
    ) as Record<string, unknown> | undefined;
    expect(event?.flow).toBe("ad_creation");
  });

  it("uses provided flow param when passed explicitly", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { pushEvent } = useAdAnalytics();

    pushEvent("purchase", [], {}, "pack_purchase");

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    expect(event?.flow).toBe("pack_purchase");
  });

  it("still accepts 3-argument form (backward compatible)", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { pushEvent } = useAdAnalytics();

    pushEvent("step_view", [], { step_number: 1 });

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "step_view",
    ) as Record<string, unknown> | undefined;
    expect(event?.flow).toBe("ad_creation");
    expect(event?.step_number).toBe(1);
  });
});

describe("useAdAnalytics - purchase()", () => {
  it("pushes a purchase event with correct transaction_id from buy_order", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { purchase } = useAdAnalytics();

    const order: PurchaseOrderData = {
      documentId: "doc123",
      amount: 9990,
      currency: "CLP",
      payment_response: {
        buy_order: "BO-456",
        authorization_code: "AUTH-789",
      },
    };

    purchase(order);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    expect(event).toBeDefined();
    expect(event?.flow).toBe("pack_purchase");

    const ecommerce = event?.ecommerce as Record<string, unknown>;
    expect(ecommerce?.transaction_id).toBe("BO-456");
    expect(ecommerce?.value).toBe(9990);
    expect(ecommerce?.currency).toBe("CLP");
  });

  it("falls back to documentId for transaction_id when buy_order is absent", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { purchase } = useAdAnalytics();

    const order: PurchaseOrderData = {
      documentId: "doc123",
      amount: 5000,
      currency: "CLP",
    };

    purchase(order);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    const ecommerce = event?.ecommerce as Record<string, unknown>;
    expect(ecommerce?.transaction_id).toBe("doc123");
  });

  it("uses empty string for transaction_id when both buy_order and documentId are absent", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { purchase } = useAdAnalytics();

    const order: PurchaseOrderData = { amount: 5000 };

    purchase(order);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    const ecommerce = event?.ecommerce as Record<string, unknown>;
    expect(ecommerce?.transaction_id).toBe("");
  });

  it("uses totalAmount as fallback when amount is absent", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { purchase } = useAdAnalytics();

    const order: PurchaseOrderData = {
      documentId: "doc123",
      totalAmount: 15000,
    };

    purchase(order);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    const ecommerce = event?.ecommerce as Record<string, unknown>;
    expect(ecommerce?.value).toBe(15000);
  });

  it("defaults to 0 when neither amount nor totalAmount is present", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { purchase } = useAdAnalytics();

    const order: PurchaseOrderData = { documentId: "doc123" };

    purchase(order);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    const ecommerce = event?.ecommerce as Record<string, unknown>;
    expect(ecommerce?.value).toBe(0);
  });

  it("defaults currency to CLP when absent", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { purchase } = useAdAnalytics();

    const order: PurchaseOrderData = { documentId: "doc123", amount: 5000 };

    purchase(order);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    const ecommerce = event?.ecommerce as Record<string, unknown>;
    expect(ecommerce?.currency).toBe("CLP");
  });

  it("builds items array with correct item fields", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { purchase } = useAdAnalytics();

    const order: PurchaseOrderData = {
      documentId: "doc123",
      amount: 9990,
      currency: "CLP",
    };

    purchase(order);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    const ecommerce = event?.ecommerce as Record<string, unknown>;
    const items = ecommerce?.items as Record<string, unknown>[];

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      item_id: "doc123",
      item_name: "Orden de pago",
      item_category: "Order",
      price: 9990,
      quantity: 1,
      currency: "CLP",
    });
  });

  it("purchase event has no undefined values in ecommerce payload", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { purchase } = useAdAnalytics();

    const order: PurchaseOrderData = {};

    purchase(order);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    const ecommerce = event?.ecommerce as Record<string, unknown>;

    expect(ecommerce?.transaction_id).not.toBeUndefined();
    expect(ecommerce?.value).not.toBeUndefined();
    expect(ecommerce?.currency).not.toBeUndefined();
    expect(ecommerce?.items).not.toBeUndefined();
  });

  it("coerces string amount to number (Strapi biginteger fix)", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { purchase } = useAdAnalytics();

    const order: PurchaseOrderData = {
      documentId: "doc123",
      amount: "19990" as unknown as number,
      currency: "CLP",
    };

    purchase(order);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    const ecommerce = event?.ecommerce as Record<string, unknown>;
    expect(typeof ecommerce?.value).toBe("number");
    expect(ecommerce?.value).toBe(19990);
  });

  it("coerces string '0' amount to numeric 0 (Strapi biginteger fix)", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { purchase } = useAdAnalytics();

    const order: PurchaseOrderData = {
      documentId: "doc123",
      amount: "0" as unknown as number,
      currency: "CLP",
    };

    purchase(order);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    const ecommerce = event?.ecommerce as Record<string, unknown>;
    expect(typeof ecommerce?.value).toBe("number");
    expect(ecommerce?.value).toBe(0);
  });

  it("uses transactionId as item_id fallback when documentId is absent", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const { purchase } = useAdAnalytics();

    const order: PurchaseOrderData = {
      amount: 9990,
      currency: "CLP",
      payment_response: { buy_order: "BO-123" },
    };

    purchase(order);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    const ecommerce = event?.ecommerce as Record<string, unknown>;
    const items = ecommerce?.items as Record<string, unknown>[];
    expect(items[0]?.item_id).toBe("BO-123");
  });
});

describe("useAdAnalytics - existing methods unchanged", () => {
  it("exports all existing methods", async () => {
    const { useAdAnalytics } = await import("./useAdAnalytics");
    const analytics = useAdAnalytics();

    expect(typeof analytics.viewItemList).toBe("function");
    expect(typeof analytics.addToCartPack).toBe("function");
    expect(typeof analytics.addToCartFeatured).toBe("function");
    expect(typeof analytics.removeFromCart).toBe("function");
    expect(typeof analytics.beginCheckout).toBe("function");
    expect(typeof analytics.addPaymentInfo).toBe("function");
    expect(typeof analytics.sendErrorEvent).toBe("function");
    expect(typeof analytics.stepView).toBe("function");
    expect(typeof analytics.pushEvent).toBe("function");
    expect(typeof analytics.purchase).toBe("function");
  });
});
