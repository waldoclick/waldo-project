<template>
  <div class="page">
    <AccountEdit />
  </div>
</template>

<script setup lang="ts">
import AccountEdit from "@/components/AccountEdit.vue";
import { useRegionsStore } from "@/stores/regions.store";
import { useCommunesStore } from "@/stores/communes.store";

const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

const regionsStore = useRegionsStore();
const communesStore = useCommunesStore();

// Pre-load regions and communes for SSR — FormProfile reads from these stores
await useAsyncData("perfil-editar-regions-communes", async () => {
  await regionsStore.loadRegions();
  await communesStore.loadCommunes();
});

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Editar Perfil",
  description:
    "Edita tu perfil en Waldo.click®. Actualiza tu información personal y mantén tus datos al día.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/cuenta/perfil/editar`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Editar Perfil",
  url: `${config.public.baseUrl}/cuenta/perfil/editar`,
  description:
    "Edita tu perfil en Waldo.click®. Actualiza tu información personal y mantén tus datos al día.",
});
</script>
