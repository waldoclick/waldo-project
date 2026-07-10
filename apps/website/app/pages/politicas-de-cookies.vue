<template>
  <NuxtLayout
    name="about"
    title="Políticas de cookies"
    intro="Aquí te explicamos qué cookies usa Waldo.click®, para qué sirven y qué control tienes sobre ellas."
    active="cookies"
  >
    <CookiePoliciesDefault :cookie-policies="cookiePolicies || []" />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

import CookiePoliciesDefault from "@/components/CookiePoliciesDefault.vue";

// Layout aplicado explícitamente con <NuxtLayout name="about"> en el template
// (con title/intro para el hero); layout: false evita el doble wrap.
definePageMeta({
  layout: false,
});

const cookiePoliciesStore = useCookiePoliciesStore();

const { data: cookiePolicies } = await useAsyncData(
  "cookie-policies",
  async () => {
    await cookiePoliciesStore.loadCookiePolicies();
    return cookiePoliciesStore.cookiePolicies || [];
  },
  { default: () => [], immediate: true, server: true },
);

$setSEO({
  title: "Política de Cookies",
  description:
    "Conoce qué cookies usa Waldo.click®, para qué sirven y cómo puedes gestionarlas al usar nuestra plataforma de anuncios de activos industriales.",
  imageUrl: `${config.public.baseUrl}/images/share.jpg`,
  url: `${config.public.baseUrl}/politicas-de-cookies`,
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Política de Cookies",
  description:
    "Conoce qué cookies usa Waldo.click®, para qué sirven y cómo puedes gestionarlas al usar nuestra plataforma de anuncios de activos industriales.",
  url: `${config.public.baseUrl}/politicas-de-cookies`,
});
</script>
