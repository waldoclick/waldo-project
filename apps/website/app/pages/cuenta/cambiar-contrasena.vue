<template>
  <div class="page">
    <AccountPassword />
  </div>
</template>

<script setup lang="ts">
import AccountPassword from "@/components/AccountPassword.vue";

const user = useStrapiUser();

// Validar el provider del usuario
if (user.value?.provider !== "email") {
  showError({
    statusCode: 403,
    message:
      "No puedes cambiar tu contraseña, porque has iniciado sesión con Google",
  });
}

const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Cambiar Contraseña",
  description:
    "Cambia tu contraseña en Waldo.click®. Mantén tu cuenta segura actualizando tus credenciales.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/cuenta/cambiar-contrasena`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Cambiar Contraseña",
  url: `${config.public.baseUrl}/cuenta/cambiar-contrasena`,
  description:
    "Cambia tu contraseña en Waldo.click®. Mantén tu cuenta segura actualizando tus credenciales.",
});
</script>
