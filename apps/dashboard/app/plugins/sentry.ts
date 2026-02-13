import * as Sentry from "@sentry/nuxt";

export default defineNuxtPlugin((nuxtApp) => {
  // Configurar usuario cuando cambie
  const user = useStrapiUser();
  const { fetchUser } = useStrapiAuth();

  // Configurar usuario inicial
  if (user.value) {
    // // console.log("user", user.value);
    Sentry.setUser({
      id: user.value.id?.toString(),
      email: user.value.email,
      username: user.value.username,
    });
  }

  // Observar cambios en el usuario
  watch(user, (newUser) => {
    if (newUser) {
      Sentry.setUser({
        id: newUser.id?.toString(),
        email: newUser.email,
        username: newUser.username,
      });
    } else {
      Sentry.setUser(null);
    }
  });

  // Capturar errores de Vue
  nuxtApp.hook("vue:error", (error, instance, info) => {
    if (import.meta.dev) {
      console.error("Error en componente:", {
        error,
        componentName: instance?.$options?.name,
        route: useRoute().path,
      });
      return;
    }

    const route = useRoute();

    // Agregar etiquetas útiles
    Sentry.setTag("environment", process.env.NODE_ENV);
    Sentry.setTag("page", route.path);
    Sentry.setTag("component", instance?.$options?.name || "unknown");

    // Solo capturar errores en entornos de staging o producción
    if (
      process.env.NODE_ENV === "staging" ||
      process.env.NODE_ENV === "production"
    ) {
      Sentry.captureException(error, {
        extra: {
          componentName: instance?.$options?.name,
          info,
          route: route.path,
        },
      });
    }
  });

  // Capturar errores no manejados
  if (import.meta.client) {
    window.addEventListener("unhandledrejection", (event) => {
      if (import.meta.dev) {
        console.error("Error no manejado:", event.reason);
        return;
      }

      if (
        process.env.NODE_ENV === "staging" ||
        process.env.NODE_ENV === "production"
      ) {
        // Manejar errores de API de Strapi
        if (event.reason?.response?.data) {
          const strapiError = event.reason.response.data;
          // Capturar cualquier error de la API que no sea 2xx
          if (event.reason.response.status >= 400) {
            Sentry.captureException(event.reason, {
              extra: {
                status: event.reason.response.status,
                statusText: event.reason.response.statusText,
                strapiError: strapiError,
                endpoint: event.reason.config?.url,
                method: event.reason.config?.method,
              },
              tags: {
                errorType: "strapi_api",
                endpoint: event.reason.config?.url,
              },
            });
          }
        } else {
          // Solo capturar errores no relacionados con la API si son críticos
          if (
            event.reason instanceof Error &&
            !event.reason.message.includes("canceled")
          ) {
            Sentry.captureException(event.reason);
          }
        }
      }
    });
  }
});
