import type Cookies from "js-cookie";

declare module "#app" {
  interface NuxtApp {
    $recaptcha: {
      execute: (action: string) => Promise<string>;
    };
    $cookies: typeof Cookies;
    $checkSiteHealth: () => Promise<{
      hasError: boolean;
      errorDetails: Array<{ type: string; message: string }>;
    }>;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $recaptcha: {
      execute: (action: string) => Promise<string>;
    };
    $cookies: typeof Cookies;
    $checkSiteHealth: () => Promise<{
      hasError: boolean;
      errorDetails: Array<{ type: string; message: string }>;
    }>;
  }
}

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

export {};
