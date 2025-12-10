// Composable for app configuration with Nuxt 4 optimizations
export const useAppConfiguration = () => {
  const config = useRuntimeConfig();

  return {
    // App information
    name: "Waldo.click®",
    version: "4.0.0",
    description: "Plataforma para compra y venta de equipo industrial en Chile",

    // URLs
    baseUrl: config.public.baseUrl,
    apiUrl: config.public.apiUrl,

    // Features
    features: {
      gtm: !!config.public.gtmId,
      sentry: !!config.public.sentryDsn,
      recaptcha: !!config.public.recaptchaSiteKey,
      logRocket: !!config.public.logRocketAppId,
    },

    // Environment
    isDev: config.public.devMode,
    isProduction: process.env.NODE_ENV === "production",

    // Security
    security: {
      blockSearchEngines: config.public.blockSearchEngines,
      apiDisableProxy: config.public.apiDisableProxy,
    },
  };
};
