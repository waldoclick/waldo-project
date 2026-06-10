import { dq as l, cF as f, cP as g } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[n] = "9d724984-d260-47c6-8404-7d58b7ebb5d0"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-9d724984-d260-47c6-8404-7d58b7ebb5d0"));
} catch {}
const m = l((e) => {
  const n = f(),
    t = n.ad,
    o = n.step >= 2,
    d = !!(t.name && t.category > 0 && t.price > 0 && t.description),
    s = !!(t.email && t.phone),
    i = !!t.condition,
    c = t.gallery.length > 0,
    a = o
      ? d
        ? s
          ? i
            ? c
              ? null
              : "/anunciar/galeria-de-imagenes"
            : "/anunciar/ficha-de-producto"
          : "/anunciar/datos-personales"
        : "/anunciar/datos-del-producto"
      : "/anunciar";
  if (!a || e.path === a) return;
  const r = {
      "/anunciar": 1,
      "/anunciar/datos-del-producto": 2,
      "/anunciar/datos-personales": 3,
      "/anunciar/ficha-de-producto": 4,
      "/anunciar/galeria-de-imagenes": 5,
    },
    u = r[e.path] ?? 0,
    p = r[a] ?? 1;
  if (u > p) return g(a);
});
export { m as default };
//# sourceMappingURL=B_J7uGLn.js.map
