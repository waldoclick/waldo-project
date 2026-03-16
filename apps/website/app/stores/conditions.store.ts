import { defineStore } from "pinia";
import type {
  Condition,
  ConditionResponse,
  ConditionState,
} from "@/types/condition";

export const useConditionsStore = defineStore("conditions", {
  state: (): ConditionState => ({
    conditions: [],
    loading: false,
    error: null,
    lastFetch: 0,
  }),

  getters: {
    getConditions: (state) => state.conditions,
    isLoading: (state) => state.loading,
    hasError: (state) => state.error !== null,

    getConditionById:
      (state) =>
      (id: number): Condition | undefined => {
        return state.conditions.find((condition) => condition.id === id);
      },

    getConditionBySlug:
      (state) =>
      (slug: string): Condition | undefined => {
        return state.conditions.find((condition) => condition.slug === slug);
      },
  },

  actions: {
    async loadConditions() {
      const now = Date.now();
      if (this.conditions.length > 0 && now - this.lastFetch < 1800000) return;

      try {
        this.loading = true;
        this.error = null;

        const client = useApiClient();
        const response = await client("conditions", {
          method: "GET",
          params: {
            pagination: { page: 1, pageSize: 1000 },
            populate: "*",
          } as unknown as Record<string, unknown>,
        });
        const typedResponse = response as unknown as ConditionResponse;

        if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
          throw new Error("Formato de datos inválido");
        }

        this.conditions = typedResponse.data;
        this.lastFetch = Date.now();
      } catch (err) {
        this.error = "Error al cargar las condiciones";
        console.error("Error loading conditions:", err);
      } finally {
        this.loading = false;
      }
    },

    async loadConditionById(id: number) {
      try {
        this.loading = true;
        this.error = null;

        const client = useApiClient();
        const response = await client("conditions", {
          method: "GET",
          params: {
            filters: { id: { $eq: id } },
            populate: "*",
          } as unknown as Record<string, unknown>,
        });
        const typedResponse = response as unknown as ConditionResponse;

        if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
          throw new Error("Formato de datos inválido");
        }

        return typedResponse.data[0] || null;
      } catch (err) {
        this.error = "Error al cargar la condición";
        console.error("Error loading condition:", err);
        return null;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },
  },

  // persist: CORRECT — static reference data with 30-min cache TTL (lastFetch); safe to reuse across sessions
  persist: {
    storage: persistedState.localStorage,
  },
});
