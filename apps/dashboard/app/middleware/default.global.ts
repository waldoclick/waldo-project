export default defineNuxtRouteMiddleware(async (to, _from) => {
  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    "/auth/login",
    "/auth/forgot-password",
    "/auth/reset-password",
  ];

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some((route) => to.path.startsWith(route));

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute) {
    return;
  }

  // Para todas las demás rutas, verificar autenticación
  const user = useStrapiUser();
  if (!user.value) {
    // Guardar la ruta a la que intentaba acceder
    useCookie("redirect", { path: "/" }).value = to.fullPath;
    // Redirigir al login
    return navigateTo("/auth/login");
  }

  // Verificar que el usuario tenga el role "manager"
  const userRole = user.value?.role;
  const roleName =
    typeof userRole === "string"
      ? userRole
      : userRole?.name || userRole?.type || null;

  if (roleName !== "manager") {
    // Si no es manager, cerrar sesión y redirigir al login
    const { logout } = useStrapiAuth();
    await logout();
    return navigateTo("/auth/login");
  }
});
