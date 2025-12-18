<template>
  <div class="page">
    <HeaderDefault :show-search="true" />
    <HeroFake />
    <LoadingDefault
      v-if="!adStore.ad || Object.keys(adStore.ad).length === 0"
    />
    <ResumeDefault
      v-else
      :show-icon="false"
      title="Revisa y confirma tu publicación"
      :summary="prepareSummary(adStore)"
    />
    <BarResume @error="isError = $event" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAdStore } from "@/stores/ad.store";
import { useAdAnalytics } from "@/composables/useAdAnalytics";
import HeaderDefault from "@/components/HeaderDefault.vue";
import ResumeDefault from "@/components/ResumeDefault.vue";
import BarResume from "@/components/BarResume.vue";
import HeroFake from "@/components/HeroFake.vue";
import LoadingDefault from "@/components/LoadingDefault.vue";

// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();

// Inicializar stores
const adStore = useAdStore();
const adAnalytics = useAdAnalytics();

// Función para preparar el summary
const prepareSummary = (store) => {
  return {
    showEditLinks: true,
    pack: store.pack,
    featured: store.featured,
    isInvoice: store.is_invoice,
    title: store.ad.name,
    category: store.ad.category,
    price: store.ad.price,
    currency: store.ad.currency,
    description: store.ad.description,
    email: store.ad.email,
    phone: store.ad.phone,
    commune: store.ad.commune,
    address: store.ad.address,
    addressNumber: store.ad.address_number,
    condition: store.ad.condition,
    manufacturer: store.ad.manufacturer,
    model: store.ad.model,
    serialNumber: store.ad.serial_number,
    year: store.ad.year,
    weight: store.ad.weight,
    width: store.ad.width,
    height: store.ad.height,
    depth: store.ad.depth,
    gallery: store.ad.gallery,
  };
};

const error = ref(false);

$setSEO({
  title: "Resumen del Aviso",
  description:
    "Consulta los detalles de tu aviso antes de publicarlo en Waldo.click®. Asegúrate de que todo esté perfecto para destacar en el mercado de activos industriales.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/resumen-aviso",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Resumen del Aviso - Waldo.click®",
  url: "https://waldo.click/resumen-aviso",
  description:
    "Consulta los detalles de tu aviso antes de publicarlo en Waldo.click®. Asegúrate de que todo esté perfecto para destacar en el mercado de activos industriales.",
});

// Middleware
definePageMeta({
  middleware: "auth",
});

// Enviar evento de begin_checkout cuando se monte el componente
onMounted(() => {
  adAnalytics.beginCheckout();
});
</script>
