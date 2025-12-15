<template>
  <!-- <pre>{{ adData }}</pre> -->
  <div v-if="adData" class="page page--contact">
    <HeaderDefault :show-search="true" />
    <HeroAnnouncement
      :name="adData.name"
      :category="adData.category"
      :user="adData.user"
    />
    <AdSingle :all="adData" />
    <RelatedAds
      v-if="relatedAds && relatedAds.length > 0"
      :ads="relatedAds"
      :loading="relatedLoading"
      :error="relatedError"
    />
    <FooterDefault />
  </div>
</template>

<script setup>
const { $setSEO, $setStructuredData } = useNuxtApp();

import { useRoute } from "vue-router";
import { useAsyncData } from "#app";
import { useAdsStore } from "@/stores/ads.store";
import { useRelatedStore } from "@/stores/related.store";
import { useHistoryStore } from "@/stores/history.store";
import { useIndicatorStore } from "@/stores/indicator.store";

import HeaderDefault from "@/components/HeaderDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import HeroAnnouncement from "@/components/HeroAnnouncement.vue";
import AdSingle from "@/components/AdSingle.vue";
import RelatedAds from "~/components/RelatedAds.vue";

const route = useRoute();
const config = useRuntimeConfig();
const historyStore = useHistoryStore();
const relatedStore = useRelatedStore();
const indicatorStore = useIndicatorStore();

const {
  data: adData,
  refresh,
  pending,
  error: adError,
} = await useAsyncData(
  "adData",
  async () => {
    const adsStore = useAdsStore();
    const user = useStrapiUser();

    try {
      const ad = await adsStore.loadAdBySlug(route.params.slug);

      if (!ad) {
        return null;
      }

      // Verificar si el anuncio está expirado (remaining_days === 0)
      // Esto debe hacerse ANTES de procesar los datos para evitar errores de serialización en Pinia
      if (ad.remaining_days === 0) {
        return null;
      }

      let isAvailable = true;

      if (!ad.active) {
        isAvailable = false;
      }

      if (!isAvailable && user && user.value.id === ad.user.id) {
        isAvailable = true;
      }

      if (!isAvailable) {
        return null;
      }

      // Formatear precio original y convertir
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
          from: ad.priceData.originalCurrency,
          to: ad.currency === "CLP" ? "USD" : "CLP",
        });

        if (result?.data) {
          ad.priceData.convertedPrice = result.data.result;
          ad.priceData.convertedTimestamp = result.meta.timestamp;
          ad.priceData.convertedCurrency =
            ad.currency === "CLP" ? "USD" : "CLP";
          ad.priceData.formattedConvertedPrice = new Intl.NumberFormat(
            "es-CL",
            {
              style: "currency",
              currency: ad.priceData.convertedCurrency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }
          ).format(ad.priceData.convertedPrice);
        }
      }

      // Solo cargamos relacionados y agregamos al historial si existe el anuncio
      await relatedStore.loadRelatedAds(ad.id);

      historyStore.addToHistory({
        id: ad.id,
        title: ad.title,
        slug: ad.slug,
        url: route.fullPath,
        price: ad.price,
        image: ad.gallery?.[0]?.url || "",
      });

      return ad;
    } catch (error) {
      console.error("Error loading ad:", error);
      return null;
    }
  },
  {
    server: true,
    lazy: false,
    watch: [() => route.params.slug], // ✅ Observar cambios en el slug
  }
);

// Determinar el mensaje de error apropiado
const getErrorMessage = () => {
  if (adError.value) {
    return {
      statusCode: 404,
      message: "Página no encontrada",
      description:
        "Lo sentimos, no pudimos cargar el anuncio. Por favor, intenta nuevamente.",
    };
  }
  return {
    statusCode: 404,
    message: "Página no encontrada",
    description:
      "Lo sentimos, el anuncio que buscas no existe o no está disponible.",
  };
};

// Observar los datos y mostrar error 404 cuando no hay datos
watchEffect(() => {
  if (!pending.value && !adData.value) {
    showError(getErrorMessage());
  }
});

// Configurar SEO cuando los datos estén disponibles
watch(
  () => adData.value,
  (newData) => {
    if (newData) {
      $setSEO({
        title: `${newData.name} en ${
          newData.commune?.name || "Chile"
        } | Venta de Equipo en Waldo.click`,
        description: `¡Oportunidad! ${String(newData.name)} en ${
          newData.commune?.name || "Chile"
        }. ${
          newData.description
            ? String(newData.description).slice(0, 150) + "..."
            : ""
        } Encuentra más equipo industrial en Waldo.click`,
        imageUrl:
          newData.gallery?.[0]?.url || `${config.public.baseUrl}/share.jpg`,
        url: `${config.public.baseUrl}/anuncios/${route.params.slug}`,
      });

      const structuredData = [
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${newData.name} en ${
            newData.commune?.name || "Chile"
          } | Venta de Equipo en Waldo.click`,
          description: `¡Oportunidad! ${String(newData.name)} en ${
            newData.commune?.name || "Chile"
          }. ${
            newData.description
              ? String(newData.description).slice(0, 150) + "..."
              : ""
          } Encuentra más equipo industrial en Waldo.click`,
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
  { immediate: true }
);

const {
  relatedAds,
  loading: relatedLoading,
  error: relatedError,
} = storeToRefs(relatedStore);
</script>
