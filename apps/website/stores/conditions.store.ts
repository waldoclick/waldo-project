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
        return state.conditions.find(
          (condition) => condition.attributes.slug === slug,
        );
      },
  },

  actions: {
    async loadConditions() {
      try {
        this.loading = true;
        this.error = null;

        const strapi = useStrapi();
        const response = await strapi.find("conditions", {
          pagination: {
            page: 1,
            pageSize: 1000,
          },
          populate: "*",
        });
        const typedResponse = response as unknown as ConditionResponse;

        if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
          throw new Error("Formato de datos inválido");
        }

        this.conditions = typedResponse.data;
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

        const strapi = useStrapi();
        const response = await strapi.find("conditions", {
          filters: {
            id: {
              $eq: id,
            },
          },
          populate: "*",
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

  persist: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
  },
});
