try {
  let e =
      "undefined" != typeof global
        ? global
        : "undefined" != typeof globalThis
          ? globalThis
          : "undefined" != typeof self
            ? self
            : {},
    t = new e.Error().stack;
  t &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[t] = "2a674f85-e4e4-4b48-9d03-a2bfaa529e32"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-2a674f85-e4e4-4b48-9d03-a2bfaa529e32"));
} catch (e) {}
import { f as e, u as t, h as r } from "../nitro/nitro.mjs";
import "@unocss/core";
import "@unocss/preset-wind3";
import "devalue";
import "node:crypto";
import "consola";
import "node:http";
import "node:https";
import "node:events";
import "node:buffer";
import "lru-cache";
import "node:fs";
import "node:path";
import "@sentry/core";
import "vue";
import "xss";
import "unhead/server";
import "unhead/plugins";
import "unhead/utils";
import "vue-bundle-renderer/runtime";
import "vue/server-renderer";
import "node:url";
import "ipx";
function buildUrl(e, t, r = {}) {
  const o = [
    "  <url>",
    `    <loc>${((i = e + t), i.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;"))}</loc>`,
  ];
  var i;
  return (
    r.lastmod && o.push(`    <lastmod>${r.lastmod}</lastmod>`),
    r.changefreq && o.push(`    <changefreq>${r.changefreq}</changefreq>`),
    void 0 !== r.priority &&
      o.push(`    <priority>${r.priority.toFixed(1)}</priority>`),
    o.push("  </url>"),
    o.join("\n")
  );
}
const o = e(
  async (e) => {
    var o;
    const i = t(e);
    if (i.public.blockSearchEngines)
      return (
        r(e, "Content-Type", "text/plain; charset=utf-8"),
        "Sitemap blocked in this environment."
      );
    const a = i.public.apiUrl,
      n = i.public.baseUrl,
      s = [],
      l = [
        { loc: "/", changefreq: "daily", priority: 1 },
        { loc: "/anuncios", changefreq: "hourly", priority: 0.9 },
        { loc: "/blog", changefreq: "daily", priority: 0.8 },
        { loc: "/packs", changefreq: "monthly", priority: 0.6 },
        { loc: "/preguntas-frecuentes", changefreq: "monthly", priority: 0.5 },
        { loc: "/contacto", changefreq: "yearly", priority: 0.4 },
        {
          loc: "/politicas-de-privacidad",
          changefreq: "yearly",
          priority: 0.3,
        },
      ];
    for (const e of l) s.push(buildUrl(n, e.loc, e));
    try {
      const e = await fetch(`${a}/api/ads/catalog`);
      if (e.ok) {
        const t = (await e.json()).data || [];
        for (const e of t)
          e.slug &&
            s.push(
              buildUrl(n, `/anuncios/${e.slug}`, {
                lastmod: new Date(
                  e.updatedAt || e.createdAt || Date.now(),
                ).toISOString(),
                changefreq: "weekly",
                priority: (null == (o = e.details) ? void 0 : o.featured)
                  ? 0.8
                  : 0.6,
              }),
            );
      }
    } catch {}
    try {
      const e = await fetch(
        `${a}/api/articles?filters[publishedAt][$notNull]=true&fields[0]=slug&fields[1]=updatedAt&fields[2]=publishedAt&pagination[pageSize]=1000`,
      );
      if (e.ok) {
        const t = (await e.json()).data || [];
        for (const e of t)
          e.slug &&
            s.push(
              buildUrl(n, `/blog/${e.slug}`, {
                lastmod: new Date(
                  e.updatedAt || e.publishedAt || e.createdAt || Date.now(),
                ).toISOString(),
                changefreq: "monthly",
                priority: 0.7,
              }),
            );
      }
    } catch {}
    const p = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...s,
      "</urlset>",
    ].join("\n");
    return (r(e, "Content-Type", "application/xml; charset=utf-8"), p);
  },
  { maxAge: 3600, name: "sitemap-xml", getKey: () => "sitemap-xml" },
);
export { o as default };
//# sourceMappingURL=sitemap.xml.mjs.map
