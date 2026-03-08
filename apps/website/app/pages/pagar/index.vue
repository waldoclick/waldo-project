<template>
  <div class="page">
    <HeaderDefault />
    <CheckoutDefault />
  </div>
</template>

<script setup lang="ts">
// components
import HeaderDefault from "@/components/HeaderDefault.vue";
import CheckoutDefault from "@/components/CheckoutDefault.vue";

definePageMeta({
  middleware: "auth",
});

useSeoMeta({ robots: "noindex, nofollow" });
</script>
