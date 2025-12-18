import { defineStore } from "pinia";
import type { AppState } from "@/types/app";

export const useAppStore = defineStore("app", {
  state: (): AppState => ({
    isSearchLightboxActive: false,
    isLoginLightboxActive: false,
    referer: null,
    contactFormSent: false,
    isMobileMenuOpen: false,
  }),

  getters: {
    getIsSearchLightboxActive: (state) => state.isSearchLightboxActive,
    getIsLoginLightboxActive: (state) => state.isLoginLightboxActive,
    getReferer: (state) => state.referer,
    getContactFormSent: (state) => state.contactFormSent,
  },

  actions: {
    // Acciones para el lightbox de búsqueda
    openSearchLightbox(): void {
      this.isSearchLightboxActive = true;
    },

    closeSearchLightbox(): void {
      this.isSearchLightboxActive = false;
    },

    toggleSearchLightbox(): void {
      this.isSearchLightboxActive = !this.isSearchLightboxActive;
    },

    // Acciones para el lightbox de inicio de sesión
    openLoginLightbox(): void {
      this.isLoginLightboxActive = true;
    },

    closeLoginLightbox(): void {
      this.isLoginLightboxActive = false;
    },

    toggleLoginLightbox(): void {
      this.isLoginLightboxActive = !this.isLoginLightboxActive;
    },

    // Acciones para la URL de referencia
    setReferer(url: string): void {
      this.referer = url;
    },

    clearReferer(): void {
      this.referer = null;
    },

    // Acciones para el formulario de contacto
    setContactFormSent(): void {
      this.contactFormSent = true;
    },

    clearContactFormSent(): void {
      this.contactFormSent = false;
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
