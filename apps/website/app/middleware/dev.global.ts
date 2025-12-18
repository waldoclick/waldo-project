export default defineNuxtRouteMiddleware((to) => {
  if (typeof window === "undefined") return;

  const config = useRuntimeConfig();
  const devMode = config.public.devMode;

  // Función para detectar si es un motor de búsqueda
  const isSearchEngine = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const searchEngines = [
      "googlebot",
      "bingbot",
      "slurp",
      "duckduckbot",
      "baiduspider",
      "yandexbot",
      "facebookexternalhit",
      "twitterbot",
      "linkedinbot",
      "whatsapp",
      "telegrambot",
      "applebot",
      "crawler",
      "spider",
    ];
    return searchEngines.some((engine) => userAgent.includes(engine));
  };

  // Función para leer cookies
  const getCookieValue = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift();
    }
    return null;
  };

  // Si el modo desarrollo está desactivado, limpiar la cookie si existe
  if (!devMode) {
    const devCookieValue = getCookieValue("devmode");
    if (devCookieValue) {
      // Limpiar la cookie estableciendo una fecha de expiración pasada
      document.cookie =
        "devmode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    return;
  }

  // Permitir acceso libre a motores de búsqueda y rutas importantes
  if (
    isSearchEngine() ||
    to.path.startsWith("/sitemap") ||
    to.path.startsWith("/robots")
  ) {
    return;
  }

  // Leer cookie devmode correctamente
  const devCookieValue = getCookieValue("devmode");
  const hasValidCookie = devCookieValue && devCookieValue.length > 0;

  // Si tiene cookie válida y está en /dev, redirigir a home
  if (to.path === "/dev" && hasValidCookie) {
    return navigateTo("/");
  }

  // Si no tiene cookie válida y no está en /dev, redirigir a /dev
  if (!hasValidCookie && to.path !== "/dev") {
    return navigateTo("/dev");
  }
});
