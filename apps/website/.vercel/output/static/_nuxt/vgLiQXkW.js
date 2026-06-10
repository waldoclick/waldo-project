import {
  aZ as y,
  a_ as t,
  a$ as o,
  bf as s,
  b0 as c,
  br as g,
  b1 as l,
  bs as u,
  b6 as h,
  bn as k,
  bo as v,
  b5 as m,
  bi as b,
  b7 as i,
  bA as f,
  b9 as $,
  bB as D,
} from "./BK8sApmn.js";
import { C as p } from "./CNKn_OHC.js";
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
    r = new e.Error().stack;
  r &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[r] = "48c44f02-de32-4b9d-8b1f-2ef0a87df382"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-48c44f02-de32-4b9d-8b1f-2ef0a87df382"));
} catch {}
const x = { class: "breadcrumbs" },
  B = { class: "breadcrumbs__list" },
  w = { class: "breadcrumbs__item" },
  I = { key: 1, class: "breadcrumbs__text" },
  C = y({
    __name: "BreadcrumbsDashboard",
    props: { items: {} },
    setup(e) {
      return (r, n) => {
        const a = g;
        return (
          t(),
          o("nav", x, [
            s("ul", B, [
              s("li", w, [
                c(
                  a,
                  { to: "/", class: "breadcrumbs__link" },
                  {
                    default: l(() => [...(n[0] || (n[0] = [u("Waldo", -1)]))]),
                    _: 1,
                  },
                ),
                c(h(p), { class: "breadcrumbs__separator" }),
              ]),
              (t(!0),
              o(
                k,
                null,
                v(
                  e.items,
                  (d, _) => (
                    t(),
                    o("li", { key: _, class: "breadcrumbs__item" }, [
                      d.to
                        ? (t(),
                          m(
                            a,
                            { key: 0, to: d.to, class: "breadcrumbs__link" },
                            { default: l(() => [u(b(d.label), 1)]), _: 2 },
                            1032,
                            ["to"],
                          ))
                        : (t(), o("span", I, b(d.label), 1)),
                      _ < e.items.length - 1
                        ? (t(),
                          m(h(p), { key: 2, class: "breadcrumbs__separator" }))
                        : i("", !0),
                    ])
                  ),
                ),
                128,
              )),
            ]),
          ])
        );
      };
    },
  }),
  N = Object.assign(C, { __name: "BreadcrumbsDashboard" }),
  H = { class: "hero hero--dashboard" },
  V = { class: "hero--dashboard__container" },
  T = { class: "hero--dashboard__header" },
  j = { class: "hero--dashboard__content" },
  E = { class: "hero--dashboard__breadcrumbs" },
  L = { class: "hero--dashboard__title" },
  O = { class: "title" },
  P = { key: 0, class: "hero--dashboard__title-icon" },
  S = { key: 0, class: "hero--dashboard__actions" },
  A = y({
    __name: "HeroHeaderDashboard",
    props: { title: {}, breadcrumbs: {} },
    setup(e) {
      const r = e,
        n = $(() => r.breadcrumbs || []);
      return (a, d) => {
        const _ = N;
        return (
          t(),
          o("section", H, [
            s("div", V, [
              s("div", T, [
                s("div", j, [
                  s("div", E, [c(_, { items: n.value }, null, 8, ["items"])]),
                  s("div", L, [
                    s("h1", O, [
                      a.$slots.titlePrefix
                        ? (t(),
                          o("span", P, [
                            f(a.$slots, "titlePrefix", {}, void 0, !0),
                          ]))
                        : i("", !0),
                      s("span", null, b(e.title), 1),
                    ]),
                  ]),
                ]),
                a.$slots.actions
                  ? (t(), o("div", S, [f(a.$slots, "actions", {}, void 0, !0)]))
                  : i("", !0),
              ]),
            ]),
          ])
        );
      };
    },
  }),
  W = Object.assign(D(A, [["__scopeId", "data-v-4be6dcf1"]]), {
    __name: "HeroHeaderDashboard",
  });
export { W as _ };
//# sourceMappingURL=vgLiQXkW.js.map
