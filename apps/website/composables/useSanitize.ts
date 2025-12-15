export const useSanitize = () => {
  // Función para sanitizar HTML de forma segura
  const sanitizeHTML = (
    html: string,
    allowedTags: string[] = [],
    allowedAttrs: string[] = []
  ): string => {
    if (!html) return "";

    // Detectar si estamos en el servidor
    const isServer = typeof window === "undefined";

    // En el servidor, hacer sanitización básica con regex
    if (isServer) {
      let sanitized = html;

      // Remover todos los scripts y eventos
      sanitized = sanitized.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ""
      );
      sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
      sanitized = sanitized.replace(/javascript:/gi, "");

      // Si no hay etiquetas permitidas, convertir a texto plano
      if (allowedTags.length === 0) {
        return sanitized.replace(/<[^>]*>/g, "");
      }

      // Permitir solo etiquetas específicas
      const tagPattern = new RegExp(
        `<(?!/?(?:${allowedTags.join("|")})\\b)[^>]*>`,
        "gi"
      );
      sanitized = sanitized.replace(tagPattern, "");

      return sanitized;
    }

    // En el cliente, usar DOMPurify si está disponible
    if (typeof window !== "undefined" && (window as any).DOMPurify) {
      return (window as any).DOMPurify.sanitize(html, {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: allowedAttrs,
        KEEP_CONTENT: true,
      });
    }

    // Fallback: sanitización básica
    return html.replace(/<[^>]*>/g, "");
  };

  /**
   * Sanitiza HTML permitiendo solo etiquetas seguras para contenido de texto
   * Ideal para títulos, descripciones y contenido de texto
   */
  const sanitizeText = (html: string): string => {
    return sanitizeHTML(html, ["strong", "em", "b", "i", "u", "br", "p"], []);
  };

  /**
   * Sanitiza HTML permitiendo más etiquetas para contenido rico
   * Ideal para descripciones de productos, contenido de artículos
   */
  const sanitizeRich = (html: string): string => {
    return sanitizeHTML(
      html,
      [
        "strong",
        "em",
        "b",
        "i",
        "u",
        "br",
        "p",
        "div",
        "span",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "blockquote",
        "a",
      ],
      ["href", "target", "rel"]
    );
  };

  /**
   * Sanitiza HTML de forma estricta, solo texto plano
   * Ideal para datos que vienen de usuarios
   */
  const sanitizeStrict = (html: string): string => {
    return sanitizeHTML(html, [], []);
  };

  /**
   * Sanitiza HTML permitiendo solo etiquetas de formato básico
   * Ideal para contenido que puede tener formato pero debe ser seguro
   */
  const sanitizeBasic = (html: string): string => {
    return sanitizeHTML(html, ["strong", "em", "br"], []);
  };

  return {
    sanitizeText,
    sanitizeRich,
    sanitizeStrict,
    sanitizeBasic,
  };
};
