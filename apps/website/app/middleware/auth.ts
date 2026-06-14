export default defineNuxtRouteMiddleware(async (to) => {
  const user = useStrapiUser();
  if (!user.value) {
    // SSR fail-open: the @nuxtjs/strapi plugin calls fetchUser() on every SSR render
    // before middleware runs. On SSR, fetchUser() calls Strapi directly (API_URL) without
    // X-Proxy-Key — proxy-auth rejects with 401 and the plugin clears the JWT via
    // setToken(null). By the time this middleware runs, the token is already null.
    // Fail-open on SSR; client hydration re-runs this guard with the token intact via
    // the Nitro proxy (which carries X-Proxy-Key). Pattern per D-03.
    if (import.meta.server) return;

    const token = useStrapiToken();
    if (token.value) {
      const { fetchUser } = useStrapiAuth();
      try {
        await fetchUser();
      } catch {
        /* Strapi unavailable — treat as unauthenticated */
      }
    }
  }
  if (!user.value) {
    useCookie("redirect", { path: "/" }).value = to.fullPath;
    return navigateTo("/login");
  }
});
