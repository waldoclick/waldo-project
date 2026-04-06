import { vi, describe, it, expect, beforeEach } from "vitest";
import type {
  PurchaseOrderData,
  PurchaseOrderItem,
} from "@/composables/useAdAnalytics";

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
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { pushEvent } = useAdAnalytics();

    pushEvent("view_item_list", []);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "view_item_list",
    ) as Record<string, unknown> | undefined;
    expect(event?.flow).toBe("ad_creation");
  });

  it("uses provided flow param when passed explicitly", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { pushEvent } = useAdAnalytics();

    pushEvent("purchase", [], {}, "pack_purchase");

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    expect(event?.flow).toBe("pack_purchase");
  });

  it("still accepts 3-argument form (backward compatible)", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
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
  it("uses order.id as transaction_id (gateway-agnostic)", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { purchase } = useAdAnalytics();

    const order: PurchaseOrderData = {
      id: 42,
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
    // transaction_id uses order.id, not buy_order (which is Webpay-specific)
    expect(ecommerce?.transaction_id).toBe("42");
    expect(ecommerce?.value).toBe(9990);
    expect(ecommerce?.currency).toBe("CLP");
  });

  it("uses empty string for transaction_id when id is absent", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
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
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
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
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
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
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { purchase } = useAdAnalytics();

    const order: PurchaseOrderData = { documentId: "doc123", amount: 5000 };

    purchase(order);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    const ecommerce = event?.ecommerce as Record<string, unknown>;
    expect(ecommerce?.currency).toBe("CLP");
  });

  it("maps order.items to GA4 items when present", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { purchase } = useAdAnalytics();

    const orderItems: PurchaseOrderItem[] = [
      { name: "1 Aviso", price: 5990, quantity: 1 },
      { name: "Anuncio destacado", price: 10000, quantity: 1 },
    ];

    const order: PurchaseOrderData = {
      id: 101,
      documentId: "doc123",
      amount: 15990,
      currency: "CLP",
      items: orderItems,
    };

    purchase(order);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    const ecommerce = event?.ecommerce as Record<string, unknown>;
    const items = ecommerce?.items as Record<string, unknown>[];

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      item_id: "1_aviso",
      item_name: "1 Aviso",
      item_category: "Order",
      price: 5990,
      quantity: 1,
      currency: "CLP",
    });
    expect(items[1]).toMatchObject({
      item_id: "anuncio_destacado",
      item_name: "Anuncio destacado",
      item_category: "Order",
      price: 10000,
      quantity: 1,
      currency: "CLP",
    });
  });

  it("falls back to single generic item when order.items is absent", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
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
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
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
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
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
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
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

  it("generic fallback item uses empty item_id when documentId is also absent", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
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
    expect(items[0]?.item_id).toBe("");
  });

  it("handles free ad purchase with value: 0 (ECOM-03)", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { purchase } = useAdAnalytics();

    const order: PurchaseOrderData = {
      documentId: "ad-doc-abc",
      amount: 0,
      currency: "CLP",
    };

    purchase(order);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    const ecommerce = event?.ecommerce as Record<string, unknown>;
    expect(ecommerce?.value).toBe(0);
    expect(typeof ecommerce?.value).toBe("number");
    // Free ads have no order.id — transaction_id is empty string
    expect(ecommerce?.transaction_id).toBe("");
  });

  it("uses ad documentId as item_id for free ad purchase fallback (ECOM-03)", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { purchase } = useAdAnalytics();

    const order: PurchaseOrderData = {
      documentId: "ad-doc-abc",
      amount: 0,
      currency: "CLP",
    };

    purchase(order);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "purchase",
    ) as Record<string, unknown> | undefined;
    const ecommerce = event?.ecommerce as Record<string, unknown>;
    const items = ecommerce?.items as Record<string, unknown>[];
    // No order.items → falls back to generic item; item_id uses documentId
    expect(items[0]?.item_id).toBe("ad-doc-abc");
  });
});

