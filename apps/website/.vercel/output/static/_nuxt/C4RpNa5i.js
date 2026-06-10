import {
  aZ as o,
  a_ as s,
  a$ as l,
  bf as t,
  bn as _,
  bo as b,
  bA as r,
  bC as c,
  bi as f,
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
    a = new e.Error().stack;
  a &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[a] = "a5d8ad68-fa1f-4cac-ab78-58b05483d973"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-a5d8ad68-fa1f-4cac-ab78-58b05483d973"));
} catch {}
const i = { class: "table table--default" },
  u = { class: "table--default__table" },
  h = { class: "table--default__header" },
  g = { class: "table--default__row" },
  y = { class: "table--default__body" },
  p = o({
    __name: "TableDefault",
    props: { columns: {} },
    setup(e) {
      return (a, m) => (
        s(),
        l("div", i, [
          t("table", u, [
            t("thead", h, [
              t("tr", g, [
                (s(!0),
                l(
                  _,
                  null,
                  b(
                    e.columns,
                    (n, d) => (
                      s(),
                      l(
                        "th",
                        {
                          key: d,
                          class: c([
                            "table--default__head",
                            {
                              "table--default__head--right":
                                n.align === "right",
                            },
                          ]),
                        },
                        f(n.label),
                        3,
                      )
                    ),
                  ),
                  128,
                )),
              ]),
            ]),
            t("tbody", y, [r(a.$slots, "default")]),
          ]),
        ])
      );
    },
  }),
  w = Object.assign(p, { __name: "TableDefault" });
export { w as _ };
//# sourceMappingURL=C4RpNa5i.js.map
