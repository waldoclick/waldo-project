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
const communeName = ref<string>("");

const title = computed(() => communeName.value || "Comuna");
const breadcrumbs = computed(() => [
  { label: "Comunas", to: "/comunas" },
  ...(communeName.value ? [{ label: communeName.value }] : []),
]);

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    try {
      const strapi = useStrapi();
      const response = await strapi.findOne("communes", id as string);
      if (response.data?.name) {
        communeName.value = response.data.name;
      }
    } catch (error) {
      console.error("Error fetching commune:", error);
    }
  }
});
</script>
