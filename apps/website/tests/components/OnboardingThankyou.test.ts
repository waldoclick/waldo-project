import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";

// ─── Import component ─────────────────────────────────────────────────────
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
  it("renders thank-you heading 'Muchas gracias por registrarte' (THANK-01)", () => {
    const wrapper = buildWrapper();
    expect(wrapper.text()).toContain("Muchas gracias por registrarte");
  });

  it("renders descriptive text about profile completion (THANK-01)", () => {
    const wrapper = buildWrapper();
    expect(wrapper.text()).toContain("Tu perfil esta completo");
  });

  it("renders primary button linking to /anunciar (THANK-02)", () => {
    const wrapper = buildWrapper();
    const links = wrapper.findAll("a");
    const anunciarLink = links.find(
      (l) => l.attributes("href") === "/anunciar",
    );
    expect(anunciarLink).toBeTruthy();
    expect(anunciarLink!.text()).toContain("Crear mi primer anuncio");
  });

  it("renders secondary button linking deterministically to / (THANK-03)", () => {
    const wrapper = buildWrapper();
    const links = wrapper.findAll("a");
    const homeLink = links.find((l) => l.attributes("href") === "/");
    expect(homeLink).toBeTruthy();
    expect(homeLink!.text()).toContain("Ir al inicio");
  });

  it("uses BEM class onboarding--thankyou on root element (LAYOUT-03)", () => {
    const wrapper = buildWrapper();
    expect(wrapper.element.classList.contains("onboarding--thankyou")).toBe(
      true,
    );
  });
});
