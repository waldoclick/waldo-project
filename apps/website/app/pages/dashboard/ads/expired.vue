<template>
  <div>
    <HeroDefaultDashboard title="Expirados" :breadcrumbs="breadcrumbs" />
    <AdsTable
      endpoint="ads/archiveds"
      section="adsArchived"
      :show-web-link="true"
    />
  </div>
</template>

<script setup lang="ts">
import AdsTable from "@/components/AdsTable.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Anuncios", to: "/dashboard/ads/pending" },
  { label: "Expirados" },
];
</script>
