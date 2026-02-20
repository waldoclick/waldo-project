<template>
  <HeroDefault title="Abandonados" :breadcrumbs="breadcrumbs" />
  <AdsAbandoned />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import AdsAbandoned from "@/components/AdsAbandoned.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Anuncios", to: "/anuncios/pendientes" },
  { label: "Abandonados" },
];
</script>
