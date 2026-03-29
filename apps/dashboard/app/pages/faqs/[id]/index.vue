<template>
  <div>
    <HeroDefault :title="title" :breadcrumbs="breadcrumbs">
      <template #actions>
        <NuxtLink
          class="btn btn--primary"
          :to="`/faqs/${route.params.id}/edit`"
        >
          Editar FAQ
        </NuxtLink>
      </template>
    </HeroDefault>
    <BoxContent>
      <template #content>
        <BoxInformation title="Información" :columns="1">
          <CardInfo v-if="item" title="Título" :description="item.title" />
          <CardInfo v-if="item" title="Contenido" :description="item.text" />
          <CardInfo
            v-if="item"
            title="Destacado"
            :description="item.featured ? 'Sí' : 'No'"
          />
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

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const item = ref<any>(null);
const apiClient = useApiClient();

const title = computed(() => item.value?.title || "FAQ");
const breadcrumbs = computed(() => [
  { label: "FAQs", to: "/faqs" },
  ...(item.value?.title ? [{ label: item.value.title }] : []),
]);

const { data: faqData } = await useAsyncData(
  `faq-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const response = (await apiClient("faqs", {
      method: "GET",
      params: { filters: { documentId: { $eq: id } } } as unknown as Record<
        string,
        unknown
      >,
    })) as { data: unknown[] };
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data;

    const fallback = (await apiClient(`faqs/${id}`, { method: "GET" })) as {
      data: unknown;
    };
    return (fallback.data as unknown) || null;
  },
);

item.value = faqData.value ?? null;
</script>
