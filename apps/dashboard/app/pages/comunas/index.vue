<template>
  <HeroDefault title="Comunas" :breadcrumbs="breadcrumbs" />
  <CommunesDefault />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import CommunesDefault from "@/components/CommunesDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Comunas" }];
</script>
