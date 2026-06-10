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
    (e._sentryDebugIds[r] = "ec95b808-3dee-47a9-8a00-b840a8f2c1e1"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-ec95b808-3dee-47a9-8a00-b840a8f2c1e1"));
} catch {}
const i = (e, r) => {
    if (r <= 0) return null;
    const u = Number(e.price) / Number(e.total_ads),
      o = Math.round((1 - u / r) * 100);
    return o > 0 ? o : null;
  },
  d = (e) => {
    const r = e.find((u) => Number(u.total_ads) === 1);
    return r ? Number(r.price) : 0;
  },
  P = () => {
    const e = (t, n) => {
        const s = d(n);
        return i(t, s);
      },
      r = (t, n) => {
        const s = e(t, n);
        return s !== null ? `Ahorras un ${s}%` : "";
      },
      u = (t, n) => {
        const s = [],
          a = Number(t.total_ads),
          p = Number(t.total_days),
          c = Number(t.total_features ?? 0),
          l = e(t, n);
        return (
          s.push(`${a} Avisos para usarlos cuando quieras.`),
          s.push(`Cada Aviso será publicado por ${p} días.`),
          c === 1
            ? s.push(
                "Incluye 1 Destacado que puedes utilizar en el Aviso que prefieras.",
              )
            : c > 1 &&
              s.push(
                `Incluye ${c} Destacados que puedes utilizar en los Avisos que prefieras.`,
              ),
          l !== null && s.push(`Ahorras un ${l}%`),
          s.join(`
`)
        );
      },
      o = (t) => {
        const n = d(t);
        if (n <= 0) return null;
        const s = t
          .filter((a) => Number(a.total_ads) > 1)
          .map((a) => i(a, n))
          .filter((a) => a !== null);
        return s.length > 0 ? Math.max(...s) : null;
      };
    return {
      getPackSavingsPct: e,
      getPackBadgeText: r,
      getPackDescription: u,
      getMaxSavingsPct: o,
      getPackBannerText: (t) => {
        const n = o(t);
        return n === null
          ? null
          : `<strong>Comprando un pack ahorras hasta un ${n}% vs el precio unitario.</strong>`;
      },
      getPacksPageTitle: (t) => {
        const n = o(t);
        return n === null
          ? "Compra un pack y publica más por menos"
          : `Publica más, paga menos — hasta un ${n}% de ahorro vs el precio por anuncio.`;
      },
    };
  };
export { P as u };
//# sourceMappingURL=JxRx1s6n.js.map
