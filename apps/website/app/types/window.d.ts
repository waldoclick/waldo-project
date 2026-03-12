export {};

import type { DataLayerEvent } from "~/composables/useAdAnalytics";

declare global {
  interface Window {
    // dataLayer accepts GA4 analytics events, GTM consent commands (array format), and plain objects
    dataLayer: (DataLayerEvent | Record<string, unknown> | unknown[])[];
    google: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (
            callback: (notification: GoogleOneTapNotification) => void,
          ) => void;
        };
      };
    };
    googleOneTapInitialized?: boolean;
    handleCredentialResponse?: (response: { credential: string }) => void;
    $zoho?: {
      salesiq?: {
        widgetcode: string;
        values: Record<string, unknown>;
        ready: () => void;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
  }
}

interface GoogleOneTapNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
  getDismissedReason: () => string;
}
