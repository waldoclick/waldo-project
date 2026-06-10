import {
  aZ as v,
  a_ as r,
  a$ as c,
  bf as n,
  b0 as m,
  b2 as B,
  bb as E,
  bm as I,
  be as k,
  bG as D,
  bN as U,
  bn as V,
  bo as N,
  b8 as S,
  bi as F,
  cQ as L,
  b7 as b,
  b1 as R,
  bF as z,
  b5 as f,
  bu as H,
  c_ as T,
  b4 as M,
  cs as W,
  b6 as s,
  cu as G,
  aY as K,
  ba as Q,
  cK as Y,
} from "./BK8sApmn.js";
import { u as Z } from "./De8hi3Om.js";
import { u as J } from "./0mH1i9X5.js";
import { _ as X } from "./ClGpxEC3.js";
import { C as ee, R as te } from "./dfgTFwTe.js";
import "./RG9bXWPx.js";
import "./CNKn_OHC.js";
try {
  let a =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    i = new a.Error().stack;
  i &&
    ((a._sentryDebugIds = a._sentryDebugIds || {}),
    (a._sentryDebugIds[i] = "837c100a-185f-4bba-bbd1-230997538db5"),
    (a._sentryDebugIdIdentifier =
      "sentry-dbid-837c100a-185f-4bba-bbd1-230997538db5"));
} catch {}
const ae = { class: "hero hero--articles" },
  se = { class: "hero--articles__container" },
  re = { class: "hero--articles__breadcrumbs" },
  le = v({
    __name: "HeroArticles",
    setup(a) {
      const i = [{ label: "Blog" }];
      return (_, u) => (
        r(),
        c("section", ae, [
          n("div", se, [
            n("div", re, [m(X, { items: i })]),
            u[0] ||
              (u[0] = n(
                "div",
                { class: "hero--articles__title" },
                [n("h1", null, "Blog")],
                -1,
              )),
          ]),
        ])
      );
    },
  }),
  ie = Object.assign(le, { __name: "HeroArticles" }),
  oe = { class: "filter filter--articles" },
  ne = { class: "filter--articles__container" },
  ce = { class: "filter--articles__selectors" },
  ue = { class: "filter--articles__selector" },
  de = ["value"],
  ge = {
    key: 1,
    class: "filter--articles__select filter--articles__select--loading",
  },
  _e = { class: "filter--articles__order" },
  pe = {
    key: 1,
    class:
      "filter--articles__select filter--articles__select--simple filter--articles__select--loading",
  },
  be = v({
    __name: "FilterArticles",
    props: { categories: {} },
    setup(a) {
      const i = B(),
        _ = E(),
        u = S(!1),
        d = S("all"),
        o = S("recent");
      return (
        I(() => {
          ((u.value = !0),
            (d.value = i.query.category?.toString() || "all"),
            (o.value = i.query.order?.toString() || "recent"));
        }),
        k(d, (t) => {
          _.push({
            query: { ...i.query, category: t !== "all" ? t : void 0, page: 1 },
          });
        }),
        k(o, (t) => {
          _.push({ query: { ...i.query, order: t, page: 1 } });
        }),
        (t, e) => (
          r(),
          c("section", oe, [
            n("div", ne, [
              n("div", ce, [
                n("div", ue, [
                  u.value
                    ? D(
                        (r(),
                        c(
                          "select",
                          {
                            key: 0,
                            "onUpdate:modelValue":
                              e[0] || (e[0] = (l) => (d.value = l)),
                            class: "filter--articles__select",
                          },
                          [
                            e[2] ||
                              (e[2] = n(
                                "option",
                                { value: "all" },
                                "Todas las categorías",
                                -1,
                              )),
                            (r(!0),
                            c(
                              V,
                              null,
                              N(
                                a.categories,
                                (l) => (
                                  r(),
                                  c(
                                    "option",
                                    { key: l.id, value: l.slug },
                                    F(l.name),
                                    9,
                                    de,
                                  )
                                ),
                              ),
                              128,
                            )),
                          ],
                          512,
                        )),
                        [[U, d.value]],
                      )
                    : (r(), c("div", ge, " Cargando... ")),
                ]),
              ]),
              n("div", _e, [
                e[4] || (e[4] = n("label", null, "Ordenar por:", -1)),
                u.value
                  ? D(
                      (r(),
                      c(
                        "select",
                        {
                          key: 0,
                          "onUpdate:modelValue":
                            e[1] || (e[1] = (l) => (o.value = l)),
                          class:
                            "filter--articles__select filter--articles__select--simple",
                        },
                        [
                          ...(e[3] ||
                            (e[3] = [
                              n(
                                "option",
                                { value: "recent" },
                                "Más recientes",
                                -1,
                              ),
                              n(
                                "option",
                                { value: "oldest" },
                                "Más antiguos",
                                -1,
                              ),
                            ])),
                        ],
                        512,
                      )),
                      [[U, o.value]],
                    )
                  : (r(), c("div", pe, " Cargando... ")),
              ]),
            ]),
          ])
        )
      );
    },
  }),
  me = Object.assign(be, { __name: "FilterArticles" }),
  fe = { class: "article article--archive" },
  ye = { class: "container" },
  he = { key: 0, class: "article--archive__list" },
  ve = { key: 1, class: "article--archive__paginate" },
  $e = { class: "paginate" },
  Ae = v({
    __name: "ArticleArchive",
    props: { articles: {}, pagination: {} },
    setup(a) {
      const i = E(),
        _ = B(),
        u = (d) => {
          (window.scrollTo(0, 0),
            i.push({ query: { ..._.query, page: d.toString() } }));
        };
      return (d, o) => {
        const t = L("vue-awesome-paginate"),
          e = z;
        return (
          r(),
          c("section", fe, [
            n("div", ye, [
              a.articles && a.articles.length > 0
                ? (r(),
                  c("div", he, [
                    (r(!0),
                    c(
                      V,
                      null,
                      N(
                        a.articles,
                        (l) => (
                          r(),
                          f(ee, { key: l.id, article: l }, null, 8, ["article"])
                        ),
                      ),
                      128,
                    )),
                  ]))
                : b("", !0),
              a.pagination &&
              a.pagination.pageCount > 1 &&
              a.pagination.total > a.pagination.pageSize
                ? (r(),
                  c("div", ve, [
                    m(e, null, {
                      default: R(() => [
                        n("div", $e, [
                          m(
                            t,
                            {
                              modelValue: a.pagination.page,
                              "onUpdate:modelValue":
                                o[0] || (o[0] = (l) => (a.pagination.page = l)),
                              "total-items": a.pagination.total,
                              "items-per-page": a.pagination.pageSize,
                              "max-pages-shown": 5,
                              onClick: u,
                            },
                            null,
                            8,
                            ["modelValue", "total-items", "items-per-page"],
                          ),
                        ]),
                      ]),
                      _: 1,
                    }),
                  ]))
                : b("", !0),
            ]),
          ])
        );
      };
    },
  }),
  Se = Object.assign(Ae, { __name: "ArticleArchive" }),
  ke = { class: "page" },
  Ve = v({
    __name: "index",
    async setup(a) {
      let i, _;
      const { $setSEO: u, $setStructuredData: d } = H(),
        o = K(),
        t = T(),
        { data: e } =
          (([i, _] = M(async () =>
            Q(
              () =>
                `blog-${t.query.category || "all"}-${t.query.page || "1"}-${t.query.order || "recent"}`,
              async () => {
                const p = Z(),
                  g = J();
                (await p.loadCategories(), g.reset());
                const h = t.query.category?.toString() || null,
                  O = Number.parseInt(t.query.page?.toString() || "1", 10),
                  P =
                    (t.query.order?.toString() || "recent") === "oldest"
                      ? ["publishedAt:asc"]
                      : ["publishedAt:desc"],
                  j = { ...(h && { categories: { slug: { $eq: h } } }) };
                await g.loadArticles(j, { page: O, pageSize: 12 }, P);
                const q = g.articles,
                  w = g.pagination;
                let C = [],
                  $ = !1,
                  x = null;
                if (q.length === 0 && w.total === 0) {
                  $ = !0;
                  try {
                    (await g.loadArticles({}, { page: 1, pageSize: 12 }, [
                      "publishedAt:desc",
                    ]),
                      (C = g.articles));
                  } catch (A) {
                    x = A instanceof Error ? A.message : String(A);
                  }
                  $ = !1;
                }
                return {
                  articles: q,
                  pagination: w,
                  categories: p.categories,
                  relatedArticles: C,
                  relatedLoading: $,
                  relatedError: x,
                };
              },
              {
                watch: [
                  () => t.query.category,
                  () => t.query.page,
                  () => t.query.order,
                ],
                server: !0,
                default: () => ({
                  articles: [],
                  pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 },
                  categories: [],
                  relatedArticles: [],
                  relatedLoading: !1,
                  relatedError: null,
                }),
              },
            ),
          )),
          (i = await i),
          _(),
          i),
        l = () => {
          const p = t.query.category?.toString();
          if (p && e.value) {
            const g = e.value.categories.find((h) => h.slug === p)?.name;
            if (g) return `${g} — Blog — Waldo.click®`;
          }
          return "Blog — Waldo.click®";
        },
        y = () =>
          "Artículos sobre activos industriales, consejos y novedades del sector. Lee las últimas publicaciones en Waldo.click®.";
      return (
        e.value &&
          (u({
            title: l(),
            description: y(),
            imageUrl: `${o.public.baseUrl}/share.jpg`,
            url: `${o.public.baseUrl}${t.fullPath}`,
          }),
          d({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: l(),
            description: y(),
            url: `${o.public.baseUrl}${t.fullPath}`,
          })),
        k(
          [() => e.value, () => t.query],
          () => {
            e.value &&
              (u({
                title: l(),
                description: y(),
                imageUrl: `${o.public.baseUrl}/share.jpg`,
                url: `${o.public.baseUrl}${t.fullPath}`,
              }),
              d({
                "@context": "https://schema.org",
                "@type": "Blog",
                name: l(),
                description: y(),
                url: `${o.public.baseUrl}${t.fullPath}`,
              }));
          },
          { immediate: !0 },
        ),
        (p, g) => (
          r(),
          c("div", ke, [
            m(W),
            m(ie),
            s(e) && s(e).articles && s(e).articles.length > 0
              ? (r(),
                f(me, { key: 0, categories: s(e).categories }, null, 8, [
                  "categories",
                ]))
              : b("", !0),
            s(e) && s(e).articles && s(e).articles.length > 0
              ? (r(),
                f(
                  Se,
                  {
                    key: 1,
                    articles: s(e).articles,
                    pagination: s(e).pagination,
                  },
                  null,
                  8,
                  ["articles", "pagination"],
                ))
              : b("", !0),
            s(e) && s(e).articles && s(e).articles.length === 0
              ? (r(),
                f(Y, {
                  key: 2,
                  type: "fail",
                  title: "No hay artículos con esos filtros",
                  description:
                    "Prueba ajustando tu búsqueda o mira lo que tenemos disponible",
                  button_label: "Ver todos los artículos",
                  button_link: "/blog",
                  button_show: !0,
                }))
              : b("", !0),
            s(e) &&
            s(e).articles &&
            s(e).articles.length === 0 &&
            s(e).relatedArticles &&
            s(e).relatedArticles.length > 0
              ? (r(),
                f(
                  te,
                  {
                    key: 3,
                    articles: s(e).relatedArticles,
                    loading: s(e).relatedLoading,
                    error: s(e).relatedError || null,
                    title: "Artículos recientes",
                    text: "Los últimos artículos del blog",
                    "center-head": !0,
                  },
                  null,
                  8,
                  ["articles", "loading", "error"],
                ))
              : b("", !0),
            m(G),
          ])
        )
      );
    },
  });
export { Ve as default };
//# sourceMappingURL=CT5H9Z-G.js.map
