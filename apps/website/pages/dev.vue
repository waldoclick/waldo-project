<template>
  <div class="page">
    <div class="auth">
      <div class="auth__introduce">
        <IntroduceAuth :title="title" :subtitle="subtitle" :list="list" />
      </div>
      <div class="auth__form">
        <div class="auth__form__inner">
          <h1 class="auth__form__title title">Acceso Restringido</h1>
          <div class="auth__form__fields">
            <FormDev />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import FormDev from "@/components/FormDev.vue";

// Import the image
import mobileMenuClose from "/images/mobile-menu-close.svg";

const title = "Acceso Restringido<br>Modo Desarrollo";
const subtitle =
  "El sitio está en mantenimiento.<br>Para continuar necesitas autenticarte:";
const list = [
  "El acceso al sitio está restringido temporalmente.",
  "Solo usuarios autorizados pueden navegar por el sitio.",
  "Los motores de búsqueda pueden acceder libremente al contenido.",
  "Contacta al administrador si necesitas acceso.",
];

// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();

$setSEO({
  title: "Acceso Restringido - Modo Desarrollo",
  description:
    "El sitio Waldo.click® está en modo desarrollo. El acceso está restringido temporalmente y solo usuarios autorizados pueden navegar por el sitio.",
  imageUrl: "https://waldo.click/share.jpg",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Acceso Restringido - Modo Desarrollo",
  description:
    "El sitio Waldo.click® está en modo desarrollo. El acceso está restringido temporalmente y solo usuarios autorizados pueden navegar por el sitio.",
  url: "https://waldo.click/dev",
});

definePageMeta({
  middleware: ["guest"],
});
</script>
