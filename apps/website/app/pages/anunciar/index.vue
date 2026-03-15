<template>
  <div class="page">
    <HeaderDefault />
    <CreateAd />
  </div>
</template>

<script setup lang="ts">
// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

// components
import HeaderDefault from "@/components/HeaderDefault.vue";
import CreateAd from "@/components/CreateAd.vue";
import { onMounted, watch } from "vue";
import { useAdAnalytics } from "~/composables/useAdAnalytics";
import { useAdStore } from "@/stores/ad.store";
import type { AnalyticsItem } from "@/stores/ad.store";
import type { Pack } from "@/types/pack";
import type { User } from "@/types/user";
import { useMeStore } from "@/stores/me.store";
import { useCategoriesStore } from "@/stores/categories.store";

// Analytics
const adAnalytics = useAdAnalytics();
const user = useStrapiUser<User>();
const adStore = useAdStore();

const meStore = useMeStore();
const categoriesStore = useCategoriesStore();

// Pre-load creation flow data for SSR — categories, packs, and me data
// must be available before components mount to avoid client-side flash
const client = useApiClient();
const { data: initData } = await useAsyncData(
  "anunciar-init",
  async () => {
    const packsResponse = (
      await Promise.all([
        meStore.loadMe(),
        categoriesStore.loadCategories(),
        client("ad-packs", {
          method: "GET",
          params: { populate: "*" } as unknown as Record<string, unknown>,
        }),
      ])
    )[2] as { data: Pack[] };
    return {
      packs: packsResponse.data ?? [],
    };
  },
  { default: () => ({ packs: [] as Pack[] }) },
);

// onMounted: analytics-only — GA4 view_item_list event must fire client-side
onMounted(() => {
  // Build analytics item list from pre-loaded packs store
  const analyticsItems: AnalyticsItem[] = [];

  // Add paid packs
  for (const pack of initData.value?.packs ?? []) {
    analyticsItems.push({
      item_id: pack.id,
      item_name: `Pack ${pack.total_ads} anuncios`,
      item_category: "Pack",
      price: pack.price,
      currency: "CLP",
    });
  }

  // Add free ad option if available
  if (user.value && (user.value.freeAdReservationsCount ?? 0) > 0) {
    analyticsItems.push({
      item_id: "free",
      item_name: "Anuncio gratuito",
      item_category: "Pack",
      price: 0,
      currency: "CLP",
    });
  }

  // Add paid reservation option if available
  if (user.value && (user.value.paidAdReservationsCount ?? 0) > 0) {
    analyticsItems.push({
      item_id: "paid",
      item_name: "Anuncio de pago (reserva)",
      item_category: "Pack",
      price: 0,
      currency: "CLP",
    });
  }

  // Add featured options
  if (user.value && (user.value.adFeaturedReservationsCount ?? 0) > 0) {
    analyticsItems.push({
      item_id: "featured_free",
      item_name: "Destacado gratuito",
      item_category: "Destacado",
      price: 0,
      currency: "CLP",
    });
  }

  analyticsItems.push(
    {
      item_id: "featured_paid",
      item_name: "Destacado",
      item_category: "Destacado",
      price: 10000,
      currency: "CLP",
    },
    {
      item_id: "featured_none",
      item_name: "Sin destacar",
      item_category: "Destacado",
      price: 0,
      currency: "CLP",
    },
  );

  // Fire view_item_list analytics event
  adAnalytics.viewItemList(analyticsItems);

  // Fire step 1 once on initial mount (not via watcher — avoids overcounting on back-navigation)
  adAnalytics.stepView(1, "Payment Method");
});

// Observar cambios en el pack seleccionado
watch(
  () => adStore.pack,
  (newPack, oldPack) => {
    if (newPack === oldPack) return;

    // Preparar datos para analytics
    const analyticsData = {
      item_id: newPack.toString(),
      item_name: "",
      item_category: "Pack",
      price: 0,
      currency: "CLP",
    };

    if (newPack === "free") {
      analyticsData.item_name = "Anuncio gratuito";
    } else if (newPack === "paid") {
      analyticsData.item_name = "Anuncio de pago (reserva)";
    } else {
      // Es un pack de los que vienen del store
      const selectedPack = (initData.value?.packs ?? []).find(
        (p) => p.id === newPack,
      );
      if (selectedPack) {
        analyticsData.item_name = `Pack ${selectedPack.total_ads} anuncios`;
        analyticsData.price = selectedPack.price;
      }
    }

    // Enviar evento
    adAnalytics.addToCartPack(analyticsData);
  },
  { immediate: true },
);

// Observar cambios en el featured seleccionado
watch(
  () => adStore.featured,
  (newFeatured, oldFeatured) => {
    if (newFeatured === oldFeatured) return;

    // Preparar datos para analytics
    const analyticsData = {
      item_id: "",
      item_name: "",
      item_category: "Destacado",
      price: 0,
      currency: "CLP",
    };

    if (newFeatured === "free") {
      analyticsData.item_id = "free_featured";
      analyticsData.item_name = "Destacado gratuito";
    } else if (newFeatured === true) {
      analyticsData.item_id = "paid_featured";
      analyticsData.item_name = "Destacado de pago";
      analyticsData.price = 10000;
    } else {
      analyticsData.item_id = "no_featured";
      analyticsData.item_name = "Sin destacar";
    }

    // Enviar evento
    adAnalytics.addToCartFeatured(analyticsData);
  },
  { immediate: true },
);

$setSEO({
  title: "Crear Anuncio",
  description:
    "Publica tus activos industriales de manera rápida y sencilla en Waldo.click®. Aumenta tu visibilidad y encuentra compradores fácilmente.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
  url: `${config.public.baseUrl}/crear-anuncio`,
});
useSeoMeta({ robots: "noindex, nofollow" });

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Crear Anuncio - Waldo.click®",
  url: `${config.public.baseUrl}/crear-anuncio`,
  description:
    "Publica tus activos industriales de manera rápida y sencilla en Waldo.click®. Aumenta tu visibilidad y encuentra compradores fácilmente.",
});

// Middleware
definePageMeta({
  middleware: "auth",
});
</script>
