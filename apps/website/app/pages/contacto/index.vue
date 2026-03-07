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
  title: "Contacto",
  description:
    "¿Tienes preguntas o necesitas ayuda? Contáctanos en Waldo.click® y nuestro equipo te responderá lo antes posible.",
  imageUrl: `${config.public.baseUrl}/contact-share.jpg`,
  url: `${config.public.baseUrl}/contacto`,
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Waldo.click - Página de Contacto",
  url: `${config.public.baseUrl}/contacto`,
  description:
    "¿Tienes preguntas o necesitas ayuda? Contáctanos en Waldo.click® y nuestro equipo te responderá lo antes posible.",
});
</script>
