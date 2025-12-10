<template>
  <FaqDefault
    :title="`Preguntas Frecuentes`"
    :text="`Encuentra respuestas a las preguntas más comunes sobre cómo funciona Waldo.click®, la plataforma para comprar y vender activos industriales.`"
    :is-left="true"
    title-tag="h1"
    :faqs="faqs || faqsData || []"
  />
</template>

<script setup lang="ts">
// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();

// Components
import FaqDefault from "@/components/FaqDefault";

// Definir layout
definePageMeta({
  layout: "about",
});

// Cargar FAQs asegurando que estén disponibles
const faqsStore = useFaqsStore();
// Primera llamada directa para tener FAQs inmediatamente
await faqsStore.loadFaqs();
const faqsData = faqsStore.faqs || [];

// Luego usamos useAsyncData para integrar con el ciclo de Nuxt
// y asegurarnos que tenemos la data más actualizada
const { data: faqs } = await useAsyncData(
  "faqs",
  async () => {
    // Forzamos una recarga completa para obtener todos los datos
    await faqsStore.loadFaqs();
    const result = faqsStore.faqs || [];
    return result;
  },
  {
    // Opciones para priorizar la carga
    immediate: true,
    server: true,
  },
);

// Combinamos ambos conjuntos de datos para asegurarnos tener todos
const allFaqs = [...(faqsData || []), ...(faqs.value || [])].filter(
  (faq, index, self) => index === self.findIndex((f) => f.id === faq.id),
);

// Datos para SEO - usamos todos los datos disponibles
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
  mainEntity: allFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.title,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.text,
    },
  })),
});
</script>
