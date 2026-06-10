import { _ as t } from "./vgLiQXkW.js";
import { aZ as o, a_ as r, a$ as s, b0 as c } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[n] = "c65a8a89-41d5-4ec6-aa55-2fc77a33af8c"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-c65a8a89-41d5-4ec6-aa55-2fc77a33af8c"));
} catch {}
const p = o({
  __name: "index",
  setup(e) {
    const n = [{ label: "Integraciones" }];
    return (d, i) => {
      const a = t;
      return (
        r(),
        s("div", null, [c(a, { title: "Integraciones", breadcrumbs: n })])
      );
    };
  },
});
export { p as default };
//# sourceMappingURL=CAJJxnKu.js.map
