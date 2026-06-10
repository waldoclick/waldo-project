<template>
  <div>
    <HeroHeaderDashboard title="Activos" :breadcrumbs="breadcrumbs" />
    <AdsTable
      endpoint="ads/actives"
      section="adsActives"
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
  { label: "Activos" },
];
</script>
