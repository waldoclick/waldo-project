export default defineNuxtRouteMiddleware(async (to, _from) => {
  const user = useStrapiUser();
  if (!user.value) {
    const token = useStrapiToken();
    if (token.value) {
      const { fetchUser } = useStrapiAuth();
      try {
        await fetchUser();
      } catch {
        /* Strapi unavailable — treat as unauthenticated */
      }
    }
  }
  if (!user.value) {
    useCookie("redirect", { path: "/" }).value = to.fullPath;
    return navigateTo("/login");
  }
});
