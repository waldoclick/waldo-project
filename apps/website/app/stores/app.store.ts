import { defineStore } from "pinia";
import type { AppState } from "@/types/app";

export const useAppStore = defineStore("app", {
  state: (): AppState => ({
    isSearchLightboxActive: false,
    isLoginLightboxActive: false,
    isDeactivateLightboxActive: false,
    deactivateAdId: null,
    referer: null,
    contactFormSent: false,
    isMobileMenuOpen: false,
  }),

  getters: {
    getIsSearchLightboxActive: (state) => state.isSearchLightboxActive,
    getIsLoginLightboxActive: (state) => state.isLoginLightboxActive,
    getIsDeactivateLightboxActive: (state) => state.isDeactivateLightboxActive,
    getDeactivateAdId: (state) => state.deactivateAdId,
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

    // Acciones para el lightbox de desactivación
    openDeactivateLightbox(adDocumentId: string): void {
      this.deactivateAdId = adDocumentId;
      this.isDeactivateLightboxActive = true;
    },

    closeDeactivateLightbox(): void {
      this.isDeactivateLightboxActive = false;
      this.deactivateAdId = null;
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

  // persist: REVIEW — referer and contactFormSent are session-scoped; isMobileMenuOpen is volatile UI state that should reset on reload
  persist: {
    storage: persistedState.localStorage,
    pick: ["referer", "contactFormSent", "isMobileMenuOpen"],
  },
});
