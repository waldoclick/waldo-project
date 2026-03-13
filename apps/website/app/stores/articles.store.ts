import { defineStore } from "pinia";
import { ref } from "vue";
import type { Article, ArticleResponse } from "@/types/article";
import type { Pagination } from "@/types/pagination";

export const useArticlesStore = defineStore("articles", () => {
  const articles = ref<Article[]>([]);
  const pagination = ref<Pagination>({
    page: 1,
    pageSize: 12,
    pageCount: 0,
    total: 0,
  });
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const strapi = useStrapi();

  const DEFAULT_PAGINATION = {
    page: 1,
    pageSize: 12,
  };

  const loadArticles = async (
    filtersParams: Record<string, unknown> = {},
    paginationParams: { page: number; pageSize: number } = DEFAULT_PAGINATION,
    sortParams: string[] = [],
  ): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const params = {
        filters: filtersParams,
        pagination: paginationParams,
        sort: sortParams,
        populate: "*",
      } as unknown as Record<string, unknown>;

      const response = await strapi.find("articles", params);
      const typedResponse = response as unknown as ArticleResponse;
      articles.value = typedResponse.data;
      pagination.value = typedResponse.meta.pagination;
    } catch (err) {
      error.value = "Error al cargar los artículos";
      console.error("Error loading articles:", err);
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    articles.value = [];
    pagination.value = { page: 1, pageSize: 12, pageCount: 0, total: 0 };
    loading.value = false;
    error.value = null;
  };

  return { articles, pagination, loading, error, loadArticles, reset };
});
