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
const categoryName = ref<string>("");

const title = computed(() => categoryName.value || "Categoría");
const breadcrumbs = computed(() => [
  { label: "Categorías", to: "/categorias" },
  ...(categoryName.value ? [{ label: categoryName.value }] : []),
]);

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    try {
      const strapi = useStrapi();
      const response = await strapi.findOne("categories", id as string);
      if (response.data?.name) {
        categoryName.value = response.data.name;
      }
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  }
});
</script>
