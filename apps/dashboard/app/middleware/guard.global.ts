import type { User } from "@/types/user";

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const publicRoutes = [
    "/auth/login",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-code",
    "/dev",
  ];

  const isPublicRoute = publicRoutes.some((route) => to.path.startsWith(route));

  if (isPublicRoute) {
    return;
  }

  const user = useStrapiUser() as Ref<User | null>;
  if (!user.value) {
    useCookie("redirect", { path: "/" }).value = to.fullPath;
    return navigateTo("/auth/login");
  }

  const userRole = user.value?.role;
  const roleName = userRole?.name?.toLowerCase() || null;

  if (roleName !== "manager") {
    const { logout } = useLogout();
    await logout();
    return;
  }
});
