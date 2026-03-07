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

const { $setSEO } = useNuxtApp();
const config = useRuntimeConfig();

$setSEO({
  title: "Comprar Pack",
  description: "Adquiere un pack de avisos en Waldo.click®.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
});
useSeoMeta({ robots: "noindex, nofollow" });
</script>
