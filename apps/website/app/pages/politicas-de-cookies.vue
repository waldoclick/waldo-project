<template>
  <CookiePoliciesDefault :cookie-policies="cookiePolicies || []" />
</template>

<script setup lang="ts">
const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

import CookiePoliciesDefault from "@/components/CookiePoliciesDefault.vue";

definePageMeta({
  layout: "about",
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
