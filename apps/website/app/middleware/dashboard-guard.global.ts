import type { User } from "@/types/user";

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/dashboard")) return;
  const user = useStrapiUser<User>();
  if (!user.value) {
    const token = useStrapiToken();
    if (!token.value) return navigateTo("/login");
    const { fetchUser } = useStrapiAuth();
    await fetchUser();
  }
  if (!user.value) return navigateTo("/login");
  const roleName = user.value.role?.name?.toLowerCase() ?? null;
  if (!roleName) return; // SSR fail-open skip per D-03 (research Open Q #4)
  if (roleName !== "manager") {
    return navigateTo("/");
  }
});
