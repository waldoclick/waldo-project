<template>
  <div class="page">
    <HeaderDefault />
    <CheckoutPro />
  </div>
</template>

<script setup lang="ts">
import HeaderDefault from "@/components/HeaderDefault.vue";
import CheckoutPro from "@/components/CheckoutPro.vue";

definePageMeta({
  middleware: "auth",
});

useSeoMeta({ robots: "noindex, nofollow" });
</script>
