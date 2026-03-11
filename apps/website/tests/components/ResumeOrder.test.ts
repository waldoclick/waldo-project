import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ResumeOrder from "@/components/ResumeOrder.vue";

// Mock useRuntimeConfig globally
global.useRuntimeConfig = vi.fn(() => ({
  public: {
    baseUrl: "http://localhost:3000",
    apiUrl: "http://localhost:1337",
  },
}));

// Mock CardInfo component
const CardInfoStub = {
  name: "CardInfo",
  props: ["title", "description"],
  template:
    '<div class="card--info"><div class="card--info__title">{{ title }}</div><div class="card--info__description">{{ description }}</div></div>',
};

// Mock other components
const IconCheckCircleStub = {
  name: "IconCheckCircle",
  props: ["size"],
  template: "<div></div>",
};

// Mock composables
vi.mock("@/composables/useImage", () => ({
  useImageProxy: vi.fn(() => ({
    transformUrl: vi.fn((url) => url),
  })),
}));

// Mock stores (return empty functions for unused stores)
vi.mock("@/stores/categories.store", () => ({
  useCategoriesStore: vi.fn(() => ({})),
}));

vi.mock("@/stores/communes.store", () => ({
  useCommunesStore: vi.fn(() => ({})),
}));

vi.mock("@/stores/conditions.store", () => ({
  useConditionsStore: vi.fn(() => ({})),
}));

describe("ResumeOrder.vue - Webpay receipt fields", () => {
  it("renders all Webpay receipt fields when summary includes payment_response data", () => {
    // Mock summary with complete payment_response
    const mockSummary = {
      documentId: "order-123",
      amount: 5000,
      currency: "CLP",
      status: "completed",
      paymentMethod: "Webpay",
      createdAt: "2026-03-10T03:00:00Z",
      authorizationCode: "1234567",
      paymentType: "VD",
      cardLast4: "4321",
      commerceCode: "597055555532",
    };

    const wrapper = mount(ResumeOrder, {
      props: {
        title: "Test Title",
        summary: mockSummary,
      },
      global: {
        components: {
          CardInfo: CardInfoStub,
          IconCheckCircle: IconCheckCircleStub,
          "client-only": {
            template: "<div><slot /></div>",
          },
        },
      },
    });

    // Assert: CardInfo components render with correct Spanish labels
    const cardInfos = wrapper.findAll(".resume--order__grid");
    expect(cardInfos.length).toBeGreaterThan(0);

    // Assert: All Webpay fields are present in the rendered output
    const text = wrapper.text();
    expect(text).toContain("N° de comprobante");
    expect(text).toContain("Monto pagado");
    expect(text).toContain("Estado del pago");
    expect(text).toContain("Método de pago");

    // Expected Webpay-specific fields (will be added in implementation)
    expect(text).toContain("Código de autorización");
    expect(text).toContain("Tipo de pago");
    expect(text).toContain("Últimos 4 dígitos");
    expect(text).toContain("Código de comercio");

    // Assert: Values are displayed (not placeholders)
    expect(text).toContain("1234567"); // authorization code
    expect(text).toContain("VD"); // payment type
    expect(text).toContain("4321"); // card last 4
    expect(text).toContain("597055555532"); // commerce code
  });

  it("shows placeholder for missing payment_response fields", () => {
    // Mock summary with partial payment_response (missing authorization_code)
    const mockSummary = {
      documentId: "order-456",
      amount: 3000,
      currency: "CLP",
      status: "completed",
      paymentMethod: "Webpay",
      createdAt: "2026-03-10T03:00:00Z",
      // authorizationCode is missing
      paymentType: "VD",
      cardLast4: "1234",
      commerceCode: "597055555532",
    };

    const wrapper = mount(ResumeOrder, {
      props: {
        title: "Test Title",
        summary: mockSummary,
      },
      global: {
        components: {
          CardInfo: CardInfoStub,
          IconCheckCircle: IconCheckCircleStub,
          "client-only": {
            template: "<div><slot /></div>",
          },
        },
      },
    });

    const text = wrapper.text();

    // Assert: "No disponible" displayed for missing authorization_code
    expect(text).toContain("Código de autorización");
    expect(text).toContain("No disponible");

    // Assert: Other fields still display correctly
    expect(text).toContain("VD");
    expect(text).toContain("1234");
    expect(text).toContain("597055555532");
  });

  it("handles null/undefined payment_response gracefully", () => {
    // Mock summary without payment_response fields
    const mockSummary = {
      documentId: "order-789",
      amount: 1000,
      currency: "CLP",
      status: "completed",
      paymentMethod: "Webpay",
      createdAt: "2026-03-10T03:00:00Z",
      // No Webpay-specific fields
    };

    const wrapper = mount(ResumeOrder, {
      props: {
        title: "Test Title",
        summary: mockSummary,
      },
      global: {
        components: {
          CardInfo: CardInfoStub,
          IconCheckCircle: IconCheckCircleStub,
          "client-only": {
            template: "<div><slot /></div>",
          },
        },
      },
    });

    // Assert: Component doesn't crash
    expect(wrapper.exists()).toBe(true);

    const text = wrapper.text();

    // Assert: All Webpay field labels are present
    expect(text).toContain("Código de autorización");
    expect(text).toContain("Tipo de pago");
    expect(text).toContain("Últimos 4 dígitos");
    expect(text).toContain("Código de comercio");

    // Assert: Placeholders shown for all missing fields
    const placeholderCount = (text.match(/No disponible/g) || []).length;
    expect(placeholderCount).toBeGreaterThanOrEqual(4);
  });
});
