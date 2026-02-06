<template>
  <HeroDefault title="Archivados" :breadcrumbs="breadcrumbs" />
  <AdsArchived />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import AdsArchived from "@/components/AdsArchived.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Anuncios", to: "/anuncios/pendientes" },
  { label: "Archivados" },
];
</script>
