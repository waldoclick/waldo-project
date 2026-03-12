<template>
  <div class="page">
    <HeaderDefault :show-search="true" />
    <HeroResults
      :bg-color="categoryData?.color || '#f0f0f0'"
      :color="categoryData?.color || '#f0f0f0'"
      :title="categoryData?.name || 'Anuncios'"
      :category-icon="categoryIconComponent"
    />
    <FilterResults v-if="adsData && adsData.ads && adsData.ads.length > 0" />
    <AdArchive
      v-if="adsData && adsData.ads && adsData.ads.length > 0"
      :ads="adsData.ads"
      :pagination="adsData.pagination"
    />
    <MessageDefault
      v-if="adsData && adsData.ads && adsData.ads.length === 0"
      type="fail"
      title="No hay anuncios con esos filtros"
      description="Prueba ajustando tu búsqueda o mira lo que tenemos disponible"
      button_label="Ver más anuncios"
      button_link="/anuncios"
      :button_show="true"
    />
    <RelatedAds
      v-if="
        adsData &&
        adsData.ads &&
        adsData.ads.length === 0 &&
        adsData.relatedAds &&
        adsData.relatedAds.length > 0
      "
      :ads="adsData.relatedAds"
      :loading="adsData.relatedLoading"
      :error="adsData.relatedError || null"
      title="Equipos destacados"
      text="Los mejores activos industriales del momento"
      :center-head="true"
    />
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  alias: ["/anuncios"],
});

const { $setSEO, $setStructuredData } = useNuxtApp() as unknown as {
  $setSEO: (data: {
    title: string;
    description: string;
    imageUrl: string;
    url: string;
  }) => void;
  $setStructuredData: (data: object) => void;
};
const config = useRuntimeConfig();

import { watch, computed } from "vue";
import { useRoute } from "nuxt/app";
import { useCategoriesStore } from "@/stores/categories.store";
import { useAdsStore } from "@/stores/ads.store";
import { useFilterStore } from "@/stores/filter.store";
import { useIcons } from "@/composables/useIcons";

// components
import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroResults from "@/components/HeroResults.vue";
import FilterResults from "@/components/FilterResults.vue";
import AdArchive from "@/components/AdArchive.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import RelatedAds from "@/components/RelatedAds.vue";
import MessageDefault from "@/components/MessageDefault.vue";

// Importar interfaces
import type { Category } from "@/types/category";
import type { Ad } from "@/types/ad";
import type { Pagination } from "@/types/pagination";

interface AdsData {
  ads: Ad[];
  pagination: Pagination;
  relatedAds: Ad[];
  relatedLoading: boolean;
  relatedError: string | null;
}

// Obtener la categoría por category
const route = useRoute();
const categoriesStore = useCategoriesStore();
const adsStore = useAdsStore();
const filterStore = useFilterStore();
const { getCategoryIcon: getCategoryIconComponent } = useIcons();

// Icono de la categoría como componente Lucide (para el hero)
const categoryIconComponent = computed(() =>
  categorySlug.value ? getCategoryIconComponent(categorySlug.value) : undefined,
);

// Carga de categoría separada — key estable por slug, independiente del resto de filtros
const categorySlug = computed(() => route.query.category?.toString() || "");

const { data: categoryData } = await useAsyncData<Category | null>(
  () => `category-${categorySlug.value}`,
  async () => {
    if (!categorySlug.value) return null;
    await categoriesStore.loadCategory(categorySlug.value);
    return categoriesStore.category ?? null;
  },
  {
    watch: [categorySlug],
    server: true,
    default: () => null,
  },
);

// Usar useAsyncData para cargar anuncios
const { data: adsData } = await useAsyncData<AdsData>(
  () =>
    `adsData-${route.query.category || "all"}-${route.query.page || "1"}-${
      route.query.order || "default"
    }-${route.query.commune || "all"}-${route.query.s || ""}`,
  async () => {
    // Pre-load filter communes for FilterResults component
    await filterStore.loadFilterCommunes();

    // Limpiar el store antes de cargar nuevos datos para evitar datos obsoletos de navegaciones anteriores
    adsStore.reset();

    const category = route.query.category?.toString() || null;
    const page = Number.parseInt(route.query.page?.toString() || "1", 10);
    const order = route.query.order?.toString() || undefined;
    const commune = route.query.commune?.toString() || null;
    const name = route.query.s?.toString() || "";

    const paginationParams = { pageSize: 20, page };

    const sortParams =
      order === "featured" || order === undefined
        ? ["ad_featured_reservation.id:desc", "createdAt:desc"]
        : ["createdAt:desc"];

    const filtersParams = {
      ...(name && { name: { $containsi: name } }),
      ...(category && { category: { slug: { $eq: category } } }),
      ...(commune && { commune: { id: { $eq: commune } } }),
      active: { $eq: true },
      remaining_days: { $gt: 0 },
    };

    await adsStore.loadAds(filtersParams, paginationParams, sortParams);
    const mainAds = adsStore.ads;
    const mainPagination = adsStore.pagination;

    let relatedAds: Ad[] = [];
    let relatedLoading = false;
    let relatedError = null;

    if (mainAds.length === 0 && mainPagination.total === 0) {
      relatedLoading = true;
      try {
        await adsStore.loadAds(
          { active: { $eq: true }, remaining_days: { $gt: 0 } },
          { page: 1, pageSize: 12 },
          ["ad_featured_reservation.id:desc", "createdAt:desc"],
        );
        relatedAds = adsStore.ads;
      } catch (error) {
        relatedError = error instanceof Error ? error.message : String(error);
      }
      relatedLoading = false;
    }

    return {
      ads: mainAds,
      pagination: mainPagination,
      relatedAds,
      relatedLoading,
      relatedError,
    };
  },
  {
    watch: [
      () => route.query.category,
      () => route.query.page,
      () => route.query.order,
      () => route.query.commune,
      () => route.query.s,
    ],
    server: true,
    default: () => ({
      ads: [],
      pagination: { page: 1, pageSize: 20, pageCount: 0, total: 0 },
      relatedAds: [],
      relatedLoading: false,
      relatedError: null,
    }),
  },
);

