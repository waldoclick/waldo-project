export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  return {
    devMode: config.public.devMode,
    devUsername: config.devUsername ? "CONFIGURADO" : "NO CONFIGURADO",
    devPassword: config.devPassword ? "CONFIGURADO" : "NO CONFIGURADO",
    timestamp: new Date().toISOString(),
  };
});
