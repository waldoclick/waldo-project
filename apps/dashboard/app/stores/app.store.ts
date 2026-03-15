import { defineStore } from "pinia";
import { ref } from "vue";
import type { AppState } from "@/types/app";

export const useAppStore = defineStore(
  "app",
  () => {
    const referer = ref<AppState["referer"]>(null);
    const isMobileMenuOpen = ref<AppState["isMobileMenuOpen"]>(false);

    // Getters
    const getReferer = computed(() => referer.value);

    // Actions: referer
    function setReferer(url: string): void {
      referer.value = url;
    }

    function clearReferer(): void {
      referer.value = null;
    }

    // Actions: mobile menu
    function openMobileMenu(): void {
      isMobileMenuOpen.value = true;
    }

    function closeMobileMenu(): void {
      isMobileMenuOpen.value = false;
    }

    function toggleMobileMenu(): void {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
    }

    return {
      referer,
      isMobileMenuOpen,
      getReferer,
      setReferer,
      clearReferer,
      openMobileMenu,
      closeMobileMenu,
      toggleMobileMenu,
    };
  },
  {
    // persist: CORRECT — referer must survive page refresh so post-login redirect works
    persist: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
    },
  },
);
