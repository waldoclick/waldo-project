export {};

import type { DataLayerEvent } from "~/composables/useAdAnalytics";
import type DOMPurify from "dompurify";

declare global {
  // Fix: @types/node v25 setInterval returns NodeJS.Timeout (extends deprecated NodeJS.Timer),
  // but DOM's clearInterval only accepts number. Adding overload to accept both.
  function clearInterval(
    id?: ReturnType<typeof setInterval> | number | null,
  ): void;
  function clearTimeout(
    id?: ReturnType<typeof setTimeout> | number | null,
  ): void;

  interface Window {
    DOMPurify: typeof DOMPurify;
    // dataLayer accepts GA4 analytics events, GTM consent commands (array format), and plain objects
    dataLayer: (DataLayerEvent | Record<string, unknown> | unknown[])[];
    google: {
      accounts: {
        id: {
          initialize: (_config: Record<string, unknown>) => void;
          prompt: (
            _callback?: (_notification: GoogleOneTapNotification) => void,
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
    $zoho?: {
      salesiq?: {
        widgetcode: string;
        values: Record<string, unknown>;
        ready: () => void;
        afterReady?: () => void;
        privacy?: {
          updateCookieConsent: (_types: string[]) => void;
        };
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
  }
}

interface GoogleOneTapNotification {
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getSkippedReason: () => string;
  getDismissedReason: () => string;
}

// Fix: c12 resolves via .d.mts which TypeScript may not follow in some pnpm setups,
// causing DefineNuxtConfig to lose its call signature. Adding it back explicitly.
declare module "nuxt/config" {
  interface DefineNuxtConfig {
    (
      config: import("@nuxt/schema").NuxtConfig,
    ): import("@nuxt/schema").NuxtConfig;
  }
}
