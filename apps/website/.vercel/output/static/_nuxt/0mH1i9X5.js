import { bJ as g, b3 as f, b8 as s } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[t] = "ba87dd14-8493-4f71-8005-4c8f6c5194a5"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-ba87dd14-8493-4f71-8005-4c8f6c5194a5"));
} catch {}
const m = g("articles", () => {
  const e = s([]),
    t = s({ page: 1, pageSize: 12, pageCount: 0, total: 0 }),
    n = s(!1),
    l = s(null),
    o = s(new Map()),
    i = f(),
    u = { page: 1, pageSize: 12 };
  return {
    articles: e,
    pagination: t,
    loading: n,
    error: l,
    loadArticles: async (a = {}, r = u, d = []) => {
      ((n.value = !0), (l.value = null));
      try {
        const c = await i("articles", {
          method: "GET",
          params: { filters: a, pagination: r, sort: d, populate: "*" },
        });
        ((e.value = c.data), (t.value = c.meta.pagination));
      } catch {
        l.value = "Error al cargar los artículos";
      } finally {
        n.value = !1;
      }
    },
    reset: () => {
      ((e.value = []),
        (t.value = { page: 1, pageSize: 12, pageCount: 0, total: 0 }),
        (n.value = !1),
        (l.value = null));
    },
    hasAICache: (a) => o.value.has(a),
    getAICache: (a) => o.value.get(a),
    setAICache: (a, r) => {
      o.value.set(a, { result: r, timestamp: Date.now() });
    },
  };
});
export { m as u };
//# sourceMappingURL=0mH1i9X5.js.map
