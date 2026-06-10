import { aZ as l, a_ as s, a$ as r, bf as o } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[n] = "53698d1f-f0c9-408f-ad41-b578a503e13e"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-53698d1f-f0c9-408f-ad41-b578a503e13e"));
} catch {}
const a = {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 32 32",
  },
  c = l({
    name: "BetterStackIcon",
    __name: "iconBetterStack",
    setup(e) {
      return (n, t) => (
        s(),
        r("svg", a, [
          ...(t[0] ||
            (t[0] = [
              o(
                "path",
                {
                  fill: "currentColor",
                  "fill-rule": "evenodd",
                  d: "m14.983 12.31 1.778-3.481c.553-1.083 2.155-1.111 2.749-.048l6.805 12.18c.592 1.06-.317 2.317-1.562 2.16l-5.027-.63zM9.016 16.002l1.38-4.811c.351-1.226 2.148-1.278 2.577-.075l3.86 10.838c.36 1.014-.651 1.983-1.71 1.639l-3.44-1.117z",
                  "clip-rule": "evenodd",
                },
                null,
                -1,
              ),
              o(
                "path",
                {
                  fill: "currentColor",
                  d: "m6.154 14.735-.642 5.334a1.65 1.65 0 0 0 .584 1.455l1.593 1.344c.546.46 1.393.011 1.276-.675L7.687 14.7c-.145-.848-1.43-.82-1.533.034",
                },
                null,
                -1,
              ),
            ])),
        ])
      );
    },
  }),
  f = Object.assign(c, { __name: "IconsIconBetterStack" });
export { f as I };
//# sourceMappingURL=5Zo0HME0.js.map
