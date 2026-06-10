import { _ as r } from "./vgLiQXkW.js";
import { _ as i, a as _ } from "./RoATBwxO.js";
import { F as d } from "./aXTW6rfY.js";
import { aZ as l, a_ as m, a$ as u, b0 as o, b1 as t } from "./BK8sApmn.js";
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
    n = new e.Error().stack;
  n &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[n] = "7ec78cb4-72de-4f45-9852-7276ec177910"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-7ec78cb4-72de-4f45-9852-7276ec177910"));
} catch {}
const I = l({
  __name: "new",
  setup(e) {
    const n = [
      { label: "Condiciones", to: "/dashboard/maintenance/conditions" },
      { label: "Nueva" },
    ];
    return (f, p) => {
      const a = r,
        c = i,
        s = _;
      return (
        m(),
        u("div", null, [
          o(a, { title: "Nueva condición", breadcrumbs: n }),
          o(s, null, {
            content: t(() => [
              o(
                c,
                { title: "Nueva condición", columns: 1 },
                { default: t(() => [o(d)]), _: 1 },
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
//# sourceMappingURL=v_xc4CGZ.js.map
