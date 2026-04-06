import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";

// ─── Mock useStrapiUser ───────────────────────────────────────────────────
const mockUser = ref({
  id: 1,
  firstname: "John",
  lastname: "Doe",
  rut: "12.345.678-9",
  phone: "+56 9 1234 5678",
  address: "Test Street",
  address_number: "123",
  postal_code: "8320000",
  is_company: false,
  region: { id: 1 },
  commune: { id: 1, region: { id: 1 } },
  birthdate: "1990-01-01",
  business_name: "",
  business_type: "",
  business_rut: "",
  business_address: "",
  business_address_number: "",
  business_postal_code: "",
  business_region: null,
  business_commune: null,
});
global.useStrapiUser = vi.fn(() => mockUser);

// ─── Mock useStrapiAuth ───────────────────────────────────────────────────
const mockFetchUser = vi.fn().mockResolvedValue();
global.useStrapiAuth = vi.fn(() => ({
  fetchUser: mockFetchUser,
}));

// ─── Mock useRouter ───────────────────────────────────────────────────────
const mockPush = vi.fn();
global.useRouter = vi.fn(() => ({ push: mockPush }));

// ─── Mock stores ─────────────────────────────────────────────────────────
global.useRegionsStore = vi.fn(() => ({ regions: { data: [] } }));
global.useCommunesStore = vi.fn(() => ({ communes: { data: [] } }));
const mockUpdateUserProfile = vi.fn().mockResolvedValue();
global.useUserStore = vi.fn(() => ({
  updateUserProfile: mockUpdateUserProfile,
}));
const mockMeReset = vi.fn();
global.useMeStore = vi.fn(() => ({ reset: mockMeReset }));

// ─── Mock useSweetAlert2 ─────────────────────────────────────────────────
const mockSwalFire = vi.fn().mockResolvedValue({ isConfirmed: true });
global.useSweetAlert2 = vi.fn(() => ({
  Swal: { fire: mockSwalFire },
}));

// ─── Mock useLogger ───────────────────────────────────────────────────────
global.useLogger = vi.fn(() => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

// ─── Mock useValidation ───────────────────────────────────────────────────
global.useValidation = vi.fn(() => ({
  isValidName: vi.fn(() => true),
  isValidAddress: vi.fn(() => true),
}));

// ─── Mock #app ────────────────────────────────────────────────────────────
vi.mock("#app", () => ({
  useNuxtApp: vi.fn(() => ({ $recaptcha: { execute: vi.fn() } })),
  useRuntimeConfig: vi.fn(() => ({ public: {} })),
}));

// ─── Mock vue-router ──────────────────────────────────────────────────────
vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  useRoute: vi.fn(() => ({ params: {}, query: {}, path: "/" })),
}));

// ─── Stub vee-validate ────────────────────────────────────────────────────
vi.mock("vee-validate", () => ({
  Field: { template: "<input />" },
  Form: {
    name: "Form",
    template:
      '<form @submit.prevent="$emit(\'submit\', {})"><slot :errors="{}" :meta="{ valid: true }" /></form>',
    emits: ["submit"],
    setup() {
      return {
        validate: () => Promise.resolve(true),
        resetForm: () => {},
        setErrors: () => {},
      };
    },
  },
  ErrorMessage: { template: "<span />" },
}));

// ─── Stub yup ─────────────────────────────────────────────────────────────
vi.mock("yup", () => ({
  object: vi.fn(() => ({ shape: vi.fn().mockReturnThis() })),
  string: vi.fn(() => ({
    required: vi.fn().mockReturnThis(),
    email: vi.fn().mockReturnThis(),
    min: vi.fn().mockReturnThis(),
    max: vi.fn().mockReturnThis(),
    oneOf: vi.fn().mockReturnThis(),
    matches: vi.fn().mockReturnThis(),
    test: vi.fn().mockReturnThis(),
    nullable: vi.fn().mockReturnThis(),
    optional: vi.fn().mockReturnThis(),
    when: vi.fn().mockReturnThis(),
  })),
  boolean: vi.fn(() => ({
    required: vi.fn().mockReturnThis(),
    nullable: vi.fn().mockReturnThis(),
    optional: vi.fn().mockReturnThis(),
  })),
  date: vi.fn(() => ({
    typeError: vi.fn().mockReturnThis(),
    required: vi.fn().mockReturnThis(),
    max: vi.fn().mockReturnThis(),
    nullable: vi.fn().mockReturnThis(),
    optional: vi.fn().mockReturnThis(),
  })),
  ref: vi.fn(),
}));

// ─── Mock useRut composable ───────────────────────────────────────────────
vi.mock("@/composables/useRut", () => ({
  useRut: () => ({
    formatRut: vi.fn((v: string) => v),
    validateRut: vi.fn(() => true),
  }),
}));

// ─── Mock useLogger composable ────────────────────────────────────────────
vi.mock("@/composables/useLogger", () => ({
  useLogger: () => ({
    logInfo: vi.fn(),
    logError: vi.fn(),
  }),
}));

// ─── Mock useValidation composable ────────────────────────────────────────
vi.mock("@/composables/useValidation", () => ({
  useValidation: () => ({
    isValidName: vi.fn(() => true),
    isValidAddress: vi.fn(() => true),
  }),
}));

