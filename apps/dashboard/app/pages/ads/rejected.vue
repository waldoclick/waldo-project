<template>
  <div>
    <HeroDefault title="Rechazados" :breadcrumbs="breadcrumbs" />
    <AdsTable
      endpoint="ads/rejecteds"
      section="adsRejected"
      :show-web-link="true"
    />
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import AdsTable from "@/components/AdsTable.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Anuncios", to: "/ads/pending" },
  { label: "Rechazados" },
];
</script>
