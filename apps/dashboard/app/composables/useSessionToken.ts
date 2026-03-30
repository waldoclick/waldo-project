import { useCookie, useNuxtApp, useRuntimeConfig } from "#imports";
import type { Ref } from "vue";

export const useSessionToken = (): Ref<string | null> => {
  const nuxt = useNuxtApp();
  const config = import.meta.server
    ? useRuntimeConfig()
    : useRuntimeConfig().public;
  const strapiConfig = config.strapi as Record<string, unknown>;
  const cookieName = strapiConfig.cookieName as string;
  const cookieOptions = strapiConfig.cookie as Record<string, unknown>;

  nuxt._cookies = nuxt._cookies || {};
  if (nuxt._cookies[cookieName]) {
    return nuxt._cookies[cookieName] as Ref<string | null>;
  }
  const cookie = useCookie<string | null>(cookieName, cookieOptions);
  nuxt._cookies[cookieName] = cookie;
  return cookie;
};
