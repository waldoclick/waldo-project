<template>
  <div>
    <HeroDashboard />
    <StatisticsDefault />
  </div>
</template>

<script setup lang="ts">
import HeroDashboard from "@/components/HeroDashboard.vue";
import StatisticsDefault from "@/components/StatisticsDefault.vue";

definePageMeta({
  layout: "dashboard",
});

// Esta página está protegida por el middleware global
// Si no estás autenticado, serás redirigido a /auth/login
</script>
