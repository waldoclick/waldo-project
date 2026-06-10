import { aZ as n, a_ as t, a$ as d, bC as s, bA as o } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[a] = "0d2aada7-eff9-480a-a521-6a76a358d911"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-0d2aada7-eff9-480a-a521-6a76a358d911"));
} catch {}
const l = n({
    __name: "BadgeDefault",
    props: { variant: {} },
    setup(e) {
      return (a, r) => (
        t(),
        d(
          "span",
          {
            class: s([
              "badge badge--default",
              {
                "badge--default--outline": e.variant === "outline",
                "badge--default--secondary": e.variant === "secondary",
              },
            ]),
          },
          [o(a.$slots, "default")],
          2,
        )
      );
    },
  }),
  i = Object.assign(l, { __name: "BadgeDefault" });
export { i as _ };
//# sourceMappingURL=D9c01Ql2.js.map
