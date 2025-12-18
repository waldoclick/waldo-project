<template>
  <HeroDefault title="Órdenes" :breadcrumbs="breadcrumbs" />
  <OrdersDefault />
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import OrdersDefault from "@/components/OrdersDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Órdenes" }];
</script>
