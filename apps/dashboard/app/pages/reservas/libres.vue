<template>
  <HeroDefault title="Libres" :breadcrumbs="breadcrumbs" />
  <ReservationsFree />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import ReservationsFree from "@/components/ReservationsFree.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [
  { label: "Reservas", to: "/reservas" },
  { label: "Libres" },
];
</script>
