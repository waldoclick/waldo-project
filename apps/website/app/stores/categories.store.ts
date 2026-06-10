// stores/categories.store.ts

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Category, CategoryResponse } from "@/types/category";
import { useApiClient } from "#imports";

export const useCategoriesStore = defineStore("categories", () => {
  const categories = ref<Category[]>([]);
  const category = ref<Category | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const client = useApiClient();

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

  async function loadCategories() {
    if (loading.value) return categories.value;

    loading.value = true;
    error.value = null;

    try {
      const response = await client("categories", {
        method: "GET",
        params: {
          pagination: { page: 1, pageSize: 1000 },
          populate: "*",
          sort: ["name:asc"],
        } as unknown as Record<string, unknown>,
      });
      const typedResponse = response as unknown as CategoryResponse;

      if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
        throw new Error("Formato de datos inválido");
      }

      categories.value = typedResponse.data;
    } catch {
      error.value = "Error al cargar las categorías";
    } finally {
      loading.value = false;
    }
  }

  async function loadCategory(slug: string) {
    if (categories.value.length === 0) {
      await loadCategories();
    }

    const existingCategory = getCategoryBySlug(slug);
    if (existingCategory) {
      category.value = existingCategory;
      return;
    }

    if (category.value && category.value.slug === slug) {
      return;
    }

    try {
      loading.value = true;
      error.value = null;

      const response = await client("categories", {
        method: "GET",
        params: {
          filters: { slug: { $eq: slug } },
          populate: "*",
        } as unknown as Record<string, unknown>,
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
        return { name: localCategory.name, id: localCategory.id };
      }

      const response = await client("categories", {
        method: "GET",
        params: {
          filters: { id: { $eq: id } },
          populate: "*",
        } as unknown as Record<string, unknown>,
      });

      const typedResponse = response as unknown as CategoryResponse;
      if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
        throw new Error("Formato de datos inválido");
      }

      const categoryData = typedResponse.data[0];
      if (categoryData && categoryData.name) {
        return { name: categoryData.name, id: categoryData.id };
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
    categories,
    category,
    loading,
    error,
    getCategories,
    getCategory,
    isLoading,
    hasError,
    getCategoryBySlug,
    getCategoryById,
    loadCategories,
    loadCategory,
    loadCategoryById,
    clearError,
  };
});
