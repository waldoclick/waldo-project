// stores/security-policies.store.ts

import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  SecurityPolicy,
  SecurityPolicyResponse,
} from "@/types/security-policy";

const PAGE_SIZE = 50;

export const useSecurityPoliciesStore = defineStore("securityPolicies", () => {
  const securityPolicies = ref<SecurityPolicy[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const client = useApiClient();

  const loadSecurityPolicies = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await client("security-policies", {
        method: "GET",
        params: {
          pagination: { pageSize: PAGE_SIZE, page: 1 },
          sort: ["order:asc"],
        } as unknown as Record<string, unknown>,
      });

      const typedResponse = response as unknown as SecurityPolicyResponse;

      if (!typedResponse.data || !Array.isArray(typedResponse.data)) {
        throw new Error("Formato de datos invalido");
      }

      securityPolicies.value = typedResponse.data;
    } catch (err) {
      error.value = "Error al cargar la politica de seguridad";
      console.error("Error loading security policies:", err);
    } finally {
      loading.value = false;
    }
  };

  return { securityPolicies, loading, error, loadSecurityPolicies };
});
