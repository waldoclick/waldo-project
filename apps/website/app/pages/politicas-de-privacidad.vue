<template>
  <PoliciesDefault />
</template>

<script setup lang="ts">
// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

// Componente principal
import PoliciesDefault from "@/components/PoliciesDefault.vue";

// Definir el layout
definePageMeta({
  layout: "about",
});

$setSEO({
  title: "Políticas de Privacidad",
  description:
    "Conoce cómo Waldo.click® protege tu información personal al publicar y comprar anuncios de activos industriales en nuestra plataforma.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/politicas-de-privacidad`,
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Políticas de Privacidad",
  description:
    "Conoce cómo Waldo.click® protege tu información personal al publicar y comprar anuncios de activos industriales en nuestra plataforma.",
  url: `${config.public.baseUrl}/politicas-de-privacidad`,
});
</script>
