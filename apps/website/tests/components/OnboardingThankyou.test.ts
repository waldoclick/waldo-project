import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";

// ─── Mock useAppStore with a referer value ────────────────────────────────
const mockGetReferer = vi.fn(() => "/some-page");
global.useAppStore = vi.fn(() => ({ getReferer: mockGetReferer() }));

// ─── Import component AFTER all mocks (vi.mock is hoisted by Vitest) ─────
import OnboardingThankyou from "@/components/OnboardingThankyou.vue";

// ─── NuxtLink stub ────────────────────────────────────────────────────────
const NuxtLinkStub = {
  name: "NuxtLink",
  template: "<a :href='to'><slot /></a>",
  props: ["to"],
};

const buildWrapper = () =>
  mount(OnboardingThankyou, {
    global: {
      components: {
        NuxtLink: NuxtLinkStub,
      },
    },
  });

describe("OnboardingThankyou.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders thank-you heading 'Muchas gracias por registrarte' (THANK-01)", () => {
    global.useAppStore = vi.fn(() => ({ getReferer: "/some-page" }));
    const wrapper = buildWrapper();
    expect(wrapper.text()).toContain("Muchas gracias por registrarte");
  });

  it("renders descriptive text about profile completion (THANK-01)", () => {
    global.useAppStore = vi.fn(() => ({ getReferer: "/some-page" }));
    const wrapper = buildWrapper();
    expect(wrapper.text()).toContain("Tu perfil esta completo");
  });

  it("renders primary button linking to /anunciar (THANK-02)", () => {
    global.useAppStore = vi.fn(() => ({ getReferer: "/some-page" }));
    const wrapper = buildWrapper();
    const links = wrapper.findAll("a");
    const anunciarLink = links.find(
      (l) => l.attributes("href") === "/anunciar",
    );
    expect(anunciarLink).toBeTruthy();
    expect(anunciarLink!.text()).toContain("Crear mi primer anuncio");
  });

  it("renders secondary button linking to appStore referer or / as fallback (THANK-03)", () => {
    global.useAppStore = vi.fn(() => ({ getReferer: "/some-page" }));
    const wrapper = buildWrapper();
    const links = wrapper.findAll("a");
    const returnLink = links.find((l) => l.attributes("href") === "/some-page");
    expect(returnLink).toBeTruthy();
    expect(returnLink!.text()).toContain("Volver a Waldo");
  });

  it("falls back to / when appStore.getReferer is null (THANK-03)", () => {
    global.useAppStore = vi.fn(() => ({ getReferer: null }));
    const wrapper = buildWrapper();
    const links = wrapper.findAll("a");
    const returnLink = links.find((l) => l.attributes("href") === "/");
    expect(returnLink).toBeTruthy();
    expect(returnLink!.text()).toContain("Volver a Waldo");
  });

  it("uses BEM class onboarding--thankyou on root element (LAYOUT-03)", () => {
    global.useAppStore = vi.fn(() => ({ getReferer: null }));
    const wrapper = buildWrapper();
    expect(wrapper.element.classList.contains("onboarding--thankyou")).toBe(
      true,
    );
  });
});
