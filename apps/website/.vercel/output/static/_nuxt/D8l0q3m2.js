import { aZ as n, b4 as s, a_ as r, a$ as o, cP as d } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[a] = "55114131-f925-44a6-bab6-e0b2726a62c0"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-55114131-f925-44a6-bab6-e0b2726a62c0"));
} catch {}
const c = n({
  __name: "index",
  async setup(e) {
    let a, t;
    return (
      ([a, t] = s(() => d("/dashboard/featured/free", { replace: !0 }))),
      await a,
      t(),
      (f, i) => (r(), o("div"))
    );
  },
});
export { c as default };
//# sourceMappingURL=D8l0q3m2.js.map
