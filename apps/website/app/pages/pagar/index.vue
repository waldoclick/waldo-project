<template>
  <div class="page">
    <HeaderDefault />
    <CheckoutDefault />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

// components
import HeaderDefault from "@/components/HeaderDefault.vue";
import CheckoutDefault from "@/components/CheckoutDefault.vue";

import { useAdStore } from "@/stores/ad.store";
import { useAdAnalytics } from "@/composables/useAdAnalytics";

const adStore = useAdStore();
const adAnalytics = useAdAnalytics();

onMounted(() => {
  // begin_checkout for pack-only flow (ad_id is null when coming from /packs).
  // For ad-creation flow, begin_checkout already fires in anunciar/resumen.vue.
  // beginCheckout() is a no-op if adStore analytics items are empty (safe fallback).
  if (adStore.ad.ad_id === null) {
    adAnalytics.beginCheckout();
  }
});

definePageMeta({
  middleware: "auth",
});

useSeoMeta({ robots: "noindex, nofollow" });
</script>
