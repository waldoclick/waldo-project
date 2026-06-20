// stores/blog-categories.store.ts

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  BlogCategory,
  BlogCategoryResponse,
} from "@/types/blog-category";
import { useApiClient } from "#imports";

export const useBlogCategoriesStore = defineStore("blogCategories", () => {
  const categories = ref<BlogCategory[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const client = useApiClient();

  const getCategories = computed(() => categories.value);
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => error.value !== null);

  const getBlogCategoryBySlug = (slug: string): BlogCategory | undefined => {
    return categories.value.find((cat) => cat.slug === slug);
  };

  async function loadBlogCategories() {
    if (loading.value) return categories.value;

    loading.value = true;
    error.value = null;

    try {
      const response = await client("blog-categories", {
        method: "GET",
        params: {
          pagination: { page: 1, pageSize: 1000 },
          sort: ["name:asc"],
        } as unknown as Record<string, unknown>,
      });
      const typedResponse = response as unknown as BlogCategoryResponse;

      if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
        throw new Error("Formato de datos inválido");
      }

      categories.value = typedResponse.data;
    } catch {
      error.value = "Error al cargar las categorías del blog";
    } finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    categories,
    loading,
    error,
    getCategories,
    isLoading,
    hasError,
    getBlogCategoryBySlug,
    loadBlogCategories,
    clearError,
  };
});
