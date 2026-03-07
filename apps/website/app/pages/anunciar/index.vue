<template>
  <div class="page">
    <HeaderDefault />
    <CreateAd />
  </div>
</template>

<script setup lang="ts">
// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();

// components
import HeaderDefault from "@/components/HeaderDefault.vue";
import CreateAd from "@/components/CreateAd.vue";
import { onMounted, watch } from "vue";
import { useAdAnalytics } from "~/composables/useAdAnalytics";
import { usePacksStore } from "@/stores/packs.store";
import { useAdStore } from "@/stores/ad.store";
import type { AnalyticsItem } from "@/stores/ad.store";
import type { User } from "@/types/user";
import { useMeStore } from "@/stores/me.store";
import { useCategoriesStore } from "@/stores/categories.store";

// Analytics
const adAnalytics = useAdAnalytics();
const packsStore = usePacksStore();
const user = useStrapiUser<User>();
const adStore = useAdStore();

const meStore = useMeStore();
const categoriesStore = useCategoriesStore();

// Pre-load creation flow data for SSR — categories, packs, and me data
// must be available before components mount to avoid client-side flash
await useAsyncData("anunciar-init", async () => {
  await Promise.all([
    meStore.loadMe(),
    categoriesStore.loadCategories(),
    packsStore.loadPacks(),
  ]);
  return true;
});

// onMounted: analytics-only — GA4 view_item_list event must fire client-side
onMounted(() => {
  // Build analytics item list from pre-loaded packs store
  const analyticsItems: AnalyticsItem[] = [];

  // Add paid packs
  for (const pack of packsStore.packs) {
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
      const selectedPack = packsStore.packs.find((p) => p.id === newPack);
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

// Observar cambios en el step
watch(
  () => adStore.step,
  (newStep) => {
    const stepNames: Record<number, string> = {
      1: "Payment Method",
      2: "General",
      3: "Personal Information",
      4: "Product Sheet",
      5: "Image Gallery",
    };

    adAnalytics.stepView(newStep, stepNames[newStep] ?? "");
  },
);

$setSEO({
  title: "Crear Anuncio",
  description:
    "Publica tus activos industriales de manera rápida y sencilla en Waldo.click®. Aumenta tu visibilidad y encuentra compradores fácilmente.",
  imageUrl: "https://waldo.click/share.jpg",
  url: "https://waldo.click/crear-anuncio",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Crear Anuncio - Waldo.click®",
  url: "https://waldo.click/crear-anuncio",
  description:
    "Publica tus activos industriales de manera rápida y sencilla en Waldo.click®. Aumenta tu visibilidad y encuentra compradores fácilmente.",
});

// Middleware
definePageMeta({
  middleware: "auth",
});
</script>
