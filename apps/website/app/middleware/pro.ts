export default defineNuxtRouteMiddleware(() => {
  const config = useRuntimeConfig();
  if (!config.public.proEnable) {
    return navigateTo("/cuenta");
  }
});
