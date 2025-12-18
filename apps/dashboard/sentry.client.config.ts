import * as Sentry from "@sentry/nuxt";
const config = useRuntimeConfig();

const dsn = config.public.sentryDsn;
const enableFeedback = config.public.sentryFeedback;
const enableDebug = config.public.sentryDebug;

const feedbackIntegration = Sentry.feedbackIntegration({
  colorScheme: "system",
  isNameRequired: true,
  isEmailRequired: true,
});

const integrations = [
  Sentry.replayIntegration(),
  Sentry.browserTracingIntegration(),
  Sentry.browserProfilingIntegration(),
  ...(enableFeedback ? [feedbackIntegration] : []),
];

Sentry.init({
  // If set up, you can use your runtime config here
  // dsn: useRuntimeConfig().public.sentry.dsn,
  dsn: dsn,
  environment: process.env.NODE_ENV,
  // Reducimos las tasas de muestreo
  tracesSampleRate: 0.1, // 10% de las transacciones
  replaysSessionSampleRate: 0.05, // 5% de las sesiones
  replaysOnErrorSampleRate: 0.1, // 10% de las sesiones con errores
  profilesSampleRate: 0.1, // 10% de las sesiones

  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [process.env.API_URL || "localhost"],

  // Integrations
  integrations,

  // Experiments
  _experiments: { enableLogs: true },

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: enableDebug,
});
