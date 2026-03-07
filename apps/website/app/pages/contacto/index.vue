<template>
  <ContactDefault />
</template>

<script setup lang="ts">
const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

// Componente principal
import ContactDefault from "@/components/ContactDefault.vue";

// Definir layout
definePageMeta({
  layout: "about",
});

$setSEO({
  title: "Contacto y Soporte",
  description:
    "¿Tienes dudas sobre anuncios de activos industriales o necesitas ayuda? Escríbenos en Waldo.click® y nuestro equipo te responderá pronto.",
  imageUrl: `${config.public.baseUrl}/contact-share.jpg`,
  url: `${config.public.baseUrl}/contacto`,
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Waldo.click - Página de Contacto",
  url: `${config.public.baseUrl}/contacto`,
  description:
    "¿Tienes dudas sobre anuncios de activos industriales o necesitas ayuda? Escríbenos en Waldo.click® y nuestro equipo te responderá pronto.",
});
</script>
