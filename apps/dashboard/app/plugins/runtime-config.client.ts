// Plugin para manejar de forma segura el runtime config
export default defineNuxtPlugin(() => {
  // Asegurar que el runtime config esté disponible globalmente
  const config = useRuntimeConfig();

  // Verificar que las propiedades críticas estén definidas
  if (!config.public.baseUrl) {
    console.warn("Runtime config baseUrl is not available, using fallback");
    // Asignar valores por defecto si no están disponibles
    config.public.baseUrl = process.env.BASE_URL || "http://localhost:3000";
  }

  if (!config.public.apiUrl) {
    console.warn("Runtime config apiUrl is not available, using fallback");
    config.public.apiUrl = process.env.API_URL || "http://localhost:1337";
  }

  // Hacer el config disponible globalmente para evitar errores
  return {
    provide: {
      runtimeConfig: config,
    },
  };
});
