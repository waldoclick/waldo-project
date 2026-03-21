<template>
  <div class="page">
    <AccountCover />
  </div>
</template>

<script setup lang="ts">
import AccountCover from "@/components/AccountCover.vue";

const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Personalizar Portada",
  description:
    "Personaliza tu portada en Waldo.click®. Dale un toque único a tu perfil y destaca tus anuncios.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/cuenta/cover`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Personalizar Portada",
  url: `${config.public.baseUrl}/cuenta/cover`,
  description:
    "Personaliza tu portada en Waldo.click®. Dale un toque único a tu perfil y destaca tus anuncios.",
});
</script>
