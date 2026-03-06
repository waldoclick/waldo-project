<template>
  <div>
    <HeroDefault title="Activos" :breadcrumbs="breadcrumbs" />
    <AdsTable
      endpoint="ads/actives"
      section="adsActives"
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
  { label: "Ads", to: "/ads/pending" },
  { label: "Activos" },
];
</script>
