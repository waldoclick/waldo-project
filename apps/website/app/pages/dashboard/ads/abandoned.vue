<template>
  <div>
    <HeroHeaderDashboard title="Borradores" :breadcrumbs="breadcrumbs" />
    <AdsTable endpoint="ads/drafts" section="adsDraft" :show-web-link="true" />
  </div>
</template>

<script setup lang="ts">
import AdsTable from "@/components/AdsTable.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Anuncios", to: "/dashboard/ads/pending" },
  { label: "Borradores" },
];
</script>
