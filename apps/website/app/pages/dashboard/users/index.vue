<template>
  <div>
    <HeroDefaultDashboard title="Usuarios" :breadcrumbs="breadcrumbs" />
    <UsersDefault />
  </div>
</template>

<script setup lang="ts">
import UsersDefault from "@/components/UsersDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Usuarios" }];
</script>
