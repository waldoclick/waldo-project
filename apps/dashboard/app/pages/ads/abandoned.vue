<template>
  <div>
    <HeroDefault title="Abandonados" :breadcrumbs="breadcrumbs" />
    <AdsTable endpoint="ads/abandoneds" section="adsAbandoned" />
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
  { label: "Abandonados" },
];
</script>
