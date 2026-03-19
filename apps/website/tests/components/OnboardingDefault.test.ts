import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";

// ─── Global stubs for auto-imported Nuxt composables ──────────────────────
global.useAppStore = vi.fn(() => ({ getReferer: null }));

// ─── Import component AFTER all mocks (vi.mock is hoisted by Vitest) ─────
import OnboardingDefault from "@/components/OnboardingDefault.vue";

// ─── Stubs for child components ───────────────────────────────────────────
const LogoBlackStub = {
  name: "LogoBlack",
  template: "<div class='logo-black-stub' />",
};
const FormProfileStub = {
  name: "FormProfile",
  template: "<div class='form-profile-stub' />",
  props: ["onboardingMode"],
  emits: ["success"],
};

const buildWrapper = () =>
  mount(OnboardingDefault, {
    global: {
      components: {
        LogoBlack: LogoBlackStub,
        FormProfile: FormProfileStub,
      },
    },
  });

describe("OnboardingDefault.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders LogoBlack component (LAYOUT-02)", () => {
    const wrapper = buildWrapper();
    expect(wrapper.findComponent(LogoBlackStub).exists()).toBe(true);
  });

  it("renders FormProfile with onboarding-mode prop set to true (FORM-01)", () => {
    const wrapper = buildWrapper();
    const formProfile = wrapper.findComponent(FormProfileStub);
    expect(formProfile.exists()).toBe(true);
    expect(formProfile.props("onboardingMode")).toBe(true);
  });

  it("emits 'success' when FormProfile emits 'success' (FORM-01)", async () => {
    const wrapper = buildWrapper();
    const formProfile = wrapper.findComponent(FormProfileStub);
    await formProfile.vm.$emit("success");
    expect(wrapper.emitted("success")).toBeTruthy();
  });
});
