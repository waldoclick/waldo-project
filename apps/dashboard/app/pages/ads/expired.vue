<template>
  <div>
    <HeroDefault title="Expirados" :breadcrumbs="breadcrumbs" />
    <AdsTable endpoint="ads/archiveds" section="adsArchived" />
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import AdsTable from "@/components/AdsTable.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Anuncios", to: "/anuncios/pendientes" },
  { label: "Expirados" },
];
</script>
