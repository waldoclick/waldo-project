import { aZ as n, b4 as d, a_ as s, a$ as r, cP as o } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[a] = "e6324025-debf-4b2d-baa7-dc779b47a2d2"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-e6324025-debf-4b2d-baa7-dc779b47a2d2"));
} catch {}
const c = n({
  __name: "index",
  async setup(e) {
    let a, t;
    return (
      ([a, t] = d(() => o("/dashboard/reservations/free", { replace: !0 }))),
      await a,
      t(),
      (i, b) => (s(), r("div"))
    );
  },
});
export { c as default };
//# sourceMappingURL=DUPPK1ri.js.map
