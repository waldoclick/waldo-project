<template>
  <div>
    <HeroDefaultDashboard title="Pendientes" :breadcrumbs="breadcrumbs" />
    <AdsTable
      endpoint="ads/pendings"
      section="adsPendings"
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
  { label: "Anuncios", to: "/ads/pending" },
  { label: "Pendientes" },
];
</script>
