<template>
  <div>
    <HeroDefault title="Usados" :breadcrumbs="breadcrumbs" />
    <FeaturedUsed />
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import FeaturedUsed from "@/components/FeaturedUsed.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Destacados", to: "/featured/free" },
  { label: "Usados" },
];
</script>
