import {
  bD as P,
  aZ as m,
  a_ as a,
  a$ as l,
  bf as s,
  b0 as i,
  br as q,
  b1 as C,
  bs as b,
  dn as j,
  b5 as v,
  bS as D,
  b9 as d,
  cW as I,
  bn as H,
  bo as A,
  bP as F,
  dp as O,
  bm as B,
  bI as M,
  be as N,
  bi as w,
  b6 as E,
  b8 as z,
  bC as T,
  cM as W,
  cL as S,
  bu as U,
  b4 as x,
  b3 as R,
  cs as V,
  cu as G,
  aY as Y,
  ba as k,
  d8 as Z,
} from "./BK8sApmn.js";
import { P as J } from "./DeJqzbk_.js";
import { u as K } from "./B8_kTB4K.js";
import { P as Q } from "./BK53MP7p.js";
import { F as X, u as tt } from "./DWOKIegE.js";
import "./DJjbGNXS.js";
import "./CNKn_OHC.js";
import "./JxRx1s6n.js";
import "./SVS4z4K_.js";
import "./DmUMncXv.js";
try {
  let o =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    t = new o.Error().stack;
  t &&
    ((o._sentryDebugIds = o._sentryDebugIds || {}),
    (o._sentryDebugIds[t] = "e6d9f577-ef37-4f93-aa77-09f2ab412f58"),
    (o._sentryDebugIdIdentifier =
      "sentry-dbid-e6d9f577-ef37-4f93-aa77-09f2ab412f58"));
} catch {}
const et = P("phone", [
    [
      "path",
      {
        d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
        key: "foiqr5",
      },
    ],
  ]),
  st = { class: "hero hero--home" },
  ot = { class: "hero--home__container" },
  at = { class: "hero--home__title" },
  nt = { class: "hero--home__search" },
  it = { class: "hero--home__search__default" },
  ct = { class: "hero--home__search__small" },
  rt = { class: "hero--home__bg" },
  lt = m({
    __name: "HeroHome",
    setup(o) {
      return (t, e) => {
        const c = q,
          n = j;
        return (
          a(),
          l("section", st, [
            s("div", ot, [
              s("h1", at, [
                i(
                  c,
                  { to: "/anunciar", class: "publish", title: "Anuncia" },
                  {
                    default: C(() => [
                      ...(e[0] || (e[0] = [b("Anuncia", -1)])),
                    ]),
                    _: 1,
                  },
                ),
                e[2] || (e[2] = b(" o ", -1)),
                i(
                  c,
                  { to: "/anuncios", title: "busca" },
                  {
                    default: C(() => [...(e[1] || (e[1] = [b("busca", -1)]))]),
                    _: 1,
                  },
                ),
                e[3] || (e[3] = b(" activos industriales, ", -1)),
                e[4] || (e[4] = s("br", null, null, -1)),
                e[5] || (e[5] = b(" rápido y fácil en Waldo.click® ", -1)),
              ]),
              e[6] ||
                (e[6] = s(
                  "p",
                  { class: "hero--home__text" },
                  " Encuentra cientos de vendores con ese equipo que necesitas ",
                  -1,
                )),
              s("div", nt, [
                s("div", it, [i(n, { type: "default" })]),
                s("div", ct, [i(n, { type: "small" })]),
              ]),
            ]),
            s("div", rt, [i(J)]),
          ])
        );
      };
    },
  }),
  ut = Object.assign(lt, { __name: "HeroHome" }),
  _t = { class: "card card--highlight" },
  dt = { class: "card--highlight__icon" },
  pt = { class: "card--highlight__info" },
  ht = ["innerHTML"],
  gt = ["innerHTML"],
  ft = { name: "CardHighlight" },
  mt = m({
    ...ft,
    props: { icon: {}, title: {}, description: {} },
    setup(o) {
      const t = o,
        { sanitizeText: e } = I(),
        c = d(() => e(t.title)),
        n = d(() => e(t.description));
      return (u, _) => (
        a(),
        l("article", _t, [
          s("div", dt, [
            (a(),
            v(D(o.icon), {
              size: 24,
              class: "icon-highlight",
              fill: "$light_peach",
            })),
          ]),
          s("div", pt, [
            s(
              "div",
              { class: "card--highlight__info__title", innerHTML: c.value },
              null,
              8,
              ht,
            ),
            s(
              "div",
              { class: "card--highlight__info__text", innerHTML: n.value },
              null,
              8,
              gt,
            ),
          ]),
        ])
      );
    },
  }),
  yt = Object.assign(mt, { __name: "CardHighlight" }),
  bt = { class: "highlights highlights--default" },
  vt = { class: "highlights--default__container" },
  wt = { class: "highlights--default__list" },
  $t = m({
    __name: "HighlightsDefault",
    setup(o) {
      const t = [
        {
          title: "Busca equipo",
          description:
            "Tenemos cientos de anuncios que se ajustan a tus necesidades.",
          icon: F,
        },
        {
          title: "Filtra y elige",
          description:
            "Ajusta los resultados y elige el mejor, prefiere los anuncios destacados.",
          icon: O,
        },
        {
          title: "Contacta y coordina",
          description: "Llama o escribe al vendedor para coordinar la compra.",
          icon: et,
        },
      ];
      return (e, c) => (
        a(),
        l("section", bt, [
          s("div", vt, [
            s("div", wt, [
              (a(),
              l(
                H,
                null,
                A(t, (n, u) =>
                  i(
                    yt,
                    {
                      key: u,
                      title: n.title,
                      icon: n.icon,
                      description: n.description,
                    },
                    null,
                    8,
                    ["title", "icon", "description"],
                  ),
                ),
                64,
              )),
            ]),
          ]),
        ])
      );
    },
  }),
  Ct = Object.assign($t, { __name: "HighlightsDefault" }),
  xt = { class: "card--category__icon" },
  kt = { class: "card--category__info" },
  Dt = ["innerHTML"],
  qt = { class: "card--category__info__count" },
  Ht = m({
    __name: "CardCategory",
    props: { title: {}, slug: {}, count: {}, icon: {}, color: {} },
    setup(o) {
      const t = o,
        e = z(null),
        { icons: c, getCategoryIcon: n } = K(),
        { sanitizeText: u } = I(),
        _ = d(() => {
          const r = t.title?.toLowerCase() || "",
            y = String(t.slug).toLowerCase();
          return n(y) || n(r);
        }),
        p = d(() => ({ path: "/anuncios", query: { category: t.slug } })),
        g = d(() => u(t.title || "")),
        f = d(() => {
          const r = Number(t.count);
          return !t.count || r <= 0
            ? "Ver anuncios"
            : r === 1
              ? "1 anuncio"
              : r > 99
                ? "+99 anuncios"
                : `${r} anuncios`;
        });
      function $(r) {
        e.value &&
          (r
            ? e.value.style.setProperty("--category-bg-color", r)
            : e.value.style.removeProperty("--category-bg-color"));
      }
      return (
        B(async () => {
          (await M(), $(t.color));
        }),
        N(
          () => t.color,
          (r) => $(r),
        ),
        (r, y) => {
          const h = q;
          return (
            a(),
            v(
              h,
              { to: p.value, class: "card card--category" },
              {
                default: C(() => [
                  s(
                    "div",
                    { ref_key: "root", ref: e, class: "card--category__inner" },
                    [
                      s("span", xt, [
                        (a(),
                        v(D(_.value), { size: 24, class: "icon-category" })),
                      ]),
                      s("span", kt, [
                        s(
                          "h3",
                          {
                            class: "card--category__info__name",
                            innerHTML: g.value,
                          },
                          null,
                          8,
                          Dt,
                        ),
                        s("span", qt, [
                          b(w(f.value) + " ", 1),
                          (a(),
                          v(D(E(c).ChevronRight), {
                            size: 16,
                            class: "icon-chevron",
                          })),
                        ]),
                      ]),
                    ],
                    512,
                  ),
                ]),
                _: 1,
              },
              8,
              ["to"],
            )
          );
        }
      );
    },
  }),
  At = Object.assign(Ht, { __name: "CardCategory" }),
  Tt = { class: "container" },
  St = { key: 0, class: "category--archive__title" },
  Lt = { key: 1, class: "category--archive__list" },
  It = { key: 2 },
  zt = "O explora equipos en cada categoría:",
  Pt = m({
    __name: "CategoryArchive",
    props: { separator: { type: Boolean }, categories: {} },
    setup(o) {
      const t = o,
        e = t.separator ?? !1,
        c = d(() =>
          [...t.categories].sort((u, _) => (_.count || 0) - (u.count || 0)),
        ),
        n = d(() => (e ? "is-separator" : ""));
      return (u, _) => (
        a(),
        l(
          "section",
          {
            id: "categorias",
            class: T(["category category--archive", n.value]),
          },
          [
            s("div", Tt, [
              (a(), l("h2", St, w(zt))),
              o.categories.length > 0
                ? (a(),
                  l("nav", Lt, [
                    (a(!0),
                    l(
                      H,
                      null,
                      A(
                        c.value,
                        (p, g) => (
                          a(),
                          v(
                            At,
                            {
                              key: g,
                              title: p.name || "",
                              color: p.color || "",
                              slug: p.slug || "",
                              icon: p.icon?.url || "",
                              count: p.count || "",
                            },
                            null,
                            8,
                            ["title", "color", "slug", "icon", "count"],
                          )
                        ),
                      ),
                      128,
                    )),
                  ]))
                : (a(),
                  l("div", It, [
                    ...(_[0] ||
                      (_[0] = [
                        s("p", null, "No hay categorías disponibles", -1),
                      ])),
                  ])),
            ]),
          ],
          2,
        )
      );
    },
  }),
  jt = Object.assign(Pt, { __name: "CategoryArchive" }),
  Ft = { class: "card card--howto" },
  Ot = { class: "card--howto__info__image" },
  Bt = { class: "card--howto__info__content" },
  Mt = { class: "card--howto__info__content__title" },
  Nt = { class: "card--howto__info__content__description" },
  Et = m({
    __name: "CardHowTo",
    props: {
      title: { default: "" },
      description: { default: "" },
      image: { default: "" },
      textButton: { default: "" },
      revert: { type: [Boolean, String] },
      showLine: { type: [Boolean, String] },
    },
    setup(o) {
      return (t, e) => {
        const c = W;
        return (
          a(),
          l("article", Ft, [
            s(
              "div",
              { class: T(["card--howto__info", { "is-revert": o.revert }]) },
              [
                s("div", Ot, [
                  i(
                    c,
                    {
                      loading: "lazy",
                      decoding: "async",
                      class: "howto--default__steps__card__info__image",
                      alt: o.title,
                      title: o.title,
                      src: o.image,
                    },
                    null,
                    8,
                    ["alt", "title", "src"],
                  ),
                ]),
                s("div", Bt, [
                  s("h3", Mt, w(o.title), 1),
                  s("div", Nt, w(o.description), 1),
                ]),
              ],
              2,
            ),
          ])
        );
      };
    },
  }),
  Wt = Object.assign(Et, { __name: "CardHowTo" }),
  Ut = [
    {
      title: "1. Regístrate",
      description:
        "Registrarte en waldo.click y obten 3 anuncios gratuitos para publicar tu equipo y si tienes más solo compra un pack de anuncios.",
      text_button: "Anuncia ahora",
    },
    {
      title: "2. Crea tu anuncio",
      description:
        "Ten a mano las especificaciones y fotos de tu equipo para que te sea más fácil y rápido publicar.",
      text_button: "Anuncia ahora",
    },
    {
      title: "3. Publica y vende",
      description:
        "Publica tu anuncio, cuando sea revisado y publicado por nosotros, solo debes esperar los llamados de los compradores y ¡vende!",
      text_button: "Anuncia ahora",
    },
  ],
  Rt = { data: Ut },
  Vt = S("/images/steps-01.svg"),
  Gt = S("/images/steps-02.svg"),
  Yt = S("/images/steps-03.svg"),
  Zt = { class: "howto--default__container" },
  Jt = { class: "howto--default__steps" },
  Kt = { class: "howto--default__buttons" },
  Qt = "¿Tienes equipos para vender?",
  Xt = "Publica tu anuncio en pocos pasos",
  te = m({
    __name: "HowtoDefault",
    setup(o) {
      const t = z(Rt),
        e = [Vt, Gt, Yt],
        c = (u) => e[u] || "",
        n = d(() => "");
      return (u, _) => {
        const p = q;
        return (
          a(),
          l(
            "section",
            {
              id: "como-publicar",
              class: T(["howto howto--default", n.value]),
            },
            [
              s("div", Zt, [
                s("div", { class: "howto--default__head" }, [
                  s("div", { class: "howto--default__head__title" }, [
                    s("h2", { class: "title" }, w(Qt)),
                  ]),
                  s("div", { class: "howto--default__head__subtitle" }, w(Xt)),
                ]),
                s("div", Jt, [
                  (a(!0),
                  l(
                    H,
                    null,
                    A(
                      t.value.data,
                      (g, f) => (
                        a(),
                        v(
                          Wt,
                          {
                            key: f,
                            title: g.title,
                            description: g.description,
                            image: c(f),
                            "text-button": g.text_button,
                            revert: f % 2 !== 0,
                            "show-line": f < 3,
                          },
                          null,
                          8,
                          [
                            "title",
                            "description",
                            "image",
                            "text-button",
                            "revert",
                            "show-line",
                          ],
                        )
                      ),
                    ),
                    128,
                  )),
                ]),
                s("div", Kt, [
                  i(
                    p,
                    {
                      title: "Anunciar ahora",
                      to: "/anunciar",
                      class: "btn btn--primary btn--announcement",
                    },
                    {
                      default: C(() => [
                        ...(_[0] ||
                          (_[0] = [s("span", null, "Anunciar ahora", -1)])),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
              ]),
            ],
            2,
          )
        );
      };
    },
  }),
  ee = Object.assign(te, { __name: "HowtoDefault" }),
  se = { class: "page page--home" },
  pe = m({
    __name: "index",
    async setup(o) {
      let t, e;
      const { $setSEO: c, $setStructuredData: n } = U(),
        { data: u } =
          (([t, e] = x(async () =>
            k("categories", async () => {
              const h = Z();
              try {
                return (await h.loadFilterCategories(), h.filterCategories);
              } catch {
                return [];
              }
            }),
          )),
          (t = await t),
          e(),
          t),
        _ = d(() => u.value ?? []),
        p = R(),
        { data: g } =
          (([t, e] = x(async () =>
            k(
              "home-packs",
              async () => {
                try {
                  return (
                    await p("ad-packs", {
                      method: "GET",
                      params: { populate: "*" },
                    })
                  ).data;
                } catch {
                  return [];
                }
              },
              { default: () => [] },
            ),
          )),
          (t = await t),
          e(),
          t),
        f = d(() => g.value ?? []),
        { data: $ } =
          (([t, e] = x(async () =>
            k("featured-faqs", async () => {
              const h = tt();
              try {
                return (await h.loadFaqs(), h.featuredFaqs);
              } catch {
                return [];
              }
            }),
          )),
          (t = await t),
          e(),
          t),
        r = d(() => $.value ?? []);
      c({
        title: "Anuncios de Activos Industriales en Chile",
        description:
          "Compra y vende activos industriales en Chile. Waldo.click® conecta vendedores y compradores de equipos nuevos y usados en todo el país.",
      });
      const y = Y();
      return (
        n([
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: y.public.baseUrl,
            name: "Waldo.click®",
            description:
              "Plataforma de compra y venta de activos industriales en Chile. Encuentra equipos nuevos o usados de todo el país.",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${y.public.baseUrl}/anuncios?s={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            url: y.public.baseUrl,
            name: "Waldo.click®",
            logo: `${y.public.baseUrl}/images/share.jpg`,
            sameAs: [],
          },
        ]),
        (h, L) => (
          a(),
          l("div", se, [
            i(V, { "show-menu": !0, "is-trasparent": !0 }),
            i(ut),
            i(Ct, { separator: !0 }),
            i(jt, { separator: !0, categories: _.value }, null, 8, [
              "categories",
            ]),
            i(ee, { separator: !0 }),
            i(Q, { separator: !0, packs: f.value }, null, 8, ["packs"]),
            i(
              X,
              {
                text: "Encuentra respuestas a las preguntas más comunes sobre cómo funciona Waldo.click®, la plataforma para comprar y vender activos industriales.",
                limit: 3,
                faqs: r.value,
              },
              null,
              8,
              ["faqs"],
            ),
            i(G),
          ])
        )
      );
    },
  });
export { pe as default };
//# sourceMappingURL=Bxs6T6G_.js.map
