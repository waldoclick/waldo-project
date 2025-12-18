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
const packName = ref<string>("");

const title = computed(() => packName.value || "Pack");
const breadcrumbs = computed(() => [
  { label: "Packs", to: "/packs" },
  ...(packName.value ? [{ label: packName.value }] : []),
]);

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    try {
      const strapi = useStrapi();
      const response = await strapi.findOne("ad-packs", id as string);
      if (response.data?.name) {
        packName.value = response.data.name;
      }
    } catch (error) {
      console.error("Error fetching pack:", error);
    }
  }
});
</script>