// ─── Mock stores ─────────────────────────────────────────────────────────
vi.mock("@/stores/regions.store", () => ({
  useRegionsStore: vi.fn(() => ({ regions: { data: [] } })),
}));

vi.mock("@/stores/communes.store", () => ({
  useCommunesStore: vi.fn(() => ({ communes: { data: [] } })),
}));

vi.mock("@/stores/user.store", () => ({
  useUserStore: vi.fn(() => ({
    updateUserProfile: mockUpdateUserProfile,
  })),
}));

// ─── Import component AFTER all mocks ────────────────────────────────────
import FormProfile from "@/components/FormProfile.vue";

// ─── Helper: mount component ──────────────────────────────────────────────
const buildWrapper = (props = {}) =>
  mount(FormProfile, { attachTo: document.body, props });

describe("FormProfile.vue — onboarding mode (FORM-02, FORM-03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateUserProfile.mockResolvedValue();
    mockFetchUser.mockResolvedValue();
    mockSwalFire.mockResolvedValue({ isConfirmed: true });

    // Re-register globals after clearAllMocks
    global.useStrapiUser = vi.fn(() => mockUser);
    global.useStrapiAuth = vi.fn(() => ({ fetchUser: mockFetchUser }));
    global.useRouter = vi.fn(() => ({ push: mockPush }));
    global.useRegionsStore = vi.fn(() => ({ regions: { data: [] } }));
    global.useCommunesStore = vi.fn(() => ({ communes: { data: [] } }));
    global.useUserStore = vi.fn(() => ({
      updateUserProfile: mockUpdateUserProfile,
    }));
    global.useMeStore = vi.fn(() => ({ reset: mockMeReset }));
    global.useSweetAlert2 = vi.fn(() => ({
      Swal: { fire: mockSwalFire },
    }));
    global.useLogger = vi.fn(() => ({ logInfo: vi.fn(), logError: vi.fn() }));
    global.useValidation = vi.fn(() => ({
      isValidName: vi.fn(() => true),
      isValidAddress: vi.fn(() => true),
    }));

    // Reset window.location.href
    Object.defineProperty(window, "location", {
      value: { href: "/" },
      writable: true,
    });
  });

  it("has defineEmits with 'success' event (FORM-02)", () => {
    const wrapper = buildWrapper();
    // If the component has defineEmits(['success']), the emits option will include 'success'
    expect(
      wrapper.vm.$options?.emits ??
        (wrapper.vm as unknown as { __emits?: unknown }).__emits,
    ).toBeTruthy();
    const emitsOption =
      wrapper.vm.$options?.emits ??
      (wrapper.vm as unknown as { __emits?: unknown }).__emits;
    const hasSuccess = Array.isArray(emitsOption)
      ? emitsOption.includes("success")
      : "success" in emitsOption;
    expect(hasSuccess).toBe(true);
  });

  it("has defineProps with onboardingMode boolean defaulting to false (FORM-02)", () => {
    const wrapper = buildWrapper();
    // The prop should exist and default to false
    const propsData = wrapper.vm.$props as Record<string, unknown>;
    expect("onboardingMode" in propsData).toBe(true);
    expect(propsData.onboardingMode).toBe(false);
  });

  it("emits 'success' after successful save (FORM-02)", async () => {
    const wrapper = buildWrapper({ onboardingMode: true });
    const vm = wrapper.vm as unknown as {
      handleSubmit: (values: unknown) => Promise<void>;
    };

    await vm.handleSubmit({
      firstname: "John",
      lastname: "Doe",
      rut: "12.345.678-9",
      phone: "+56 9 1234 5678",
      address: "Test Street",
      address_number: "123",
      postal_code: "8320000",
      is_company: false,
      region: 1,
      commune: 1,
      birthdate: "1990-01-01",
    });
    await new Promise((r) => setTimeout(r, 0));

    expect(wrapper.emitted("success")).toBeTruthy();
  });

  it("does NOT redirect to /cuenta/perfil when onboardingMode is true (FORM-02)", async () => {
    const wrapper = buildWrapper({ onboardingMode: true });
    const vm = wrapper.vm as unknown as {
      handleSubmit: (values: unknown) => Promise<void>;
    };

    await vm.handleSubmit({
      firstname: "John",
      lastname: "Doe",
      rut: "12.345.678-9",
      phone: "+56 9 1234 5678",
      address: "Test Street",
      address_number: "123",
      postal_code: "8320000",
      is_company: false,
      region: 1,
      commune: 1,
      birthdate: "1990-01-01",
    });
    await new Promise((r) => setTimeout(r, 0));

    expect(window.location.href).not.toBe("/cuenta/perfil");
  });

  it("DOES redirect to /cuenta/perfil when onboardingMode is false (backward compat) (FORM-03)", async () => {
    const wrapper = buildWrapper({ onboardingMode: false });
    const vm = wrapper.vm as unknown as {
      handleSubmit: (values: unknown) => Promise<void>;
    };

    await vm.handleSubmit({
      firstname: "John",
      lastname: "Doe",
      rut: "12.345.678-9",
      phone: "+56 9 1234 5678",
      address: "Test Street",
      address_number: "123",
      postal_code: "8320000",
      is_company: false,
      region: 1,
      commune: 1,
      birthdate: "1990-01-01",
    });
    await new Promise((r) => setTimeout(r, 0));

    expect(window.location.href).toBe("/cuenta/perfil");
  });
});
