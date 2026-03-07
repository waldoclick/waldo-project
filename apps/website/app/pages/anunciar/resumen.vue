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
    <BarAnnouncement
      :percentage="100"
      :show-steps="false"
      :summary-text="paymentSummaryText"
      :primary-label="primaryButtonLabel"
      @primary="confirmPay"
      @back="router.push('/anunciar?step=5')"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
const { Swal } = useSweetAlert2();
import { useAdStore } from "@/stores/ad.store";
import { useAdAnalytics } from "@/composables/useAdAnalytics";
import { useAdPaymentSummary } from "@/composables/useAdPaymentSummary";
import HeaderDefault from "@/components/HeaderDefault.vue";
import ResumeDefault from "@/components/ResumeDefault.vue";
import BarAnnouncement from "@/components/BarAnnouncement.vue";
import HeroFake from "@/components/HeroFake.vue";
import LoadingDefault from "@/components/LoadingDefault.vue";
const { create } = useStrapi();
const { fetchUser } = useStrapiAuth();

// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();

// Inicializar stores
const adStore = useAdStore();
const adAnalytics = useAdAnalytics();
const router = useRouter();
const { packPart, hasToPay, totalAmount, paymentSummaryText } =
  useAdPaymentSummary();

// Función para preparar el summary
const prepareSummary = (store) => {
  return {
    showEditLinks: true,
    pack: store.pack,
    featured: store.featured,
    isInvoice: store.is_invoice,
    paymentSummary: paymentSummaryText.value,
    paymentMethod: packPart.value?.label || null,
    totalAmount: totalAmount.value,
    hasToPay: hasToPay.value,
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

const primaryButtonLabel = computed(() =>
  hasToPay.value ? "Ir a pagar" : "Crear anuncio",
);

const swalCopy = computed(() => {
  if (hasToPay.value) {
    return {
      title: "¿Estás seguro?",
      text: "Tras realizar el pago, no será posible modificar el anuncio.",
      confirm: "Sí, proceder al pago",
    };
  }

  return {
    title: "¿Quieres crear el anuncio?",
    text: "Una vez creado el anuncio, no podrás modificarlo.",
    confirm: "Sí, crear el anuncio",
  };
});

$setSEO({
  title: "Resumen del Anuncio",
  description:
    "Consulta los detalles de tu anuncio antes de publicarlo en Waldo.click®. Asegúrate de que todo esté perfecto para destacar en el mercado de activos industriales.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/resumen-anuncio",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Resumen del Anuncio - Waldo.click®",
  url: "https://waldo.click/resumen-anuncio",
  description:
    "Consulta los detalles de tu anuncio antes de publicarlo en Waldo.click®. Asegúrate de que todo esté perfecto para destacar en el mercado de activos industriales.",
});

// Middleware
definePageMeta({
  middleware: "auth",
});

// onMounted: analytics-only — fires begin_checkout event; client-side only, non-blocking
onMounted(() => {
  adAnalytics.beginCheckout();
});

const confirmPay = async () => {
  const result = await Swal.fire({
    title: swalCopy.value.title,
    text: swalCopy.value.text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: swalCopy.value.confirm,
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    await handlePayClick();
  }
};

const handlePayClick = async () => {
  const allData = {
    pack: adStore.pack,
    featured: adStore.featured,
    is_invoice: adStore.is_invoice,
    ad: adStore.ad,
  };

  try {
    // Enviar evento de add_payment_info antes de procesar el pago
    adAnalytics.addPaymentInfo(allData);

    const response = await create("payments/ad", allData);

    if (response.data && response.data.webpay) {
      // Get ad_id from response and update store if exists
      const ad_id = response.data.ad?.id;
      if (ad_id) {
        adStore.updateAdId(ad_id);
      }
      handleRedirect(response.data.webpay);
    } else {
      // If no webpay, refresh user data and redirect to success page
      await fetchUser();
      router.push("/anunciar/gracias?ad=" + response.data.ad?.id);
    }
  } catch (error) {
    let errorMessage =
      "Hubo un problema al procesar el pago. Por favor, inténtalo de nuevo.";

    if (
      error.response?.data?.message === "No free featured credits available" ||
      error.message === "No free featured credits available"
    ) {
      errorMessage = "No tienes créditos destacados gratuitos disponibles";
    }

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
};

const handleRedirect = (response) => {
  // Crear un formulario dinámicamente
  const form = document.createElement("form");
  form.method = "POST";
  form.action = response.url;

  // Crear un campo de entrada para el token
  const tokenField = document.createElement("input");
  tokenField.type = "hidden";
  tokenField.name = "token_ws";
  tokenField.value = response.gatewayRef;
  form.appendChild(tokenField);

  // Añadir el formulario al cuerpo del documento y enviarlo
  document.body.appendChild(form);
  form.submit();
};
</script>
