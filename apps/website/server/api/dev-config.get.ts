export default defineEventHandler(async (_event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }

  const config = useRuntimeConfig();

  return {
    devMode: config.public.devMode,
    devUsername: config.devUsername ? "CONFIGURADO" : "NO CONFIGURADO",
    devPassword: config.devPassword ? "CONFIGURADO" : "NO CONFIGURADO",
    timestamp: new Date().toISOString(),
  };
});
