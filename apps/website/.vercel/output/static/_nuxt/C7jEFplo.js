import {
  bD as r,
  aZ as c,
  a_ as u,
  a$ as d,
  bf as s,
  b0 as e,
  br as _,
  b1 as i,
  b6 as l,
  cs as b,
  ds as m,
  ct as p,
  bA as f,
  cu as g,
  dt as h,
  du as y,
  dv as k,
  dw as x,
  dx as L,
  dy as v,
} from "./BK8sApmn.js";
import { C as M } from "./KZVta_c4.js";
import { S as C } from "./PYJho2bR.js";
import { S as w } from "./Dd7eiwlI.js";
import { M as D } from "./TvotpkE8.js";
try {
  let t =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    o = new t.Error().stack;
  o &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[o] = "22f6ce64-576f-453a-b525-8e06964d6808"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-22f6ce64-576f-453a-b525-8e06964d6808"));
} catch {}
const S = r("message-square", [
    [
      "path",
      {
        d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
        key: "1lielz",
      },
    ],
  ]),
  V = { class: "menu menu--about", "aria-label": "Menú informativo" },
  $ = { class: "menu--about__list", role: "list" },
  I = { class: "menu--about__item" },
  A = { class: "menu--about__item" },
  q = { class: "menu--about__item" },
  B = { class: "menu--about__item" },
  H = { class: "menu--about__item" },
  T = c({
    __name: "MenuAbout",
    setup(t) {
      return (o, a) => {
        const n = _;
        return (
          u(),
          d("nav", V, [
            s("ul", $, [
              s("li", I, [
                e(
                  n,
                  {
                    to: "/preguntas-frecuentes",
                    class: "menu--about__link",
                    "aria-label":
                      "Ver preguntas frecuentes y respuestas comunes",
                    title: "Ver preguntas frecuentes y respuestas comunes",
                  },
                  {
                    default: i(() => [
                      e(l(M), {
                        class: "menu--about__icon",
                        "aria-hidden": "true",
                      }),
                      a[0] ||
                        (a[0] = s("span", null, "Preguntas frecuentes", -1)),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              s("li", A, [
                e(
                  n,
                  {
                    to: "/politicas-de-privacidad",
                    class: "menu--about__link",
                    "aria-label":
                      "Leer políticas de privacidad y términos de uso",
                    title: "Leer políticas de privacidad y términos de uso",
                  },
                  {
                    default: i(() => [
                      e(l(C), {
                        class: "menu--about__icon",
                        "aria-hidden": "true",
                      }),
                      a[1] ||
                        (a[1] = s("span", null, "Políticas de privacidad", -1)),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              s("li", q, [
                e(
                  n,
                  {
                    to: "/condiciones-de-uso",
                    class: "menu--about__link",
                    "aria-label": "Leer condiciones de uso",
                    title: "Leer condiciones de uso",
                  },
                  {
                    default: i(() => [
                      e(l(w), {
                        class: "menu--about__icon",
                        "aria-hidden": "true",
                      }),
                      a[2] ||
                        (a[2] = s("span", null, "Condiciones de uso", -1)),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              s("li", B, [
                e(
                  n,
                  {
                    to: "/contacto",
                    class: "menu--about__link",
                    "aria-label": "Contactar con el equipo de soporte",
                    title: "Contactar con el equipo de soporte",
                  },
                  {
                    default: i(() => [
                      e(l(S), {
                        class: "menu--about__icon",
                        "aria-hidden": "true",
                      }),
                      a[3] || (a[3] = s("span", null, "Contáctanos", -1)),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              s("li", H, [
                e(
                  n,
                  {
                    to: "/sitemap",
                    class: "menu--about__link",
                    "aria-label":
                      "Ver mapa del sitio con todas las páginas disponibles",
                    title:
                      "Ver mapa del sitio con todas las páginas disponibles",
                  },
                  {
                    default: i(() => [
                      e(l(D), {
                        class: "menu--about__icon",
                        "aria-hidden": "true",
                      }),
                      a[4] || (a[4] = s("span", null, "Mapa del sitio", -1)),
                    ]),
                    _: 1,
                  },
                ),
              ]),
            ]),
          ])
        );
      };
    },
  }),
  z = Object.assign(T, { __name: "MenuAbout" }),
  E = { class: "layout layout--about" },
  F = { class: "layout--about__container" },
  N = { class: "layout--about__sidebar" },
  P = { class: "layout--about__content" },
  J = {
    __name: "about",
    setup(t) {
      return (o, a) => (
        u(),
        d("div", E, [
          e(b),
          e(m),
          e(p),
          s("div", F, [
            s("div", N, [e(z)]),
            s("div", P, [f(o.$slots, "default")]),
          ]),
          e(g),
          e(h),
          e(y),
          e(k),
          e(x),
          e(L),
          e(v),
        ])
      );
    },
  };
export { J as default };
//# sourceMappingURL=C7jEFplo.js.map
