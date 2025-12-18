<template>
  <HeroDefault title="Categorías" :breadcrumbs="breadcrumbs" />
  <CategoriesDefault />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import CategoriesDefault from "@/components/CategoriesDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Categorías" }];
</script>
