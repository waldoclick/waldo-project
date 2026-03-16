export default defineNuxtPlugin(() => {
  // Referer tracking only makes sense on the client (client-side navigations).
  // Skipping on SSR avoids calling useAppStore() when Pinia may not be active
  // (e.g. after @pinia/nuxt calls setActivePinia(void 0) in app:rendered hook).
  if (!import.meta.client) return;

  const router = useRouter();
  const appStore = useAppStore();

  // Rutas que no queremos guardar como referer
  const excludedRoutes = new Set([
    "/404",
    "/auth/forgot-password",
    "/auth/reset-password",
  ]);

  router.beforeEach((to, from) => {
    // Solo guardamos el referer si la ruta anterior no está en la lista de excluidas
    // y no es una ruta de /account o /auth
    if (
      !excludedRoutes.has(from.fullPath) &&
      !from.fullPath.startsWith("/account") &&
      !from.fullPath.startsWith("/auth")
    ) {
      appStore.setReferer(from.fullPath);
    }
  });
});
