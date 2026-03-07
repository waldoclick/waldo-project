<template>
  <div class="page">
    <HeaderDefault is-trasparent="true" :show-search="true" />
    <HeroDefault :title="`Packs`" />
    <PacksDefault :packs="packs" />
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
// components
import HeaderDefault from "@/components/HeaderDefault.vue";
import PacksDefault from "@/components/PacksDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";

import type { Pack } from "@/types/pack";

// Load packs
const { data: packsData } = await useAsyncData<Pack[]>(
  "packs-page-packs",
  () => {
    return new Promise<Pack[]>(async (resolve) => {
      const packsStore = usePacksStore();
      try {
        await packsStore.loadPacks();
        resolve(packsStore.packs);
      } catch (error) {
        console.error("Error loading packs:", error);
        resolve([]);
      }
    });
  },
);
const packs = computed(() => packsData.value ?? []);

const config = useRuntimeConfig();
const { $setSEO, $setStructuredData } = useNuxtApp();

$setSEO({
  title: "Packs de Avisos",
  description:
    "Elige el pack de avisos que mejor se adapte a tus necesidades. Publica más anuncios y llega a más compradores en Waldo.click®.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/packs`,
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Packs de Avisos — Waldo.click®",
  description: "Elige el pack de avisos que mejor se adapte a tus necesidades.",
  url: `${config.public.baseUrl}/packs`,
});

useSeoMeta({ robots: "noindex, nofollow" });

// Middleware
definePageMeta({
  middleware: "auth",
});
</script>
