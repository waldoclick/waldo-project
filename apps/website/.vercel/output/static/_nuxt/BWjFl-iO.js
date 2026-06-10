import "./BK8sApmn.js";
try {
  let t =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    n = new t.Error().stack;
  n &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[n] = "0fcd1edb-8a75-4de9-8d9f-eb800b1264d9"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-0fcd1edb-8a75-4de9-8d9f-eb800b1264d9"));
} catch {}
function r() {
  return {
    formatRut: (e) => (
      (e = e.replace(/[^\dKk]/g, "")),
      e.length > 1 &&
        (e =
          e.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".") +
          "-" +
          e.slice(-1)),
      e.toUpperCase()
    ),
    validateRut: (e) => {
      if (((e = e.replace(/[^\dKk]/g, "")), e.length < 8 || e.length > 9))
        return !1;
      const o = e.slice(0, -1),
        a = e.slice(-1).toUpperCase();
      let i = 0,
        d = 2;
      for (let s = o.length - 1; s >= 0; s--)
        ((i += Number.parseInt(o[s]) * d), (d = d === 7 ? 2 : d + 1));
      const l = 11 - (i % 11),
        f = l === 11 ? "0" : l === 10 ? "K" : l.toString();
      return a === f;
    },
  };
}
export { r as u };
//# sourceMappingURL=BWjFl-iO.js.map
