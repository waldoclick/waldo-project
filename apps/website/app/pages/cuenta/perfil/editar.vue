<template>
  <div class="page">
    <AccountEdit />
  </div>
</template>

<script setup>
import AccountEdit from "@/components/AccountEdit.vue";

const { $setSEO, $setStructuredData } = useNuxtApp();

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Editar Perfil",
  description:
    "Edita tu perfil en Waldo.click®. Actualiza tu información personal y mantén tus datos al día.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/cuenta/perfil/editar",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Editar Perfil",
  url: "https://waldo.click/cuenta/perfil/editar",
  description:
    "Edita tu perfil en Waldo.click®. Actualiza tu información personal y mantén tus datos al día.",
});
</script>
