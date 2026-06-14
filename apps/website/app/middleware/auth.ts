export default defineNuxtRouteMiddleware(async (to) => {
  const user = useStrapiUser();
  if (!user.value) {
    const token = useStrapiToken();
    if (token.value) {
      const { fetchUser } = useStrapiAuth();
      try {
        await fetchUser();
      } catch {
        /* Strapi unavailable — treat as unauthenticated */
      }
      // SSR fail-open: fetchUser() on server uses API_URL directly without
      // X-Proxy-Key — proxy-auth middleware rejects with 401, user stays null.
      // Fail-open here; client hydration re-runs the guard with user already
      // populated via the Nitro proxy (which does carry X-Proxy-Key).
      // Pattern per D-03 (dashboard-guard.global.ts).
      if (import.meta.server && !user.value) return;
    }
  }
  if (!user.value) {
    useCookie("redirect", { path: "/" }).value = to.fullPath;
    return navigateTo("/login");
  }
});
