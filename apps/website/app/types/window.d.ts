export {};

declare global {
  interface Window {
    dataLayer: unknown[];
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
