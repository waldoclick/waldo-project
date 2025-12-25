<template>
  <div class="page">
    <HeaderDefault :show-search="true" />
    <HeroResults
      v-if="adsData && adsData.category"
      :bg-color="adsData.category.color"
      :color="adsData.category.color"
      :title="adsData.category.name"
      :icon="getCategoryIcon(adsData.category)"
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
      title="No hay avisos con esos filtros"
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

import { ref, watch, computed } from "vue";
import { useRoute } from "nuxt/app";
import { useCategoriesStore } from "@/stores/categories.store";
import { useAdsStore } from "@/stores/ads.store";

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

interface Category {
  name: string;
  color: string;
  icon?: {
    url: string;
  };
}

interface AdsData {
  ads: Ad[];
  pagination: Pagination;
  category: Category;
  relatedAds: Ad[];
  relatedLoading: boolean;
  relatedError: string | null;
}

interface Commune {
  id: number;
  name: string;
}

// Obtener la categoría por category
const route = useRoute();
const categoriesStore = useCategoriesStore();
const adsStore = useAdsStore();
const media = useStrapiMedia("");

const defaultCategory = ref<Category>({
  name: "Anuncios",
  color: "#f0f0f0",
  icon: {
    url: "",
  },
});

// Función para obtener el icono de la categoría
const getCategoryIcon = (category: Category) => {
  if (category && category.icon) {
    return media + category.icon.url;
  }
  return "";
};

// Usar useAsyncData para cargar anuncios y categorías
const { data: adsData, refresh } = await useAsyncData<AdsData>(
  () =>
    `adsData-${route.query.category || "all"}-${route.query.page || "1"}-${
      route.query.order || "default"
    }-${route.query.commune || "all"}-${route.query.s || ""}`, // Clave dinámica basada en query params
  async () => {
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
      ...(name && { name: { $containsi: name } }), // Búsqueda parcial, insensible a mayúsculas
      ...(category && { category: { slug: { $eq: category } } }), // Filtro por categoría
      ...(commune && { commune: { id: { $eq: commune } } }), // Filtro por comuna
      active: { $eq: true },
      remaining_days: { $gt: 0 }, // Filtro para remaining_days mayor a 0
    };

    let categoryData: Category;
    if (category) {
      try {
        await categoriesStore.loadCategory(category);
        categoryData = categoriesStore.category || defaultCategory.value;
      } catch (error) {
        console.error("Error loading category:", error);
        categoryData = defaultCategory.value;
      }
    } else {
      categoryData = defaultCategory.value;
    }

    await adsStore.loadAds(filtersParams, paginationParams, sortParams);
    const mainAds = adsStore.ads;
    const mainPagination = adsStore.pagination;

    // Si no hay resultados, cargar anuncios relacionados
    let relatedAds = [];
    let relatedLoading = false;
    let relatedError = null;

    if (mainAds.length === 0) {
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
      category: categoryData,
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
      category: defaultCategory.value,
      relatedAds: [],
      relatedLoading: false,
      relatedError: null,
    }),
  },
);

// Observar cambios en la URL y refrescar
watch(
  [
    () => route.query.category,
    () => route.query.page,
    () => route.query.order,
    () => route.query.commune,
    () => route.query.s,
  ],
  () => refresh(), // Refrescar los datos cuando cambian las query params
);

// Función para generar el título SEO según los parámetros de búsqueda
const generateSEOTitle = () => {
  const searchQuery = route.query.s?.toString();
  const categoryName = adsData.value?.category?.name;
  const communeId = route.query.commune?.toString();
  // Buscar la comuna en los anuncios para obtener su nombre
  const communeName = adsData.value?.ads.find(
    (ad) => ad.commune?.id?.toString() === communeId,
  )?.commune?.name;

  if (searchQuery) {
    let title = `Buscando "${searchQuery}"`;
    if (categoryName && categoryName !== "Anuncios")
      title += ` en ${categoryName}`;
    if (communeName) title += ` en ${communeName}`;
    return `${title}`;
  }

  if (categoryName === "Anuncios") {
    return communeName
      ? `Activos industriales en ${communeName}`
      : "Activos industriales en Chile";
  }

  if (categoryName && communeName) {
    return `Activos industriales de ${categoryName} en ${communeName}`;
  }

  if (categoryName) {
    return `Activos industriales de ${categoryName}`;
  }

  if (communeName) {
    return `Activos industriales en ${communeName}`;
  }

  return "Activos industriales en Chile";
};

// Función para generar la descripción SEO
const generateSEODescription = () => {
  const searchQuery = route.query.s?.toString();
  const categoryName = adsData.value?.category?.name;
  const communeId = route.query.commune?.toString();
  // Buscar la comuna en los anuncios para obtener su nombre
  const communeName = adsData.value?.ads.find(
    (ad) => ad.commune?.id?.toString() === communeId,
  )?.commune?.name;
  const totalAds = adsData.value?.pagination?.total || 0;

  let description = "";

  if (searchQuery) {
    description = `Resultados de búsqueda para "${searchQuery}"`;
    if (categoryName) description += ` en la categoría ${categoryName}`;
    if (communeName) description += ` en ${communeName}`;
  } else {
    description = `Explora ${totalAds} anuncios de activos industriales`;
    if (categoryName) description += ` en la categoría ${categoryName}`;
    if (communeName) description += ` en ${communeName}`;
  }

  return `${description}. Encuentra los mejores precios en equipamiento industrial en Waldo.click`;
};

// Actualizar el SEO cuando cambian los datos
watch(
  [() => adsData.value, () => route.query],
  () => {
    if (adsData.value) {
      $setSEO({
        title: generateSEOTitle(),
        description: generateSEODescription(),
        imageUrl: "https://waldo.click/share.jpg",
        url: `https://waldo.click${route.fullPath}`,
      });

      $setStructuredData({
        "@context": "https://schema.org",
        "@type": "SearchResultsPage",
        name: generateSEOTitle(),
        description: generateSEODescription(),
        url: `https://waldo.click${route.fullPath}`,
      });
    }
  },
  { immediate: true },
);
</script>
