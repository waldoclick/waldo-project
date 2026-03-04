<template>
  <div>
    <HeroDefault title="Pendientes" :breadcrumbs="breadcrumbs" />
    <AdsPendings />
  </div>
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
