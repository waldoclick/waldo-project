import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";

// ─── Mock #app before importing component ─────────────────────────────────
const mockRecaptcha = {
  execute: vi.fn().mockResolvedValue("fake-recaptcha-token"),
};
vi.mock("#app", () => ({
  useNuxtApp: () => ({ $recaptcha: mockRecaptcha }),
}));

// ─── Mock vee-validate ────────────────────────────────────────────────────
vi.mock("vee-validate", () => ({
  Field: { template: "<input />" },
  Form: {
    template:
      '<form @submit.prevent="$emit(\'submit\', values)"><slot :errors="{}" :meta="{ valid: true }" /></form>',
    emits: ["submit"],
  },
  ErrorMessage: { template: "<span />" },
}));

// ─── Mock yup ─────────────────────────────────────────────────────────────
vi.mock("yup", () => ({
  object: vi.fn(() => ({})),
  string: vi.fn(() => ({
    email: vi.fn().mockReturnThis(),
    required: vi.fn().mockReturnThis(),
  })),
}));

// ─── Nuxt auto-imported globals ───────────────────────────────────────────
const mockSwalFire = vi.fn();
const mockClient = vi.fn();
const mockPush = vi.fn();

// useSweetAlert2 is a Nuxt auto-imported global in FormLogin.vue (no explicit import)
global.useSweetAlert2 = vi.fn(() => ({ Swal: { fire: mockSwalFire } }));
global.useStrapiClient = vi.fn(
  () => mockClient,
) as unknown as typeof useStrapiClient;
global.useState = vi.fn((_key: string, init: () => unknown) =>
  ref(init()),
) as unknown as typeof useState;
global.useRouter = vi.fn(() => ({
  push: mockPush,
})) as unknown as typeof useRouter;

// ─── Import component AFTER all mocks ─────────────────────────────────────
import { mount } from "@vue/test-utils";
import FormLogin from "@/components/FormLogin.vue";

// Helper: simulate a login error thrown by the Strapi client
function makeLoginError(message: string) {
  return { error: { message } };
}

describe("FormLogin.vue — REGV-05 unconfirmed email resend section", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-assign mocks so cleared state doesn't break tests
    global.useSweetAlert2 = vi.fn(() => ({ Swal: { fire: mockSwalFire } }));
    global.useStrapiClient = vi.fn(
      () => mockClient,
    ) as unknown as typeof useStrapiClient;
    global.useState = vi.fn((_key: string, init: () => unknown) =>
      ref(init()),
    ) as unknown as typeof useState;
    global.useRouter = vi.fn(() => ({
      push: mockPush,
    })) as unknown as typeof useRouter;
    mockRecaptcha.execute.mockResolvedValue("fake-recaptcha-token");
  });

  // Test 1: showResendSection becomes true when error is "not confirmed"
  it('sets showResendSection to true when login error is "Your account email is not confirmed"', async () => {
    mockClient.mockRejectedValueOnce(
      makeLoginError("Your account email is not confirmed"),
    );

    const wrapper = mount(FormLogin, {
      global: {
        stubs: {
          Form: {
            name: "Form",
            template:
              '<form @submit.prevent><slot :errors="{}" :meta="{ valid: true }" /></form>',
          },
          Field: { template: "<input />" },
          ErrorMessage: { template: "<span />" },
        },
      },
    });

    const vm = wrapper.vm as unknown as {
      handleSubmit: (values: Record<string, unknown>) => Promise<void>;
      showResendSection: { value: boolean };
    };

    await vm.handleSubmit({ email: "test@example.com", password: "pass" });

    expect(vm.showResendSection.value).toBe(true);
  });

  // Test 2: unconfirmedEmail is set to submitted email
  it('sets unconfirmedEmail to submitted email when error is "Your account email is not confirmed"', async () => {
    mockClient.mockRejectedValueOnce(
      makeLoginError("Your account email is not confirmed"),
    );

    const wrapper = mount(FormLogin, {
      global: {
        stubs: {
          Form: {
            name: "Form",
            template:
              '<form @submit.prevent><slot :errors="{}" :meta="{ valid: true }" /></form>',
          },
          Field: { template: "<input />" },
          ErrorMessage: { template: "<span />" },
        },
      },
    });

    const vm = wrapper.vm as unknown as {
      handleSubmit: (values: Record<string, unknown>) => Promise<void>;
      unconfirmedEmail: { value: string };
    };

    await vm.handleSubmit({ email: "test@example.com", password: "pass" });

    expect(vm.unconfirmedEmail.value).toBe("test@example.com");
  });

  // Test 3: Swal IS fired for "Invalid identifier or password" (other errors unchanged)
  it('fires Swal for "Invalid identifier or password" errors (other errors still use Swal)', async () => {
    mockClient.mockRejectedValueOnce(
      makeLoginError("Invalid identifier or password"),
    );

    const wrapper = mount(FormLogin, {
      global: {
        stubs: {
          Form: {
            name: "Form",
            template:
              '<form @submit.prevent><slot :errors="{}" :meta="{ valid: true }" /></form>',
          },
          Field: { template: "<input />" },
          ErrorMessage: { template: "<span />" },
        },
      },
    });

    const vm = wrapper.vm as unknown as {
      handleSubmit: (values: Record<string, unknown>) => Promise<void>;
    };

    await vm.handleSubmit({ email: "bad@example.com", password: "wrong" });

    expect(mockSwalFire).toHaveBeenCalledWith(
      "Error",
      expect.stringContaining("incorrectos"),
      "error",
    );
  });

  // Test 4: handleResendConfirmation calls POST /auth/send-email-confirmation
  it("calls POST /auth/send-email-confirmation with the unconfirmed email on resend", async () => {
    mockClient
      .mockRejectedValueOnce(
        makeLoginError("Your account email is not confirmed"),
      )
      .mockResolvedValueOnce({});

    const wrapper = mount(FormLogin, {
      global: {
        stubs: {
          Form: {
            name: "Form",
            template:
              '<form @submit.prevent><slot :errors="{}" :meta="{ valid: true }" /></form>',
          },
          Field: { template: "<input />" },
          ErrorMessage: { template: "<span />" },
        },
      },
    });

    const vm = wrapper.vm as unknown as {
      handleSubmit: (values: Record<string, unknown>) => Promise<void>;
      handleResendConfirmation: () => Promise<void>;
      unconfirmedEmail: { value: string };
    };

    // Trigger unconfirmed state
    await vm.handleSubmit({ email: "test@example.com", password: "pass" });
    expect(vm.unconfirmedEmail.value).toBe("test@example.com");

    // Call resend
    await vm.handleResendConfirmation();

    expect(mockClient).toHaveBeenCalledWith("/auth/send-email-confirmation", {
      method: "POST",
      body: { email: "test@example.com" },
    });
  });
});
