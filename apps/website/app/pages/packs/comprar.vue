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
import { usePacksStore } from "@/stores/packs.store";

const packsStore = usePacksStore();

// Pre-load packs for SSR — PackMethod reads from packsStore
await useAsyncData("packs-comprar", async () => {
  await packsStore.loadPacks();
});

// Middleware
definePageMeta({
  middleware: "auth",
});
</script>
