<template>
  <HeroDefault title="Packs" :breadcrumbs="breadcrumbs" />
  <PacksDefault />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import PacksDefault from "@/components/PacksDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Packs" }];
</script>
