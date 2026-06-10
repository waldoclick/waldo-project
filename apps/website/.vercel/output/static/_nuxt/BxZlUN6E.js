import {
  aZ as o,
  a_ as s,
  a$ as n,
  bA as d,
  b0 as t,
  dw as b,
  dx as r,
  dy as l,
} from "./BK8sApmn.js";
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
    (e._sentryDebugIds[a] = "bafe84bc-8389-419a-b100-bac30c3294a4"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-bafe84bc-8389-419a-b100-bac30c3294a4"));
} catch {}
const c = { class: "layout layout--auth" },
  u = o({
    __name: "auth",
    setup(e) {
      return (a, i) => (
        s(),
        n("div", c, [d(a.$slots, "default"), t(b), t(r), t(l)])
      );
    },
  });
export { u as default };
//# sourceMappingURL=BxZlUN6E.js.map
