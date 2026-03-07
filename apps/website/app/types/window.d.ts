export {};

import type { DataLayerEvent } from "~/composables/useAdAnalytics";

declare global {
  interface Window {
    // dataLayer accepts both GA4 analytics events (DataLayerEvent) and GTM consent commands
    dataLayer: (DataLayerEvent | Record<string, unknown>)[];
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
