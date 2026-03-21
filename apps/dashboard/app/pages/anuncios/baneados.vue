<template>
  <HeroDefault title="Baneados" :breadcrumbs="breadcrumbs" />
  <AdsBanned />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import AdsBanned from "@/components/AdsBanned.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Anuncios", to: "/anuncios/pendientes" },
  { label: "Baneados" },
];
</script>
