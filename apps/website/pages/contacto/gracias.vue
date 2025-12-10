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

<script setup>
definePageMeta({
  layout: "about",
});

const { $setSEO, $setStructuredData } = useNuxtApp();
const appStore = useAppStore();

// Verificar si el formulario fue enviado
if (!appStore.getContactFormSent) {
  showError({
    statusCode: 404,
    message: "Página no encontrada",
    description: "La página que intentas acceder no existe",
  });
}

// Limpiar el estado después de verificar
appStore.clearContactFormSent();

// Components
import MessageDefault from "@/components/MessageDefault.vue";
import { useAppStore } from "@/stores/app.store";

$setSEO({
  title: "Gracias por contactarnos",
  description:
    "Hemos recibido tu mensaje. Te responderemos lo antes posible. Gracias por confiar en Waldo.click®.",
  imageUrl: "https://waldo.click/thanks-share.jpg",
  url: "https://waldo.click/gracias",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Gracias por contactarnos",
  url: "https://waldo.click/gracias",
  description: "Hemos recibido tu mensaje. Gracias por confiar en nosotros.",
});
</script>
