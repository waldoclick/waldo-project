// import * as Sentry from "@sentry/nuxt";

export function useLogger() {
  const logError = (error: any) => {
    // Sentry.captureException(new Error(`Uh oh, something broke, here's the error: '${error}'`));
  };

  const logInfo = (message: string) => {
    // Sentry.captureMessage(message);
    console.info(message);
  };

  return {
    logError,
    logInfo,
  };
}
