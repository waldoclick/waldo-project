<template>
  <div class="page">
    <AccountAvatar />
  </div>
</template>

<script setup lang="ts">
import AccountAvatar from "@/components/AccountAvatar.vue";
import type { User } from "@/types/user";

const user = useStrapiUser<User>();

// Validar si es usuario PRO
if (!user.value?.pro) {
  showError({
    statusCode: 403,
    message: "Función exclusiva para cuentas PRO",
    statusMessage:
      "Destaca tu presencia con un avatar personalizado. Las cuentas PRO pueden subir su propia imagen de perfil para generar más confianza y reconocimiento en la comunidad.",
  });
}

const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Personalizar Avatar",
  description:
    "Personaliza tu avatar en Waldo.click®. Crea una presencia única y profesional en la plataforma.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/cuenta/avatar`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Personalizar Avatar",
  url: `${config.public.baseUrl}/cuenta/avatar`,
  description:
    "Personaliza tu avatar en Waldo.click®. Crea una presencia única y profesional en la plataforma.",
});
</script>
