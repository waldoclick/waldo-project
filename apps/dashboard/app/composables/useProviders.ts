export const useProviders = () => {
  const { getProviderAuthenticationUrl } = useStrapiAuth();
  const config = useRuntimeConfig();

  /**
   * Obtiene la URL de autenticación de un proveedor
   * Si el proxy está desactivado, devuelve la URL normal
   * Si el proxy está activo, reemplaza la URL del frontend con la de la API
   * y agrega el redirect_url correcto para el dashboard
   */
  const getProviderUrl = (provider: string): string => {
    const originalUrl = getProviderAuthenticationUrl(provider);
    const frontendUrl = config.public.baseUrl;
    const redirectUrl = `${frontendUrl}/login/${provider}`;

    // Convertir URL relativa a absoluta si es necesario
    let url: URL;
    try {
      url = new URL(originalUrl);
    } catch {
      // Si es una URL relativa, construirla con baseUrl
      const baseUrl = config.public.apiDisableProxy
        ? config.public.apiUrl
        : frontendUrl;
      url = new URL(originalUrl, baseUrl);
    }

    // Agregar el redirect_url para que Strapi sepa dónde redirigir después de autenticar
    url.searchParams.set("redirect_url", redirectUrl);

    // Si el proxy está desactivado, devolver la URL con redirect_url
    if (config.public.apiDisableProxy) {
      return url.toString();
    }

    // Si el proxy está activo, reemplazar el host por el de la API
    const apiUrl = config.public.apiUrl;
    const apiUrlObj = new URL(apiUrl);
    url.host = apiUrlObj.host;
    url.protocol = apiUrlObj.protocol;
    if (apiUrlObj.port) {
      url.port = apiUrlObj.port;
    }

    return url.toString();
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
