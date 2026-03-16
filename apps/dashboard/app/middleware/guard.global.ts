import type { User } from "@/types/user";

// Rutas que no queremos guardar como referer
const excludedRefererRoutes = new Set([
  "/404",
  "/auth/forgot-password",
  "/auth/reset-password",
]);

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Track referer for post-login redirect — middleware runs after Pinia is active
  // (moved here from router.client.ts plugin which ran before Pinia was ready)
  if (
    import.meta.client &&
    !excludedRefererRoutes.has(from.fullPath) &&
    !from.fullPath.startsWith("/account") &&
    !from.fullPath.startsWith("/auth")
  ) {
    const appStore = useAppStore();
    appStore.setReferer(from.fullPath);
  }

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
    const { logout } = useStrapiAuth();
    await logout();
    return navigateTo("/auth/login");
  }
});
