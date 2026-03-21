<template>
  <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
  <BoxContent>
    <template #content>
      <BoxInformation title="Editar región" :columns="1">
        <FormRegion :region="region" @saved="handleRegionSaved" />
      </BoxInformation>
    </template>
    <template #sidebar>
      <BoxInformation title="Detalles" :columns="1">
        <CardInfo
          v-if="region"
          title="Fecha de creación"
          :description="formatDate(region.createdAt)"
        />
        <CardInfo
          v-if="region"
          title="Última modificación"
          :description="formatDate(region.updatedAt)"
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
import FormRegion from "@/components/FormRegion.vue";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const region = ref<any>(null);

const title = computed(() => region.value?.name || "Región");
const breadcrumbs = computed(() => [
  { label: "Regiones", to: "/regiones" },
  ...(region.value?.name
    ? [{ label: region.value.name, to: `/regiones/${route.params.id}` }]
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

const handleRegionSaved = (updatedRegion: any) => {
  if (updatedRegion) {
    region.value = updatedRegion;
  }
};

const { data: regionData } = await useAsyncData(
  `region-edit-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const strapi = useStrapi();
    const response = await strapi.find("regions", {
      filters: { documentId: { $eq: id } },
    });
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data;

    const fallbackResponse = await strapi.findOne("regions", id as string);
    return fallbackResponse.data || null;
  },
);

region.value = regionData.value;
</script>
