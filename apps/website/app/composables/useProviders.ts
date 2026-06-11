export const useProviders = () => {
  const { getProviderAuthenticationUrl } = useStrapiAuth();

  /**
   * Returns the provider authentication URL.
   * In proxy mode (production), the Nitro proxy at server/api/[...].ts forwards
   * /api/connect/google to Strapi — no URL replacement needed.
   * In dev-direct mode (API_DISABLE_PROXY=true), @nuxtjs/strapi is configured with
   * the Strapi URL directly, so getProviderAuthenticationUrl already returns the correct URL.
   */
  const getProviderUrl = (provider: string): string => {
    return getProviderAuthenticationUrl(provider);
  };

  /**
   * Redirige al proveedor de autenticación especificado
   */
  const redirectToProvider = (provider: string): void => {
    const url = getProviderUrl(provider);
    window.location.href = url;
  };

  return {
    getProviderUrl,
    redirectToProvider,
  };
};
