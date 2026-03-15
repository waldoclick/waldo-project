import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, nextTick } from "vue";

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
      '<form @submit.prevent><slot :errors="{}" :meta="{ valid: true }" /></form>',
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

// Helper: mount FormLogin with standard stubs
function mountFormLogin() {
  return mount(FormLogin, {
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
}

// Helper: invoke handleSubmit on the component vm
async function triggerSubmit(
  vm: unknown,
  email: string,
  password: string,
): Promise<void> {
  await (
    vm as {
      handleSubmit: (v: Record<string, unknown>) => Promise<void>;
    }
  ).handleSubmit({ email, password });
}

describe("FormLogin.vue — REGV-05 unconfirmed email resend section", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  // Test 1: showResendSection renders in DOM when error is "not confirmed"
  it('shows resend section in DOM when login error is "Your account email is not confirmed"', async () => {
    mockClient.mockRejectedValueOnce(
      makeLoginError("Your account email is not confirmed"),
    );

    const wrapper = mountFormLogin();
    await triggerSubmit(wrapper.vm, "test@example.com", "pass");
    await nextTick();

    expect(wrapper.find(".form__resend-confirmation").exists()).toBe(true);
  });

  // Test 2: resend section shows user's email
  it('displays submitted email in resend section when error is "Your account email is not confirmed"', async () => {
    mockClient.mockRejectedValueOnce(
      makeLoginError("Your account email is not confirmed"),
    );

    const wrapper = mountFormLogin();
    await triggerSubmit(wrapper.vm, "test@example.com", "pass");
    await nextTick();

    expect(wrapper.find(".form__resend-confirmation").text()).toContain(
      "test@example.com",
    );
  });

  // Test 3: Swal IS fired for "Invalid identifier or password" (other errors unchanged)
  it('fires Swal for "Invalid identifier or password" errors (other errors still use Swal)', async () => {
    mockClient.mockRejectedValueOnce(
      makeLoginError("Invalid identifier or password"),
    );

    const wrapper = mountFormLogin();
    await triggerSubmit(wrapper.vm, "bad@example.com", "wrong");

    expect(mockSwalFire).toHaveBeenCalledWith(
      "Error",
      expect.stringContaining("incorrectos"),
      "error",
    );
  });

  // Test 5: client called with X-Recaptcha-Token header and NO recaptchaToken in body
  it("sends X-Recaptcha-Token header and excludes recaptchaToken from body", async () => {
    mockClient.mockResolvedValueOnce({ pendingToken: "tok" });

    const wrapper = mountFormLogin();
    await triggerSubmit(wrapper.vm, "user@example.com", "password123");

    expect(mockClient).toHaveBeenCalledWith(
      "/auth/local",
      expect.objectContaining({
        headers: { "X-Recaptcha-Token": "fake-recaptcha-token" },
        body: expect.not.objectContaining({
          recaptchaToken: expect.anything(),
        }),
      }),
    );
  });

  // Test 4: handleResendConfirmation calls POST /auth/send-email-confirmation
  it("calls POST /auth/send-email-confirmation with the unconfirmed email on resend", async () => {
    mockClient
      .mockRejectedValueOnce(
        makeLoginError("Your account email is not confirmed"),
      )
      .mockResolvedValueOnce({});

    const wrapper = mountFormLogin();

    // Trigger unconfirmed state
    await triggerSubmit(wrapper.vm, "test@example.com", "pass");
    await nextTick();

    // Resend section should be visible
    expect(wrapper.find(".form__resend-confirmation").exists()).toBe(true);

    // Call resend handler directly
    await (
      wrapper.vm as unknown as {
        handleResendConfirmation: () => Promise<void>;
      }
    ).handleResendConfirmation();

    expect(mockClient).toHaveBeenCalledWith("/auth/send-email-confirmation", {
      method: "POST",
      body: { email: "test@example.com" },
    });
  });
});
