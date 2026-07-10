<template>
  <SecurityPoliciesDefault :security-policies="securityPolicies || []" />
</template>

<script setup lang="ts">
const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

import SecurityPoliciesDefault from "@/components/SecurityPoliciesDefault.vue";

definePageMeta({
  layout: "about",
});

const securityPoliciesStore = useSecurityPoliciesStore();

const { data: securityPolicies } = await useAsyncData(
  "security-policies",
  async () => {
    await securityPoliciesStore.loadSecurityPolicies();
    return securityPoliciesStore.securityPolicies || [];
  },
  { default: () => [], immediate: true, server: true },
);

$setSEO({
  title: "Política de Seguridad",
  description:
    "Conoce cómo Waldo.click® protege la información y qué hacemos frente a incidentes de ciberseguridad en nuestra plataforma de anuncios de activos industriales.",
  imageUrl: `${config.public.baseUrl}/images/share.jpg`,
  url: `${config.public.baseUrl}/politicas-de-seguridad`,
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Política de Seguridad",
  description:
    "Conoce cómo Waldo.click® protege la información y qué hacemos frente a incidentes de ciberseguridad en nuestra plataforma de anuncios de activos industriales.",
  url: `${config.public.baseUrl}/politicas-de-seguridad`,
});
</script>
