<template>
  <div>
    <HeroDefault :title="title" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink
          class="btn btn--primary"
          :to="`/regions/${route.params.id}/edit`"
        >
          Editar región
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import HeroDefault from "@/components/HeroDefault.vue";
import BoxContent from "@/components/BoxContent.vue";
import BoxInformation from "@/components/BoxInformation.vue";
import CardInfo from "@/components/CardInfo.vue";
import type { RegionData } from "@/components/FormRegion.vue";

interface RegionRecord extends RegionData {
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const item = ref<RegionRecord | null>(null);
const apiClient = useApiClient();

const title = computed(() => item.value?.name || "Región");
const breadcrumbs = computed(() => [
  { label: "Regiones", to: "/regions" },
  ...(item.value?.name ? [{ label: item.value.name }] : []),
]);

const { data: regionData } = await useAsyncData(
  `region-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const response = (await apiClient("regions", {
      method: "GET",
      params: { filters: { documentId: { $eq: id } } } as unknown as Record<
        string,
        unknown
      >,
    })) as { data: unknown[] };
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data;

    const fallback = (await apiClient(`regions/${id}`, { method: "GET" })) as {
      data: unknown;
    };
    return (fallback.data as unknown) || null;
  },
);

item.value = regionData.value ?? null;
</script>
