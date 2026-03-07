<template>
  <FaqDefault
    :title="`Preguntas Frecuentes`"
    :text="`Encuentra respuestas a las preguntas más comunes sobre cómo funciona Waldo.click®, la plataforma para comprar y vender activos industriales.`"
    :is-left="true"
    title-tag="h1"
    :faqs="faqs || []"
  />
</template>

<script setup lang="ts">
// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();

// Components
import FaqDefault from "@/components/FaqDefault.vue";

// Definir layout
definePageMeta({
  layout: "about",
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
  { immediate: true, server: true },
);

// Datos para SEO
$setSEO({
  title: "Preguntas Frecuentes",
  description:
    "Resuelve tus dudas sobre cómo funciona Waldo.click®, la plataforma para comprar y vender activos industriales.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/preguntas-frecuentes",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  name: "Preguntas Frecuentes",
  description:
    "Resuelve tus dudas sobre cómo funciona Waldo.click®, la plataforma para comprar y vender activos industriales.",
  url: "https://waldo.click/preguntas-frecuentes",
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
