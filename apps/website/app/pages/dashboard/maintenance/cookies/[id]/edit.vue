<template>
  <div>
    <HeroHeaderDashboard :title="title" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Editar Sección de Política de Cookies" :columns="1">
          <FormCookiePolicy :cookie-policy="cookiePolicy" @saved="handleCookiePolicySaved" />
        </BoxInformation>
      </template>
      <template #sidebar>
        <BoxInformation title="Detalles" :columns="1">
          <CardInfo v-if="cookiePolicy" title="Fecha de creación" :description="formatDate(cookiePolicy.createdAt)" />
          <CardInfo v-if="cookiePolicy" title="Última modificación" :description="formatDate(cookiePolicy.updatedAt)" />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import FormCookiePolicy from "@/components/FormCookiePolicy.vue";
import type { CookiePolicyData } from "@/components/FormCookiePolicy.vue";
import { formatDate } from "@/utils/date";

interface CookiePolicyRecord extends CookiePolicyData {
  createdAt?: string;
  updatedAt?: string;
}

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const cookiePolicy = ref<CookiePolicyRecord | null>(null);
const apiClient = useApiClient();

const title = computed(() => cookiePolicy.value?.title || "Política de Cookies");
const breadcrumbs = computed(() => [
  { label: "Política de Cookies", to: "/dashboard/maintenance/cookies" },
  ...(cookiePolicy.value?.title
    ? [{ label: cookiePolicy.value.title, to: `/dashboard/maintenance/cookies/${route.params.id}` }]
    : []),
  { label: "Editar" },
]);

const handleCookiePolicySaved = (updated: CookiePolicyData) => {
  if (updated) {
    cookiePolicy.value = updated;
  }
};

const { data: cookiePolicyData } = await useAsyncData(
  `cookie-policy-edit-${route.params.id}`,
  async () => {
    const documentId = route.params.id;
    if (!documentId) return null;

    const response = (await apiClient("cookie-policies", {
      method: "GET",
      params: {
        filters: { documentId: { $eq: documentId } },
      } as unknown as Record<string, unknown>,
    })) as { data: unknown[] };
    return Array.isArray(response.data) ? response.data[0] : null;
  },
  { default: () => null },
);

cookiePolicy.value = cookiePolicyData.value ?? null;
</script>
