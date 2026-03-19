import { describe, it } from "vitest";

describe("FormProfile.vue — onboarding mode (FORM-02, FORM-03)", () => {
  it.todo("has defineEmits with 'success' event (FORM-02)");
  it.todo(
    "has defineProps with onboardingMode boolean defaulting to false (FORM-02)",
  );
  it.todo("emits 'success' after successful save (FORM-02)");
  it.todo(
    "does NOT redirect to /cuenta/perfil when onboardingMode is true (FORM-02)",
  );
  it.todo(
    "DOES redirect to /cuenta/perfil when onboardingMode is false (backward compat) (FORM-03)",
  );
});
