<template>
  <div>
    <HeroDefault title="Expirados" :breadcrumbs="breadcrumbs" />
    <AdsArchived />
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import AdsArchived from "@/components/AdsArchived.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Anuncios", to: "/anuncios/pendientes" },
  { label: "Expirados" },
];
</script>
