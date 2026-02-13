/**
 * Composable for transforming local image URLs to use the correct base URL
 * Handles both proxy and direct API access modes
 */
export function useImage() {
  const { getImage } = useNuxtImage();
  return { getImage, ...useImageProxy() };
}

export function useImageProxy() {
  const config = useRuntimeConfig();

  /**
   * Transforms a local image URL to use the correct base URL
   * @param url - The local image URL
   * @returns The full URL with correct base
   */
  const transformUrl = (url: string): string => {
    if (!url) return "";

    // If it's already a full URL, return as is
    if (url.startsWith("http")) {
      return url;
    }

    // If it's a relative URL (starts with /), use the appropriate base URL
    if (url.startsWith("/")) {
      // If proxy is disabled, use apiUrl directly
      if (config.public.apiDisableProxy) {
        return `${config.public.apiUrl}${url}`;
      }

      // If proxy is enabled, convert /uploads/ to /api/images/ and use baseUrl
      if (url.startsWith("/uploads/")) {
        const proxyPath = url.replace("/uploads/", "/api/images/");
        return `${config.public.baseUrl}${proxyPath}`;
      }

      // For other paths, use baseUrl
      return `${config.public.baseUrl}${url}`;
    }

    // If it's not a recognized URL, return as is
    return url;
  };

  /**
   * Sube un archivo usando el proxy de Strapi
   * @param file - Archivo a subir
   * @param type - Tipo de archivo (gallery, cover, avatar, etc.)
   * @param recaptchaToken - Token de reCAPTCHA (opcional)
   * @returns Promise con el resultado del upload
   */
  const uploadFile = async (
    file: File,
    type: string,
    recaptchaToken?: string,
  ) => {
    const token = useStrapiToken();
    const formData = new FormData();
    formData.append("files", file);
    formData.append("type", type);

    // Agregar token de reCAPTCHA si está disponible
    if (recaptchaToken) {
      formData.append("recaptchaToken", recaptchaToken);
    }

    // Usar el proxy en lugar de la URL directa
    const uploadUrl = config.public.apiDisableProxy
      ? `${config.public.apiUrl}/api/ads/upload`
      : `/api/ads/upload`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();
    return result[0]; // Strapi devuelve un array, tomamos el primer elemento
  };

  return { transformUrl, uploadFile };
}
