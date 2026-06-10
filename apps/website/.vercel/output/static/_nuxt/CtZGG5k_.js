import { _ } from "./vgLiQXkW.js";
import { _ as m, a as c } from "./RoATBwxO.js";
import { F as d } from "./BT44QAAr.js";
import { aZ as u, a_ as l, a$ as i, b0 as o, b1 as t } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[n] = "e2917a4e-d236-4eea-b99f-8b79e706e535"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-e2917a4e-d236-4eea-b99f-8b79e706e535"));
} catch {}
const I = u({
  __name: "new",
  setup(e) {
    const n = [
      { label: "Comunas", to: "/dashboard/maintenance/communes" },
      { label: "Nueva" },
    ];
    return (f, p) => {
      const a = _,
        s = m,
        r = c;
      return (
        l(),
        i("div", null, [
          o(a, { title: "Nueva comuna", breadcrumbs: n }),
          o(r, null, {
            content: t(() => [
              o(
                s,
                { title: "Nueva comuna", columns: 1 },
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
//# sourceMappingURL=CtZGG5k_.js.map
