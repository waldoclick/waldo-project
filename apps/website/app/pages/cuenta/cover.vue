<template>
  <div class="page">
    <AccountCover />
  </div>
</template>

<script setup lang="ts">
import AccountCover from "@/components/AccountCover.vue";
import type { User } from "@/types/user";

const user = useStrapiUser<User>();

// Validar si es usuario PRO
if (!user.value?.pro) {
  showError({
    statusCode: 403,
    message: "Función exclusiva para cuentas PRO",
    statusMessage:
      "Mejora tu experiencia en Waldo.click® con una cuenta PRO y personaliza tu perfil con una portada única. Destaca entre los demás vendedores y aumenta la visibilidad de tus anuncios.",
  });
}

const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Personalizar Portada",
  description:
    "Personaliza tu portada en Waldo.click®. Dale un toque único a tu perfil y destaca tus anuncios.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/cuenta/cover`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Personalizar Portada",
  url: `${config.public.baseUrl}/cuenta/cover`,
  description:
    "Personaliza tu portada en Waldo.click®. Dale un toque único a tu perfil y destaca tus anuncios.",
});
</script>
