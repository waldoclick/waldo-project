<template>
  <div>
    <HeroHeaderDashboard :title="title" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Editar Sección de Política de Seguridad" :columns="1">
          <FormSecurityPolicy :security-policy="securityPolicy" @saved="handleSecurityPolicySaved" />
        </BoxInformation>
      </template>
      <template #sidebar>
        <BoxInformation title="Detalles" :columns="1">
          <CardInfo v-if="securityPolicy" title="Fecha de creación" :description="formatDate(securityPolicy.createdAt)" />
          <CardInfo v-if="securityPolicy" title="Última modificación" :description="formatDate(securityPolicy.updatedAt)" />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import FormSecurityPolicy from "@/components/FormSecurityPolicy.vue";
import type { SecurityPolicyData } from "@/components/FormSecurityPolicy.vue";
import { formatDate } from "@/utils/date";

interface SecurityPolicyRecord extends SecurityPolicyData {
  createdAt?: string;
  updatedAt?: string;
}

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const securityPolicy = ref<SecurityPolicyRecord | null>(null);
const apiClient = useApiClient();

const title = computed(() => securityPolicy.value?.title || "Política de Seguridad");
const breadcrumbs = computed(() => [
  { label: "Política de Seguridad", to: "/dashboard/maintenance/security" },
  ...(securityPolicy.value?.title
    ? [{ label: securityPolicy.value.title, to: `/dashboard/maintenance/security/${route.params.id}` }]
    : []),
  { label: "Editar" },
]);

const handleSecurityPolicySaved = (updated: SecurityPolicyData) => {
  if (updated) {
    securityPolicy.value = updated;
  }
};

const { data: securityPolicyData } = await useAsyncData(
  `security-policy-edit-${route.params.id}`,
  async () => {
    const documentId = route.params.id;
    if (!documentId) return null;

    const response = (await apiClient("security-policies", {
      method: "GET",
      params: {
        filters: { documentId: { $eq: documentId } },
      } as unknown as Record<string, unknown>,
    })) as { data: unknown[] };
    return Array.isArray(response.data) ? response.data[0] : null;
  },
  { default: () => null },
);

securityPolicy.value = securityPolicyData.value ?? null;
</script>
