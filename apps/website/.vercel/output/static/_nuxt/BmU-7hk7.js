import { aZ as a, b4 as d, a_ as s, a$ as o, cP as r } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[n] = "61de39bf-fd63-4138-9929-09776f5e3396"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-61de39bf-fd63-4138-9929-09776f5e3396"));
} catch {}
const _ = a({
  __name: "index",
  async setup(e) {
    let n, t;
    return (
      ([n, t] = d(() => r("/dashboard/ads/pending", { replace: !0 }))),
      await n,
      t(),
      (f, i) => (s(), o("div"))
    );
  },
});
export { _ as default };
//# sourceMappingURL=BmU-7hk7.js.map
