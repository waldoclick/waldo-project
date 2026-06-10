import { _ as r } from "./vgLiQXkW.js";
import { _, a as i } from "./RoATBwxO.js";
import { F as l } from "./BQKVS5WP.js";
import { aZ as c, a_ as f, a$ as m, b0 as n, b1 as t } from "./BK8sApmn.js";
import "./CNKn_OHC.js";
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
    o = new e.Error().stack;
  o &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[o] = "3df4d759-d2d0-4803-9a6d-5f0b0ab360f6"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-3df4d759-d2d0-4803-9a6d-5f0b0ab360f6"));
} catch {}
const w = c({
  __name: "new",
  setup(e) {
    const o = [
      { label: "Politicas", to: "/dashboard/maintenance/policies" },
      { label: "Nueva" },
    ];
    return (u, p) => {
      const a = r,
        d = _,
        s = i;
      return (
        f(),
        m("div", null, [
          n(a, { title: "Nueva Politica", breadcrumbs: o }),
          n(s, null, {
            content: t(() => [
              n(
                d,
                { title: "Nueva Politica", columns: 1 },
                { default: t(() => [n(l)]), _: 1 },
              ),
            ]),
            _: 1,
          }),
        ])
      );
    };
  },
});
export { w as default };
//# sourceMappingURL=D8R-ZVpC.js.map
