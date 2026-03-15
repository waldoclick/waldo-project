import type { CookiesStatic } from "js-cookie";

declare module "#app" {
  interface NuxtApp {
    $cookies: CookiesStatic;
    $checkSiteHealth: () => Promise<{
      hasError: boolean;
      errorDetails: Array<{ type: string; message: string }>;
    }>;
    $recaptcha?: {
      execute: (action: string) => Promise<string | undefined>;
    };
  }
}

export {};
