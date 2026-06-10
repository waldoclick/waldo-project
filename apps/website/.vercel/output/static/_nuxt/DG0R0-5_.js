import { u as h } from "./De8hi3Om.js";
import {
  bD as p,
  aZ as y,
  a_ as o,
  a$ as r,
  bf as i,
  bn as _,
  bo as b,
  bi as f,
  b0 as k,
  b1 as v,
  b5 as g,
  bS as x,
  br as S,
  b4 as C,
  dd as M,
  bu as w,
  aY as D,
  ba as P,
  bv as I,
} from "./BK8sApmn.js";
import { H as $ } from "./RG9bXWPx.js";
import { M as A } from "./Dw7hc4Ok.js";
import { M as B } from "./DlM_smgl.js";
import { S as E } from "./PYJho2bR.js";
import { C as L } from "./KZVta_c4.js";
import { M as N } from "./TvotpkE8.js";
import { M as H } from "./DFMJU6rT.js";
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
    t = new e.Error().stack;
  t &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[t] = "cd39e0fe-eb8f-45c6-b2c8-6f3a0f1d7218"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-cd39e0fe-eb8f-45c6-b2c8-6f3a0f1d7218"));
} catch {}
const R = p("key-round", [
  [
    "path",
    {
      d: "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",
      key: "1s6t7t",
    },
  ],
  [
    "circle",
    { cx: "16.5", cy: "7.5", r: ".5", fill: "currentColor", key: "w0ekpg" },
  ],
]);
const U = p("log-in", [
  ["path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4", key: "u53s6r" }],
  ["polyline", { points: "10 17 15 12 10 7", key: "1ail0h" }],
  ["line", { x1: "15", x2: "3", y1: "12", y2: "12", key: "v6grx8" }],
]);
const j = p("shapes", [
  [
    "path",
    {
      d: "M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z",
      key: "1bo67w",
    },
  ],
  [
    "rect",
    { x: "3", y: "14", width: "7", height: "7", rx: "1", key: "1bkyp8" },
  ],
  ["circle", { cx: "17.5", cy: "17.5", r: "3.5", key: "w3z12y" }],
]);
const z = p("user-plus", [
    ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
    ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
    ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
    ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }],
  ]),
  V = { class: "sitemap sitemap--default" },
  W = { class: "sitemap--default__container" },
  F = { class: "sitemap--default__content" },
  O = { class: "sitemap--default__content__block__list" },
  T = y({
    __name: "SitemapDefault",
    props: { blocks: {} },
    setup(e) {
      return (t, c) => {
        const s = S;
        return (
          o(),
          r("section", V, [
            i("div", W, [
              c[0] ||
                (c[0] = i(
                  "h1",
                  { class: "sitemap--default__title title" },
                  "Mapa del sitio",
                  -1,
                )),
              i("div", F, [
                (o(!0),
                r(
                  _,
                  null,
                  b(
                    e.blocks,
                    (n, d) => (
                      o(),
                      r(
                        "div",
                        { key: d, class: "sitemap--default__content__block" },
                        [
                          i("h2", null, f(n.title), 1),
                          i("ul", O, [
                            (o(!0),
                            r(
                              _,
                              null,
                              b(
                                n.items,
                                (l, u) => (
                                  o(),
                                  r("li", { key: u }, [
                                    k(
                                      s,
                                      { to: l.to },
                                      {
                                        default: v(() => [
                                          (o(), g(x(l.icon), { size: 16 })),
                                          i("span", null, f(l.label), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1032,
                                      ["to"],
                                    ),
                                  ])
                                ),
                              ),
                              128,
                            )),
                          ]),
                        ],
                      )
                    ),
                  ),
                  128,
                )),
              ]),
            ]),
          ])
        );
      };
    },
  }),
  Z = Object.assign(T, { __name: "SitemapDefault" }),
  te = y({
    __name: "sitemap",
    async setup(e) {
      let t, c;
      const { data: s } =
          (([t, c] = C(async () =>
            P("sitemap-data", async () => {
              const a = h(),
                m = I();
              return (
                await Promise.all([a.loadCategories(), m.loadCommunes()]),
                { categories: a.categories, communes: m.communes.data }
              );
            }),
          )),
          (t = await t),
          c(),
          t),
        n = [
          {
            title: "Páginas Principales",
            items: [
              { to: "/", label: "Inicio", icon: $ },
              { to: "/anuncios", label: "Anuncios", icon: A },
              { to: "/contacto", label: "Contacto", icon: B },
              { to: "/login", label: "Iniciar Sesión", icon: U },
              { to: "/packs", label: "Packs", icon: M },
              {
                to: "/politicas-de-privacidad",
                label: "Políticas de Privacidad",
                icon: E,
              },
              {
                to: "/preguntas-frecuentes",
                label: "Preguntas Frecuentes",
                icon: L,
              },
              {
                to: "/recuperar-contrasena",
                label: "Recuperar Contraseña",
                icon: R,
              },
              { to: "/registro", label: "Registro", icon: z },
              { to: "/sitemap", label: "Mapa del Sitio", icon: N },
            ],
          },
        ];
      (s.value?.categories &&
        s.value.categories.length > 0 &&
        n.push({
          title: "Categorías",
          items: s.value.categories.map((a) => ({
            to: `/anuncios?category=${a.slug}`,
            label: a.name,
            icon: j,
          })),
        }),
        s.value?.communes &&
          s.value.communes.length > 0 &&
          n.push({
            title: "Comunas",
            items: s.value.communes.map((a) => ({
              to: `/anuncios?commune=${a.id}`,
              label: a.name,
              icon: H,
            })),
          }));
      const { $setSEO: d, $setStructuredData: l } = w(),
        u = D();
      return (
        d({
          title: "Mapa del Sitio",
          description:
            "Navega fácilmente por Waldo.click®. Encuentra anuncios de activos industriales, categorías, comunas y todas las secciones del sitio.",
          imageUrl: `${u.public.baseUrl}/share.jpg`,
        }),
        l({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Mapa del Sitio",
          description:
            "Navega fácilmente por Waldo.click®. Encuentra anuncios de activos industriales, categorías, comunas y todas las secciones del sitio.",
          url: `${u.public.baseUrl}/sitemap`,
        }),
        (a, m) => (o(), g(Z, { blocks: n }))
      );
    },
  });
export { te as default };
//# sourceMappingURL=DG0R0-5_.js.map
