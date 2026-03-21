<template>
  <div class="page">
    <AccountUsername />
  </div>
</template>

<script setup lang="ts">
import AccountUsername from "@/components/AccountUsername.vue";
import type { User } from "@/types/user";

const user = useStrapiUser<User>();

// Validar si es usuario PRO
if (user.value?.pro_status !== "active") {
  showError({
    statusCode: 403,
    message: "Función exclusiva para cuentas PRO",
    statusMessage:
      "Personaliza tu nombre de usuario y construye tu marca personal con una cuenta PRO. Crea una identidad única y memorable para tus compradores potenciales.",
  });
}

const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Personalizar Nombre de Usuario",
  description:
    "Personaliza tu nombre de usuario en Waldo.click®. Crea una identidad única y memorable para tu negocio.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/cuenta/username`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Personalizar Nombre de Usuario",
  url: `${config.public.baseUrl}/cuenta/username`,
  description:
    "Personaliza tu nombre de usuario en Waldo.click®. Crea una identidad única y memorable para tu negocio.",
});
</script>
