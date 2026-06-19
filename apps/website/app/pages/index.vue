<template>
  <div class="page page--home">
    <HeaderDefault :show-menu="true" />
    <HeroHome :featured-ads="featuredAds" :categories="categories" />
    <AdArchive :ads="featuredAds" :featured-section="true" />
    <CategoryArchive :categories="categories" />
    <SellCta />
    <ArticleArchive
      :articles="articles"
      :pagination="emptyPagination"
      :blog-section="true"
    />
    <FooterDefault />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();

// Components
import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroHome from "@/components/HeroHome.vue";
import AdArchive from "@/components/AdArchive.vue";
import CategoryArchive from "@/components/CategoryArchive.vue";
import SellCta from "@/components/SellCta.vue";
import ArticleArchive from "@/components/ArticleArchive.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import type { Ad } from "@/types/ad";
import type { Article } from "@/types/article";
import type { FilterCategory } from "@/types/filter";
import type { Pagination } from "@/types/pagination";

interface HomeData {
  categories: FilterCategory[];
  featuredAds: Ad[];
  articles: Article[];
}

// Single home data load — categories + featured ads + latest articles in one wave
const { data } = await useAsyncData<HomeData>(
  "home-data",
  async () => {
    const filterStore = useFilterStore();
    const adsStore = useAdsStore();
    const articlesStore = useArticlesStore();

    const [categories, featuredAds, articles] = await Promise.all([
      (async () => {
        try {
          await filterStore.loadFilterCategories();
          return filterStore.filterCategories;
        } catch (error) {
          console.error("Error loading categories:", error);
          return [] as FilterCategory[];
        }
      })(),
      (async () => {
        try {
          await adsStore.loadAds({}, { page: 1, pageSize: 8 }, [
            "sort_priority:asc",
            "createdAt:desc",
          ]);
          return adsStore.ads;
        } catch (error) {
          console.error("Error loading featured ads:", error);
          return [] as Ad[];
        }
      })(),
      (async () => {
        try {
          await articlesStore.loadArticles({}, { page: 1, pageSize: 3 }, [
            "createdAt:desc",
          ]);
          return articlesStore.articles;
        } catch (error) {
          console.error("Error loading articles:", error);
          return [] as Article[];
        }
      })(),
    ]);

    return { categories, featuredAds, articles };
  },
  {
    default: () => ({
      categories: [] as FilterCategory[],
      featuredAds: [] as Ad[],
      articles: [] as Article[],
    }),
  },
);

const categories = computed(() => data.value?.categories ?? []);
const featuredAds = computed(() => data.value?.featuredAds ?? []);
const articles = computed(() => data.value?.articles ?? []);

const emptyPagination: Pagination = {
  page: 1,
  pageSize: 3,
  pageCount: 0,
  total: 0,
};

$setSEO({
  title: "Anuncios de Activos Industriales en Chile",
  description:
    "Compra y vende activos industriales en Chile. Waldo.click® conecta vendedores y compradores de equipos nuevos y usados en todo el país.",
});

const config = useRuntimeConfig();

$setStructuredData([
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: config.public.baseUrl,
    name: "Waldo.click®",
    description:
      "Plataforma de compra y venta de activos industriales en Chile. Encuentra equipos nuevos o usados de todo el país.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${config.public.baseUrl}/anuncios?s={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    url: config.public.baseUrl,
    name: "Waldo.click®",
    logo: `${config.public.baseUrl}/images/share.jpg`,
    sameAs: [],
  },
]);
</script>
