import * as Sentry from "@sentry/nuxt";
const config = useRuntimeConfig();

const dsn = config.public.sentryDsn;
const enableDebug = config.public.sentryDebug;

Sentry.init({
  dsn: dsn,
  environment: process.env.NODE_ENV,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1,

  // Set the profiling sample rate (1.0 = 100% of sessions will be profiled)
  profilesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: enableDebug,
});
