import {
  aZ as r,
  a_ as n,
  a$ as o,
  bf as s,
  bA as i,
  b0 as d,
  br as b,
  b1 as _,
  b7 as p,
  b6 as u,
  cS as m,
  cM as y,
  bs as f,
  bi as g,
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
    t = new e.Error().stack;
  t &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[t] = "b720abef-6b8d-4e06-8ec0-de0a14b5d284"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-b720abef-6b8d-4e06-8ec0-de0a14b5d284"));
} catch {}
const h = { class: "emptystate emptystate--default" },
  w = { class: "emptystate--default__image" },
  N = { class: "emptystate--default__text" },
  x = { key: 0, class: "emptystate--default__image" },
  I = r({
    __name: "EmptyState",
    props: {
      showCleanFilters: { type: Boolean, default: !1 },
      message: {
        type: String,
        default: "No hay anuncios disponibles para tu búsqueda.",
      },
    },
    setup(e) {
      return (t, a) => {
        const l = y,
          c = b;
        return (
          n(),
          o("div", h, [
            s("div", w, [
              i(t.$slots, "image", {}, () => [
                d(
                  l,
                  {
                    loading: "lazy",
                    decoding: "async",
                    src: u(m),
                    alt: "No hay anuncios disponibles",
                    title: "No hay anuncios disponibles",
                  },
                  null,
                  8,
                  ["src"],
                ),
              ]),
            ]),
            s("div", N, [
              i(t.$slots, "message", {}, () => [f(g(e.message), 1)]),
            ]),
            e.showCleanFilters
              ? (n(),
                o("div", x, [
                  d(
                    c,
                    {
                      to: { path: "/anuncios", query: { s: "", category: "" } },
                      class: "btn btn--secondary btn--block",
                      title: "[Limpiar filtros]",
                    },
                    {
                      default: _(() => [
                        ...(a[0] ||
                          (a[0] = [s("span", null, "[Limpiar filtros]", -1)])),
                      ]),
                      _: 1,
                    },
                  ),
                ]))
              : p("", !0),
          ])
        );
      };
    },
  }),
  k = Object.assign(I, { __name: "EmptyState" });
export { k as E };
//# sourceMappingURL=27XRtptg.js.map
