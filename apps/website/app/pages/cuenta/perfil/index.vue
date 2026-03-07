<template>
  <div class="page">
    <AccountProfile />
  </div>
</template>

<script setup lang="ts">
import AccountProfile from "@/components/AccountProfile.vue";

const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Perfil",
  description:
    "Gestiona tu perfil en Waldo.click®. Actualiza tu información personal y mantén tus datos al día.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/cuenta/perfil`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Perfil",
  url: `${config.public.baseUrl}/cuenta/perfil`,
  description:
    "Gestiona tu perfil en Waldo.click®. Actualiza tu información personal y mantén tus datos al día.",
});
</script>
