<template>
  <div class="page">
    <AccountEdit />
  </div>
</template>

<script setup>
import AccountEdit from "@/components/AccountEdit.vue";
import { useRegionsStore } from "@/stores/regions.store";
import { useCommunesStore } from "@/stores/communes.store";

const { $setSEO, $setStructuredData } = useNuxtApp();

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
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/cuenta/perfil/editar",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Editar Perfil",
  url: "https://waldo.click/cuenta/perfil/editar",
  description:
    "Edita tu perfil en Waldo.click®. Actualiza tu información personal y mantén tus datos al día.",
});
</script>
