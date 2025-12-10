<template>
  <div class="page page--account">
    <AccountMain />
  </div>
</template>

<script setup>
import AccountMain from "@/components/AccountMain.vue";

const { $setSEO, $setStructuredData } = useNuxtApp();

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Mi Cuenta",
  description:
    "Accede a tu cuenta en Waldo.click®. Administra tus datos, anuncios y más desde un solo lugar.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/cuenta",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Mi Cuenta",
  url: "https://waldo.click/cuenta",
  description:
    "Accede a tu cuenta en Waldo.click®. Administra tus datos, anuncios y más desde un solo lugar.",
});
</script>
