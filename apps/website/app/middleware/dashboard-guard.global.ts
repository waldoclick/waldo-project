import type { User } from "@/types/user";

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/dashboard")) return;
  const user = useSessionUser<User>();
  if (!user.value) {
    if (import.meta.server) return navigateTo("/login");
    const { fetchUser } = useSessionAuth();
    try {
      await fetchUser(); // 401 = anonymous; sets user.value = null silently
    } catch {
      /* Strapi unavailable — treat as unauthenticated */
    }
  }
  if (!user.value) return navigateTo("/login");
  const roleName = user.value.role?.name?.toLowerCase() ?? null;
  if (!roleName) return; // SSR fail-open skip per D-03 (research Open Q #4)
  if (roleName !== "manager") {
    return navigateTo("/");
  }
});
