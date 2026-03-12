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

    await strapiLogout();
    await navigateTo("/");
  };

  return { logout };
};
