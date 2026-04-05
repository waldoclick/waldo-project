import { useStrapiClient, useNuxtApp } from "#imports";

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
          ...((options?.headers as Record<string, string> | undefined) ?? {}),
          ...(recaptchaToken ? { "X-Recaptcha-Token": recaptchaToken } : {}),
        },
      });
    }

    return client<T>(url, options);
  };
}
