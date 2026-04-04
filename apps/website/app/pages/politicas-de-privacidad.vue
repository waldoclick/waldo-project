<template>
  <PoliciesDefault :policies="policies || []" />
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

// Cargar policies — useAsyncData integra con el ciclo SSR de Nuxt;
// el cache guard del store evita peticiones duplicadas.
const policiesStore = usePoliciesStore();

const { data: policies } = await useAsyncData(
  "policies",
  async () => {
    await policiesStore.loadPolicies();
    return policiesStore.policies || [];
  },
  { default: () => [], immediate: true, server: true },
);

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
