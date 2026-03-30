import type { User } from "@/types/user";

export default defineNuxtRouteMiddleware((to, _from) => {
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

  const user = useSessionUser<User>();
  if (!user.value) {
    useCookie("redirect", { path: "/" }).value = to.fullPath;
    return navigateTo("/auth/login");
  }

  const userRole = user.value?.role;
  const roleName = userRole?.name?.toLowerCase() || null;

  // Role is only populated after /users/me is called (client-side).
  // On SSR the JWT is present but role is undefined — skip the role check to
  // avoid a redirect loop that crashes the server with OOM.
  if (!roleName) return;

  if (roleName !== "manager") {
    // Non-manager authenticated user — not allowed in the dashboard.
    // Redirect to login without calling useLogout() (unsafe in middleware context).
    // The website session cookie is intentionally left untouched.
    return navigateTo("/auth/login");
  }
});
