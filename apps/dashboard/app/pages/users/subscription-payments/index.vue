<template>
  <div>
    <HeroDefault title="Pagos de subscripción" :breadcrumbs="breadcrumbs" />
    <SubscriptionPaymentsDefault />
  </div>
</template>

<script setup lang="ts">
import HeroDefault from "@/components/HeroDefault.vue";
import SubscriptionPaymentsDefault from "@/components/SubscriptionPaymentsDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Pagos de subscripción" }];
</script>
