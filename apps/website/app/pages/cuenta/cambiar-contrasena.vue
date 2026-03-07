<template>
  <div class="page">
    <MemoDefault
      v-if="isExternalProvider"
      :icon="ShieldOff"
      text="No puedes cambiar tu contraseña porque iniciaste sesión con Google u otro proveedor externo."
      link="/cuenta"
      button-text="Volver a mi cuenta"
    />
    <AccountPassword v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ShieldOff } from "lucide-vue-next";
import AccountPassword from "@/components/AccountPassword.vue";
import MemoDefault from "@/components/MemoDefault.vue";

const user = useStrapiUser();

// Show in-page message instead of throwing a Nuxt error when user
// authenticated via an external provider (Google, Facebook, etc.)
const isExternalProvider = computed(() => user.value?.provider !== "local");

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
