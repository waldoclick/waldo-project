<template>
  <div>
    <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Editar condición" :columns="1">
          <FormCondition :condition="condition" @saved="handleConditionSaved" />
        </BoxInformation>
      </template>
      <template #sidebar>
        <BoxInformation title="Detalles" :columns="1">
          <CardInfo
            v-if="condition"
            title="Fecha de creación"
            :description="formatDate(condition.createdAt)"
          />
          <CardInfo
            v-if="condition"
            title="Última modificación"
            :description="formatDate(condition.updatedAt)"
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
import FormCondition from "@/components/FormCondition.vue";
import type { ConditionData } from "@/components/FormCondition.vue";

interface ConditionRecord extends ConditionData {
  createdAt?: string;
  updatedAt?: string;
}

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const condition = ref<ConditionRecord | null>(null);
const apiClient = useApiClient();

const title = computed(() => condition.value?.name || "Condición");
const breadcrumbs = computed(() => [
  { label: "Condiciones", to: "/conditions" },
  ...(condition.value?.name
    ? [{ label: condition.value.name, to: `/conditions/${route.params.id}` }]
    : []),
  { label: "Editar" },
]);

const handleConditionSaved = (updatedCondition: ConditionData) => {
  if (updatedCondition) {
    condition.value = updatedCondition;
  }
};

const { data: conditionData } = await useAsyncData(
  `condition-edit-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const response = (await apiClient("conditions", {
      method: "GET",
      params: { filters: { documentId: { $eq: id } } } as unknown as Record<
        string,
        unknown
      >,
    })) as { data: unknown[] };
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data;

    const fallback = (await apiClient(`conditions/${id}`, {
      method: "GET",
    })) as { data: unknown };
    return (fallback.data as unknown) || null;
  },
);

condition.value = conditionData.value ?? null;
</script>
