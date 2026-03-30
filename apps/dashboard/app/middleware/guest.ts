import type { User } from "@/types/user";

export default defineNuxtRouteMiddleware((_to, _from) => {
  const user = useSessionUser<User>();
  if (!user.value) return;

  // Only redirect to dashboard home if the user is a manager.
  // Non-manager users may have a valid JWT (shared cookie from the website) but are
  // not allowed in the dashboard — let them stay on the login page without looping.
  const roleName = (user.value?.role?.name ?? "").toLowerCase();
  if (roleName === "manager") {
    return navigateTo("/");
  }
});
