<template>
  <div>
    <HeroHeaderDashboard :title="title" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink
          class="btn btn--primary"
          :to="`/dashboard/maintenance/security/${route.params.id}/edit`"
        >
          Editar Sección
        </NuxtLink>
      </template>
    </HeroHeaderDashboard>
    <BoxContent>
      <template #content>
        <BoxInformation title="Información" :columns="1">
          <CardInfo v-if="item" title="Título" :description="item.title" />
          <CardInfo v-if="item" title="Contenido" :description="item.text" />
          <CardInfo
            v-if="item"
            title="Orden"
            :description="item.order != null ? String(item.order) : 'Sin orden'"
          />
        </BoxInformation>
      </template>
      <template #sidebar>
        <BoxInformation title="Detalles" :columns="1">
          <CardInfo
            v-if="item"
            title="Fecha de creación"
            :description="formatDate(item.createdAt)"
          />
          <CardInfo
            v-if="item"
            title="Última modificación"
            :description="formatDate(item.updatedAt)"
          />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
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
const item = ref<SecurityPolicyRecord | null>(null);
const apiClient = useApiClient();

const title = computed(() => item.value?.title || "Política de Seguridad");
const breadcrumbs = computed(() => [
  { label: "Política de Seguridad", to: "/dashboard/maintenance/security" },
  ...(item.value?.title ? [{ label: item.value.title }] : []),
]);

const { data: securityPolicyData } = await useAsyncData(
  `security-policy-${route.params.id}`,
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

item.value = securityPolicyData.value ?? null;
</script>
