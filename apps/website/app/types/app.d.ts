export interface AppState {
  isSearchLightboxActive: boolean;
  isLoginLightboxActive: boolean;
  isDeactivateLightboxActive: boolean;
  deactivateAdId: string | null;
  referer: string | null;
  contactFormSent: boolean;
  isMobileMenuOpen: boolean;
}
