import { useAppStore } from "@/stores/app.store";
import { useMeStore } from "@/stores/me.store";
import { useSearchStore } from "@/stores/search.store";
import { useStrapiAuth, navigateTo } from "#imports";

export const useLogout = () => {
  const logout = async (): Promise<void> => {
    const appStore = useAppStore();
    const meStore = useMeStore();
    const searchStore = useSearchStore();
    const { logout: strapiLogout } = useStrapiAuth();

    appStore.$reset();
    meStore.reset();
    searchStore.clearTavily();

    await strapiLogout();
    await navigateTo("/auth/login");
  };

  return { logout };
};
