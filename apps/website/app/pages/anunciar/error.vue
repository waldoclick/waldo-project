<template>
  <div class="page">
    <HeaderDefault :show-search="true" />
    <HeroFake />
    <MessageDefault
      type="fail"
      title="Ha ocurrido un error"
      description="Ocurrió un problema al procesar tu solicitud. Estamos trabajando para solucionarlo. Por favor, intenta de nuevo más tarde."
    />
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();

import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroFake from "@/components/HeroFake.vue";
import MessageDefault from "@/components/MessageDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import { useAdAnalytics } from "~/composables/useAdAnalytics";
import { onMounted } from "vue";

$setSEO({
  title: "Error al Crear Anuncio",
  description:
    "Hubo un problema al intentar crear tu anuncio en Waldo.click®. Por favor, revisa los datos e inténtalo nuevamente.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/error-crear-anuncio",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Error al Crear Anuncio - Waldo.click®",
  url: "https://waldo.click/error-crear-anuncio",
  description:
    "Hubo un problema al intentar crear tu anuncio en Waldo.click®. Por favor, revisa los datos e inténtalo nuevamente.",
});

// Middleware
definePageMeta({
  middleware: "auth",
});

// Analytics
const adAnalytics = useAdAnalytics();

// onMounted: analytics-only — fires ad creation error event; client-side only, non-blocking
onMounted(() => {
  adAnalytics.sendErrorEvent(
    "ad_creation_error",
    "Ocurrió un problema al procesar tu solicitud",
  );
});
</script>
