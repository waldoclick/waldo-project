<template>
  <div class="page">
    <AccountAvatar />
  </div>
</template>

<script setup>
import AccountAvatar from "@/components/AccountAvatar.vue";

const user = useStrapiUser();

// Validar si es usuario PRO
if (!user.value?.pro) {
  showError({
    statusCode: 403,
    message: "Función exclusiva para cuentas PRO",
    description:
      "Destaca tu presencia con un avatar personalizado. Las cuentas PRO pueden subir su propia imagen de perfil para generar más confianza y reconocimiento en la comunidad.",
  });
}

const { $setSEO, $setStructuredData } = useNuxtApp();

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Personalizar Avatar",
  description:
    "Personaliza tu avatar en Waldo.click®. Crea una presencia única y profesional en la plataforma.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/cuenta/avatar",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Personalizar Avatar",
  url: "https://waldo.click/cuenta/avatar",
  description:
    "Personaliza tu avatar en Waldo.click®. Crea una presencia única y profesional en la plataforma.",
});
</script>
