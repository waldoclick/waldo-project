<template>
  <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
  <BoxContent>
    <template #content>
      <BoxInformation title="Editar categoría" :columns="1">
        <FormCategory :category="category" @saved="handleCategorySaved" />
      </BoxInformation>
    </template>
    <template #sidebar>
      <BoxInformation title="Detalles" :columns="1">
        <CardInfo
          v-if="category"
          title="Fecha de creación"
          :description="formatDate(category.createdAt)"
        />
        <CardInfo
          v-if="category"
          title="Última modificación"
          :description="formatDate(category.updatedAt)"
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
import FormCategory from "@/components/FormCategory.vue";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const category = ref<any>(null);

const title = computed(() => category.value?.name || "Categoría");
const breadcrumbs = computed(() => [
  { label: "Categorías", to: "/categorias" },
  ...(category.value?.name
    ? [{ label: category.value.name, to: `/categorias/${route.params.id}` }]
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

const handleCategorySaved = (updatedCategory: any) => {
  if (updatedCategory) {
    category.value = updatedCategory;
  }
};

const { data: categoryData } = await useAsyncData(
  `category-edit-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const strapi = useStrapi();
    const response = await strapi.find("categories", {
      filters: { documentId: { $eq: id } },
      populate: ["icon"],
    });
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data;

    const fallbackResponse = await strapi.findOne("categories", id as string, {
      populate: ["icon"],
    });
    return fallbackResponse.data || null;
  },
);

category.value = categoryData.value;
</script>
