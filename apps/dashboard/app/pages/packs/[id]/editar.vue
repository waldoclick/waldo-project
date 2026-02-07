<template>
  <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
  <BoxContent>
    <template #content>
      <BoxInformation title="Editar pack" :columns="1">
        <FormPack :pack="pack" @saved="handlePackSaved" />
      </BoxInformation>
    </template>
    <template #sidebar>
      <BoxInformation title="Detalles" :columns="1">
        <CardInfo
          v-if="pack"
          title="Fecha de creación"
          :description="formatDate(pack.createdAt)"
        />
        <CardInfo
          v-if="pack"
          title="Última modificación"
          :description="formatDate(pack.updatedAt)"
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
import FormPack from "@/components/FormPack.vue";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const pack = ref<any>(null);

const title = computed(() => pack.value?.name || "Pack");
const breadcrumbs = computed(() => [
  { label: "Packs", to: "/packs" },
  ...(pack.value?.name
    ? [{ label: pack.value.name, to: `/packs/${route.params.id}` }]
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

const handlePackSaved = (updatedPack: any) => {
  if (updatedPack) {
    pack.value = updatedPack;
  }
};

const { data: packData } = await useAsyncData(
  `pack-edit-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;

    const strapi = useStrapi();
    const response = await strapi.find("ad-packs", {
      filters: { documentId: { $eq: id } },
    });
    const data = Array.isArray(response.data) ? response.data[0] : null;
    if (data) return data;

    const fallbackResponse = await strapi.findOne("ad-packs", id as string);
    return fallbackResponse.data || null;
  },
);

pack.value = packData.value;
</script>
