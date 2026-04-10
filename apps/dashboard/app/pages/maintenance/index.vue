<template>
  <div>
    <HeroDefault title="Mantenedores" :breadcrumbs="breadcrumbs" />
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Mantenedores" }];
</script>
