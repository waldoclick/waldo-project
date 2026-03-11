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
      :summary="prepareSummary()"
    />
    <BarAnnouncement
      :percentage="100"
      :show-steps="false"
      :summary-text="paymentSummaryText"
      :primary-label="primaryButtonLabel"
      @primary="confirmPay"
      @back="router.push('/anunciar/galeria-de-imagenes')"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
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
const config = useRuntimeConfig();

// Inicializar stores
const adStore = useAdStore();
const adAnalytics = useAdAnalytics();
const router = useRouter();
const { packPart, hasToPay, totalAmount, paymentSummaryText } =
  useAdPaymentSummary();

// Función para preparar el summary
const prepareSummary = () => {
  return {
    showEditLinks: true,
    pack: adStore.pack,
    featured: adStore.featured,
    isInvoice: adStore.is_invoice,
    paymentSummary: paymentSummaryText.value,
    paymentMethod: packPart.value?.label || null,
    totalAmount: totalAmount.value,
    hasToPay: hasToPay.value,
    title: adStore.ad.name,
    category: adStore.ad.category,
    price: adStore.ad.price,
    currency: adStore.ad.currency,
    description: adStore.ad.description,
    email: adStore.ad.email,
    phone: adStore.ad.phone,
    commune: adStore.ad.commune,
    address: adStore.ad.address,
    addressNumber: adStore.ad.address_number,
    condition: adStore.ad.condition,
    manufacturer: adStore.ad.manufacturer,
    model: adStore.ad.model,
    serialNumber: adStore.ad.serial_number,
    year: adStore.ad.year,
    weight: adStore.ad.weight,
    width: adStore.ad.width,
    height: adStore.ad.height,
    depth: adStore.ad.depth,
    gallery: adStore.ad.gallery,
  };
};

const primaryButtonLabel = computed(() =>
  hasToPay.value ? "Ir a pagar" : "Crear anuncio",
);

// Solo se usa para anuncios gratuitos ahora
const swalCopy = computed(() => {
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
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/resumen-anuncio`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Resumen del Anuncio - Waldo.click®",
  url: `${config.public.baseUrl}/resumen-anuncio`,
  description:
    "Consulta los detalles de tu anuncio antes de publicarlo en Waldo.click®. Asegúrate de que todo esté perfecto para destacar en el mercado de activos industriales.",
});

// Middleware
definePageMeta({
  middleware: "auth",
});

// onMounted: load packs for price calculation and fire begin_checkout event; client-side only, non-blocking
onMounted(async () => {
  // Load packs if needed for price calculation
  const { loadPacks } = usePacksList();
  await loadPacks();

  adAnalytics.beginCheckout();
});

const confirmPay = async () => {
  // Si hay que pagar, guardar draft y navegar directo a pagar sin confirmación
  if (hasToPay.value) {
    try {
      const draftResponse = await create<{ id: number }>("ads/save-draft", {
        ad: adStore.ad,
      } as unknown as Parameters<typeof create>[1]);
      adStore.updateAdId(draftResponse.data.id);
      router.push("/pagar");
    } catch {
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al guardar el anuncio. Por favor, inténtalo de nuevo.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
    return;
  }

  // Si es gratuito, mostrar confirmación antes de crear
  const result = await Swal.fire({
    title: swalCopy.value.title,
    text: swalCopy.value.text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: swalCopy.value.confirm,
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      const draftResponse = await create<{ id: number }>("ads/save-draft", {
        ad: adStore.ad,
      } as unknown as Parameters<typeof create>[1]);
      adStore.updateAdId(draftResponse.data.id);
      await handleFreeCreation();
    } catch {
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al guardar el anuncio. Por favor, inténtalo de nuevo.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  }
};

const handleFreeCreation = async () => {
  try {
    adAnalytics.addPaymentInfo();

    // Process free ad using the dedicated endpoint
    const freeAdResponse = await create<{ ad?: { id: number } }>(
      "payments/free-ad",
      { ad_id: adStore.ad.ad_id, pack: adStore.pack } as unknown as Parameters<
        typeof create
      >[1],
    );

    await fetchUser();
    router.push(
      "/pagar/gracias?ad=" + (freeAdResponse.data.ad?.id ?? adStore.ad.ad_id),
    );
  } catch (error: unknown) {
    let errorMessage =
      "Hubo un problema al procesar tu anuncio. Por favor, inténtalo de nuevo.";

    const apiMessage =
      (error as { response?: { data?: { message?: string } } }).response?.data
        ?.message || (error as { message?: string }).message;

    if (apiMessage === "No free reservation available") {
      errorMessage = "No tienes créditos gratuitos disponibles";
    } else if (apiMessage === "No paid reservation available") {
      errorMessage = "No tienes reservas pagadas disponibles";
    }

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
};
</script>
