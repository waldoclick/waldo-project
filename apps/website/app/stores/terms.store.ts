// stores/terms.store.ts

import { defineStore } from "pinia";
import { ref } from "vue";
import type { Term, TermResponse } from "@/types/term";

const PAGE_SIZE = 50;

export const useTermsStore = defineStore("terms", () => {
  const terms = ref<Term[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const client = useApiClient();

  const loadTerms = async () => {
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
    } catch (err) {
      error.value = "Error al cargar los terminos";
      console.error("Error loading terms:", err);
    } finally {
      loading.value = false;
    }
  };

  return { terms, loading, error, loadTerms };
});
