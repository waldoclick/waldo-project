import { _ as d } from "./vgLiQXkW.js";
import { _, a as c } from "./RoATBwxO.js";
import { F as i } from "./D25bJp4A.js";
import { aZ as l, a_ as f, a$ as m, b0 as o, b1 as t } from "./BK8sApmn.js";
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
    n = new e.Error().stack;
  n &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[n] = "f5e55fcf-8911-4e72-b71a-9484a5d46039"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-f5e55fcf-8911-4e72-b71a-9484a5d46039"));
} catch {}
const w = l({
  __name: "new",
  setup(e) {
    const n = [
      { label: "Condiciones de Uso", to: "/dashboard/maintenance/terms" },
      { label: "Nueva" },
    ];
    return (u, p) => {
      const a = d,
        s = _,
        r = c;
      return (
        f(),
        m("div", null, [
          o(a, { title: "Nueva Condicion de Uso", breadcrumbs: n }),
          o(r, null, {
            content: t(() => [
              o(
                s,
                { title: "Nueva Condicion de Uso", columns: 1 },
                { default: t(() => [o(i)]), _: 1 },
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
//# sourceMappingURL=XpT-qv3h.js.map
