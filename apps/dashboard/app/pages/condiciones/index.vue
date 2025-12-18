<template>
  <HeroDefault title="Condiciones" :breadcrumbs="breadcrumbs" />
  <ConditionsDefault />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import ConditionsDefault from "@/components/ConditionsDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Condiciones" }];
</script>
