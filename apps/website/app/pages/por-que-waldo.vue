<template>
  <div class="page page--why">
    <HeaderDefault :show-menu="true" />
    <WhyHero />
    <HighlightsDefault />
    <HowtoDefault />
    <PacksDefault :packs="packs" :show-head="true" />
    <WhyCta />
    <FaqDefault
      :title="`Preguntas frecuentes`"
      :text="`Respuestas a lo más común sobre cómo funciona Waldo.click®.`"
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
import WhyHero from "@/components/WhyHero.vue";
import HighlightsDefault from "@/components/HighlightsDefault.vue";
import HowtoDefault from "@/components/HowtoDefault.vue";
import PacksDefault from "@/components/PacksDefault.vue";
import WhyCta from "@/components/WhyCta.vue";
import FaqDefault from "@/components/FaqDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";
import type { Pack } from "@/types/pack";
import type { FAQ } from "@/types/faq";

interface WhyData {
  packs: Pack[];
  faqs: FAQ[];
}

// Single data load — packs + featured FAQs in one wave (Highlights/Howto are static)
const client = useApiClient();
const { data } = await useAsyncData<WhyData>(
  "why-data",
  async () => {
    const faqsStore = useFaqsStore();

    const [packs, faqs] = await Promise.all([
      (async () => {
        try {
          const response = (await client("ad-packs", {
            method: "GET",
            params: { populate: "*" } as unknown as Record<string, unknown>,
          })) as { data: Pack[] };
          return response.data;
        } catch (error) {
          console.error("Error loading packs:", error);
          return [] as Pack[];
        }
      })(),
      (async () => {
        try {
          await faqsStore.loadFaqs();
          return faqsStore.featuredFaqs;
        } catch (error) {
          console.error("Error loading featured FAQs:", error);
          return [] as FAQ[];
        }
      })(),
    ]);

    return { packs, faqs };
  },
  {
    default: () => ({
      packs: [] as Pack[],
      faqs: [] as FAQ[],
    }),
  },
);

const packs = computed(() => data.value?.packs ?? []);
const faqs = computed(() => data.value?.faqs ?? []);

const config = useRuntimeConfig();

$setSEO({
  title: "Por qué Waldo — Marketplace de Activos Industriales",
  description:
    "Conoce cómo Waldo.click® conecta a quienes compran y venden activos industriales en Chile. Busca equipos, publica avisos y elige el pack ideal.",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  url: `${config.public.baseUrl}/por-que-waldo`,
  name: "Por qué Waldo — Waldo.click®",
  description:
    "Cómo funciona Waldo.click®: el marketplace de activos industriales para comprar y vender equipos, vehículos, repuestos e insumos en Chile.",
});
</script>
