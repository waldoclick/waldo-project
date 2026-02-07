<template>
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
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import CardInfo from "@/components/CardInfo.vue";
import FormCondition from "@/components/FormCondition.vue";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const condition = ref<any>(null);

const title = computed(() => condition.value?.name || "Condición");
const breadcrumbs = computed(() => [
  { label: "Condiciones", to: "/condiciones" },
  ...(condition.value?.name
    ? [{ label: condition.value.name, to: `/condiciones/${route.params.id}` }]
    : []),
  { label: "Editar" },
]);

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "--";
  return new Date(dateString).toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleConditionSaved = (updatedCondition: any) => {
  if (updatedCondition) {
    condition.value = updatedCondition;
  }
};

const { data: conditionData } = await useAsyncData(
  `condition-edit-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const strapi = useStrapi();
    const response = await strapi.find("conditions", {
      filters: { documentId: { $eq: id } },
    });
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data;

    const fallbackResponse = await strapi.findOne("conditions", id as string);
    return fallbackResponse.data || null;
  },
);

condition.value = conditionData.value;
</script>
