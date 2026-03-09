<template>
  <div class="page">
    <HeaderDefault :show-search="true" />
    <HeroFake />
    <MessageDefault
      type="fail"
      :title="errorTitle"
      :description="errorDescription"
    />
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroFake from "@/components/HeroFake.vue";
import MessageDefault from "@/components/MessageDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import { useAdAnalytics } from "~/composables/useAdAnalytics";
import { computed, onMounted } from "vue";

$setSEO({
  title: "Error al Crear Anuncio",
  description:
    "Hubo un problema al intentar crear tu anuncio en Waldo.click®. Por favor, revisa los datos e inténtalo nuevamente.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/pagar/error`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Error al Crear Anuncio - Waldo.click®",
  url: `${config.public.baseUrl}/pagar/error`,
  description:
    "Hubo un problema al intentar crear tu anuncio en Waldo.click®. Por favor, revisa los datos e inténtalo nuevamente.",
});

// Middleware
definePageMeta({
  middleware: "auth",
});

// Reason-specific messaging
const route = useRoute();
const reason = computed(() => route.query.reason as string | undefined);

const errorTitle = computed(() => {
  if (reason.value === "cancelled") return "Pago cancelado";
  if (reason.value === "rejected") return "Pago rechazado";
  return "Ha ocurrido un error";
});

const errorDescription = computed(() => {
  if (reason.value === "cancelled")
    return "Cancelaste el proceso de pago. Puedes intentarlo nuevamente cuando quieras.";
  if (reason.value === "rejected")
    return "Tu pago fue rechazado por Webpay. Verifica los datos de tu tarjeta e intenta nuevamente.";
  return "Ocurrió un problema al procesar tu solicitud. Estamos trabajando para solucionarlo. Por favor, intenta de nuevo más tarde.";
});

// Analytics
const adAnalytics = useAdAnalytics();

// onMounted: analytics-only — fires ad creation error event; client-side only, non-blocking
onMounted(() => {
  adAnalytics.sendErrorEvent("ad_creation_error", errorDescription.value);
});
</script>
