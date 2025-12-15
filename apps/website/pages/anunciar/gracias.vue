<template>
  <div class="page">
    <HeaderDefault :show-search="true" />
    <HeroFake />
    <!-- <pre>{{ prepareSummary(data) }}</pre> -->
    <ResumeDefault
      v-if="data"
      title="¡Listo!, Creaste tu anuncio con éxito."
      description="Ahora debes esperar que tu anuncio pase por nuestra revisión, te avisaremos a tu correo electrónico cuando sea publicado."
      :show-icon="true"
      :summary="prepareSummary(data)"
    />
    <FooterDefault />
  </div>
</template>

<script setup>
// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();

import { computed, watchEffect } from "vue";
import { useAdsStore } from "@/stores/ads.store";
import { useRoute } from "vue-router";
import { useAdStore } from "@/stores/ad.store";
import { useAdAnalytics } from "~/composables/useAdAnalytics";

import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroFake from "@/components/HeroFake.vue";
import ResumeDefault from "@/components/ResumeDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";

// Inicializar stores y route
const route = useRoute();
const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;
const adStore = useAdStore();

// Analytics
const adAnalytics = useAdAnalytics();

// Función auxiliar para manejar errores
const handleError = (type, updatedAt = null) => {
  const errorMessages = {
    INVALID_URL: {
      message: "URL inválida",
      description: "La URL que intentas acceder no es válida",
    },
    EXPIRED: {
      message: "Resumen expirado",
      description: "El tiempo para ver el resumen de tu anuncio ha expirado",
    },
    NOT_FOUND: {
      message: "Anuncio no encontrado",
      description: "No pudimos encontrar el anuncio que buscas",
    },
  };

  const errorConfig = errorMessages[type] || errorMessages.NOT_FOUND;

  showError({
    statusCode: 404,
    ...errorConfig,
  });
};

// Cargar los datos del anuncio de forma asíncrona
const { data, pending, error } = await useAsyncData(
  "adData",
  async () => {
    if (!route.query.ad) {
      return { error: "INVALID_URL" };
    }

    const adsStore = useAdsStore();
    let response;

    try {
      response = await adsStore.loadAdById(route.query.ad);
    } catch {
      return { error: "NOT_FOUND" };
    }

    if (!response || !response.updatedAt) {
      return { error: "NOT_FOUND" };
    }

    // Verificar si el anuncio está expirado (remaining_days === 0)
    // Esto debe hacerse ANTES de procesar los datos para evitar errores de serialización en Pinia
    if (response.remaining_days === 0) {
      throw createError({
        statusCode: 403,
        message: "Resumen expirado",
        description: "El tiempo para ver el resumen de tu anuncio ha expirado",
      });
    }

    // Verificar el tiempo transcurrido basado en la última actualización
    const updatedAt = new Date(response.updatedAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now - updatedAt) / (1000 * 60));

    if (diffInMinutes > 10) {
      throw createError({
        statusCode: 403,
        message: "Resumen expirado",
        description: "El tiempo para ver el resumen de tu anuncio ha expirado",
      });
    }

    return response;
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
      description:
        error.value.description ||
        error.value.message ||
        "Lo sentimos, ha ocurrido un error.",
    });
    return;
  }

  if (data.value?.error) {
    handleError(data.value.error, data.value.updatedAt);
    return; // Salir temprano para evitar procesar datos con error
  } else if (data.value && !pending.value && !data.value.error) {
    // Limpiar el store solo cuando los datos se hayan cargado exitosamente
    adStore.clearAll();

    // Enviar evento de purchase
    const items = [];
    if (data.value.details.pack) {
      items.push({
        item_id: data.value.details.pack,
        item_name: `Pack ${data.value.details.pack}`,
        item_category: "Pack",
        price:
          data.value.details.pack === "free"
            ? 0
            : data.value.details.pack_price,
        currency: "CLP",
      });
    }
    if (data.value.details.featured) {
      items.push({
        item_id: data.value.details.featured ? "featured" : "not_featured",
        item_name: data.value.details.featured ? "Destacado" : "Sin destacar",
        item_category: "Destacado",
        price: data.value.details.featured ? 10000 : 0,
        currency: "CLP",
      });
    }

    adAnalytics.pushEvent("purchase", items, {
      transaction_id: data.value.id,
      value: items.reduce((total, item) => total + (item.price || 0), 0),
      currency: "CLP",
    });
  }
});

const galleryData = computed(() => {
  if (!data.value?.gallery) return [];

  return data.value.gallery.map((image) => ({
    id: image.id,
    url: `${apiUrl}${image.formats?.thumbnail?.url}`,
  }));
});

// Función para preparar el summary
const prepareSummary = (data) => {
  if (!data) return null;

  return {
    showEditLinks: false,
    pack: data.details.pack,
    featured: data.details.featured,
    isInvoice: data.details.is_invoice,
    title: data.name,
    category: data.category.id,
    price: data.price,
    currency: data.currency,
    description: data.description,
    email: data.email,
    phone: data.phone,
    commune: data.commune.id,
    address: data.address,
    addressNumber: data.address_number,
    condition: data.condition.id,
    manufacturer: data.manufacturer,
    model: data.model,
    serialNumber: data.serial_number,
    year: data.year,
    weight: data.weight,
    width: data.width,
    height: data.height,
    depth: data.depth,
    gallery: data.gallery,
  };
};

$setSEO({
  title: "Gracias por Publicar",
  description:
    "Tu aviso ha sido publicado con éxito en Waldo.click®. Gracias por confiar en nosotros para conectar con compradores de activos industriales.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/gracias",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Gracias por Publicar - Waldo.click®",
  url: "https://waldo.click/gracias",
  description:
    "Tu aviso ha sido publicado con éxito en Waldo.click®. Gracias por confiar en nosotros para conectar con compradores de activos industriales.",
});

// Middleware
definePageMeta({
  middleware: "auth",
});
</script>

<style scoped></style>
