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
    r = new e.Error().stack;
  r &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[r] = "d0f163c2-f2ae-4f3d-b1b1-ec645371fcce"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-d0f163c2-f2ae-4f3d-b1b1-ec645371fcce"));
} catch {}
const i = (e, r) => {
  if (e == null) return "--";
  const n = typeof e == "string" ? Number.parseFloat(e) : e;
  return Number.isNaN(n)
    ? "--"
    : new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        ...r,
      }).format(n);
};
export { i as f };
//# sourceMappingURL=DFEPOiSh.js.map
