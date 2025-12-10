<template>
  <div class="page">
    <AccountUsername />
  </div>
</template>

<script setup>
import AccountUsername from "@/components/AccountUsername.vue";

const user = useStrapiUser();

// Validar si es usuario PRO
if (!user.value?.pro) {
  showError({
    statusCode: 403,
    message: "Función exclusiva para cuentas PRO",
    description:
      "Personaliza tu nombre de usuario y construye tu marca personal con una cuenta PRO. Crea una identidad única y memorable para tus compradores potenciales.",
  });
}

const { $setSEO, $setStructuredData } = useNuxtApp();

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Personalizar Nombre de Usuario",
  description:
    "Personaliza tu nombre de usuario en Waldo.click®. Crea una identidad única y memorable para tu negocio.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/cuenta/username",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Personalizar Nombre de Usuario",
  url: "https://waldo.click/cuenta/username",
  description:
    "Personaliza tu nombre de usuario en Waldo.click®. Crea una identidad única y memorable para tu negocio.",
});
</script>
