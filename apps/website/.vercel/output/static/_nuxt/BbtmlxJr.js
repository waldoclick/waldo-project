import { aZ as n, a_ as a, a$ as l, bC as o, bA as s } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[t] = "298e4c1b-bcb2-4875-8362-399b5f3c1c1a"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-298e4c1b-bcb2-4875-8362-399b5f3c1c1a"));
} catch {}
const c = n({
    __name: "TableCell",
    props: { align: {} },
    setup(e) {
      return (t, _) => (
        a(),
        l(
          "td",
          {
            class: o([
              "table--default__cell",
              {
                "table--default__cell--right": e.align === "right",
                "table--default__cell--center": e.align === "center",
              },
            ]),
          },
          [s(t.$slots, "default")],
          2,
        )
      );
    },
  }),
  i = Object.assign(c, { __name: "TableCell" }),
  r = { class: "table--default__row" },
  b = n({
    __name: "TableRow",
    setup(e) {
      return (t, _) => (a(), l("tr", r, [s(t.$slots, "default")]));
    },
  }),
  f = Object.assign(b, { __name: "TableRow" });
export { f as _, i as a };
//# sourceMappingURL=BbtmlxJr.js.map
