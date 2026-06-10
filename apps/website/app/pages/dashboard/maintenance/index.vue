<template>
  <div>
    <HeroDefaultDashboard title="Mantenedores" :breadcrumbs="breadcrumbs" />
  </div>
</template>

<script setup lang="ts">

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Mantenedores" }];
</script>
