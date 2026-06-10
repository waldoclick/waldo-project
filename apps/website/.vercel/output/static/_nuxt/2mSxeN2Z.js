import { _ } from "./vgLiQXkW.js";
import { _ as c, a as d } from "./RoATBwxO.js";
import { F as f } from "./6bVI6abF.js";
import { aZ as l, a_ as i, a$ as m, b0 as t, b1 as n } from "./BK8sApmn.js";
import "./CNKn_OHC.js";
import "./DQVnk6X6.js";
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
    (e._sentryDebugIds[o] = "af963c1f-d5f0-472b-8399-882a8d3f14a0"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-af963c1f-d5f0-472b-8399-882a8d3f14a0"));
} catch {}
const I = l({
  __name: "new",
  setup(e) {
    const o = [
      { label: "Categorías", to: "/dashboard/maintenance/categories" },
      { label: "Nueva" },
    ];
    return (u, p) => {
      const a = _,
        r = c,
        s = d;
      return (
        i(),
        m("div", null, [
          t(a, { title: "Nueva categoría", breadcrumbs: o }),
          t(s, null, {
            content: n(() => [
              t(
                r,
                { title: "Nueva categoría", columns: 1 },
                { default: n(() => [t(f)]), _: 1 },
              ),
            ]),
            _: 1,
          }),
        ])
      );
    };
  },
});
export { I as default };
//# sourceMappingURL=2mSxeN2Z.js.map
