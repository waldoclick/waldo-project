<template>
  <PoliciesDefault />
</template>

<script setup>
// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();

// Componente principal
import PoliciesDefault from "@/components/PoliciesDefault.vue";

// Definir el layout
definePageMeta({
  layout: "about",
});

$setSEO({
  title: "Políticas de Privacidad",
  description:
    "Conoce cómo Waldo.click® protege tu información personal y asegura la privacidad en tus transacciones.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://www.waldo.click/politicas-de-privacidad",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Políticas de Privacidad",
  description:
    "Conoce cómo Waldo.click® protege tu información personal y asegura la privacidad en tus transacciones.",
  url: "https://waldo.click/politicas-de-privacidad",
});
</script>
