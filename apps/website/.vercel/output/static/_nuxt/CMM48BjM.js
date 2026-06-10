import "./BK8sApmn.js";
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
    o = new e.Error().stack;
  o &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[o] = "d2581a3e-f678-404a-b201-9afd925aa25f"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-d2581a3e-f678-404a-b201-9afd925aa25f"));
} catch {}
function d() {
  return { logError: (n) => {}, logInfo: (n) => {} };
}
export { d as u };
//# sourceMappingURL=CMM48BjM.js.map
