<template>
  <NuxtLayout
    name="about"
    title="Mapa del sitio"
    intro="Navega fácilmente por Waldo. Encuentra anuncios, categorías, comunas y todas las secciones del sitio."
    active="mapa"
  >
    <SitemapDefault :blocks="sitemapBlocks" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useCategoriesStore } from "@/stores/categories.store";
import { useCommunesStore } from "@/stores/communes.store";

// Componente principal
import SitemapDefault from "@/components/SitemapDefault.vue";

// Layout aplicado explícitamente con <NuxtLayout name="about"> en el template;
// layout: false evita que Nuxt aplique además el layout por defecto (doble wrap).
definePageMeta({
  layout: false,
});

const { data: pageData } = await useAsyncData(
  "sitemap-data",
  async () => {
    const categoriesStore = useCategoriesStore();
    const communesStore = useCommunesStore();

    await Promise.all([
      categoriesStore.loadCategories(),
      communesStore.loadCommunes(),
    ]);

    return {
      categories: categoriesStore.categories,
      communes: communesStore.communes.data,
    };
  },
  { default: () => ({ categories: [], communes: [] }) },
);

const sitemapBlocks = [
  {
    title: "Páginas Principales",
    items: [
      { to: "/", label: "Inicio" },
      { to: "/anuncios", label: "Anuncios" },
      { to: "/contacto", label: "Contacto" },
      { to: "/login", label: "Iniciar Sesión" },
      { to: "/packs", label: "Packs" },
      { to: "/politicas-de-privacidad", label: "Políticas de Privacidad" },
      { to: "/preguntas-frecuentes", label: "Preguntas Frecuentes" },
      { to: "/recuperar-contrasena", label: "Recuperar Contraseña" },
      { to: "/registro", label: "Registro" },
      { to: "/sitemap", label: "Mapa del Sitio" },
    ],
  },
];

if (pageData.value?.categories && pageData.value.categories.length > 0) {
  sitemapBlocks.push({
    title: "Categorías",
    items: pageData.value.categories.map((category) => ({
      to: `/anuncios?category=${category.slug}`,
      label: category.name,
    })),
  });
}

if (pageData.value?.communes && pageData.value.communes.length > 0) {
  sitemapBlocks.push({
    title: "Comunas",
    items: pageData.value.communes.map((commune) => ({
      to: `/anuncios?commune=${commune.id}`,
      label: commune.name,
    })),
  });
}

// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();
const config = useRuntimeConfig();

$setSEO({
  title: "Mapa del Sitio",
  description:
    "Navega fácilmente por Waldo.click®. Encuentra anuncios de activos industriales, categorías, comunas y todas las secciones del sitio.",
  imageUrl: `${config.public.baseUrl}/share.jpg`,
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Mapa del Sitio",
  description:
    "Navega fácilmente por Waldo.click®. Encuentra anuncios de activos industriales, categorías, comunas y todas las secciones del sitio.",
  url: `${config.public.baseUrl}/sitemap`,
});
</script>
