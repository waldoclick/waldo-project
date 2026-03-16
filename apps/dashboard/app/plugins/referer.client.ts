/**
 * Tracks the referer (previous route) for post-login redirect.
 *
 * WHY A PLUGIN AND NOT MIDDLEWARE:
 * Route middleware (defineNuxtRouteMiddleware) runs during both SSR and client-side
 * hydration. During hydration, Pinia plugins may not yet be fully initialized when
 * the middleware executes, causing "getActivePinia() was called but there was no
 * active Pinia". The `import.meta.client` guard is insufficient because hydration
 * runs on the client but before Pinia is ready.
 *
 * Using nuxtApp.hook('app:mounted') guarantees this code runs only after ALL plugins
 * (including @pinia/nuxt) have finished initializing and the Vue app is fully mounted.
 * At that point, registering a router.beforeEach hook is safe because Pinia is active.
 */

const excludedRefererRoutes = new Set([
  "/404",
  "/auth/forgot-password",
  "/auth/reset-password",
]);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", () => {
    const router = useRouter();
    const appStore = useAppStore();

    router.beforeEach((to, from) => {
      if (
        !excludedRefererRoutes.has(from.fullPath) &&
        !from.fullPath.startsWith("/account") &&
        !from.fullPath.startsWith("/auth")
      ) {
        appStore.setReferer(from.fullPath);
      }
    });
  });
});
