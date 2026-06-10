import { dq as d, bx as a, dr as s, cP as n } from "./BK8sApmn.js";
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
    t = new e.Error().stack;
  t &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[t] = "2a152db8-876c-45fc-a632-57b084591494"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-2a152db8-876c-45fc-a632-57b084591494"));
} catch {}
const i = d((e, t) => {
  if (!a().value)
    return ((s("redirect", { path: "/" }).value = e.fullPath), n("/login"));
});
export { i as default };
//# sourceMappingURL=l98y3t11.js.map
