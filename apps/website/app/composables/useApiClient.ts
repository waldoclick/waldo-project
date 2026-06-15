import { useNuxtApp, useRuntimeConfig, useRequestHeaders } from "#imports";
import { useSessionClient } from "@/composables/useSessionClient";

/**
 * useApiClient — single HTTP entry point that automatically injects
 * X-Recaptcha-Token on POST, PUT and DELETE requests and forwards SSR cookies.
 *
 * Falls back gracefully when $recaptcha is unavailable (SSR, adblocker).
 * Caller-supplied headers are always preserved.
 */
export function useApiClient() {
  const client = useSessionClient();
  const nuxtApp = useNuxtApp();

  // Capture SSR request headers NOW, while the composable runs in a valid Nuxt
  // instance (composable/store setup, before any await). Reading useRequestHeaders
  // lazily inside the async request below throws "composable called outside Nuxt
  // instance" once the call happens after an await (e.g. in a useAsyncData handler),
  // which silently killed every after-await SSR fetch (e.g. the blog article list).
  const ssrHeaders: Record<string, string> = {};
  if (import.meta.server) {
    try {
      // Forward the browser cookie jar so the catch-all proxy can read waldo_jwt
      // and inject Authorization toward Strapi. Nitro self-calls do not inherit
      // the incoming request's cookies automatically.
      const { cookie } = useRequestHeaders(["cookie"]);
      if (cookie) ssrHeaders["cookie"] = cookie;

      // Bypass Vercel Deployment Protection on staging/production SSR self-calls.
      const bypass = useRuntimeConfig().vercelBypassSecret as
        | string
        | undefined;
      if (bypass) ssrHeaders["x-vercel-protection-bypass"] = bypass;
    } catch {
      // Nuxt context unavailable — proceed without these headers rather than crash.
    }
  }

  const MUTATING_METHODS = ["POST", "PUT", "DELETE"] as const;
  type MutatingMethod = (typeof MUTATING_METHODS)[number];

  return async function apiClient<T = unknown>(
    url: string,
    options?: Parameters<typeof client>[1],
  ): Promise<T> {
    const method = (
      (options?.method as string | undefined) ?? "GET"
    ).toUpperCase();

    // Use the headers captured at composable-creation time (see above).
    const serverHeaders: Record<string, string> = import.meta.server
      ? { ...ssrHeaders }
      : {};

    if (MUTATING_METHODS.includes(method as MutatingMethod)) {
      let recaptchaToken: string | undefined;

      try {
        // $recaptcha is a client-only plugin — undefined on SSR
        recaptchaToken = await (
          nuxtApp.$recaptcha as
            | { execute: (_action: string) => Promise<string> }
            | undefined
        )?.execute("submit");
      } catch {
        // reCAPTCHA blocked (adblocker) or script load failure — proceed without token.
        // The Nitro proxy will reject the request only if the route is in
        // RECAPTCHA_PROTECTED_ROUTES and the token is missing.
      }

      return client<T>(url, {
        ...options,
        headers: {
          ...serverHeaders,
          ...((options?.headers as Record<string, string> | undefined) ?? {}),
          ...(recaptchaToken ? { "X-Recaptcha-Token": recaptchaToken } : {}),
        },
      });
    }

    return client<T>(url, {
      ...options,
      headers: {
        ...serverHeaders,
        ...((options?.headers as Record<string, string> | undefined) ?? {}),
      },
    });
  };
}
