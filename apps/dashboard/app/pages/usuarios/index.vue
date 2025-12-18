<template>
  <HeroDefault title="Usuarios" :breadcrumbs="breadcrumbs" />
  <UsersDefault />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import UsersDefault from "@/components/UsersDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Usuarios" }];
</script>
