<template>
  <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
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
import { ref, computed, onMounted } from "vue";
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

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    try {
      const strapi = useStrapi();
      const response = await strapi.findOne("communes", id as string, {
        populate: "region",
      });
      if (response.data) {
        commune.value = response.data;
      }
    } catch (error) {
      console.error("Error fetching commune:", error);
    }
  }
});
</script>
