/**
 * Composable for transforming local image URLs to use the correct base URL
 * Handles both proxy and direct API access modes
 */
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
   * Sube múltiples archivos en una sola petición usando el proxy de Strapi
   * @param files - Archivos a subir
   * @param type - Tipo de archivo (gallery, cover, avatar, etc.)
   * @returns Promise con el array de resultados del upload
   */
  const uploadFiles = async (
    files: File[],
    type: string,
  ): Promise<
    Array<{
      id: number;
      url: string;
      formats?: { thumbnail: { url: string }; medium?: { url: string } };
    }>
  > => {
    const token = useStrapiToken();
    const { $recaptcha } = useNuxtApp();
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    formData.append("type", type);

    // Generar token reCAPTCHA para el header
    let recaptchaToken: string | undefined;
    try {
      recaptchaToken = await (
        $recaptcha as
          | { execute: (action: string) => Promise<string> }
          | undefined
      )?.execute("submit");
    } catch {
      // reCAPTCHA bloqueado o no disponible — continuar sin token
    }

    // Usar el proxy en lugar de la URL directa
    const uploadUrl = config.public.apiDisableProxy
      ? `${config.public.apiUrl}/api/ads/upload`
      : `/api/ads/upload`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token.value}`,
    };
    if (recaptchaToken) {
      headers["X-Recaptcha-Token"] = recaptchaToken;
    }

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();
    return result; // Strapi devuelve un array con todos los archivos subidos
  };

  return { transformUrl, uploadFiles };
}
