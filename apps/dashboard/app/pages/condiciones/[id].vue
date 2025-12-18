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
const conditionName = ref<string>("");

const title = computed(() => conditionName.value || "Condición");
const breadcrumbs = computed(() => [
  { label: "Condiciones", to: "/condiciones" },
  ...(conditionName.value ? [{ label: conditionName.value }] : []),
]);

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    try {
      const strapi = useStrapi();
      const response = await strapi.findOne("conditions", id as string);
      if (response.data?.name) {
        conditionName.value = response.data.name;
      }
    } catch (error) {
      console.error("Error fetching condition:", error);
    }
  }
});
</script>
