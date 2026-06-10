import {
  aZ as $,
  a_ as o,
  a$ as d,
  bf as a,
  b0 as n,
  bi as v,
  b7 as h,
  b9 as w,
  b6 as r,
  bn as C,
  bo as I,
  cW as B,
  b1 as N,
  bs as H,
  br as L,
  bu as T,
  c_ as V,
  b4 as z,
  cr as E,
  be as A,
  cs as M,
  b5 as U,
  cu as q,
  ba as F,
  cv as O,
  aY as R,
  b8 as j,
} from "./BK8sApmn.js";
import { u as W } from "./0mH1i9X5.js";
import { _ as P } from "./ClGpxEC3.js";
import { _ as G, S as Y } from "./MqP1_NXX.js";
import { R as Z } from "./dfgTFwTe.js";
import { u as J } from "./CJzzMwWR.js";
import "./RG9bXWPx.js";
import "./CNKn_OHC.js";
import "./BSW603Mu.js";
import "./DJPzpk2M.js";
import "./D6ORICL5.js";
try {
  let i =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    t = new i.Error().stack;
  t &&
    ((i._sentryDebugIds = i._sentryDebugIds || {}),
    (i._sentryDebugIds[t] = "2d2b65d5-8d61-4eeb-bfee-847f961dccae"),
    (i._sentryDebugIdIdentifier =
      "sentry-dbid-2d2b65d5-8d61-4eeb-bfee-847f961dccae"));
} catch {}
const K = { class: "hero hero--article" },
  Q = { class: "hero--article__container" },
  X = { class: "hero--article__breadcrumbs" },
  ee = { class: "hero--article__title" },
  te = { key: 0, class: "hero--article__date" },
  se = ["datetime"],
  ae = $({
    __name: "HeroArticle",
    props: { title: {}, categoryName: {}, categorySlug: {}, publishedAt: {} },
    setup(i) {
      const t = i,
        _ = w(() => [{ label: "Blog", to: "/blog" }, { label: t.title }]),
        m = w(() =>
          t.publishedAt
            ? new Intl.DateTimeFormat("es-CL", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(new Date(t.publishedAt))
            : null,
        );
      return (p, g) => (
        o(),
        d("section", K, [
          a("div", Q, [
            a("div", X, [n(P, { items: _.value }, null, 8, ["items"])]),
            a("div", ee, [a("h1", null, v(t.title), 1)]),
            m.value
              ? (o(),
                d("div", te, [
                  a(
                    "time",
                    { datetime: t.publishedAt ?? "" },
                    v(m.value),
                    9,
                    se,
                  ),
                ]))
              : h("", !0),
          ]),
        ])
      );
    },
  }),
  le = Object.assign(ae, { __name: "HeroArticle" }),
  ie = { class: "article article--single" },
  re = { class: "article--single__container" },
  ce = { class: "article--single__body" },
  oe = { class: "article--single__body__gallery" },
  ne = { class: "article--single__body__description" },
  ue = ["innerHTML"],
  de = { class: "article--single__sidebar" },
  _e = { key: 0, class: "article--single__sidebar__categories" },
  ge = { class: "article--single__sidebar__share" },
  me = $({
    __name: "ArticleSingle",
    props: { article: {} },
    setup(i) {
      const t = i,
        { parseMarkdown: _ } = B();
      return (m, p) => {
        const g = G,
          u = L;
        return (
          o(),
          d("section", ie, [
            a("div", re, [
              a("div", ce, [
                a("div", oe, [
                  n(g, { media: t.article.gallery ?? [] }, null, 8, ["media"]),
                ]),
                a("div", ne, [
                  a(
                    "div",
                    {
                      class: "article--single__body__description__text",
                      innerHTML: r(_)(t.article.body),
                    },
                    null,
                    8,
                    ue,
                  ),
                ]),
              ]),
              a("div", de, [
                t.article.categories?.length > 0
                  ? (o(),
                    d("div", _e, [
                      p[0] || (p[0] = a("h3", null, "Categorías", -1)),
                      a("ul", null, [
                        (o(!0),
                        d(
                          C,
                          null,
                          I(
                            t.article.categories ?? [],
                            (s) => (
                              o(),
                              d("li", { key: s.id }, [
                                n(
                                  u,
                                  { to: `/blog?category=${s.slug}` },
                                  { default: N(() => [H(v(s.name), 1)]), _: 2 },
                                  1032,
                                  ["to"],
                                ),
                              ])
                            ),
                          ),
                          128,
                        )),
                      ]),
                    ]))
                  : h("", !0),
                a("div", ge, [n(Y)]),
              ]),
            ]),
          ])
        );
      };
    },
  }),
  pe = Object.assign(me, { __name: "ArticleSingle" }),
  be = { key: 0, class: "page" },
  Ce = $({
    __name: "[slug]",
    async setup(i) {
      let t, _;
      const { $setSEO: m, $setStructuredData: p } = T(),
        g = R(),
        u = V(),
        { data: s, pending: S } =
          (([t, _] = z(async () =>
            F(
              () => `article-${u.params.slug}`,
              async () => {
                const l = W(),
                  e = u.params.slug;
                await l.loadArticles(
                  { slug: { $eq: e } },
                  { page: 1, pageSize: 1 },
                  [],
                );
                const c = l.articles[0] || null;
                if (!c) return { article: null, relatedArticles: [] };
                await l.loadArticles(
                  {
                    categories: { slug: { $eq: c.categories?.[0]?.slug } },
                    slug: { $ne: c.slug },
                  },
                  { page: 1, pageSize: 6 },
                  ["publishedAt:desc"],
                );
                let b = l.articles;
                if (b.length < 3) {
                  const k = new Set(b.map((y) => y.id));
                  await l.loadArticles(
                    { slug: { $ne: c.slug } },
                    { page: 1, pageSize: 6 },
                    ["publishedAt:desc"],
                  );
                  const D = l.articles.filter((y) => !k.has(y.id));
                  b = [...b, ...D].slice(0, 6);
                }
                return { article: c, relatedArticles: b };
              },
              {
                server: !0,
                default: () => ({ article: null, relatedArticles: [] }),
              },
            ),
          )),
          (t = await t),
          _(),
          t);
      (E(() => {
        !S.value &&
          (!s.value || !s.value.article) &&
          O({
            statusCode: 404,
            message: "Artículo no encontrado",
            statusMessage:
              "Lo sentimos, el artículo que buscas no existe o no está disponible.",
          });
      }),
        A(
          () => s.value,
          (l) => {
            if (l?.article) {
              const e = l.article,
                c =
                  e.cover?.[0]?.formats?.medium?.url ||
                  e.cover?.[0]?.formats?.thumbnail?.url ||
                  `${g.public.baseUrl}/share.jpg`;
              (m({
                title: `${e.seo_title || e.title} — Blog — Waldo.click®`,
                description: e.seo_description || e.header,
                imageUrl: c,
                url: `${g.public.baseUrl}/blog/${u.params.slug}`,
              }),
                p({
                  "@context": "https://schema.org",
                  "@type": "BlogPosting",
                  name: e.seo_title || e.title,
                  description: e.seo_description || e.header,
                  image: c,
                  datePublished: e.publishedAt || e.createdAt,
                  author: { "@type": "Organization", name: "Waldo.click®" },
                  url: `${g.public.baseUrl}/blog/${u.params.slug}`,
                }));
            }
          },
          { immediate: !0 },
        ));
      const { articleView: x } = J(),
        f = j(!1);
      return (
        A(
          () => u.params.slug,
          () => {
            f.value = !1;
          },
        ),
        A(
          () => s.value,
          (l) => {
            if (l?.article && !f.value) {
              f.value = !0;
              const e = l.article;
              x(e.id, e.title, e.categories[0]?.name || "Unknown");
            }
          },
          { immediate: !0 },
        ),
        (l, e) =>
          r(s)?.article
            ? (o(),
              d("div", be, [
                n(M),
                n(
                  le,
                  {
                    title: r(s).article.title,
                    "category-name": r(s).article.categories[0]?.name || "",
                    "category-slug": r(s).article.categories[0]?.slug || "",
                    "published-at": r(s).article.publishedAt,
                  },
                  null,
                  8,
                  ["title", "category-name", "category-slug", "published-at"],
                ),
                n(pe, { article: r(s).article }, null, 8, ["article"]),
                r(s).relatedArticles.length > 0
                  ? (o(),
                    U(
                      Z,
                      {
                        key: 0,
                        articles: r(s).relatedArticles,
                        loading: !1,
                        error: null,
                        title: "Artículos relacionados",
                        text: "Más contenido que puede interesarte",
                        "center-head": !0,
                      },
                      null,
                      8,
                      ["articles"],
                    ))
                  : h("", !0),
                n(q),
              ]))
            : h("", !0)
      );
    },
  });
export { Ce as default };
//# sourceMappingURL=CMrPQo9d.js.map
