// stores/policies.store.ts

import { defineStore } from "pinia";
import { ref } from "vue";
import type { Policy, PolicyResponse } from "@/types/policy";

const PAGE_SIZE = 50;

export const usePoliciesStore = defineStore("policies", () => {
  const policies = ref<Policy[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const client = useApiClient();

  const loadPolicies = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await client("policies", {
        method: "GET",
        params: {
          pagination: { pageSize: PAGE_SIZE, page: 1 },
          sort: ["order:asc"],
        } as unknown as Record<string, unknown>,
      });

      const typedResponse = response as unknown as PolicyResponse;

      if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
        throw new Error("Formato de datos invalido");
      }

      policies.value = typedResponse.data;
    } catch (err) {
      error.value = "Error al cargar las politicas";
      console.error("Error loading policies:", err);
    } finally {
      loading.value = false;
    }
  };

  return { policies, loading, error, loadPolicies };
});
