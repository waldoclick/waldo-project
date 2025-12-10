<template>
  <div class="page">
    <AccountProfile />
  </div>
</template>

<script setup>
import AccountProfile from "@/components/AccountProfile.vue";

const { $setSEO, $setStructuredData } = useNuxtApp();

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Perfil",
  description:
    "Gestiona tu perfil en Waldo.click®. Actualiza tu información personal y mantén tus datos al día.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/cuenta/perfil",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Perfil",
  url: "https://waldo.click/cuenta/perfil",
  description:
    "Gestiona tu perfil en Waldo.click®. Actualiza tu información personal y mantén tus datos al día.",
});
</script>
