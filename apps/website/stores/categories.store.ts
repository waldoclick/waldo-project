// stores/categories.store.ts

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  Category,
  CategoryResponse,
  CategoryState,
} from "@/types/category";

const DEFAULT_CACHE_MINUTES = 30;

export const useCategoriesStore = defineStore(
  "categories",
  () => {
    // State
    const categories = ref<Category[]>([]);
    const category = ref<Category | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const lastFetch = ref(0);
    const cacheDurationMinutes = ref(DEFAULT_CACHE_MINUTES);

    // Getters
    const getCategories = computed(() => categories.value);
    const getCategory = computed(() => category.value);
    const isLoading = computed(() => loading.value);
    const hasError = computed(() => error.value !== null);

    const getCategoryBySlug = (slug: string): Category | undefined => {
      return categories.value.find((cat) => cat.slug === slug);
    };

    const getCategoryById = (id: number): Category | undefined => {
      return categories.value.find((cat) => cat.id === id);
    };

    // Actions
    async function loadCategories() {
      const now = Date.now();
      const cacheAge = now - lastFetch.value;
      const cacheValidityMs = cacheDurationMinutes.value * 60 * 1000;

      if (categories.value.length > 0 && cacheAge < cacheValidityMs) {
        return categories.value;
      }

      if (loading.value) {
        return categories.value;
      }

      loading.value = true;
      error.value = null;

      try {
        const strapi = useStrapi();
        const response = await strapi.find("categories", {
          pagination: {
            page: 1,
            pageSize: 1000,
          },
          populate: "*",
        });
        const typedResponse = response as unknown as CategoryResponse;

        if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
          throw new Error("Formato de datos inválido");
        }

        categories.value = typedResponse.data;
        lastFetch.value = now;
      } catch {
        error.value = "Error al cargar las categorías";
      } finally {
        loading.value = false;
      }
    }

    async function loadCategory(slug: string) {
      try {
        loading.value = true;
        error.value = null;

        const strapi = useStrapi();
        const response = await strapi.find("categories", {
          filters: {
            slug: {
              $eq: slug,
            },
          },
          populate: "*",
        });
        const typedResponse = response as unknown as CategoryResponse;

        if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
          throw new Error("Formato de datos inválido");
        }

        category.value = typedResponse.data[0] || null;
      } catch {
        error.value = "Error al cargar la categoría";
        category.value = null;
      } finally {
        loading.value = false;
      }
    }

    async function loadCategoryById(id: number) {
      try {
        loading.value = true;
        error.value = null;

        if (categories.value.length === 0) {
          await loadCategories();
        }

        const localCategory = categories.value.find((cat) => cat.id === id);
        if (localCategory && localCategory.name) {
          return {
            name: localCategory.name,
            id: localCategory.id,
          };
        }

        const strapi = useStrapi();
        const response = await strapi.find("categories", {
          filters: {
            id: {
              $eq: id,
            },
          },
        });

        const typedResponse = response as unknown as CategoryResponse;
        if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
          throw new Error("Formato de datos inválido");
        }

        const categoryData = typedResponse.data[0];
        if (categoryData && categoryData.name) {
          return {
            name: categoryData.name,
            id: categoryData.id,
          };
        }

        throw new Error("Categoría no encontrada");
      } catch {
        throw new Error("Error al cargar la categoría");
      } finally {
        loading.value = false;
      }
    }

    function clearError() {
      error.value = null;
    }

    return {
      // State
      categories,
      category,
      loading,
      error,
      // Getters
      getCategories,
      getCategory,
      isLoading,
      hasError,
      getCategoryBySlug,
      getCategoryById,
      // Actions
      loadCategories,
      loadCategory,
      loadCategoryById,
      clearError,
    };
  }
  // {
  //   persist: {
  //     storage: typeof window !== "undefined" ? localStorage : undefined,
  //   },
  // },
);
