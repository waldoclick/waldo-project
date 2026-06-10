<template>
  <div>
    <HeroDefaultDashboard title="Integraciones" :breadcrumbs="breadcrumbs" />
  </div>
</template>

<script setup lang="ts">

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Integraciones" }];
</script>
