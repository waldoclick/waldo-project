<template>
  <NuxtLayout
    name="about"
    title="Escríbenos tus dudas"
    intro="¿Tienes preguntas sobre cómo publicar, comprar o vender equipos industriales en Waldo.click®? Completa el formulario y nuestro equipo te responderá a la brevedad."
    active="cont"
  >
    <ContactDefault />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

// Componente principal
import ContactDefault from "@/components/ContactDefault.vue";

// Definir layout — explicit <NuxtLayout> wrapper requires layout:false to avoid double-wrap
definePageMeta({
  layout: false,
});

$setSEO({
  title: "Contacto y Soporte",
  description:
    "¿Tienes dudas sobre anuncios de activos industriales o necesitas ayuda? Escríbenos en Waldo.click® y nuestro equipo te responderá pronto.",
  imageUrl: `${config.public.baseUrl}/images/share.jpg`,
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
