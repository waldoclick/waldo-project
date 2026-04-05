import { useAdStore } from "@/stores/ad.store";
import { useHistoryStore } from "@/stores/history.store";
import { useMeStore } from "@/stores/me.store";
import { useUserStore } from "@/stores/user.store";
import { useAdsStore } from "@/stores/ads.store";
import { useAppStore } from "@/stores/app.store";
import { useStrapiAuth, navigateTo } from "#imports";

export const useLogout = () => {
  const logout = async (): Promise<void> => {
    const adStore = useAdStore();
    const historyStore = useHistoryStore();
    const meStore = useMeStore();
    const userStore = useUserStore();
    const adsStore = useAdsStore();
    const appStore = useAppStore();
    const { logout: strapiLogout } = useStrapiAuth();

    adStore.$reset();
    historyStore.$reset();
    meStore.reset();
    userStore.reset();
    adsStore.reset();
    appStore.$reset();

    // Clear the old host-only cookie (pre-migration, no domain attr) to prevent zombie sessions
    if (import.meta.client) {
      const { cookie: cookieOpts } = useRuntimeConfig().public.strapi as {
        cookie: { path: string; domain?: string };
      };
      document.cookie = `waldo_jwt=; path=${cookieOpts.path}; max-age=0${cookieOpts.domain ? `; domain=${cookieOpts.domain}` : ""}`;
    }

    // GTAP-12: Clear GIS auto-sign-in state — prevents One Tap dead-loop after logout
    // Optional chain makes this a safe no-op on server (window.google is undefined)
    window.google?.accounts?.id?.disableAutoSelect();

    await strapiLogout();
    await navigateTo("/");
  };

  return { logout };
};
