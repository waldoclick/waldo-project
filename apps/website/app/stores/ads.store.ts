import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ad, AdAccess } from "@/types/ad";
import type { Pagination } from "@/types/pagination";
import type { StrapiResponse } from "@nuxtjs/strapi";
import { useApiClient } from "#imports";

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

    const client = useApiClient();

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
        } as unknown as Record<string, unknown>;

        const response = await client("ads/actives", {
          method: "GET",
          params: params as unknown as Record<string, unknown>,
        });
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

    const loadAdBySlug = async (
      slug: string,
    ): Promise<{ ad: Ad; access: AdAccess }> => {
      loading.value = true;
      error.value = null;

      try {
        const response = await client(`ads/slug/${slug}`, {
          method: "GET",
        });
        const typedResponse = response as unknown as {
          data: Ad;
          access: AdAccess;
        };

        if (typedResponse.data) {
          return { ad: typedResponse.data, access: typedResponse.access };
        } else {
          throw new Error("Ad not found");
        }
      } catch (err) {
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
        const response = await client("ads", {
          method: "GET",
          params: {
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
          } as unknown as Record<string, unknown>,
        });
        const typedResponse = response as unknown as StrapiResponse<Ad>;

        if (typedResponse.data.length > 0) {
          return typedResponse.data[0]!;
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

    const reset = () => {
      ads.value = [];
      pagination.value = { page: 1, pageSize: 20, pageCount: 0, total: 0 };
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
      reset,
    };
  },
  {
    // persist: RISK — query results (ads[], pagination) are volatile; stale listings survive reload and may show deleted/outdated ads
    persist: {
      storage: persistedState.localStorage,
    },
  },
);
