import { defineNuxtPlugin, reloadNuxtApp } from "#app";
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

  // Dev mode guard — skip entirely when site is in dev mode and user hasn't authenticated via /dev
  const devMode = config.public.devMode as boolean | undefined;
  if (devMode) {
    const devCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("devmode="));
    if (!devCookie) return;
  }

  // Route guard — skip on auth pages where One Tap should not appear
  const route = useRoute();
  if (route.path.startsWith("/login/") || route.path.startsWith("/onboarding"))
    return;

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
          reloadNuxtApp();
        } catch (error) {
          console.error("[OneTap] Authentication failed:", error);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: true,
    });

    // Prompt once on app load — GIS handles suppression for dismissed/skipped users
    window.google.accounts.id.prompt();
  };

  initializeOneTap();
});
