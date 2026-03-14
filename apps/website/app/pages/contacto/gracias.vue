<template>
  <div class="page">
    <MessageDefault
      type="success"
      title="¡Gracias!, Hemos recibido tu mensaje."
      description="Nos pondremos en contacto contigo a la brevedad posible. Revisa tu correo electrónico para más detalles."
      :button_show="true"
      button_label="Volver al inicio"
      button_link="/"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "about",
});

const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();
const appStore = useAppStore();
const { generateLead } = useAdAnalytics();

// Verificar si el formulario fue enviado
if (!appStore.getContactFormSent) {
  showError({
    statusCode: 404,
    message: "Página no encontrada",
    statusMessage: "La página que intentas acceder no existe",
  });
}

// Fire GA4 event before clearing state (guard is still true at this point)
generateLead();

// Limpiar el estado después de verificar
appStore.clearContactFormSent();

// Components
import MessageDefault from "@/components/MessageDefault.vue";
import { useAppStore } from "@/stores/app.store";

$setSEO({
  title: "Gracias por contactarnos",
  description:
    "Hemos recibido tu mensaje. Te responderemos lo antes posible. Gracias por confiar en Waldo.click®.",
  imageUrl: `${config.public.baseUrl}/thanks-share.jpg`,
  url: `${config.public.baseUrl}/gracias`,
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Gracias por contactarnos",
  url: `${config.public.baseUrl}/gracias`,
  description: "Hemos recibido tu mensaje. Gracias por confiar en nosotros.",
});
</script>
