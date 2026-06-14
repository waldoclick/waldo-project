export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSessionUser();
  if (!user.value) {
    // SSR fail-open: skip on server; client hydration re-runs this guard after
    // the session plugin has populated user state via fetchUser(). Pattern per D-03.
    if (import.meta.server) return;

    const { fetchUser } = useSessionAuth();
    try {
      await fetchUser(); // 401 = anonymous; sets user.value = null silently
    } catch {
      /* Strapi unavailable — treat as unauthenticated */
    }
  }
  if (!user.value) {
    useCookie("redirect", { path: "/" }).value = to.fullPath;
    return navigateTo("/login");
  }
});
