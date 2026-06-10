import { bJ as i, b3 as t } from "./BK8sApmn.js";
try {
  let n =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    o = new n.Error().stack;
  o &&
    ((n._sentryDebugIds = n._sentryDebugIds || {}),
    (n._sentryDebugIds[o] = "3cb11443-3423-43a2-ad2b-415876b5b6c7"),
    (n._sentryDebugIdIdentifier =
      "sentry-dbid-3cb11443-3423-43a2-ad2b-415876b5b6c7"));
} catch {}
const a = i("conditions", {
  state: () => ({ conditions: [], loading: !1, error: null }),
  getters: {
    getConditions: (n) => n.conditions,
    isLoading: (n) => n.loading,
    hasError: (n) => n.error !== null,
    getConditionById: (n) => (o) => n.conditions.find((e) => e.id === o),
    getConditionBySlug: (n) => (o) => n.conditions.find((e) => e.slug === o),
  },
  actions: {
    async loadConditions() {
      try {
        ((this.loading = !0), (this.error = null));
        const e = await t()("conditions", {
          method: "GET",
          params: { pagination: { page: 1, pageSize: 1e3 }, populate: "*" },
        });
        if (!e.data || !Array.isArray(e.data))
          throw new Error("Formato de datos inválido");
        this.conditions = e.data;
      } catch {
        this.error = "Error al cargar las condiciones";
      } finally {
        this.loading = !1;
      }
    },
    async loadConditionById(n) {
      try {
        ((this.loading = !0), (this.error = null));
        const r = await t()("conditions", {
          method: "GET",
          params: { filters: { id: { $eq: n } }, populate: "*" },
        });
        if (!r.data || !Array.isArray(r.data))
          throw new Error("Formato de datos inválido");
        return r.data[0] || null;
      } catch {
        return ((this.error = "Error al cargar la condición"), null);
      } finally {
        this.loading = !1;
      }
    },
    clearError() {
      this.error = null;
    },
  },
});
export { a as u };
//# sourceMappingURL=B5cviOR7.js.map
