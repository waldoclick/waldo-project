import type Cookies from "js-cookie";
import type { GtmSupport } from "@gtm-support/vue-gtm";
import type { formatDate, formatDateShort } from "../utils/date";
// Activate pinia-plugin-persistedstate module augmentation (adds `persist` to DefineStoreOptionsBase)
import "pinia-plugin-persistedstate";

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
    // Bridge @gtm-support/vue-gtm's @vue/runtime-core augmentation into 'vue'
    // so Nuxt auto-imports (formatDate etc.) remain visible on the component instance.
    $gtm: GtmSupport;
  }
}

// @gtm-support/vue-gtm augments @vue/runtime-core (not 'vue'), which causes Volar's
// template type checker to use @vue/runtime-core's ComponentCustomProperties — missing
// Nuxt auto-imports like formatDate. Bridge those into @vue/runtime-core to fix the split.
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    readonly formatDate: typeof formatDate;
    readonly formatDateShort: typeof formatDateShort;
  }
}

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

export {};
