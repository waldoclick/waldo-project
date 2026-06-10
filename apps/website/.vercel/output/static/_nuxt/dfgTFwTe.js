import {
  cL as $,
  aZ as b,
  a_ as t,
  a$ as a,
  bf as l,
  bC as y,
  b0 as o,
  b1 as _,
  b5 as v,
  cM as w,
  br as C,
  bs as u,
  bi as r,
  b7 as m,
  b9 as f,
  bt as A,
  cN as I,
  bn as N,
  bo as D,
} from "./BK8sApmn.js";
try {
  let e =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    i = new e.Error().stack;
  i &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[i] = "aceab85d-1709-4514-a104-8d0d829c5d68"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-aceab85d-1709-4514-a104-8d0d829c5d68"));
} catch {}
const B = $("/images/empty-article.png"),
  L = { class: "card card--article" },
  R = ["alt"],
  T = { class: "card--article__info" },
  V = { key: 0, class: "card--article__info__categories" },
  z = { class: "card--article__info__name" },
  j = { class: "card--article__info__excerpt" },
  E = { key: 1, class: "card--article__info__date" },
  F = b({
    __name: "CardArticle",
    props: { article: {} },
    setup(e) {
      const i = e,
        { transformUrl: g } = A(),
        n = (c, s) => (c.length > s ? c.slice(0, Math.max(0, s)) + "..." : c),
        h = f(() => {
          const c = i.article.cover;
          return c && c.length > 0;
        }),
        k = f(() => {
          const c = i.article.cover,
            s =
              c[0]?.formats?.medium?.url || c[0]?.formats?.thumbnail?.url || "";
          return g(s);
        });
      return (c, s) => {
        const x = w,
          d = C;
        return (
          t(),
          a("article", L, [
            l(
              "div",
              {
                class: y([
                  "card--article__image",
                  { "card--article__image--empty": !h.value },
                ]),
              },
              [
                o(
                  d,
                  { to: `/blog/${e.article.slug}` },
                  {
                    default: _(() => [
                      h.value
                        ? (t(),
                          v(
                            x,
                            {
                              key: 0,
                              src: k.value,
                              alt: e.article.title,
                              width: "400",
                              height: "300",
                              loading: "lazy",
                              format: "webp",
                              remote: "",
                            },
                            null,
                            8,
                            ["src", "alt"],
                          ))
                        : (t(),
                          a(
                            "img",
                            {
                              key: 1,
                              src: B,
                              alt: e.article.title,
                              width: "400",
                              height: "300",
                              loading: "lazy",
                            },
                            null,
                            8,
                            R,
                          )),
                    ]),
                    _: 1,
                  },
                  8,
                  ["to"],
                ),
              ],
              2,
            ),
            l("div", T, [
              e.article.categories && e.article.categories.length > 0
                ? (t(),
                  a("nav", V, [
                    o(
                      d,
                      { to: `/blog?category=${e.article.categories[0].slug}` },
                      {
                        default: _(() => [
                          u(r(e.article.categories[0].name), 1),
                        ]),
                        _: 1,
                      },
                      8,
                      ["to"],
                    ),
                  ]))
                : m("", !0),
              l("h3", z, [
                o(
                  d,
                  { to: `/blog/${e.article.slug}` },
                  { default: _(() => [u(r(n(e.article.title, 60)), 1)]), _: 1 },
                  8,
                  ["to"],
                ),
              ]),
              l("p", j, r(n(e.article.header, 120)), 1),
              e.article.publishedAt
                ? (t(),
                  a(
                    "div",
                    E,
                    r(
                      new Intl.DateTimeFormat("es-CL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }).format(new Date(e.article.publishedAt)),
                    ),
                    1,
                  ))
                : m("", !0),
              o(
                d,
                {
                  to: `/blog/${e.article.slug}`,
                  class: "card--article__info__link",
                },
                {
                  default: _(() => [
                    ...(s[0] || (s[0] = [u(" Leer más ", -1)])),
                  ]),
                  _: 1,
                },
                8,
                ["to"],
              ),
            ]),
          ])
        );
      };
    },
  }),
  H = Object.assign(F, { __name: "CardArticle" }),
  M = { class: "related related--articles" },
  O = { class: "related--articles__container" },
  U = { class: "related--articles__title" },
  P = { key: 0, class: "related--articles__text" },
  S = { key: 0, class: "related--articles__loading" },
  Z = { key: 1, class: "related--articles__error" },
  q = { key: 2, class: "related--articles__empty" },
  G = { key: 3, class: "related--articles__grid" },
  J = b({
    __name: "RelatedArticles",
    props: {
      articles: {},
      loading: { type: Boolean },
      error: {},
      title: { default: "Artículos relacionados" },
      text: { default: "" },
      centerHead: { type: Boolean, default: !1 },
    },
    setup(e) {
      return (i, g) => (
        t(),
        a("section", M, [
          l("div", O, [
            l(
              "div",
              {
                class: y([
                  "related--articles__head",
                  { "related--articles__head--center": e.centerHead },
                ]),
              },
              [
                l("h2", U, r(e.title), 1),
                e.text ? (t(), a("div", P, r(e.text), 1)) : m("", !0),
              ],
              2,
            ),
            e.loading
              ? (t(), a("div", S, [o(I)]))
              : e.error
                ? (t(), a("div", Z, r(e.error), 1))
                : e.articles.length === 0
                  ? (t(),
                    a("div", q, " No se encontraron artículos relacionados "))
                  : (t(),
                    a("div", G, [
                      (t(!0),
                      a(
                        N,
                        null,
                        D(
                          e.articles,
                          (n) => (
                            t(),
                            v(H, { key: n.id, article: n }, null, 8, [
                              "article",
                            ])
                          ),
                        ),
                        128,
                      )),
                    ])),
          ]),
        ])
      );
    },
  }),
  Q = Object.assign(J, { __name: "RelatedArticles" });
export { H as C, Q as R };
//# sourceMappingURL=dfgTFwTe.js.map
