import { bJ as A, b3 as I, b8 as i, b9 as u } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[t] = "a468be0a-70f0-425e-a04b-0725bad7b446"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-a468be0a-70f0-425e-a04b-0725bad7b446"));
} catch {}
const T = A("categories", () => {
  const e = i([]),
    t = i(null),
    o = i(!1),
    n = i(null),
    d = I(),
    f = u(() => e.value),
    y = u(() => t.value),
    p = u(() => o.value),
    v = u(() => n.value !== null),
    g = (r) => e.value.find((a) => a.slug === r),
    b = (r) => e.value.find((a) => a.id === r);
  async function c() {
    if (o.value) return e.value;
    ((o.value = !0), (n.value = null));
    try {
      const a = await d("categories", {
        method: "GET",
        params: {
          pagination: { page: 1, pageSize: 1e3 },
          populate: "*",
          sort: ["name:asc"],
        },
      });
      if (!a.data || !Array.isArray(a.data))
        throw new Error("Formato de datos inválido");
      e.value = a.data;
    } catch {
      n.value = "Error al cargar las categorías";
    } finally {
      o.value = !1;
    }
  }
  async function w(r) {
    e.value.length === 0 && (await c());
    const a = g(r);
    if (a) {
      t.value = a;
      return;
    }
    if (!(t.value && t.value.slug === r))
      try {
        ((o.value = !0), (n.value = null));
        const l = await d("categories", {
          method: "GET",
          params: { filters: { slug: { $eq: r } }, populate: "*" },
        });
        if (!l.data || !Array.isArray(l.data))
          throw new Error("Formato de datos inválido");
        t.value = l.data[0] || null;
      } catch {
        ((n.value = "Error al cargar la categoría"), (t.value = null));
      } finally {
        o.value = !1;
      }
  }
  async function m(r) {
    try {
      ((o.value = !0), (n.value = null), e.value.length === 0 && (await c()));
      const a = e.value.find((C) => C.id === r);
      if (a && a.name) return { name: a.name, id: a.id };
      const l = await d("categories", {
        method: "GET",
        params: { filters: { id: { $eq: r } }, populate: "*" },
      });
      if (!l.data || !Array.isArray(l.data))
        throw new Error("Formato de datos inválido");
      const s = l.data[0];
      if (s && s.name) return { name: s.name, id: s.id };
      throw new Error("Categoría no encontrada");
    } catch {
      throw new Error("Error al cargar la categoría");
    } finally {
      o.value = !1;
    }
  }
  function h() {
    n.value = null;
  }
  return {
    categories: e,
    category: t,
    loading: o,
    error: n,
    getCategories: f,
    getCategory: y,
    isLoading: p,
    hasError: v,
    getCategoryBySlug: g,
    getCategoryById: b,
    loadCategories: c,
    loadCategory: w,
    loadCategoryById: m,
    clearError: h,
  };
});
export { T as u };
//# sourceMappingURL=De8hi3Om.js.map
