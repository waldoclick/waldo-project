export default defineNuxtRouteMiddleware(async (to, _from) => {
  const publicRoutes = [
    "/auth/login",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/dev",
  ];

  const isPublicRoute = publicRoutes.some((route) => to.path.startsWith(route));

  if (isPublicRoute) {
    return;
  }

  const user = useStrapiUser();
  if (!user.value) {
    useCookie("redirect", { path: "/" }).value = to.fullPath;
    return navigateTo("/auth/login");
  }

  const userRole = user.value?.role;
  const roleName =
    typeof userRole === "string"
      ? userRole.toLowerCase()
      : userRole?.name?.toLowerCase() ||
        userRole?.type?.toLowerCase() ||
        user.value?.type?.toLowerCase() ||
        null;

  if (roleName !== "manager") {
    const { logout } = useStrapiAuth();
    await logout();
    return navigateTo("/auth/login");
  }
});
