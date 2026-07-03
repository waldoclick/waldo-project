/**
 * llms.txt dinámico — generado en runtime, cacheado 1 hora.
 *
 * Lista solo páginas permanentes (llmstxt.org spec). Los avisos individuales
 * y los perfiles de usuario quedan fuera a propósito: son contenido rotativo
 * que expira o cambia, y no sirven como referencia estable para un LLM.
 */

export default cachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig(event);

    if (config.public.blockSearchEngines) {
      setHeader(event, "Content-Type", "text/plain; charset=utf-8");
      return "llms.txt blocked in this environment.";
    }

    const baseUrl = config.public.baseUrl as string;

    const content = `# Waldo.click

> Marketplace de avisos clasificados en Chile para comprar y vender maquinaria y activos industriales.

Solo se listan páginas permanentes. Los avisos individuales (\`/anuncios/{slug}\`) y los perfiles de usuario (\`/{username}\`) quedan fuera intencionalmente: son contenido rotativo que expira o cambia, y no sirven como referencia estable.

## Páginas principales

- [Inicio](${baseUrl}/): búsqueda de avisos, categorías destacadas y cómo funciona la plataforma.
- [Avisos](${baseUrl}/anuncios): buscador y listado de avisos activos por categoría, comuna y palabra clave.
- [Blog](${baseUrl}/blog): artículos y guías sobre maquinaria, activos industriales y el mercado usado en Chile.
- [Preguntas frecuentes](${baseUrl}/preguntas-frecuentes): dudas comunes sobre publicar, comprar y pagar en Waldo.click.
- [Contacto](${baseUrl}/contacto): canal de contacto directo con el equipo de Waldo.click.

## Legal

- [Términos y condiciones de uso](${baseUrl}/terminos-y-condiciones-de-uso)
- [Políticas de privacidad](${baseUrl}/politicas-de-privacidad)
- [Políticas de cookies](${baseUrl}/politicas-de-cookies)
- [Políticas de seguridad](${baseUrl}/politicas-de-seguridad)
`;

    setHeader(event, "Content-Type", "text/plain; charset=utf-8");

    return content;
  },
  {
    maxAge: 60 * 60, // 1 hora de caché en Nitro
    name: "llms-txt",
    getKey: () => "llms-txt",
  },
);
