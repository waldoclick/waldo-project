import { H as m } from "./RG9bXWPx.js";
import { C as _ } from "./CNKn_OHC.js";
import {
  cQ as p,
  a_ as a,
  a$ as r,
  bf as o,
  b0 as n,
  b1 as u,
  b6 as c,
  bn as y,
  bo as g,
  b5 as i,
  bs as h,
  bi as f,
  b7 as k,
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
    s = new e.Error().stack;
  s &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[s] = "6cee27ad-a97d-49eb-b9fc-ea4f7204a2c7"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-6cee27ad-a97d-49eb-b9fc-ea4f7204a2c7"));
} catch {}
const w = { class: "breadcrumbs" },
  D = { class: "breadcrumbs__list" },
  v = { class: "breadcrumbs__item" },
  x = { key: 1, class: "breadcrumbs__text" },
  N = {
    __name: "BreadcrumbsDefault",
    props: {
      items: {
        type: Array,
        required: !0,
        default: () => [],
        validator: (e) =>
          e.every(
            (s) =>
              typeof s == "object" &&
              "label" in s &&
              (!("to" in s) || typeof s.to == "string"),
          ),
      },
    },
    setup(e) {
      return (s, l) => {
        const b = p("router-link");
        return (
          a(),
          r("nav", w, [
            o("ul", D, [
              o("li", v, [
                n(
                  b,
                  { to: "/", class: "breadcrumbs__link" },
                  {
                    default: u(() => [
                      n(c(m), { class: "breadcrumbs__home-icon", size: 16 }),
                      l[0] ||
                        (l[0] = o(
                          "span",
                          { class: "breadcrumbs__home-text" },
                          "Waldo",
                          -1,
                        )),
                    ]),
                    _: 1,
                  },
                ),
                n(c(_), { class: "breadcrumbs__separator" }),
              ]),
              (a(!0),
              r(
                y,
                null,
                g(
                  e.items,
                  (t, d) => (
                    a(),
                    r("li", { key: d, class: "breadcrumbs__item" }, [
                      t.to
                        ? (a(),
                          i(
                            b,
                            { key: 0, to: t.to, class: "breadcrumbs__link" },
                            { default: u(() => [h(f(t.label), 1)]), _: 2 },
                            1032,
                            ["to"],
                          ))
                        : (a(), r("span", x, f(t.label), 1)),
                      d < e.items.length - 1
                        ? (a(),
                          i(c(_), { key: 2, class: "breadcrumbs__separator" }))
                        : k("", !0),
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
  };
export { N as _ };
//# sourceMappingURL=ClGpxEC3.js.map
