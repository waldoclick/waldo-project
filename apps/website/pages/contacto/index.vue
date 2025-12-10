<template>
  <ContactDefault />
</template>

<script setup lang="ts">
const { $setSEO, $setStructuredData } = useNuxtApp();

// Componente principal
import ContactDefault from "@/components/ContactDefault";

// Definir layout
definePageMeta({
  layout: "about",
});

$setSEO({
  title: "Contacto",
  description:
    "¿Tienes preguntas o necesitas ayuda? Contáctanos en Waldo.click® y nuestro equipo te responderá lo antes posible.",
  imageUrl: "https://waldo.click/contact-share.jpg",
  url: "https://waldo.click/contacto",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Waldo.click - Página de Contacto",
  url: "https://waldo.click/contacto",
  description:
    "¿Tienes preguntas o necesitas ayuda? Contáctanos en Waldo.click® y nuestro equipo te responderá lo antes posible.",
});
</script>
