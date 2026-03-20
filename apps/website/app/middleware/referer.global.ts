// Rutas que no queremos guardar como referer
const excludedRefererRoutes = new Set([
  "/registro",
  "/404",
  "/recuperar-contrasena",
  "/restablecer-contrasena",
]);

export default defineNuxtRouteMiddleware((to, from) => {
  // Track referer for post-login redirect — middleware runs after Pinia is active.
  // Moved here from router.client.ts plugin which ran before Pinia was ready.
  if (
    import.meta.client &&
    !excludedRefererRoutes.has(from.fullPath) &&
    !from.fullPath.startsWith("/cuenta") &&
    !from.fullPath.startsWith("/login") &&
    !from.fullPath.startsWith("/onboarding")
  ) {
    const appStore = useAppStore();
    appStore.setReferer(from.fullPath);
  }
});
