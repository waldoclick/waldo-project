<template>
  <div>
    <HeroDefault title="Usadas" :breadcrumbs="breadcrumbs" />
    <ReservationsUsed />
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import ReservationsUsed from "@/components/ReservationsUsed.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Reservas", to: "/reservas/libres" },
  { label: "Usadas" },
];
</script>
