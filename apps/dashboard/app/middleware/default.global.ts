export default defineNuxtRouteMiddleware((to, _from) => {
  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    "/login",
    "/registro",
    "/recuperar-contrasena",
    "/restablecer-contrasena",
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
    return navigateTo("/login");
  }
});
