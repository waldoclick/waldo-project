<template>
  <HeroDefault title="Libres" :breadcrumbs="breadcrumbs" />
  <FeaturedFree />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import FeaturedFree from "@/components/FeaturedFree.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Destacados", to: "/destacados/libres" },
  { label: "Libres" },
];
</script>
