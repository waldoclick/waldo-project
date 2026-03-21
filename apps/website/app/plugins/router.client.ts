export default defineNuxtPlugin(() => {
  const router = useRouter();
  const appStore = useAppStore();

  // Rutas que no queremos guardar como referer
  const excludedRoutes = new Set([
    "/registro",
    "/404",
    "/recuperar-contrasena",
    "/restablecer-contrasena",
  ]);

  router.beforeEach((to, from) => {
    // Solo guardamos el referer si la ruta anterior no está en la lista de excluidas
    // y no es una ruta de /cuenta
    if (
      !excludedRoutes.has(from.fullPath) &&
      !from.fullPath.startsWith("/cuenta") &&
      !from.fullPath.startsWith("/login")
    ) {
      appStore.setReferer(from.fullPath);
    }
  });
});
