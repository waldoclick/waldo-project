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
// Define SEO
const { $setSEO } = useNuxtApp();

// Components
import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroHome from "@/components/HeroHome.vue";
import HighlightsDefault from "@/components/HighlightsDefault.vue";
import CategoryArchive from "@/components/CategoryArchive.vue";
import HowtoDefault from "@/components/HowtoDefault.vue";
import PacksDefault from "~/components/PacksDefault.vue";
import FaqDefault from "~/components/FaqDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";

// Load categories
const { data: categories } = await useAsyncData("categories", async () => {
  const filterStore = useFilterStore();
  try {
    await filterStore.loadFilterCategories();
    return filterStore.filterCategories;
  } catch (error) {
    console.error("Error loading categories:", error);
    return [];
  }
});

// Load packs
const { data: packs } = await useAsyncData("packs", async () => {
  const packsStore = usePacksStore();
  try {
    await packsStore.loadPacks();
    return packsStore.packs;
  } catch (error) {
    console.error("Error loading packs:", error);
    return [];
  }
});

// Load FAQs destacadas para el home
const { data: faqs } = await useAsyncData("featured-faqs", async () => {
  const faqsStore = useFaqsStore();
  try {
    await faqsStore.loadFaqs();
    return faqsStore.featuredFaqs;
  } catch (error) {
    console.error("Error loading featured FAQs:", error);
    return [];
  }
});

$setSEO({
  title: "Compra y Venta de Equipo en Chile",
  description:
    "Publica y encuentra equipo industrial en Chile. Waldo.click® conecta vendedores y compradores de equipos nuevos o usados en todo el país.",
});
</script>
