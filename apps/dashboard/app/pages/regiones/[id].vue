<template>
  <HeroDefault :title="title" :breadcrumbs="breadcrumbs" />
  <div></div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import HeroDefault from "@/components/HeroDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const regionName = ref<string>("");

const title = computed(() => regionName.value || "Región");
const breadcrumbs = computed(() => [
  { label: "Regiones", to: "/regiones" },
  ...(regionName.value ? [{ label: regionName.value }] : []),
]);

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    try {
      const strapi = useStrapi();
      const response = await strapi.findOne("regions", id as string);
      if (response.data?.name) {
        regionName.value = response.data.name;
      }
    } catch (error) {
      console.error("Error fetching region:", error);
    }
  }
});
</script>
