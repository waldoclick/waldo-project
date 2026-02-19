export default defineNuxtRouteMiddleware((to) => {
  if (typeof window === "undefined") return;

  const config = useRuntimeConfig();
  const devMode = config.public.devMode;

  const getCookieValue = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift();
    }
    return null;
  };

  if (!devMode) {
    const devCookieValue = getCookieValue("devmode");
    if (devCookieValue) {
      document.cookie =
        "devmode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    return;
  }

  const devCookieValue = getCookieValue("devmode");
  const hasValidCookie = devCookieValue && devCookieValue.length > 0;

  if (to.path === "/dev" && hasValidCookie) {
    return navigateTo("/");
  }

  if (!hasValidCookie && to.path !== "/dev") {
    return navigateTo("/dev");
  }
});
