<template>
  <div class="page page--account">
    <AccountMain />
  </div>
</template>

<script setup lang="ts">
import AccountMain from "@/components/AccountMain.vue";

const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Mi Cuenta",
  description:
    "Accede a tu cuenta en Waldo.click®. Administra tus datos, anuncios y más desde un solo lugar.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/cuenta`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Mi Cuenta",
  url: `${config.public.baseUrl}/cuenta`,
  description:
    "Accede a tu cuenta en Waldo.click®. Administra tus datos, anuncios y más desde un solo lugar.",
});
</script>
