<template>
  <NuxtLayout
    name="about"
    title="Condiciones de uso"
    intro="Conoce las condiciones que regulan la publicación y compra de anuncios de activos industriales en la plataforma Waldo.click®."
    active="cond"
  >
    <TermsDefault :terms="terms || []" />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

// Componente principal
import TermsDefault from "@/components/TermsDefault.vue";

// Layout aplicado explícitamente con <NuxtLayout name="about"> en el template;
// layout: false evita que Nuxt aplique además el layout por defecto (doble wrap).
definePageMeta({
  layout: false,
});

// Cargar terms — useAsyncData integra con el ciclo SSR de Nuxt;
// el cache guard del store evita peticiones duplicadas.
const termsStore = useTermsStore();

const { data: terms } = await useAsyncData(
  "terms",
  async () => {
    await termsStore.loadTerms();
    return termsStore.terms || [];
  },
  { default: () => [], immediate: true, server: true },
);

$setSEO({
  title: "Condiciones de Uso",
  description:
    "Revisa las condiciones de uso de Waldo.click® para la publicación y compra de anuncios de activos industriales en nuestra plataforma.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/condiciones-de-uso`,
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Condiciones de Uso",
  description:
    "Revisa las condiciones de uso de Waldo.click® para la publicación y compra de anuncios de activos industriales en nuestra plataforma.",
  url: `${config.public.baseUrl}/condiciones-de-uso`,
});
</script>
