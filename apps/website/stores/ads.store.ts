import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ad } from "@/types/ad";
import type { Pagination } from "@/types/pagination";
import type { StrapiResponse } from "@/types/strapi.interface";

export const useAdsStore = defineStore(
  "ads",
  () => {
    const ads = ref<Ad[]>([]);
    const pagination = ref<Pagination>({
      page: 1,
      pageSize: 20,
      pageCount: 0,
      total: 0,
    });
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const strapi = useStrapi();

    const DEFAULT_PAGINATION = {
      page: 1,
      pageSize: 20,
    };

    const loadAds = async (
      filtersParams: Record<string, any> = {},
      paginationParams: { page: number; pageSize: number } = DEFAULT_PAGINATION,
      sortParams: string[] = [],
    ) => {
      loading.value = true;
      error.value = null;

      try {
        const params = {
          filters: filtersParams,
          pagination: paginationParams,
          sort: sortParams,
          populate: "*",
        };

        const response = await strapi.find("ads", params);
        const typedResponse = response as unknown as StrapiResponse<Ad>;
        ads.value = typedResponse.data;
        pagination.value = typedResponse.meta.pagination;
      } catch (err) {
        error.value = "Error al cargar los anuncios";
        console.error("Error loading ads:", err);
      } finally {
        loading.value = false;
      }
    };

    const loadAdBySlug = async (slug: string): Promise<Ad> => {
      loading.value = true;
      error.value = null;

      try {
        const response = await strapi.find("ads", {
          filters: { slug: { $eq: slug } },
          populate: {
            commune: {
              populate: "*",
            },
            user: {
              populate: "*",
            },
            category: true,
            condition: true,
            gallery: true,
          },
        });
        const typedResponse = response as unknown as StrapiResponse<Ad>;

        if (typedResponse.data.length > 0) {
          return typedResponse.data[0];
        } else {
          throw new Error("Ad not found");
        }
      } catch (err) {
        error.value = "Error al cargar el anuncio";
        console.error("Error loading ad:", err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const loadAdById = async (id: string): Promise<Ad> => {
      loading.value = true;
      error.value = null;

      try {
        const response = await strapi.find("ads", {
          filters: { id: { $eq: id } },
          populate: {
            commune: {
              populate: "*",
            },
            user: true,
            category: true,
            condition: true,
            gallery: true,
          },
        });
        const typedResponse = response as unknown as StrapiResponse<Ad>;

        if (typedResponse.data.length > 0) {
          return typedResponse.data[0];
        } else {
          throw new Error("Ad not found");
        }
      } catch (err) {
        error.value = "Error al cargar el anuncio";
        console.error("Error loading ad:", err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const clearAll = () => {
      ads.value = [];
      pagination.value = {
        page: 1,
        pageSize: 20,
        pageCount: 0,
        total: 0,
      };
      loading.value = false;
      error.value = null;
    };

    return {
      ads,
      pagination,
      loading,
      error,
      loadAds,
      loadAdBySlug,
      loadAdById,
      clearAll,
    };
  },
  {
    persist: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
    },
  },
);
