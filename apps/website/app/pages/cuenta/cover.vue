<template>
  <div class="page">
    <AccountCover />
  </div>
</template>

<script setup>
import AccountCover from "@/components/AccountCover.vue";

const user = useStrapiUser();

// Validar si es usuario PRO
if (!user.value?.pro) {
  showError({
    statusCode: 403,
    message: "Función exclusiva para cuentas PRO",
    description:
      "Mejora tu experiencia en Waldo.click® con una cuenta PRO y personaliza tu perfil con una portada única. Destaca entre los demás vendedores y aumenta la visibilidad de tus anuncios.",
  });
}

const { $setSEO, $setStructuredData } = useNuxtApp();

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Personalizar Portada",
  description:
    "Personaliza tu portada en Waldo.click®. Dale un toque único a tu perfil y destaca tus anuncios.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/cuenta/cover",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Personalizar Portada",
  url: "https://waldo.click/cuenta/cover",
  description:
    "Personaliza tu portada en Waldo.click®. Dale un toque único a tu perfil y destaca tus anuncios.",
});
</script>
