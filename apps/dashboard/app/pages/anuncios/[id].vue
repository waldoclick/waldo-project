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
const adName = ref<string>("");

const title = computed(() => adName.value || "Anuncio");
const breadcrumbs = computed(() => [
  { label: "Anuncios", to: "/anuncios" },
  ...(adName.value ? [{ label: adName.value }] : []),
]);

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    try {
      const strapi = useStrapi();
      const response = await strapi.findOne("ads", id as string);
      if (response.data?.name) {
        adName.value = response.data.name;
      }
    } catch (error) {
      console.error("Error fetching ad:", error);
    }
  }
});
</script>
