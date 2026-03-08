<template>
  <div class="page">
    <HeaderDefault />
    <BuyPack />
  </div>
</template>

<script setup lang="ts">
// components
import HeaderDefault from "@/components/HeaderDefault.vue";
import BuyPack from "@/components/BuyPack.vue";

// TODO(Phase 56): comprar.vue and BuyPack.vue are deleted in Phase 56.
// Pack loading stub removed here to unblock typecheck after store deletion.

// Middleware
definePageMeta({
  middleware: "auth",
});

const { $setSEO } = useNuxtApp();
const config = useRuntimeConfig();

$setSEO({
  title: "Comprar Pack",
  description: "Adquiere un pack de avisos en Waldo.click®.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
});
useSeoMeta({ robots: "noindex, nofollow" });
</script>
