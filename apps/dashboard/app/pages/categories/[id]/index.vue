<template>
  <div>
    <HeroDefault :title="title" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink
          class="btn btn--primary"
          :to="`/categories/${route.params.id}/edit`"
        >
          Editar categoría
        </NuxtLink>
      </template>
    </HeroDefault>
    <BoxContent>
      <template #content>
        <BoxInformation title="Información" :columns="2">
          <CardInfo v-if="item" title="Nombre" :description="item.name" />
          <CardInfo v-if="item" title="Slug" :description="item.slug" />
          <CardInfo v-if="item" title="Color" :description="item.color" />
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
        <BoxInformation v-if="item?.icon?.url" title="Icono" :columns="1">
          <img :src="iconPreview" alt="Icono categoría" />
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
import { useImageProxy } from "@/composables/useImage";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const item = ref<any>(null);
const { transformUrl } = useImageProxy();
const apiClient = useApiClient();

const title = computed(() => item.value?.name || "Categoría");
const breadcrumbs = computed(() => [
  { label: "Categorías", to: "/categories" },
  ...(item.value?.name ? [{ label: item.value.name }] : []),
]);

const iconPreview = computed(() =>
  item.value?.icon?.url ? transformUrl(item.value.icon.url) : "",
);

const { data: categoryData } = await useAsyncData(
  `category-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const response = (await apiClient("categories", {
      method: "GET",
      params: {
        filters: { documentId: { $eq: id } },
        populate: ["icon"],
      } as unknown as Record<string, unknown>,
    })) as { data: unknown[] };
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data;

    const fallback = (await apiClient(`categories/${id}`, {
      method: "GET",
      params: { populate: ["icon"] } as unknown as Record<string, unknown>,
    })) as { data: unknown };
    return (fallback.data as unknown) || null;
  },
);

item.value = categoryData.value ?? null;
</script>
