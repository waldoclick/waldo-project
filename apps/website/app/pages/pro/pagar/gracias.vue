<template>
  <div class="page">
    <HeaderDefault :show-search="true" />
    <HeroFake />
    <ResumePro
      v-if="orderData"
      title="¡Pago recibido!"
      description="Tu suscripción PRO ha sido activada. Más abajo verás el comprobante de tu pago. Guarda esta información."
      :show-icon="true"
      :summary="prepareSummary(orderData)"
    />
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
const { $setSEO } = useNuxtApp();

import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";

import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroFake from "@/components/HeroFake.vue";
import ResumePro from "@/components/ResumePro.vue";
import FooterDefault from "@/components/FooterDefault.vue";

const route = useRoute();
const config = useRuntimeConfig();

interface OrderData {
  id?: number;
  documentId?: string;
  amount?: number;
  totalAmount?: number;
  currency?: string;
  status?: string;
  payment_type?: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt?: string;
  items?: Array<{ name: string; price: number; quantity: number }>;
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

const handleError = (type: "INVALID_URL" | "NOT_FOUND") => {
  const errorMessages = {
    INVALID_URL: {
      message: "Orden inválida",
      statusMessage:
        "No se recibió un ID de orden válido en la URL. Por favor vuelve e intenta nuevamente.",
    },
    NOT_FOUND: {
      message: "Orden no encontrada",
      statusMessage:
        "No pudimos encontrar la información de tu pago en nuestro sistema.",
    },
  };
  const errorConfig = errorMessages[type] || errorMessages.NOT_FOUND;
  showError({ statusCode: 404, ...errorConfig });
};

import { useOrderById } from "@/composables/useOrderById";
const { data, pending, error } = await useAsyncData(
  "pro-pagar-gracias",
  async (): Promise<OrderData | { error: string }> => {
    const documentId = route.query.order as string;
    if (!documentId) return { error: "INVALID_URL" };
    try {
      const order = await useOrderById(documentId);
      return order as OrderData;
    } catch {
      return { error: "NOT_FOUND" };
    }
  },
  { server: true, lazy: false },
);

const orderData = computed((): OrderData | null => {
  if (!data.value || "error" in data.value) return null;
  return data.value as OrderData;
});

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

const prepareSummary = (
  orderData: OrderData | null,
): Record<string, unknown> | undefined => {
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
  title: "Suscripción PRO Confirmada",
  description:
    "Tu suscripción PRO ha sido activada exitosamente en Waldo.click.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/pro/pagar/gracias`,
});
useSeoMeta({ robots: "noindex, nofollow" });

definePageMeta({
  middleware: ["auth", "pro"],
});
</script>
