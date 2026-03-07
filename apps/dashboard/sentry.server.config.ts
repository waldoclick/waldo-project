import * as Sentry from "@sentry/nuxt";

// Only initialize Sentry in production to prevent dev/staging noise from
// reaching Sentry. Passing dsn: undefined is the official SDK-supported way
// to disable all instrumentation with zero overhead.
const isProduction = process.env.NODE_ENV === "production";

const config = useRuntimeConfig();

const dsn = isProduction ? config.public.sentryDsn : undefined;
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