// Observar cambios en la URL y refrescar
// COMENTADO: Este watch es redundante porque useAsyncData ya tiene watch en sus opciones (líneas 198-204)
// que automáticamente refresca cuando cambian los query params. Esto causaba llamadas duplicadas.
// watch(
//   [
//     () => route.query.category,
//     () => route.query.page,
//     () => route.query.order,
//     () => route.query.commune,
//     () => route.query.s,
//   ],
//   () => refresh(), // Refrescar los datos cuando cambian las query params
// );

// Función para generar el título SEO según los parámetros de búsqueda
const generateSEOTitle = () => {
  const searchQuery = route.query.s?.toString();
  const categoryName = categoryData.value?.name;
  const communeId = route.query.commune?.toString();
  // Buscar la comuna en los anuncios para obtener su nombre
  const communeName = adsData.value?.ads.find(
    (ad) =>
      typeof ad.commune === "object" &&
      ad.commune !== null &&
      ad.commune.id?.toString() === communeId,
  )?.commune;
  const communeNameStr =
    typeof communeName === "object" && communeName !== null
      ? communeName.name
      : undefined;

  if (searchQuery) {
    let title = `Buscando "${searchQuery}"`;
    if (categoryName && categoryName !== "Anuncios")
      title += ` en ${categoryName}`;
    return title;
  }

  if (!categoryName || categoryName === "Anuncios") {
    return communeNameStr
      ? `Activos Industriales en ${communeNameStr}`
      : "Anuncios de Activos Industriales";
  }

  if (categoryName && communeNameStr) {
    return `Anuncios de ${categoryName} en ${communeNameStr}`;
  }

  if (categoryName) {
    return `Anuncios de ${categoryName} en Chile`;
  }

  return "Anuncios de Activos Industriales";
};

// Función para generar la descripción SEO
const generateSEODescription = () => {
  const searchQuery = route.query.s?.toString();
  const categoryName = categoryData.value?.name;
  const communeId = route.query.commune?.toString();
  // Buscar la comuna en los anuncios para obtener su nombre
  const communeObj = adsData.value?.ads.find(
    (ad) =>
      typeof ad.commune === "object" &&
      ad.commune !== null &&
      ad.commune.id?.toString() === communeId,
  )?.commune;
  const communeName =
    typeof communeObj === "object" && communeObj !== null
      ? communeObj.name
      : undefined;

  if (searchQuery) {
    let desc = `Resultados para "${searchQuery}" en Waldo.click®. Activos industriales en Chile`;
    if (categoryName && categoryName !== "Anuncios")
      desc += `: ${categoryName}`;
    if (communeName) desc += `, ${communeName}`;
    return `${desc}. Equipos nuevos y usados a los mejores precios.`;
  }

  if (!categoryName || categoryName === "Anuncios") {
    if (!communeName) {
      return "Encuentra anuncios de activos industriales en todo Chile. Equipos nuevos y usados de todas las categorías disponibles en Waldo.click®.";
    }
    return `Encuentra anuncios de activos industriales en ${communeName}. Equipos industriales nuevos y usados disponibles en Waldo.click®.`;
  }

  if (categoryName && communeName) {
    return `Explora anuncios de ${categoryName} en ${communeName}. Activos industriales disponibles en Waldo.click®. Contacta al vendedor directamente.`;
  }

  return `Explora anuncios de ${categoryName} en Chile. Activos industriales nuevos y usados disponibles en Waldo.click®. Compra y vende en minutos.`;
};

// SSR-safe initial SEO call — ensures server-rendered HTML has correct title/description
if (adsData.value) {
  $setSEO({
    title: generateSEOTitle(),
    description: generateSEODescription(),
    imageUrl: `${config.public.baseUrl}/share.jpg`,
    url: `${config.public.baseUrl}${route.fullPath}`,
  });

  $setStructuredData({
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: generateSEOTitle(),
    description: generateSEODescription(),
    url: `${config.public.baseUrl}${route.fullPath}`,
  });
}

// Actualizar el SEO cuando cambian los datos
watch(
  [() => adsData.value, () => route.query],
  () => {
    if (adsData.value) {
      $setSEO({
        title: generateSEOTitle(),
        description: generateSEODescription(),
        imageUrl: `${config.public.baseUrl}/share.jpg`,
        url: `${config.public.baseUrl}${route.fullPath}`,
      });

      $setStructuredData({
        "@context": "https://schema.org",
        "@type": "SearchResultsPage",
        name: generateSEOTitle(),
        description: generateSEODescription(),
        url: `${config.public.baseUrl}${route.fullPath}`,
      });
    }
  },
  { immediate: true },
);
</script>
