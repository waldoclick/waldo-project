import { defineStore } from "pinia";
import type { AppState } from "@/types/app";

export const useAppStore = defineStore("app", {
  state: (): AppState => ({
    referer: null,
    isMobileMenuOpen: false,
  }),

  getters: {
    getReferer: (state) => state.referer,
  },

  actions: {
    // Acciones para la URL de referencia
    setReferer(url: string): void {
      this.referer = url;
    },

    clearReferer(): void {
      this.referer = null;
    },

    // Acciones para el menú mobile
    openMobileMenu(): void {
      this.isMobileMenuOpen = true;
    },

    closeMobileMenu(): void {
      this.isMobileMenuOpen = false;
    },

    toggleMobileMenu(): void {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
  },

  persist: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
  },
});
