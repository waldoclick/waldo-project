<template>
  <NuxtLayout
    name="about"
    title="Preguntas frecuentes"
    intro="Encuentra respuestas a las preguntas más comunes sobre cómo funciona Waldo, la plataforma para comprar y vender activos industriales."
    active="faq"
  >
    <FaqComplete :faqs="faqs || []" />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

// Components
import FaqComplete from "@/components/FaqComplete.vue";

// Layout aplicado explícitamente con <NuxtLayout name="about"> en el template;
// layout: false evita que Nuxt aplique además el layout por defecto (doble wrap).
definePageMeta({
  layout: false,
});

// Cargar FAQs — useAsyncData integra con el ciclo SSR de Nuxt;
// el cache guard del store evita peticiones duplicadas.
const faqsStore = useFaqsStore();

const { data: faqs } = await useAsyncData(
  "faqs",
  async () => {
    await faqsStore.loadFaqs();
    return faqsStore.faqs || [];
  },
  { immediate: true, server: true, default: () => [] },
);

// Datos para SEO
$setSEO({
  title: "Preguntas Frecuentes sobre Anuncios",
  description:
    "Resuelve tus dudas sobre cómo publicar y comprar anuncios de activos industriales en Waldo.click®. Respuestas rápidas sobre packs, pagos y más.",
  imageUrl: `${config.public.baseUrl}/images/share.jpg`,
  url: `${config.public.baseUrl}/preguntas-frecuentes`,
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  name: "Preguntas Frecuentes sobre Anuncios",
  description:
    "Resuelve tus dudas sobre cómo publicar y comprar anuncios de activos industriales en Waldo.click®. Respuestas rápidas sobre packs, pagos y más.",
  url: `${config.public.baseUrl}/preguntas-frecuentes`,
  mainEntity: (faqs.value || []).map((faq) => ({
    "@type": "Question",
    name: faq.title,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.text,
    },
  })),
});
</script>
