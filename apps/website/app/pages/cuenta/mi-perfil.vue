<template>
  <div class="page">
    <AccountMiPerfil />
  </div>
</template>

<script setup lang="ts">
import AccountMiPerfil from "@/components/AccountMiPerfil.vue";
import { useRegionsStore } from "@/stores/regions.store";
import { useCommunesStore } from "@/stores/communes.store";

const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

const regionsStore = useRegionsStore();
const communesStore = useCommunesStore();

await useAsyncData("mi-perfil-regions-communes", async () => {
  await regionsStore.loadRegions();
  await communesStore.loadCommunes();
});

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Mi Perfil",
  description:
    "Gestiona tu perfil en Waldo.click®. Actualiza tu información personal y cambia tu contraseña.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/cuenta/mi-perfil`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Mi Perfil",
  url: `${config.public.baseUrl}/cuenta/mi-perfil`,
  description:
    "Gestiona tu perfil en Waldo.click®. Actualiza tu información personal y cambia tu contraseña.",
});
</script>
