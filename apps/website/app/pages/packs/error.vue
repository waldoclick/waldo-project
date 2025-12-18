<template>
  <div class="page">
    <HeaderDefault :show-search="true" />
    <HeroFake />
    <MessageDefault
      type="fail"
      title="Error en el pago"
      description="Hubo un problema al procesar tu pago. Por favor, intenta nuevamente."
      button_label="Volver a intentar"
      button_link="/packs"
      :button_show="true"
    />
    <FooterDefault />
  </div>
</template>

<script setup>
const { $setSEO, $setStructuredData } = useNuxtApp();

import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroFake from "@/components/HeroFake.vue";
import MessageDefault from "@/components/MessageDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";

$setSEO({
  title: "Error en el Pago",
  description:
    "Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/packs/error",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Error en el Pago - Waldo.click®",
  url: "https://waldo.click/packs/error",
  description:
    "Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.",
});

// Middleware
definePageMeta({
  middleware: "auth",
});
</script>
