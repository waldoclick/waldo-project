import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ad, AdResponse } from "@/types/ad";
import { useApiClient } from "#imports";

export const useRelatedStore = defineStore(
  "related",
  () => {
    const relatedAds = ref<Ad[]>([]);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const client = useApiClient();

    const loadRelatedAds = async (id: number) => {
      try {
        loading.value = true;
        error.value = null;

        const response = await client(`related/ads/${id}`, {
          method: "GET",
          params: { populate: "*" } as unknown as Record<string, unknown>,
        });

        const typedResponse = response as unknown as AdResponse;

        if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
          throw new Error("Invalid data format");
        }

        relatedAds.value = typedResponse.data;
      } catch (err) {
        error.value = "Error loading related ads";
        console.error("Error loading related ads:", err);
      } finally {
        loading.value = false;
      }
    };

    return {
      relatedAds,
      loading,
      error,
      loadRelatedAds,
    };
  },
  {
    // persist: RISK — related ads are specific to the last-viewed ad; stale results appear on unrelated ad pages after reload
    persist: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
    },
  },
);
