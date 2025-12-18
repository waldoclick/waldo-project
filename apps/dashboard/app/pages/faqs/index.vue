<template>
  <HeroDefault title="FAQs" :breadcrumbs="breadcrumbs" />
  <FaqsDefault />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import FaqsDefault from "@/components/FaqsDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "FAQs" }];
</script>
