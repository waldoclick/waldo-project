<template>
  <div class="page">
    <HeaderDefault is-trasparent="true" :show-search="true" />
    <HeroDefault :title="`Packs`" />
    <PacksDefault :packs="packs" />
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
// components
import HeaderDefault from "@/components/HeaderDefault.vue";
import PacksDefault from "@/components/PacksDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";

// Load packs
const { data: packs } = await useAsyncData("packs", () => {
  return new Promise(async (resolve) => {
    const packsStore = usePacksStore();
    try {
      await packsStore.loadPacks();
      resolve(packsStore.packs);
    } catch (error) {
      console.error("Error loading packs:", error);
      resolve([]);
    }
  });
});

// Middleware
definePageMeta({
  middleware: "auth",
});
</script>
