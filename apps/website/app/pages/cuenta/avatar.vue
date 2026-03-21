<template>
  <div class="page">
    <AccountAvatar />
  </div>
</template>

<script setup lang="ts">
import AccountAvatar from "@/components/AccountAvatar.vue";

const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Personalizar Avatar",
  description:
    "Personaliza tu avatar en Waldo.click®. Crea una presencia única y profesional en la plataforma.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/cuenta/avatar`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Personalizar Avatar",
  url: `${config.public.baseUrl}/cuenta/avatar`,
  description:
    "Personaliza tu avatar en Waldo.click®. Crea una presencia única y profesional en la plataforma.",
});
</script>
