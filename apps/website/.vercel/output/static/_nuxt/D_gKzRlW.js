import { bJ as t, b3 as o } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[n] = "74d1d196-7ed9-4521-9155-cc710139001b"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-74d1d196-7ed9-4521-9155-cc710139001b"));
} catch {}
const i = t("regions", {
  state: () => ({
    regions: {
      data: [],
      meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } },
    },
    loading: !1,
    error: null,
  }),
  getters: {
    getRegions: (e) => e.regions,
    getLoading: (e) => e.loading,
    getError: (e) => e.error,
    getRegionById: (e) => (n) => e.regions.data.find((r) => r.id === n),
    getRegionByName: (e) => (n) => e.regions.data.find((r) => r.name === n),
  },
  actions: {
    async loadRegions() {
      try {
        ((this.loading = !0), (this.error = null));
        const r = await o()("regions", {
          method: "GET",
          params: { pagination: { page: 1, pageSize: 1e3 } },
        });
        if (!r.data || !Array.isArray(r.data))
          throw new Error("Formato de datos inválido");
        this.regions = r;
      } catch {
        this.error = "Error al cargar las regiones";
      } finally {
        this.loading = !1;
      }
    },
  },
});
export { i as u };
//# sourceMappingURL=D_gKzRlW.js.map
