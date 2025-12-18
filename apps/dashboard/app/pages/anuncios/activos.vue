<template>
  <HeroDefault title="Activos" :breadcrumbs="breadcrumbs" />
  <AdsActives />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import AdsActives from "@/components/AdsActives.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Anuncios", to: "/anuncios" },
  { label: "Activos" },
];
</script>
