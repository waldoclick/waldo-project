<template>
  <div>
    <HeroDefault title="Baneados" :breadcrumbs="breadcrumbs" />
    <AdsTable endpoint="ads/banneds" section="adsBanned" />
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
  { label: "Baneados" },
];
</script>
