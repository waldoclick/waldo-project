/**
 * Sitemap dinámico — generado en runtime, cacheado 1 hora.
 *
 * Corre server-side: el fetch va directo a Strapi (server → server).
 * La URL de Strapi nunca se expone al browser.
 */

interface AdEntry {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
  details?: { featured?: boolean };
}

interface ArticleEntry {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
  publishedAt?: string | null;
}

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildUrl(
  baseUrl: string,
  loc: string,
  options: {
    lastmod?: string;
    changefreq?: string;
    priority?: number;
  } = {},
): string {
  const parts = [`  <url>`, `    <loc>${xmlEscape(baseUrl + loc)}</loc>`];
  if (options.lastmod) parts.push(`    <lastmod>${options.lastmod}</lastmod>`);
  if (options.changefreq)
    parts.push(`    <changefreq>${options.changefreq}</changefreq>`);
  if (options.priority !== undefined)
    parts.push(`    <priority>${options.priority.toFixed(1)}</priority>`);
  parts.push(`  </url>`);
  return parts.join("\n");
}

export default cachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig(event);
    const apiUrl = config.public.apiUrl as string;
    const baseUrl = config.public.baseUrl as string;

    const urls: string[] = [];

    // Páginas estáticas
    const staticPages = [
      { loc: "/", changefreq: "daily", priority: 1 },
      { loc: "/anuncios", changefreq: "hourly", priority: 0.9 },
      { loc: "/blog", changefreq: "daily", priority: 0.8 },
      { loc: "/packs", changefreq: "monthly", priority: 0.6 },
      { loc: "/preguntas-frecuentes", changefreq: "monthly", priority: 0.5 },
      { loc: "/contacto", changefreq: "yearly", priority: 0.4 },
      { loc: "/politicas-de-privacidad", changefreq: "yearly", priority: 0.3 },
    ];

    for (const page of staticPages) {
      urls.push(buildUrl(baseUrl, page.loc, page));
    }

    // Anuncios activos
    try {
      const adsRes = await fetch(`${apiUrl}/api/ads/actives`);
      if (adsRes.ok) {
        const adsData = await adsRes.json();
        const ads: AdEntry[] = adsData.data || [];
        for (const ad of ads) {
          if (!ad.slug) continue;
          urls.push(
            buildUrl(baseUrl, `/anuncios/${ad.slug}`, {
              lastmod: new Date(
                ad.updatedAt || ad.createdAt || Date.now(),
              ).toISOString(),
              changefreq: "weekly",
              priority: ad.details?.featured ? 0.8 : 0.6,
            }),
          );
        }
      }
    } catch {
      // Si Strapi no responde, seguimos con las URLs estáticas
    }

    // Artículos del blog
    try {
      const articlesRes = await fetch(
        `${apiUrl}/api/articles?filters[publishedAt][$notNull]=true&fields[0]=slug&fields[1]=updatedAt&fields[2]=publishedAt&pagination[pageSize]=1000`,
      );
      if (articlesRes.ok) {
        const articlesData = await articlesRes.json();
        const articles: ArticleEntry[] = articlesData.data || [];
        for (const article of articles) {
          if (!article.slug) continue;
          urls.push(
            buildUrl(baseUrl, `/blog/${article.slug}`, {
              lastmod: new Date(
                article.updatedAt ||
                  article.publishedAt ||
                  article.createdAt ||
                  Date.now(),
              ).toISOString(),
              changefreq: "monthly",
              priority: 0.7,
            }),
          );
        }
      }
    } catch {
      // Si Strapi no responde, seguimos sin los artículos
    }

    const xml = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
      ...urls,
      `</urlset>`,
    ].join("\n");

    setHeader(event, "Content-Type", "application/xml; charset=utf-8");

    return xml;
  },
  {
    maxAge: 60 * 60, // 1 hora de caché en Nitro
    name: "sitemap-xml",
    getKey: () => "sitemap-xml",
  },
);
