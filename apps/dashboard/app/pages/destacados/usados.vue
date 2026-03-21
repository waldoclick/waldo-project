<template>
  <HeroDefault title="Usados" :breadcrumbs="breadcrumbs" />
  <FeaturedUsed />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import FeaturedUsed from "@/components/FeaturedUsed.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Destacados", to: "/destacados/libres" },
  { label: "Usados" },
];
</script>
