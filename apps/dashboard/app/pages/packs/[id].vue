<template>
  <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
  <BoxContent>
    <template #content>
      <BoxInformation title="Información" :columns="2">
        <CardInfo v-if="item" title="Nombre" :description="item.name" />
        <CardInfo
          v-if="item"
          title="Descripción"
          :description="item.description"
        />
        <CardInfo v-if="item" title="Texto" :description="item.text" />
        <CardInfo
          v-if="item"
          title="Precio"
          :description="`$${item.price?.toLocaleString('es-CL') || '--'}`"
        />
        <CardInfo
          v-if="item"
          title="Duración (días)"
          :description="item.total_days?.toString() || '--'"
        />
        <CardInfo
          v-if="item"
          title="Cantidad de anuncios"
          :description="item.total_ads?.toString() || '--'"
        />
        <CardInfo
          v-if="item"
          title="Destacados"
          :description="item.total_features?.toString() || '--'"
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
const item = ref<any>(null);

const title = computed(() => item.value?.name || "Pack");
const breadcrumbs = computed(() => [
  { label: "Packs", to: "/packs" },
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

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    try {
      const strapi = useStrapi();
      const response = await strapi.findOne("ad-packs", id as string);
      if (response.data) {
        item.value = response.data;
      }
    } catch (error) {
      console.error("Error fetching pack:", error);
    }
  }
});
</script>
