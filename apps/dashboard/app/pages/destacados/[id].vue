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
const featuredId = ref<string>("");

const title = computed(() =>
  featuredId.value ? `Destacado #${featuredId.value}` : "Destacado",
);
const breadcrumbs = computed(() => [
  { label: "Destacados", to: "/destacados/libres" },
  ...(featuredId.value ? [{ label: `#${featuredId.value}` }] : []),
]);

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    featuredId.value = id as string;
  }
});
</script>
