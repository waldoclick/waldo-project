<template>
  <div>
    <HeroHeaderDashboard
      title="Pagos de subscripción"
      :breadcrumbs="breadcrumbs"
    />
    <SubscriptionPaymentsDefault />
  </div>
</template>

<script setup lang="ts">
import SubscriptionPaymentsDefault from "@/components/SubscriptionPaymentsDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Pagos de subscripción" }];
</script>
