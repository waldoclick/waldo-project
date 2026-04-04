import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import PoliciesDefault from "@/components/PoliciesDefault.vue";
import type { Policy } from "@/types/policy";

// Mock AccordionDefault to avoid rendering complexity in unit tests
const AccordionDefaultStub = {
  name: "AccordionDefault",
  props: ["questions"],
  template:
    '<div class="accordion--default" data-testid="accordion"><slot /></div>',
};

// Mock useNuxtApp to avoid runtime errors in test environment
vi.stubGlobal("useNuxtApp", () => ({
  $setSEO: vi.fn(),
  $setStructuredData: vi.fn(),
}));

describe("<PoliciesDefault />", () => {
  it("passes policies prop to AccordionDefault as questions", () => {
    // Arrange
    const policies: Policy[] = [
      {
        id: 1,
        title: "1. Información general",
        text: "<p>Texto de la política.</p>",
        order: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        publishedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: 2,
        title: "2. Protección de datos",
        text: "<p>Contenido.</p>",
        order: 2,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        publishedAt: "2026-01-01T00:00:00.000Z",
      },
    ];

    // Act
    const wrapper = mount(PoliciesDefault, {
      props: { policies },
      global: {
        components: { AccordionDefault: AccordionDefaultStub },
      },
    });

    // Assert: AccordionDefault is mounted and receives the correct questions
    const accordion = wrapper.findComponent(AccordionDefaultStub);
    expect(accordion.exists()).toBe(true);
    expect(accordion.props("questions")).toEqual(policies);
  });

  it("renders with empty policies array", () => {
    // Arrange
    const policies: Policy[] = [];

    // Act
    const wrapper = mount(PoliciesDefault, {
      props: { policies },
      global: {
        components: { AccordionDefault: AccordionDefaultStub },
      },
    });

    // Assert: component renders without error and accordion receives empty array
    expect(wrapper.exists()).toBe(true);
    const accordion = wrapper.findComponent(AccordionDefaultStub);
    expect(accordion.exists()).toBe(true);
    expect(accordion.props("questions")).toEqual([]);
  });
});
