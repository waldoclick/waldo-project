<template>
  <!-- Aquí puedes agregar tu template si es necesario -->
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import type { User } from "@/types/user.d.ts";
import { useAppStore } from "@/stores/app.store";
import { useMeStore } from "@/stores/me.store";
const { Swal } = useSweetAlert2();

useSeoMeta({ robots: "noindex, nofollow" });

const apiClient = useApiClient();
const route = useRoute();
const meStore = useMeStore();
const appStore = useAppStore();

const authenticate = async () => {
  try {
    // POST to the Nitro exchange route — useApiClient injects X-Recaptcha-Token automatically.
    // The route verifies reCAPTCHA, exchanges the access_token with Strapi, and sets the
    // httpOnly waldo_jwt cookie. It returns { user } — the token never reaches the client.
    const result = await apiClient<{ user: User }>(
      "auth/facebook/exchange",
      { method: "POST", body: { access_token: route.query.access_token as string } },
    );
    if (result?.user) {
      // Clear stale cache so isProfileComplete() fetches fresh data from the API.
      meStore.reset();
      const isComplete = await meStore.isProfileComplete();

      // Decide destination before the navigation — same rationale as FormVerifyCode:
      // avoid relying on the guard to intercept (race / same-route no-op risk).
      if (!isComplete) {
        await navigateTo("/onboarding");
        return;
      }

      const redirectTo = appStore.getReferer || "/anuncios";
      appStore.clearReferer();
      await navigateTo(redirectTo);
    }
  } catch (error) {
    const err = error as {
      response?: {
        data?: {
          error?: {
            details?: { error?: { message?: string }; message?: string };
          };
        };
      };
    };
    const errorMessage =
      err?.response?.data?.error?.details?.error?.message ||
      "Error desconocido durante la autenticación.";
    Swal.fire("Error", errorMessage, "error");
    await navigateTo("/login");
  }
};

// Guard: reCAPTCHA ($recaptcha) is client-only — must not run on SSR.
// The exchange route rejects without X-Recaptcha-Token, which useApiClient
// injects client-side only.
if (import.meta.client) authenticate();
</script>
