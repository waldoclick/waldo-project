<template>
  <div class="page page--home">
    <HeaderDefault :show-menu="true" :is-trasparent="true" />
    <HeroHome />
    <HighlightsDefault :separator="true" />
    <CategoryArchive :separator="true" :categories="categories" />
    <HowtoDefault :separator="true" />
    <PacksDefault :separator="true" :packs="packs" />
    <FaqDefault
      :text="`Encuentra respuestas a las preguntas más comunes sobre cómo funciona Waldo.click®, la plataforma para comprar y vender activos industriales.`"
      :limit="3"
      :faqs="faqs"
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
import HighlightsDefault from "@/components/HighlightsDefault.vue";
import CategoryArchive from "@/components/CategoryArchive.vue";
import HowtoDefault from "@/components/HowtoDefault.vue";
import PacksDefault from "~/components/PacksDefault.vue";
import FaqDefault from "~/components/FaqDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import type { Pack } from "@/types/pack";

// Load categories
const { data: categoriesData } = await useAsyncData("categories", async () => {
  const filterStore = useFilterStore();
  try {
    await filterStore.loadFilterCategories();
    return filterStore.filterCategories;
  } catch (error) {
    console.error("Error loading categories:", error);
    return [];
  }
});
const categories = computed(() => categoriesData.value ?? []);

// Load packs
const { data: packsData } = await useAsyncData("home-packs", async () => {
  const packsStore = usePacksStore();
  try {
    await packsStore.loadPacks();
    return packsStore.packs;
  } catch (error) {
    console.error("Error loading packs:", error);
    return [];
  }
});
const packs = computed(() => packsData.value ?? []);

// Load featured FAQs for the home page
const { data: faqsData } = await useAsyncData("featured-faqs", async () => {
  const faqsStore = useFaqsStore();
  try {
    await faqsStore.loadFaqs();
    return faqsStore.featuredFaqs;
  } catch (error) {
    console.error("Error loading featured FAQs:", error);
    return [];
  }
});
const faqs = computed(() => faqsData.value ?? []);

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
