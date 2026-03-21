<template>
  <HeroDefault :title="title" :breadcrumbs="breadcrumbs">
    <template #actions>
      <NuxtLink
        class="btn btn--primary"
        :to="`/comunas/${route.params.id}/editar`"
      >
        Editar comuna
      </NuxtLink>
    </template>
  </HeroDefault>
  <BoxContent>
    <template #content>
      <BoxInformation title="Información" :columns="2">
        <CardInfo v-if="commune" title="Nombre" :description="commune.name" />
        <CardInfo
          v-if="commune"
          title="Región"
          :description="commune.region?.name || '--'"
        />
        <CardInfo v-if="commune" title="Slug" :description="commune.slug" />
      </BoxInformation>
    </template>
    <template #sidebar>
      <BoxInformation title="Detalles" :columns="1">
        <CardInfo
          v-if="commune"
          title="Fecha de creación"
          :description="formatDate(commune.createdAt)"
        />
        <CardInfo
          v-if="commune"
          title="Última modificación"
          :description="formatDate(commune.updatedAt)"
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
const commune = ref<any>(null);

const title = computed(() => commune.value?.name || "Comuna");
const breadcrumbs = computed(() => [
  { label: "Comunas", to: "/comunas" },
  ...(commune.value?.name ? [{ label: commune.value.name }] : []),
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

const { data: communeData } = await useAsyncData(
  `commune-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const strapi = useStrapi();
    const response = await strapi.find("communes", {
      filters: { documentId: { $eq: id } },
      populate: "region",
    });
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data;

    const fallbackResponse = await strapi.findOne("communes", id as string, {
      populate: "region",
    });
    return fallbackResponse.data || null;
  },
);

commune.value = communeData.value;
</script>
