<template>
  <HeroDefault :title="title" :breadcrumbs="breadcrumbs">
    <template #actions>
      <NuxtLink
        class="btn btn--primary"
        :to="`/condiciones/${route.params.id}/editar`"
      >
        Editar condición
      </NuxtLink>
    </template>
  </HeroDefault>
  <BoxContent>
    <template #content>
      <BoxInformation title="Información" :columns="2">
        <CardInfo v-if="item" title="Nombre" :description="item.name" />
        <CardInfo v-if="item" title="Slug" :description="item.slug" />
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
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import CardInfo from "@/components/CardInfo.vue";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const item = ref<any>(null);

const title = computed(() => item.value?.name || "Condición");
const breadcrumbs = computed(() => [
  { label: "Condiciones", to: "/condiciones" },
  ...(item.value?.name ? [{ label: item.value.name }] : []),
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

const { data: conditionData } = await useAsyncData(
  `condition-${route.params.id}`,
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

item.value = conditionData.value;
</script>
