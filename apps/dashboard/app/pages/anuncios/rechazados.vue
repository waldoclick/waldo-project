<template>
  <HeroDefault title="Rechazados" :breadcrumbs="breadcrumbs" />
  <AdsRejected />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import AdsRejected from "@/components/AdsRejected.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Anuncios", to: "/anuncios" },
  { label: "Rechazados" },
];
</script>
