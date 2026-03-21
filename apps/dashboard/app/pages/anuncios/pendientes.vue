<template>
  <HeroDefault title="Pendientes" :breadcrumbs="breadcrumbs" />
  <AdsPendings />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import AdsPendings from "@/components/AdsPendings.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Anuncios", to: "/anuncios/pendientes" },
  { label: "Pendientes" },
];
</script>
