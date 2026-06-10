import { _ } from "./vgLiQXkW.js";
import { _ as c, a as i } from "./RoATBwxO.js";
import { F as d } from "./B9seTQdH.js";
import { aZ as l, a_ as m, a$ as f, b0 as o, b1 as t } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[n] = "11c2e382-0319-4cc0-bf5b-4197f9ae4149"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-11c2e382-0319-4cc0-bf5b-4197f9ae4149"));
} catch {}
const I = l({
  __name: "new",
  setup(e) {
    const n = [
      { label: "Regiones", to: "/dashboard/maintenance/regions" },
      { label: "Nueva" },
    ];
    return (u, p) => {
      const a = _,
        r = c,
        s = i;
      return (
        m(),
        f("div", null, [
          o(a, { title: "Nueva región", breadcrumbs: n }),
          o(s, null, {
            content: t(() => [
              o(
                r,
                { title: "Nueva región", columns: 1 },
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
//# sourceMappingURL=dp8vKeNT.js.map
