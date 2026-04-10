<template>
  <div>
    <HeroDefault title="Integraciones" :breadcrumbs="breadcrumbs" />
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Integraciones" }];
</script>
