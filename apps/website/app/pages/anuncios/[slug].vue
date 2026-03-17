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
      :loading="false"
      :error="null"
    />
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
const { $setSEO, $setStructuredData } = useNuxtApp();

import { useRoute } from "vue-router";
import { useAsyncData } from "#app";
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
  relatedAds: Ad[];
}

const route = useRoute();
const config = useRuntimeConfig();
const historyStore = useHistoryStore();
const indicatorStore = useIndicatorStore();
const client = useApiClient();

const { data: adData } = await useAsyncData<AdPageData | null>(
  `ad-${route.params.slug}`,
  async () => {
    // Fetch the ad directly — no store
    let adResult: { data: AdWithPriceData; access: AdAccess } | null = null;
    try {
      adResult = await client<{ data: AdWithPriceData; access: AdAccess }>(
        `ads/slug/${route.params.slug as string}`,
      );
    } catch {
      // 404 or access denied — show error page
      showError({ statusCode: 404, statusMessage: "Anuncio no encontrado" });
      return null;
    }

    if (!adResult?.data) {
      showError({ statusCode: 404, statusMessage: "Anuncio no encontrado" });
      return null;
    }

    const ad = adResult.data;
    const access = adResult.access;

    // Format price
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

      try {
        const converted = await indicatorStore.convertCurrency({
          amount: ad.priceData.originalPrice,
          from: ad.priceData.originalCurrency as "CLP" | "USD" | "EUR",
          to: (ad.currency === "CLP" ? "USD" : "CLP") as "CLP" | "USD" | "EUR",
        });
        if (converted?.data) {
          const convertedData = converted.data as unknown as { result: number };
          const convertedMeta = (converted as any).meta as
            | { timestamp: string }
            | undefined;
          ad.priceData.convertedPrice = convertedData.result;
          ad.priceData.convertedTimestamp = convertedMeta?.timestamp;
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
      } catch {
        // Currency conversion is non-critical
      }
    }

    // Fetch related ads directly — only for active ads
    let relatedAds: Ad[] = [];
    if (ad.status === "active" && ad.id) {
      try {
        const relatedResult = await client<{ data: Ad[] }>(
          `related/ads/${ad.id}`,
          { params: { populate: "*" } as unknown as Record<string, unknown> },
        );
        relatedAds = relatedResult?.data ?? [];
      } catch {
        // Non-critical
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

    return { ad, access, relatedAds };
  },
  {
    server: true,
    lazy: false,
    default: () => null,
  },
);

const adComputed = computed(() => adData.value?.ad ?? null);
const adAccess = computed(() => adData.value?.access ?? null);
const relatedAds = computed(() => adData.value?.relatedAds ?? []);

// Show 404 when data is done loading but no ad was found
watchEffect(() => {
  if (!adData.value) {
    showError({ statusCode: 404, statusMessage: "Anuncio no encontrado" });
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
