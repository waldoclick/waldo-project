import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  FilterCommune,
  FilterCategory,
  FilterResponse,
  FilterState,
} from "@/types/filter";

const DEFAULT_CACHE_MINUTES = 30;

export const useFilterStore = defineStore(
  "filters",
  () => {
    // State
    const filterCommunes = ref<FilterCommune[]>([]);
    const filterCategories = ref<FilterCategory[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const lastFetchCommunes = ref(0);
    const lastFetchCategories = ref(0);
    const cacheDurationMinutes = ref(DEFAULT_CACHE_MINUTES);

    // Getters
    const getCommunes = computed(() => filterCommunes.value);
    const getCommunesCount = computed(() => filterCommunes.value.length);
    const getCategories = computed(() => filterCategories.value);
    const getCategoriesCount = computed(() => filterCategories.value.length);
    const isLoading = computed(() => loading.value);
    const hasError = computed(() => error.value !== null);

    // Actions
    async function loadFilterCommunes() {
      if (
        lastFetchCommunes.value &&
        Date.now() - lastFetchCommunes.value <
          cacheDurationMinutes.value * 60 * 1000
      ) {
        return filterCommunes.value;
      }

      try {
        loading.value = true;
        error.value = null;

        const strapi = useStrapi();
        const response = await strapi.find("filter/communes", {});
        const typedResponse =
          response as unknown as FilterResponse<FilterCommune>;

        if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
          throw new Error("Invalid data format");
        }

        filterCommunes.value = typedResponse.data;
        lastFetchCommunes.value = Date.now();
      } catch {
        error.value = "Error loading communes";
      } finally {
        loading.value = false;
      }

      return filterCommunes.value;
    }

    async function loadFilterCategories() {
      if (
        lastFetchCategories.value &&
        Date.now() - lastFetchCategories.value <
          cacheDurationMinutes.value * 60 * 1000
      ) {
        return filterCategories.value;
      }

      try {
        loading.value = true;
        error.value = null;

        const strapi = useStrapi();
        const response = await strapi.find("filter/categories", {});
        const typedResponse =
          response as unknown as FilterResponse<FilterCategory>;

        if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
          throw new Error("Invalid data format");
        }

        filterCategories.value = typedResponse.data;
        lastFetchCategories.value = Date.now();
      } catch {
        error.value = "Error loading categories";
      } finally {
        loading.value = false;
      }

      return filterCategories.value;
    }

    function clearError() {
      error.value = null;
    }

    return {
      // State
      filterCommunes,
      filterCategories,
      loading,
      error,
      lastFetchCommunes,
      lastFetchCategories,
      cacheDurationMinutes,
      // Getters
      getCommunes,
      getCommunesCount,
      getCategories,
      getCategoriesCount,
      isLoading,
      hasError,
      // Actions
      loadFilterCommunes,
      loadFilterCategories,
      clearError,
    };
  },
  {
    persist: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
    },
  },
);
