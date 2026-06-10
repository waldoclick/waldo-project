import { _ as c } from "./vgLiQXkW.js";
import { _ as d } from "./Bjk732Ik.js";
import { _ as b, a as l } from "./RoATBwxO.js";
import { aZ as m, a_ as p, a$ as i, b0 as o, b1 as t } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[n] = "b829553b-5011-41f7-8bed-58396ad4bb32"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-b829553b-5011-41f7-8bed-58396ad4bb32"));
} catch {}
const w = m({
  __name: "new",
  setup(e) {
    const n = [
      { label: "Packs", to: "/dashboard/maintenance/packs" },
      { label: "Nuevo" },
    ];
    return (u, f) => {
      const a = c,
        _ = d,
        s = b,
        r = l;
      return (
        p(),
        i("div", null, [
          o(a, { title: "Nuevo pack", breadcrumbs: n }),
          o(r, null, {
            content: t(() => [
              o(
                s,
                { title: "Nuevo pack", columns: 1 },
                { default: t(() => [o(_)]), _: 1 },
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
//# sourceMappingURL=CAxZMIUl.js.map
