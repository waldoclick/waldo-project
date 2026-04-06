export {};

import type { DataLayerEvent } from "~/composables/useAdAnalytics";
import type DOMPurify from "dompurify";

declare global {
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
