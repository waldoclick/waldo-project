<template>
  <div>
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
  </div>
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
const apiClient = useApiClient();

const title = computed(() => region.value?.name || "Región");
const breadcrumbs = computed(() => [
  { label: "Regiones", to: "/regions" },
  ...(region.value?.name
    ? [{ label: region.value.name, to: `/regions/${route.params.id}` }]
    : []),
  { label: "Editar" },
]);

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

    const response = await apiClient("regions", {
      method: "GET",
      params: { filters: { documentId: { $eq: id } } } as unknown as Record<string, unknown>,
    }) as { data: unknown[] };
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data;

    const fallback = await apiClient(`regions/${id}`, { method: "GET" }) as { data: unknown };
    return (fallback.data as unknown) || null;
  },
);

region.value = regionData.value ?? null;
</script>
