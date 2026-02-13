<template>
  <DefaultLayout>
    <div class="page">
      <HeaderDefault :show-search="true" />
      <HeroFake />
      <!-- {{ error }} -->
      <MessageDefault
        type="fail"
        :title="getErrorTitle()"
        :description="getErrorDescription()"
        button_label="Volver al inicio"
        button_link="/"
        :button_show="true"
      />
      <RelatedAds
        v-if="adsData?.ads && adsData.ads.length > 0"
        :ads="adsData.ads"
        :loading="pending"
        :error="
          fetchError
            ? fetchError instanceof Error
              ? fetchError.message
              : String(fetchError)
            : null
        "
        title="Tenemos avisos que podrían interesarte"
        text="Revisa nuestra selección de activos industriales disponibles"
        :center-head="true"
      />
      <FooterDefault />
    </div>
  </DefaultLayout>
</template>

<script setup>
import DefaultLayout from "~/layouts/default.vue";
import HeaderDefault from "@/components/HeaderDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import MessageDefault from "@/components/MessageDefault.vue";
import HeroFake from "@/components/HeroFake.vue";
import RelatedAds from "@/components/RelatedAds.vue";
import { useAdsStore } from "@/stores/ads.store";

const props = defineProps({
  error: {
    type: Object,
    default: () => ({}),
  },
});

// Función para obtener el título del error
const getErrorTitle = () => {
  // Si hay un mensaje personalizado, usarlo primero
  if (props.error?.message) {
    if (props.error?.statusCode === 404) {
      return `404 - ${props.error.message}`;
    }
    return props.error.message;
  }

  // Mensajes por defecto según el statusCode
  if (props.error?.statusCode === 404) {
    return "404 - Página no encontrada";
  } else if (props.error?.statusCode === 429) {
    return "Demasiadas solicitudes";
  } else if (props.error?.statusCode === 500) {
    return "Error del servidor";
  } else if (props.error?.statusCode === 403) {
    return "Acceso denegado";
  }
  return "Error inesperado";
};

// Función para obtener la descripción del error
const getErrorDescription = () => {
  // Si hay una descripción personalizada, usarla primero
  if (props.error?.description) {
    return props.error.description;
  }

  // Descripciones por defecto según el statusCode
  if (props.error?.statusCode === 404) {
    return "La página que buscas no existe o ha sido movida.";
  } else if (props.error?.statusCode === 429) {
    return "Has realizado demasiadas solicitudes muy rápido. Por favor, espera unos momentos antes de intentar nuevamente.";
  } else if (props.error?.statusCode === 500) {
    return "Ocurrió un error interno del servidor. Nuestro equipo está trabajando para solucionarlo.";
  } else if (props.error?.statusCode === 403) {
    return "No tienes permisos para acceder a esta página.";
  }
  return "Lo sentimos, ha ocurrido un error.";
};

const {
  data: adsData,
  pending,
  error: fetchError,
} = await useAsyncData(
  "ads404",
  async () => {
    try {
      const adsStore = useAdsStore();
      await adsStore.loadAds(
        { active: { $eq: true }, remaining_days: { $gt: 0 } },
        { page: 1, pageSize: 8 },
        ["createdAt:desc"],
      );
      return {
        ads: adsStore.ads,
        error: null,
      };
    } catch (error) {
      console.error("Error loading related ads:", error);
      return {
        ads: [],
        error: error,
      };
    }
  },
  {
    server: true,
    lazy: false,
  },
);

// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();

// SEO dinámico según el tipo de error
const getSEOTitle = () => {
  if (props.error?.statusCode === 404) {
    return "Página no encontrada | Waldo.click®";
  } else if (props.error?.statusCode === 429) {
    return "Demasiadas solicitudes | Waldo.click®";
  } else if (props.error?.statusCode === 500) {
    return "Error del servidor | Waldo.click®";
  } else if (props.error?.statusCode === 403) {
    return "Acceso denegado | Waldo.click®";
  }
  return "Error | Waldo.click®";
};

const getSEOUrl = () => {
  const statusCode = props.error?.statusCode || "error";
  return `https://waldo.click/${statusCode}`;
};

$setSEO({
  title: getSEOTitle(),
  description: getErrorDescription(),
  imageUrl: "https://waldo.click/share.jpg",
  url: getSEOUrl(),
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: getSEOTitle(),
  description: getErrorDescription(),
  url: getSEOUrl(),
});
</script>
