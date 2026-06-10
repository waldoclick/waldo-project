import "./BK8sApmn.js";
try {
  let r =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    n = new r.Error().stack;
  n &&
    ((r._sentryDebugIds = r._sentryDebugIds || {}),
    (r._sentryDebugIds[n] = "76d9d09d-9e81-4e4c-818c-99bf55880195"),
    (r._sentryDebugIdIdentifier =
      "sentry-dbid-76d9d09d-9e81-4e4c-818c-99bf55880195"));
} catch {}
const a = () => {
  const r = (e, t) => {
    let s = 0,
      d = 0,
      o = 0;
    return (
      e.length === 4
        ? ((s = Number.parseInt(e[1] + e[1], 16)),
          (d = Number.parseInt(e[2] + e[2], 16)),
          (o = Number.parseInt(e[3] + e[3], 16)))
        : e.length === 7 &&
          ((s = Number.parseInt(e[1] + e[2], 16)),
          (d = Number.parseInt(e[3] + e[4], 16)),
          (o = Number.parseInt(e[5] + e[6], 16))),
      `rgba(${s}, ${d}, ${o}, ${t})`
    );
  };
  return { hexToRgba: r, bgColorWithTransparency: (e, t = 0.2) => r(e, t) };
};
export { a as u };
//# sourceMappingURL=Ctg5ZDgN.js.map
