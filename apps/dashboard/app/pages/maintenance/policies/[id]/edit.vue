<template>
  <div>
    <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Editar Politica" :columns="1">
          <FormPolicy :policy="policy" @saved="handlePolicySaved" />
        </BoxInformation>
      </template>
      <template #sidebar>
        <BoxInformation title="Detalles" :columns="1">
          <CardInfo
            v-if="policy"
            title="Fecha de creación"
            :description="formatDate(policy.createdAt)"
          />
          <CardInfo
            v-if="policy"
            title="Última modificación"
            :description="formatDate(policy.updatedAt)"
          />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import CardInfo from "@/components/CardInfo.vue";
import FormPolicy from "@/components/FormPolicy.vue";
import type { PolicyData } from "@/components/FormPolicy.vue";

interface PolicyRecord extends PolicyData {
  createdAt?: string;
  updatedAt?: string;
}

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const policy = ref<PolicyRecord | null>(null);
const apiClient = useApiClient();

const title = computed(() => policy.value?.title || "Politica");
const breadcrumbs = computed(() => [
  { label: "Politicas", to: "/policies" },
  ...(policy.value?.title
    ? [{ label: policy.value.title, to: `/policies/${route.params.id}` }]
    : []),
  { label: "Editar" },
]);

const handlePolicySaved = (updatedPolicy: PolicyData) => {
  if (updatedPolicy) {
    policy.value = updatedPolicy;
  }
};

const { data: policyData } = await useAsyncData(
  `policy-edit-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const response = (await apiClient("policies", {
      method: "GET",
      params: { filters: { id: { $eq: Number(id) } } } as unknown as Record<
        string,
        unknown
      >,
    })) as { data: unknown[] };
    return Array.isArray(response.data) ? response.data[0] : null;
  },
  { default: () => null },
);

policy.value = policyData.value ?? null;
</script>
