<template>
  <div class="page">
    <HeaderDefault :show-search="true" />
    <HeroFake />
    <ResumeOrder
      v-if="data"
      title="¡Pago recibido!"
      :description="`Tu pago Webpay fue procesado correctamente. Más abajo verás el comprobante de tu pago y los datos de tu orden (#${data.documentId || data.id || '--'}). Guarda este comprobante.`"
      :show-icon="true"
      :summary="prepareSummary(data)"
    />
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();

import { computed, watchEffect, ref } from "vue";
import { useAdsStore } from "@/stores/ads.store";
import { useRoute } from "vue-router";
import { useAdStore } from "@/stores/ad.store";
import { useAdAnalytics } from "~/composables/useAdAnalytics";

import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroFake from "@/components/HeroFake.vue";
import ResumeOrder from "@/components/ResumeOrder.vue";
import FooterDefault from "@/components/FooterDefault.vue";

// Inicializar stores y route
const route = useRoute();
const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;
const adStore = useAdStore();

// Analytics
const adAnalytics = useAdAnalytics();
const purchaseFired = ref(false);

// Función auxiliar para manejar errores
const handleError = (type: "INVALID_URL" | "NOT_FOUND") => {
  const errorMessages = {
    INVALID_URL: {
      message: "Orden inválida",
      statusMessage:
        "No se recibió un ID de orden válido en la URL. Por favor vuelve a la tienda e intenta nuevamente.",
    },
    NOT_FOUND: {
      message: "Orden no encontrada",
      statusMessage:
        "No pudimos encontrar la información de tu pago en nuestro sistema. Es posible que el pago no se haya completado correctamente. Si tienes dudas, contacta a soporte con tu comprobante Webpay.",
    },
  };
  const errorConfig = errorMessages[type] || errorMessages.NOT_FOUND;
  showError({
    statusCode: 404,
    ...errorConfig,
  });
};

// Cargar los datos del pedido (orden) de forma asíncrona
import { useOrderById } from "@/composables/useOrderById";
const { data, pending, error } = await useAsyncData(
  () => `gracias-${route.query.order}`,
  async () => {
    const documentId = route.query.order as string;
    if (!documentId) {
      return { error: "INVALID_URL" };
    }
    try {
      const order = await useOrderById(documentId);
      return order;
    } catch {
      return { error: "NOT_FOUND" };
    }
  },
  {
    server: true,
    lazy: false,
  },
);

// Manejar errores y limpiar store cuando los datos estén disponibles
watchEffect(() => {
  // Si hay un error de useAsyncData (lanzado con createError)
  if (error.value) {
    showError({
      statusCode: error.value.statusCode || 500,
      message: error.value.message || "Error inesperado",
      statusMessage:
        error.value.statusMessage ||
        error.value.message ||
        "Lo sentimos, ha ocurrido un error.",
    });
    return;
  }

  if (data.value && "error" in data.value) {
    handleError(
      data.value.error as "INVALID_URL" | "EXPIRED" | "NOT_FOUND",
      null,
    );
    return; // Salir temprano para evitar procesar datos con error
  } else if (data.value && !pending.value && !("error" in data.value)) {
    // No ad store to clean; order data loaded
    // TODO: If purchase analytics desired, use order/payment data here and update the event for order-centric analytics
    // (Left blank for now)
  }
});

const galleryData = computed(() => {
  if (!data.value || "error" in data.value || !data.value.gallery) return [];

  return data.value.gallery.map((image: any) => ({
    id: image.id,
    url: `${apiUrl}${image.formats?.thumbnail?.url}`,
  }));
});

// Prepara los campos requeridos por ResumeOrder.vue
const prepareSummary = (data: any): Record<string, any> | undefined => {
  if (!data) return undefined;
  return {
    documentId: data.documentId,
    amount: data.amount || data.totalAmount,
    currency: data.currency,
    status: data.status,
    paymentMethod: data.payment_type || data.paymentMethod,
    createdAt: data.paidAt || data.createdAt,
    receiptNumber:
      data.payment_response?.buy_order ||
      data.payment_response?.authorization_code ||
      "",
    email: data.user?.email || "",
    fullName: data.user?.fullName || data.user?.username || "",
    // New Webpay fields extracted from payment_response
    authorizationCode: data.payment_response?.authorization_code ?? undefined,
    paymentType:
      data.payment_response?.payment_type_code ??
      data.payment_type ??
      data.paymentMethod ??
      undefined,
    cardLast4: data.payment_response?.card_detail?.card_number ?? undefined,
    commerceCode: data.payment_response?.commerce_code ?? undefined,
  };
};

$setSEO({
  title: "Gracias por Publicar",
  description:
    "Tu anuncio ha sido publicado con éxito en Waldo.click®. Gracias por confiar en nosotros para conectar con compradores de activos industriales.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/pagar/gracias`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Gracias por Publicar - Waldo.click®",
  url: `${config.public.baseUrl}/pagar/gracias`,
  description:
    "Tu anuncio ha sido publicado con éxito en Waldo.click®. Gracias por confiar en nosotros para conectar con compradores de activos industriales.",
});

// Middleware
definePageMeta({
  middleware: "auth",
});
</script>

<style scoped></style>
