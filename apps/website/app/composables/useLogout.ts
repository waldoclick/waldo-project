import { useAdStore } from "@/stores/ad.store";
import { useHistoryStore } from "@/stores/history.store";
import { useMeStore } from "@/stores/me.store";
import { useUserStore } from "@/stores/user.store";
import { useAdsStore } from "@/stores/ads.store";
import { useAppStore } from "@/stores/app.store";
import { navigateTo } from "#imports";

export const useLogout = () => {
  const logout = async (): Promise<void> => {
    const adStore = useAdStore();
    const historyStore = useHistoryStore();
    const meStore = useMeStore();
    const userStore = useUserStore();
    const adsStore = useAdsStore();
    const appStore = useAppStore();

    adStore.$reset();
    historyStore.$reset();
    meStore.reset();
    userStore.reset();
    adsStore.reset();
    appStore.$reset();

    // GTAP-12: Clear GIS auto-sign-in state — prevents One Tap dead-loop after logout
    // Optional chain makes this a safe no-op on server (window.google is undefined)
    window.google?.accounts?.id?.disableAutoSelect();

    // Clear httpOnly cookie server-side — client JS cannot clear an httpOnly cookie
    await $fetch("/api/auth/logout", { method: "POST" });
    useSessionUser().value = null;
    await navigateTo("/");
  };

  return { logout };
};
