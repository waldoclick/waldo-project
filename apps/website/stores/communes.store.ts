import { defineStore } from "pinia";
import type { Commune, CommuneResponse, CommuneState } from "@/types/commune";

export const useCommunesStore = defineStore("communes", {
  state: (): CommuneState => ({
    communes: {
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
    getCommunes: (state) => state.communes,
    getLoading: (state) => state.loading,
    getError: (state) => state.error,

    getCommuneById:
      (state) =>
      (id: number): Commune | undefined => {
        return state.communes.data.find((commune) => commune.id === id);
      },

    getCommunesByRegion:
      (state) =>
      (regionId: number): Commune[] => {
        return state.communes.data.filter(
          (commune) => commune.region.id === regionId
        );
      },

    getCommuneInfo:
      (state) =>
      (
        communeId: number
      ): { communeName: string; regionName: string } | null => {
        const commune = state.communes.data.find(
          (commune) => commune.id === communeId
        );
        if (!commune) return null;

        return {
          communeName: commune.name,
          regionName: commune.region.name,
        };
      },
  },

  actions: {
    async loadCommunes() {
      try {
        this.loading = true;
        this.error = null;

        const strapi = useStrapi();
        const response = await strapi.find("communes", {
          pagination: {
            page: 1,
            pageSize: 1000,
          },
          populate: "*",
          sort: ["name:asc"],
        });
        const typedResponse = response as unknown as CommuneResponse;

        if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
          throw new Error("Formato de datos inválido");
        }

        this.communes = typedResponse;
      } catch (err) {
        this.error = "Error al cargar las comunas";
        console.error("Error loading communes:", err);
      } finally {
        this.loading = false;
      }
    },
  },

  persist: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
  },
});
