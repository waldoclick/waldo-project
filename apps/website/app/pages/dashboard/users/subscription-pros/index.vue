<template>
  <div>
    <HeroHeaderDashboard
      title="Subscripciones PRO"
      :breadcrumbs="breadcrumbs"
    />
    <SubscriptionProsDefault />
  </div>
</template>

<script setup lang="ts">
import SubscriptionProsDefault from "@/components/SubscriptionProsDefault.vue";

definePageMeta({
  layout: "dashboard",
});

const breadcrumbs = [{ label: "Subscripciones PRO" }];
</script>
