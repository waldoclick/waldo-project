import {
  useStrapiClient,
  useNuxtApp,
  useRuntimeConfig,
  useRequestHeaders,
} from "#imports";

/**
 * useApiClient — drop-in replacement for useStrapiClient() that automatically
 * injects X-Recaptcha-Token on POST, PUT and DELETE requests.
 *
 * Falls back gracefully when $recaptcha is unavailable (SSR, adblocker).
 * Caller-supplied headers are always preserved.
 */
export function useApiClient() {
  const client = useStrapiClient();
  const nuxtApp = useNuxtApp();

  const MUTATING_METHODS = ["POST", "PUT", "DELETE"] as const;
  type MutatingMethod = (typeof MUTATING_METHODS)[number];

  return async function apiClient<T = unknown>(
    url: string,
    options?: Parameters<typeof client>[1],
  ): Promise<T> {
    const method = (
      (options?.method as string | undefined) ?? "GET"
    ).toUpperCase();

    const serverHeaders: Record<string, string> = {};
    if (import.meta.server) {
      // Forward the browser cookie jar so the catch-all proxy can read waldo_jwt
      // and inject Authorization toward Strapi (Pitfall 3). Nitro self-calls do
      // not inherit the incoming request's cookies automatically.
      const { cookie } = useRequestHeaders(["cookie"]);
      if (cookie) serverHeaders["cookie"] = cookie;

      // Bypass Vercel Deployment Protection on staging/production SSR self-calls.
      const bypass = useRuntimeConfig().vercelBypassSecret as string | undefined;
      if (bypass) serverHeaders["x-vercel-protection-bypass"] = bypass;

      // X-Proxy-Key removed: the catch-all proxy now injects it toward Strapi.
      // NOTE: while runtimeConfig.strapi.url = API_URL remains (plan 06 removes
      // it), SSR useStrapiClient calls still go direct to Strapi and require
      // X-Proxy-Key. Plan 03–06 intermediary window: do not deploy 03 without 06.
    }

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
