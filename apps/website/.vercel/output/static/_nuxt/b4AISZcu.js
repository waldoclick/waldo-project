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
    n = new e.Error().stack;
  n &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[n] = "20cb5446-b510-4b0f-ae81-04e67e3091b6"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-20cb5446-b510-4b0f-ae81-04e67e3091b6"));
} catch {}
const r = (e, n) => (!e && !n ? "--" : [e, n].filter(Boolean).join(" ")),
  o = (e, n) => (e ? (n ? `${e} ${n}` : e) : "--"),
  f = (e) => (e ? "Sí" : "No"),
  b = (e) => (e == null ? "--" : `${e} días`),
  a = (e) => (e ? (e === "webpay" ? "WebPay" : e) : "--");
export { b as a, r as b, f as c, o as f, a as g };
//# sourceMappingURL=b4AISZcu.js.map
