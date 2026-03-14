import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";

// ─── Mock registrationEmail state (shared, persistent between tests) ──────
const registrationEmailRef = ref("");

// ─── Mock router ─────────────────────────────────────────────────────────
const mockPush = vi.fn();
global.useRouter = vi.fn(() => ({ push: mockPush }));
global.useRoute = vi.fn(() => ({}));

// ─── Mock useStrapiClient ─────────────────────────────────────────────────
const mockClient = vi.fn();
global.useStrapiClient = vi.fn(() => mockClient);

// ─── Mock useStrapiAuth (old path — should NOT be used in new code) ───────
const mockSetToken = vi.fn();
const mockRegister = vi.fn();
global.useStrapiAuth = vi.fn(() => ({
  register: mockRegister,
  setToken: mockSetToken,
}));

// ─── Mock useState (returns persistent ref for 'registrationEmail') ───────
global.useState = vi.fn((key: string, init?: () => string) => {
  if (key === "registrationEmail") return registrationEmailRef;
  return ref(init ? init() : "");
});

// ─── Mock useSweetAlert2 ─────────────────────────────────────────────────
const mockSwalFire = vi.fn();
global.useSweetAlert2 = vi.fn(() => ({
  Swal: { fire: mockSwalFire },
}));

// ─── Mock #app (provides useNuxtApp with $recaptcha) ─────────────────────
// The component imports useNuxtApp from "#app" — we intercept at the module level.
const mockRecaptchaExecute = vi.fn().mockResolvedValue("mock-recaptcha-token");
vi.mock("#app", () => ({
  useNuxtApp: vi.fn(() => ({
    $recaptcha: {
      execute: mockRecaptchaExecute,
    },
  })),
  useRuntimeConfig: vi.fn(() => ({ public: {} })),
}));

// ─── Mock vue-router (useRouter/useRoute use Vue inject — must be module-mocked) ─
vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  useRoute: vi.fn(() => ({ params: {}, query: {}, path: "/" })),
}));

// ─── Stub vee-validate ───────────────────────────────────────────────────
// The Form stub must expose `validate()` because FormRegister uses a template ref (ref="formRef")
// and calls formRef.value.validate() inside handleSubmit.
vi.mock("vee-validate", () => ({
  Field: { template: "<input />" },
  Form: {
    name: "Form",
    template:
      '<form @submit.prevent="$emit(\'submit\')"><slot :errors="{}" :meta="{ valid: true }" /></form>',
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
  object: vi.fn(() => ({
    shape: vi.fn().mockReturnThis(),
  })),
  string: vi.fn(() => ({
    required: vi.fn().mockReturnThis(),
    email: vi.fn().mockReturnThis(),
    min: vi.fn().mockReturnThis(),
    max: vi.fn().mockReturnThis(),
    oneOf: vi.fn().mockReturnThis(),
    matches: vi.fn().mockReturnThis(),
    test: vi.fn().mockReturnThis(),
  })),
  boolean: vi.fn(() => ({
    required: vi.fn().mockReturnThis(),
  })),
  ref: vi.fn(),
}));

// ─── Mock useRut ─────────────────────────────────────────────────────────
vi.mock("@/composables/useRut", () => ({
  useRut: () => ({
    formatRut: vi.fn((v: string) => v),
    validateRut: vi.fn(() => true),
  }),
}));

// ─── Import component AFTER all mocks (vi.mock is hoisted by Vitest) ─────
import FormRegister from "@/components/FormRegister.vue";

// ─── Helper: mount component ──────────────────────────────────────────────
const buildWrapper = () => mount(FormRegister, { attachTo: document.body });

describe("FormRegister.vue — no-JWT redirect behavior (REGV-03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registrationEmailRef.value = "";

    // Re-register globals after clearAllMocks
    global.useRouter = vi.fn(() => ({ push: mockPush }));
    global.useRoute = vi.fn(() => ({}));
    global.useStrapiClient = vi.fn(() => mockClient);
    global.useStrapiAuth = vi.fn(() => ({
      register: mockRegister,
      setToken: mockSetToken,
    }));
    global.useState = vi.fn((key: string, init?: () => string) => {
      if (key === "registrationEmail") return registrationEmailRef;
      return ref(init ? init() : "");
    });
    global.useSweetAlert2 = vi.fn(() => ({
      Swal: { fire: mockSwalFire },
    }));
    mockRecaptchaExecute.mockResolvedValue("mock-recaptcha-token");
  });

  it("Test 1: When register response has no jwt, redirects to /registro/confirmar (not /login)", async () => {
    // Arrange: response has no jwt (email confirmation enabled)
    mockClient.mockResolvedValue({
      user: { id: 1, email: "test@example.com" },
    });

    const wrapper = buildWrapper();
    // Vue exposes reactive data unwrapped on the vm instance (no .value needed)
    const vm = wrapper.vm as unknown as {
      step: number;
      form: { email: string; username: string; confirm_password?: string };
      handleSubmit: () => Promise<void>;
    };

    // Set form state: go to step 2 with email
    vm.step = 2;
    vm.form.email = "test@example.com";

    // Act: submit the form
    await vm.handleSubmit();
    await new Promise((r) => setTimeout(r, 0));

    // Assert: navigated to confirmation page, not login
    expect(mockPush).toHaveBeenCalledWith("/registro/confirmar");
    expect(mockPush).not.toHaveBeenCalledWith("/login");
  });

  it("Test 2: When register response has no jwt, setToken is NOT called with undefined", async () => {
    // Arrange: response has no jwt
    mockClient.mockResolvedValue({
      user: { id: 1, email: "test@example.com" },
    });

    const wrapper = buildWrapper();
    const vm = wrapper.vm as unknown as {
      step: number;
      form: { email: string; username: string; confirm_password?: string };
      handleSubmit: () => Promise<void>;
    };

    vm.step = 2;
    vm.form.email = "test@example.com";

    await vm.handleSubmit();
    await new Promise((r) => setTimeout(r, 0));

    // Assert: setToken(undefined) never called — auth state is safe
    expect(mockSetToken).not.toHaveBeenCalledWith(undefined);
  });

  it("Test 3: When register response has a jwt, redirects to /login (backward compatible)", async () => {
    // Arrange: response has jwt (email confirmation disabled)
    mockClient.mockResolvedValue({ jwt: "token123", user: { id: 1 } });

    const wrapper = buildWrapper();
    const vm = wrapper.vm as unknown as {
      step: number;
      form: { email: string; username: string; confirm_password?: string };
      handleSubmit: () => Promise<void>;
    };

    vm.step = 2;
    vm.form.email = "test@example.com";

    await vm.handleSubmit();
    await new Promise((r) => setTimeout(r, 0));

    // Assert: normal flow — redirect to login
    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(mockPush).not.toHaveBeenCalledWith("/registro/confirmar");
  });

  it("Test 4: When no jwt, registrationEmail state is set to form.email before redirect", async () => {
    // Arrange: no jwt response
    mockClient.mockResolvedValue({ user: { id: 1 } });

    const wrapper = buildWrapper();
    const vm = wrapper.vm as unknown as {
      step: number;
      form: { email: string; username: string; confirm_password?: string };
      handleSubmit: () => Promise<void>;
    };

    vm.step = 2;
    vm.form.email = "myemail@test.com";

    await vm.handleSubmit();
    await new Promise((r) => setTimeout(r, 0));

    // Assert: registrationEmail shared state populated with submitted email
    expect(registrationEmailRef.value).toBe("myemail@test.com");
  });
});
