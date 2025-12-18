import { defineStore } from "pinia";
import type { Region, RegionResponse, RegionState } from "@/types/region";

export const useRegionsStore = defineStore("regions", {
  state: (): RegionState => ({
    regions: {
      data: [],
      meta: {
        pagination: {
          page: 1,
          pageSize: 0,
          pageCount: 0,
          total: 0,
        },
      },
    },
    loading: false,
    error: null,
  }),

  getters: {
    getRegions: (state) => state.regions,
    getLoading: (state) => state.loading,
    getError: (state) => state.error,

    getRegionById:
      (state) =>
      (id: number): Region | undefined => {
        return state.regions.data.find((region) => region.id === id);
      },

    getRegionByName:
      (state) =>
      (name: string): Region | undefined => {
        return state.regions.data.find((region) => region.name === name);
      },
  },

  actions: {
    async loadRegions() {
      try {
        this.loading = true;
        this.error = null;

        const strapi = useStrapi();
        const response = await strapi.find("regions", {
          pagination: {
            page: 1,
            pageSize: 1000, // Un número grande para obtener prácticamente todos los registros
          },
        });
        const typedResponse = response as unknown as RegionResponse;

        if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
          throw new Error("Formato de datos inválido");
        }

        this.regions = typedResponse;
      } catch (err) {
        this.error = "Error al cargar las regiones";
        console.error("Error loading regions:", err);
      } finally {
        this.loading = false;
      }
    },
  },

  persist: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
  },
});
