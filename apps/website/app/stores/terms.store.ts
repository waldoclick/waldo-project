// stores/terms.store.ts

import { defineStore } from "pinia";
import { ref } from "vue";
import type { Term, TermResponse } from "@/types/term";

const CACHE_DURATION = 3600000; // 1 hour in milliseconds
const PAGE_SIZE = 50;

export const useTermsStore = defineStore(
  "terms",
  () => {
    const terms = ref<Term[]>([]);
    const lastFetchTimestamp = ref<number | null>(null);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const client = useApiClient();

    const loadTerms = async () => {
      const now = Date.now();

      if (
        !lastFetchTimestamp.value ||
        now - lastFetchTimestamp.value > CACHE_DURATION
      ) {
        try {
          loading.value = true;
          error.value = null;

          const response = await client("terms", {
            method: "GET",
            params: {
              pagination: { pageSize: PAGE_SIZE, page: 1 },
              sort: ["order:asc"],
            } as unknown as Record<string, unknown>,
          });

          const typedResponse = response as unknown as TermResponse;

          if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
            throw new Error("Formato de datos invalido");
          }

          terms.value = typedResponse.data;
          lastFetchTimestamp.value = now;
        } catch (err) {
          error.value = "Error al cargar los terminos";
          console.error("Error loading terms:", err);
        } finally {
          loading.value = false;
        }
      }
    };

    return { terms, lastFetchTimestamp, loading, error, loadTerms };
  },
  {
    // persist: CORRECT — static reference data with 1-hour cache TTL; safe to reuse across sessions
    persist: { storage: persistedState.localStorage },
  },
);
