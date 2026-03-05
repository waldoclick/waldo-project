import * as Sentry from "@sentry/nuxt";

export function useLogger() {
  const logError = (error: unknown) => {
    Sentry.captureException(error);
  };

  const logInfo = (message: string) => {
    Sentry.captureMessage(message);
  };

  return {
    logError,
    logInfo,
  };
}
