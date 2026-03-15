<template>
  <div class="page">
    <HeaderDefault :show-search="true" />
    <HeroFake />
    <ResumeDefault
      v-if="adData"
      :show-icon="true"
      :hide-payment-section="true"
      title="¡Anuncio creado!"
      description="Tu anuncio ha sido enviado para revisión. Te notificaremos por correo cuando esté publicado."
      :summary="prepareAdSummary(adData)"
    />
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
import { watchEffect, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useAdStore } from "@/stores/ad.store";
import {
  useAdAnalytics,
  type PurchaseOrderData,
} from "~/composables/useAdAnalytics";

import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroFake from "@/components/HeroFake.vue";
import ResumeDefault from "@/components/ResumeDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";

const route = useRoute();
const client = useApiClient();
const adStore = useAdStore();

onMounted(() => {
  adStore.reset();
});

// Middleware
definePageMeta({
  middleware: "auth",
});

useSeoMeta({ robots: "noindex, nofollow" });

const { data, error } = await useAsyncData(
  "anunciar-gracias",
  async (): Promise<Record<string, unknown> | { error: string }> => {
    const documentId = route.query.ad as string;
    if (!documentId) {
      return { error: "INVALID_URL" };
    }
    try {
      const { data: ad } = await strapi.findOne("ads", documentId, {
        populate: "*",
      } as unknown as Parameters<typeof strapi.findOne>[2]);
      if (!ad) {
        return { error: "NOT_FOUND" };
      }
      return ad as Record<string, unknown>;
    } catch {
      return { error: "NOT_FOUND" };
    }
  },
  {
    server: true,
    lazy: false,
    default: () => null,
  },
);

// Computed for ad data with correct type
const adData = computed((): Record<string, unknown> | null => {
  if (!data.value || "error" in data.value) return null;
  return data.value as Record<string, unknown>;
});

// Analytics: fire purchase event once when ad data is available
// Mirrors pagar/gracias.vue pattern — purchaseFired guard prevents double-fire on SSR hydration
const adAnalytics = useAdAnalytics();
const purchaseFired = ref(false);

watch(
  adData,
  (ad) => {
    if (ad && !purchaseFired.value) {
      purchaseFired.value = true;
      const freeAdOrder: PurchaseOrderData = {
        documentId: (ad.documentId as string) ?? (route.query.ad as string),
        amount: 0,
        currency: (ad.currency as string) ?? "CLP",
      };
      adAnalytics.purchase(freeAdOrder);
    }
  },
  { immediate: true },
);

// Handle errors via watchEffect
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
    const errorType = (data.value as { error: string }).error;
    if (errorType === "INVALID_URL") {
      showError({
        statusCode: 404,
        message: "URL inválida",
        statusMessage:
          "No se recibió un ID de anuncio válido en la URL. Por favor vuelve e intenta nuevamente.",
      });
    } else {
      showError({
        statusCode: 404,
        message: "Anuncio no encontrado",
        statusMessage:
          "No pudimos encontrar la información de tu anuncio. Si tienes dudas, contacta a soporte.",
      });
    }
  }
});

const prepareAdSummary = (ad: Record<string, unknown>) => ({
  showEditLinks: false,
  title: ad.name,
  category: (ad.category as { id?: unknown })?.id ?? ad.category,
  price: ad.price,
  currency: ad.currency,
  description: ad.description,
  email: ad.email,
  phone: ad.phone,
  commune: (ad.commune as { id?: unknown })?.id ?? ad.commune,
  address: ad.address,
  addressNumber: ad.address_number,
  condition: (ad.condition as { id?: unknown })?.id ?? ad.condition,
  manufacturer: ad.manufacturer,
  model: ad.model,
  serialNumber: ad.serial_number,
  year: ad.year,
  weight: ad.weight,
  width: ad.width,
  height: ad.height,
  depth: ad.depth,
  gallery: ad.gallery,
  hasToPay: false,
});
</script>

<style scoped></style>
