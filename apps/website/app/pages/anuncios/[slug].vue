<template>
  <div v-if="adComputed" class="page page--contact">
    <HeaderDefault :show-search="true" />
    <HeroAnnouncement
      :name="adComputed.name"
      :category="(adComputed.category as Record<string, any>) || {}"
      :user="adComputed.user"
    />
    <AdSingle :all="adComputed" :access="adAccess ?? undefined" />
    <RelatedAds
      v-if="relatedAds && relatedAds.length > 0"
      :ads="relatedAds"
      :loading="relatedLoading"
      :error="relatedError"
    />
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
const { $setSEO, $setStructuredData } = useNuxtApp();

import { useRoute } from "vue-router";
import { useAsyncData } from "#app";
import { useAdsStore } from "@/stores/ads.store";
import { useRelatedStore } from "@/stores/related.store";
import { useHistoryStore } from "@/stores/history.store";
import { useIndicatorStore } from "@/stores/indicator.store";
import type { Ad, AdAccess } from "@/types/ad";

import HeaderDefault from "@/components/HeaderDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import HeroAnnouncement from "@/components/HeroAnnouncement.vue";
import AdSingle from "@/components/AdSingle.vue";
import RelatedAds from "~/components/RelatedAds.vue";
import { useAdAnalytics } from "@/composables/useAdAnalytics";

interface PriceData {
  formattedPrice: string;
  originalPrice: number;
  originalCurrency: string;
  convertedPrice?: number;
  convertedTimestamp?: string;
  convertedCurrency?: string;
  formattedConvertedPrice?: string;
}

// Ad as returned by Strapi API — commune and category are objects, not IDs
interface AdWithPriceData extends Omit<
  Ad,
  "commune" | "category" | "condition"
> {
  commune: {
    id: number;
    name: string;
    region?: { id: number; name: string };
  } | null;
  category: { id: number; name: string } | null;
  condition: { id: number; name: string } | null;
  priceData?: PriceData;
  active?: boolean;
}

interface AdPageData {
  ad: AdWithPriceData;
  access: AdAccess;
}

const route = useRoute();
const config = useRuntimeConfig();
const historyStore = useHistoryStore();
const relatedStore = useRelatedStore();
const indicatorStore = useIndicatorStore();

const { data: adData, refresh } = await useAsyncData<AdPageData | null>(
  `ad-${route.params.slug}`,
  async () => {
    const adsStore = useAdsStore();

    let result: { ad: AdWithPriceData; access: AdAccess } | null = null;
    try {
      result = (await adsStore.loadAdBySlug(route.params.slug as string)) as {
        ad: AdWithPriceData;
        access: AdAccess;
      } | null;
    } catch {
      // Ad not found or access denied (e.g. 404 from Strapi)
      throw createError({
        statusCode: 404,
        message: "Página no encontrada",
        fatal: true,
      });
    }

    try {
      if (!result) {
        throw createError({
          statusCode: 404,
          message: "Página no encontrada",
          fatal: true,
        });
      }

      const ad = result.ad;

      // For now, always show the ad information

      // Format original price and convert to alternate currency
      if (ad.price) {
        ad.priceData = {
          formattedPrice: new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: ad.currency || "CLP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(ad.price),
          originalPrice: ad.price,
          originalCurrency: ad.currency || "CLP",
        };

        const result = await indicatorStore.convertCurrency({
          amount: ad.priceData.originalPrice,
          from: ad.priceData.originalCurrency as "CLP" | "USD" | "EUR",
          to: (ad.currency === "CLP" ? "USD" : "CLP") as "CLP" | "USD" | "EUR",
        });

        if (result?.data) {
          const resultData = result.data as unknown as { result: number };
          const resultMeta = (result as any).meta as
            | { timestamp: string }
            | undefined;
          ad.priceData.convertedPrice = resultData.result;
          ad.priceData.convertedTimestamp = resultMeta?.timestamp;
          ad.priceData.convertedCurrency =
            ad.currency === "CLP" ? "USD" : "CLP";
          ad.priceData.formattedConvertedPrice = new Intl.NumberFormat(
            "es-CL",
            {
              style: "currency",
              currency: ad.priceData.convertedCurrency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            },
          ).format(ad.priceData.convertedPrice ?? 0);
        }
      }

      // Only load related ads for active ads — Strapi related endpoint requires a published ad
      // Non-active statuses from Strapi: "pending", "archived", "banned", "rejected", "draft", "unknown"
      if (ad.status === "active") {
        try {
          await relatedStore.loadRelatedAds(ad.id);
        } catch {
          // Non-critical — related ads failing should not block the main ad page
        }
      }

      historyStore.addToHistory({
        id: ad.id,
        title: ad.title,
        slug: ad.slug,
        url: route.fullPath,
        price: ad.price,
        image: ad.gallery?.[0]?.url || "",
      });

      return { ad, access: result.access };
    } catch (error) {
      // Re-throw Nuxt errors (e.g. the 404 from the !result path above) — do not convert to 500
      if (error && typeof error === "object" && "statusCode" in error) {
        throw error;
      }
      console.error("Error loading ad:", error);
      throw createError({
        statusCode: 500,
        message: "Error del servidor",
        fatal: true,
      });
    }
  },
  {
    server: true,
    lazy: false,
    default: () => null,
  },
);