describe("useAdAnalytics - existing methods unchanged", () => {
  it("exports all existing methods", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
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
    // New discovery-tracking functions
    expect(typeof analytics.viewItemListPublic).toBe("function");
    expect(typeof analytics.viewItem).toBe("function");
    expect(typeof analytics.search).toBe("function");
    // New contact/auth/blog functions
    expect(typeof analytics.contactSeller).toBe("function");
    expect(typeof analytics.generateLead).toBe("function");
    expect(typeof analytics.signUp).toBe("function");
    expect(typeof analytics.login).toBe("function");
    expect(typeof analytics.articleView).toBe("function");
  });
});

describe("useAdAnalytics - viewItemListPublic()", () => {
  it("pushes view_item_list event with flow='ad_discovery' and mapped items", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { viewItemListPublic } = useAdAnalytics();

    const ad = {
      id: 42,
      name: "Grúa horquilla Toyota",
      price: 5000000,
      currency: "CLP",
      category: { name: "Maquinaria" },
    };

    viewItemListPublic([ad]);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "view_item_list",
    ) as Record<string, unknown> | undefined;

    expect(event).toBeDefined();
    expect(event?.flow).toBe("ad_discovery");

    const ecommerce = event?.ecommerce as Record<string, unknown>;
    const items = ecommerce?.items as Record<string, unknown>[];
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      item_id: "42",
      item_name: "Grúa horquilla Toyota",
      item_category: "Maquinaria",
      price: 5000000,
    });
  });

  it("does NOT push an event when ads array is empty", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { viewItemListPublic } = useAdAnalytics();

    viewItemListPublic([]);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "view_item_list",
    );
    expect(event).toBeUndefined();
  });

  it("uses 'Unknown' for item_category when category is a number", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { viewItemListPublic } = useAdAnalytics();

    const ad = {
      id: 10,
      name: "Camión",
      price: 12000000,
      currency: "CLP",
      category: 3,
    };

    viewItemListPublic([ad]);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "view_item_list",
    ) as Record<string, unknown> | undefined;
    const ecommerce = event?.ecommerce as Record<string, unknown>;
    const items = ecommerce?.items as Record<string, unknown>[];
    expect(items[0]?.item_category).toBe("Unknown");
  });
});

describe("useAdAnalytics - viewItem()", () => {
  it("pushes view_item event with flow='ad_discovery' and exactly 1 item", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { viewItem } = useAdAnalytics();

    const ad = {
      id: 99,
      name: "Montacargas Clark",
      price: 8500000,
      currency: "CLP",
      category: { name: "Maquinaria" },
    };

    viewItem(ad);

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "view_item",
    ) as Record<string, unknown> | undefined;

    expect(event).toBeDefined();
    expect(event?.flow).toBe("ad_discovery");

    const ecommerce = event?.ecommerce as Record<string, unknown>;
    const items = ecommerce?.items as Record<string, unknown>[];
    expect(items).toHaveLength(1);
    expect(items[0]?.item_id).toBe("99");
  });

  it("uses category.name when category is an object, 'Unknown' when numeric", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { viewItem } = useAdAnalytics();

    viewItem({
      id: 5,
      name: "Tractor",
      price: 20000000,
      currency: "CLP",
      category: { name: "Agrícola" },
    });

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "view_item",
    ) as Record<string, unknown> | undefined;
    const ecommerce = event?.ecommerce as Record<string, unknown>;
    const items = ecommerce?.items as Record<string, unknown>[];
    expect(items[0]?.item_category).toBe("Agrícola");
  });
});

describe("useAdAnalytics - search()", () => {
  it("pushes search event with search_term and flow='ad_discovery', no ecommerce block", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { search } = useAdAnalytics();

    search("grúa horquilla");

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "search",
    ) as Record<string, unknown> | undefined;

    expect(event).toBeDefined();
    expect(event?.flow).toBe("ad_discovery");
    expect(event?.search_term).toBe("grúa horquilla");
    expect(event?.ecommerce).toBeUndefined();
  });
});

