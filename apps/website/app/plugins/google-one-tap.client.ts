import { defineNuxtPlugin } from "#app";
import { useApiClient } from "@/composables/useApiClient";
import {
  useStrapiAuth,
  useStrapiUser,
  useRuntimeConfig,
  useRoute,
} from "#imports";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const clientId = config.public.googleClientId as string | undefined;

  if (!clientId) {
    console.warn("[OneTap] GOOGLE_CLIENT_ID not configured");
    return;
  }

  // Auth state guard — skip if user is already authenticated on app load
  const user = useStrapiUser();
  if (user.value) return;

  // Route guard — skip on auth callback pages (e.g. /login/google) to avoid
  // showing One Tap while OAuth flow is completing
  const route = useRoute();
  if (route.path.startsWith("/login/")) return;

  // Instantiate composables at plugin root level (AGENTS.md: setup-level instantiation required)
  const client = useApiClient();
  const { setToken, fetchUser } = useStrapiAuth();

  // Wait for the GIS script (loaded via nuxt.config.ts app.head async/defer) to become available
  const initializeOneTap = () => {
    if (!window.google?.accounts?.id) {
      setTimeout(initializeOneTap, 100);
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        try {
          const result = await client<{ jwt: string; user: unknown }>(
            "auth/google-one-tap",
            { method: "POST", body: { credential: response.credential } },
          );
          setToken(result.jwt);
          await fetchUser();
        } catch (error) {
          console.error("[OneTap] Authentication failed:", error);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      // Note: use_fedcm_for_prompt intentionally omitted — deprecated in GIS SDK
    });

    // Prompt once on app load — GIS handles suppression for dismissed/skipped users
    window.google.accounts.id.prompt();
  };

  initializeOneTap();
});
