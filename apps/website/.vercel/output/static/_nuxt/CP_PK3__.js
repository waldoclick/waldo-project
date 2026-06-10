import { _ as o } from "./vgLiQXkW.js";
import { aZ as a, a_ as r, a$ as d, b0 as s } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[n] = "212ca816-c343-4dbb-9305-e10305a4af76"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-212ca816-c343-4dbb-9305-e10305a4af76"));
} catch {}
const f = a({
  __name: "index",
  setup(e) {
    const n = [{ label: "Mantenedores" }];
    return (c, l) => {
      const t = o;
      return (
        r(),
        d("div", null, [s(t, { title: "Mantenedores", breadcrumbs: n })])
      );
    };
  },
});
export { f as default };
//# sourceMappingURL=CP_PK3__.js.map