// Convenience computed refs — adData is now { ad, access }
const adComputed = computed(() => adData.value?.ad ?? null);
const adAccess = computed(() => adData.value?.access ?? null);

// Client-side guard: if adData is null after hydration, show 404 error page.
// Cannot use watchEffect (fires in SSR → 500). onMounted is client-only.
onMounted(() => {
  if (!adData.value) {
    showError({ statusCode: 404, message: "Página no encontrada" });
  }
});

// Set SEO and structured data when ad data is available
watch(
  () => adComputed.value,
  (newData) => {
    if (newData) {
      const commune = newData.commune?.name || "Chile";
      const descPrefix = `¡Oportunidad! ${String(newData.name)} en ${commune}.`;
      const descSuffix = " Activo industrial en Waldo.click®.";
      const sliceBudget = 155 - descPrefix.length - descSuffix.length - 4;
      const descPart =
        newData.description && sliceBudget > 10
          ? ` ${String(newData.description).slice(0, sliceBudget)}...`
          : "";
      const description = newData.description
        ? `${descPrefix}${descPart}${descSuffix}`
        : `¡Oportunidad! ${String(newData.name)} en ${commune}. Activo industrial a la venta. Consulta precio, detalles y contacta al vendedor en Waldo.click®.`;
      $setSEO({
        title: `${newData.name} en ${commune}`,
        description,
        imageUrl:
          newData.gallery?.[0]?.url || `${config.public.baseUrl}/share.jpg`,
        url: `${config.public.baseUrl}/anuncios/${route.params.slug}`,
      });

      const structuredData = [
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${newData.name} en ${commune}`,
          description,
          url: `${config.public.baseUrl}/anuncios/${route.params.slug}`,
        },
        {
          "@context": "https://schema.org",
          "@type": "Product",
          name: newData.name,
          description: newData.description,
          url: `${config.public.baseUrl}/anuncios/${route.params.slug}`,
          image:
            newData.gallery?.[0]?.url || `${config.public.baseUrl}/share.jpg`,
          brand: {
            "@type": "Brand",
            name: newData.manufacturer,
          },
          model: newData.model,
          sku: newData.serial_number,
          weight: {
            "@type": "QuantitativeValue",
            value: newData.weight,
            unitCode: "KGM",
          },
          width: {
            "@type": "QuantitativeValue",
            value: newData.width,
            unitCode: "CMT",
          },
          height: {
            "@type": "QuantitativeValue",
            value: newData.height,
            unitCode: "CMT",
          },
          depth: {
            "@type": "QuantitativeValue",
            value: newData.depth,
            unitCode: "CMT",
          },
          category: newData.category?.name,
          itemCondition: newData.condition?.name,
          productionDate: newData.year,
          seller: {
            "@type": newData.user?.is_company ? "Organization" : "Person",
            name: newData.user?.is_company
              ? newData.user?.business_name
              : `${newData.user?.firstname} ${newData.user?.lastname}`,
            email: newData.user?.email,
            telephone: newData.user?.phone,
            address: {
              "@type": "PostalAddress",
              streetAddress: newData.user?.is_company
                ? newData.user?.business_address
                : newData.user?.address,
              addressLocality: newData.commune?.name,
              addressRegion: newData.commune?.region?.name,
              postalCode: newData.user?.is_company
                ? newData.user?.business_postal_code
                : newData.user?.postal_code,
            },
          },
          offers: {
            "@type": "Offer",
            price: newData.price,
            priceCurrency: newData.currency,
            availability: newData.active
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        },
      ];

      $setStructuredData(structuredData);
    }
  },
  { immediate: true },
);

const {
  relatedAds,
  loading: relatedLoading,
  error: relatedError,
} = storeToRefs(relatedStore);

// Analytics — view_item tracking (DISC-02)
const adAnalytics = useAdAnalytics();
const viewItemFired = ref(false);

// Reset fired guard when slug changes (Nuxt reuses component across [slug] navigations)
watch(
  () => route.params.slug,
  () => {
    viewItemFired.value = false;
  },
);

// Fire view_item when ad data loads; guard prevents double-fire on same slug
watch(
  () => adComputed.value,
  (ad) => {
    if (ad && !viewItemFired.value) {
      viewItemFired.value = true;
      adAnalytics.viewItem(ad);
    }
  },
  { immediate: true },
);
</script>
