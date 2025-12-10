export const useProviders = () => {
  const { getProviderAuthenticationUrl } = useStrapiAuth();
  const config = useRuntimeConfig();

  /**
   * Obtiene la URL de autenticación de un proveedor
   * Si el proxy está desactivado, devuelve la URL normal
   * Si el proxy está activo, reemplaza la URL del frontend con la de la API
   */
  const getProviderUrl = (provider: string): string => {
    const originalUrl = getProviderAuthenticationUrl(provider);

    // Si el proxy está desactivado, devolver la URL original
    if (config.public.apiDisableProxy) {
      return originalUrl;
    }

    // Si el proxy está activo, hacer el replace
    const frontendUrl = config.public.baseUrl;
    const apiUrl = config.public.apiUrl;

    return originalUrl.replace(frontendUrl, apiUrl);
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
