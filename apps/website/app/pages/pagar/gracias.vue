<template>
  <div class="page">
    <HeaderDefault :show-search="true" />
    <HeroFake />
    <!-- Para anuncios de pago: mostrar comprobante de orden -->
    <ResumeOrder
      v-if="orderData"
      title="¡Pago recibido!"
      description="Tu pago Webpay fue procesado correctamente. Más abajo verás el comprobante de tu pago. Guarda esta información."
      :show-icon="true"
      :summary="prepareSummary(orderData)"
    />
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();

import { computed, watchEffect, ref, watch, onMounted } from "vue";
import { useAdsStore } from "@/stores/ads.store";
import { useRoute } from "vue-router";
import { useAdStore } from "@/stores/ad.store";
import {
  useAdAnalytics,
  type PurchaseOrderData,
} from "~/composables/useAdAnalytics";

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

onMounted(() => {
  adStore.clearAll();
});

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

// Tipo temporal para la orden hasta que se defina en types/
interface OrderData {
  documentId?: string;
  id?: string;
  amount?: number;
  totalAmount?: number;
  currency?: string;
  status?: string;
  payment_type?: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt?: string;
  payment_response?: {
    buy_order?: string;
    authorization_code?: string;
    payment_type_code?: string;
    card_detail?: {
      card_number?: string;
    };
    commerce_code?: string;
  };
  user?: {
    email?: string;
    fullName?: string;
    username?: string;
  };
}

// Cargar los datos del pedido (orden) de forma asíncrona
import { useOrderById } from "@/composables/useOrderById";
const { data, pending, error } = await useAsyncData(
  "pagar-gracias",
  async (): Promise<OrderData | { error: string }> => {
    const documentId = route.query.order as string;
    if (!documentId) {
      return { error: "INVALID_URL" };
    }
    try {
      const order = await useOrderById(documentId);
      return order as OrderData;
    } catch {
      return { error: "NOT_FOUND" };
    }
  },
  {
    server: true,
    lazy: false,
  },
);

// Computed para obtener los datos de la orden con el tipo correcto
const orderData = computed((): OrderData | null => {
  if (!data.value || "error" in data.value) return null;
  return data.value as OrderData;
});

// Fire purchase event once when order data is available, BEFORE clearing store.
// Using watch with { immediate: true } handles both SSR hydration (data already populated)
// and lazy-loaded cases (data arrives after mount). purchaseFired guard prevents double-fire.
watch(
  orderData,
  (order) => {
    if (order && !purchaseFired.value) {
      purchaseFired.value = true;
      adAnalytics.purchase(order as PurchaseOrderData);
    }
  },
  { immediate: true },
);

// Manejar errores cuando los datos estén disponibles
watchEffect(() => {
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
    handleError(data.value.error as "INVALID_URL" | "NOT_FOUND");
  }
});

// Orders don't have gallery - that was from the ad
// If you need to show ad gallery, you would need to populate the ad relation in the order

// Prepara los campos requeridos por ResumeOrder.vue
const prepareSummary = (
  orderData: OrderData | null,
): Record<string, any> | undefined => {
  if (!orderData) return undefined;
  return {
    documentId: orderData.documentId,
    amount: orderData.amount || orderData.totalAmount,
    currency: orderData.currency,
    status: orderData.status,
    paymentMethod: orderData.payment_type || orderData.paymentMethod,
    createdAt: orderData.paidAt || orderData.createdAt,
    receiptNumber:
      orderData.payment_response?.buy_order ||
      orderData.payment_response?.authorization_code ||
      "",
    email: orderData.user?.email || "",
    fullName: orderData.user?.fullName || orderData.user?.username || "",
    // New Webpay fields extracted from payment_response
    authorizationCode:
      orderData.payment_response?.authorization_code ?? undefined,
    paymentType:
      orderData.payment_response?.payment_type_code ??
      orderData.payment_type ??
      orderData.paymentMethod ??
      undefined,
    cardLast4:
      orderData.payment_response?.card_detail?.card_number ?? undefined,
    commerceCode: orderData.payment_response?.commerce_code ?? undefined,
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
