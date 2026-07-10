// stores/cookie-policies.store.ts

import { defineStore } from "pinia";
import { ref } from "vue";
import type { CookiePolicy, CookiePolicyResponse } from "@/types/cookie-policy";

const PAGE_SIZE = 50;

export const useCookiePoliciesStore = defineStore("cookiePolicies", () => {
  const cookiePolicies = ref<CookiePolicy[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const client = useApiClient();

  const loadCookiePolicies = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await client("cookie-policies", {
        method: "GET",
        params: {
          pagination: { pageSize: PAGE_SIZE, page: 1 },
          sort: ["order:asc"],
        } as unknown as Record<string, unknown>,
      });

      const typedResponse = response as unknown as CookiePolicyResponse;

      if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
        throw new Error("Formato de datos invalido");
      }

      cookiePolicies.value = typedResponse.data;
    } catch (err) {
      error.value = "Error al cargar la politica de cookies";
      console.error("Error loading cookie policies:", err);
    } finally {
      loading.value = false;
    }
  };

  return { cookiePolicies, loading, error, loadCookiePolicies };
});