describe("useAdAnalytics - contactSeller()", () => {
  it("pushes contact event with method='email' and flow='user_engagement', no ecommerce block", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { contactSeller } = useAdAnalytics();

    contactSeller("email");

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "contact",
    ) as Record<string, unknown> | undefined;

    expect(event).toBeDefined();
    expect(event?.flow).toBe("user_engagement");
    expect(event?.method).toBe("email");
    expect(event?.ecommerce).toBeUndefined();
  });

  it("pushes contact event with method='phone' and flow='user_engagement', no ecommerce block", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { contactSeller } = useAdAnalytics();

    contactSeller("phone");

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "contact",
    ) as Record<string, unknown> | undefined;

    expect(event).toBeDefined();
    expect(event?.flow).toBe("user_engagement");
    expect(event?.method).toBe("phone");
    expect(event?.ecommerce).toBeUndefined();
  });
});

describe("useAdAnalytics - generateLead()", () => {
  it("pushes generate_lead event with flow='user_engagement', no ecommerce block", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { generateLead } = useAdAnalytics();

    generateLead();

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "generate_lead",
    ) as Record<string, unknown> | undefined;

    expect(event).toBeDefined();
    expect(event?.flow).toBe("user_engagement");
    expect(event?.ecommerce).toBeUndefined();
  });
});

describe("useAdAnalytics - signUp()", () => {
  it("pushes sign_up event with method='email' and flow='user_lifecycle', no ecommerce block", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { signUp } = useAdAnalytics();

    signUp();

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "sign_up",
    ) as Record<string, unknown> | undefined;

    expect(event).toBeDefined();
    expect(event?.flow).toBe("user_lifecycle");
    expect(event?.method).toBe("email");
    expect(event?.ecommerce).toBeUndefined();
  });
});

describe("useAdAnalytics - login()", () => {
  it("pushes login event with method='email' and flow='user_lifecycle', no ecommerce block", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { login } = useAdAnalytics();

    login("email");

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "login",
    ) as Record<string, unknown> | undefined;

    expect(event).toBeDefined();
    expect(event?.flow).toBe("user_lifecycle");
    expect(event?.method).toBe("email");
    expect(event?.ecommerce).toBeUndefined();
  });

  it("pushes login event with method='google' and flow='user_lifecycle', no ecommerce block", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { login } = useAdAnalytics();

    login("google");

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "login",
    ) as Record<string, unknown> | undefined;

    expect(event).toBeDefined();
    expect(event?.flow).toBe("user_lifecycle");
    expect(event?.method).toBe("google");
    expect(event?.ecommerce).toBeUndefined();
  });
});

describe("useAdAnalytics - articleView()", () => {
  it("pushes article_view event with article_id, article_title, article_category and flow='content_engagement', no ecommerce block", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { articleView } = useAdAnalytics();

    articleView("post-123", "Cómo vender tu maquinaria", "Consejos");

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "article_view",
    ) as Record<string, unknown> | undefined;

    expect(event).toBeDefined();
    expect(event?.flow).toBe("content_engagement");
    expect(event?.article_id).toBe("post-123");
    expect(event?.article_title).toBe("Cómo vender tu maquinaria");
    expect(event?.article_category).toBe("Consejos");
    expect(event?.ecommerce).toBeUndefined();
  });

  it("passes article_id as-is without coercion (number stays number)", async () => {
    const { useAdAnalytics } = await import("@/composables/useAdAnalytics");
    const { articleView } = useAdAnalytics();

    articleView(42, "Mercado de maquinaria 2026", "Mercado");

    const event = mockDataLayer.find(
      (e) => (e as Record<string, unknown>).event === "article_view",
    ) as Record<string, unknown> | undefined;

    expect(event).toBeDefined();
    expect(event?.article_id).toBe(42);
    expect(typeof event?.article_id).toBe("number");
  });
});
