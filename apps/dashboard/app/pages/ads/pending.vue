<template>
  <div>
    <HeroDefault title="Pendientes" :breadcrumbs="breadcrumbs" />
    <AdsTable endpoint="ads/pendings" section="adsPendings" />
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
  { label: "Pendientes" },
];
</script>
