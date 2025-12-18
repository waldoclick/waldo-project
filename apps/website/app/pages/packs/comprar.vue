<template>
  <div class="page">
    <HeaderDefault />
    <BuyPack />
  </div>
</template>

<script setup>
// components
import HeaderDefault from "@/components/HeaderDefault.vue";
import BuyPack from "@/components/BuyPack.vue";

// Middleware
definePageMeta({
  middleware: "auth",
});
</script>
