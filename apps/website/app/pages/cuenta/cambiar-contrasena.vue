<template>
  <div class="page">
    <AccountPassword />
  </div>
</template>

<script setup>
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

definePageMeta({
  layout: "account",
  middleware: "auth",
});

$setSEO({
  title: "Cambiar Contraseña",
  description:
    "Cambia tu contraseña en Waldo.click®. Mantén tu cuenta segura actualizando tus credenciales.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/cuenta/cambiar-contrasena",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Cambiar Contraseña",
  url: "https://waldo.click/cuenta/cambiar-contrasena",
  description:
    "Cambia tu contraseña en Waldo.click®. Mantén tu cuenta segura actualizando tus credenciales.",
});
</script>
