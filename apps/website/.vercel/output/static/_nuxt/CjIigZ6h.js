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
    t = new e.Error().stack;
  t &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[t] = "52cd2374-c410-45cf-ade3-ac7cd972e3de"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-52cd2374-c410-45cf-ade3-ac7cd972e3de"));
} catch {}
const m = (e) => {
    if (!e) return "--";
    const t = new Date(e),
      s = new Date();
    if (Number.isNaN(t.getTime())) return "--";
    const r = (s.getTime() - t.getTime()) / 1e3,
      n = new Intl.RelativeTimeFormat("es-CL", { numeric: "always" });
    if (r < 0) return u(e);
    if (r < 60) return n.format(-Math.round(r), "second");
    const a = r / 60;
    if (a < 60) return n.format(-Math.round(a), "minute");
    const f = a / 60;
    if (f < 24) return n.format(-Math.round(f), "hour");
    const o = f / 24;
    if (o < 30) return n.format(-Math.round(o), "day");
    const d = o / 30;
    if (d < 12) return n.format(-Math.round(d), "month");
    const i = o / 365;
    return n.format(-Math.round(i), "year");
  },
  u = (e) => {
    if (!e) return "--";
    const t = new Date(e);
    return Number.isNaN(t.getTime())
      ? "--"
      : new Intl.DateTimeFormat("es-CL", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(t);
  };
export { u as a, m as f };
//# sourceMappingURL=CjIigZ6h.js.map
