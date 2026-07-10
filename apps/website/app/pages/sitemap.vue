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
// Componente principal
import SitemapDefault from "@/components/SitemapDefault.vue";

// Layout aplicado explícitamente con <NuxtLayout name="about"> en el template;
// layout: false evita que Nuxt aplique además el layout por defecto (doble wrap).
definePageMeta({
  layout: false,
});

// Bloques fijos según la maqueta (MAPA DEL SITIO): tres columnas
// Explorar / Tu cuenta / Información — sin categorías/comunas dinámicas.
const sitemapBlocks = [
  {
    title: "Explorar",
    items: [
      { to: "/", label: "Inicio" },
      { to: "/anuncios", label: "Todos los anuncios" },
      { to: "/anuncios", label: "Categorías" },
      { to: "/packs", label: "Comprar packs" },
    ],
  },
  {
    title: "Tu cuenta",
    items: [
      { to: "/login", label: "Iniciar sesión" },
      { to: "/registro", label: "Regístrate" },
      { to: "/anunciar", label: "Publicar un aviso" },
      { to: "/cuenta/mis-anuncios", label: "Mis anuncios" },
    ],
  },
  {
    title: "Información",
    items: [
      { to: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
      { to: "/politicas-de-privacidad", label: "Políticas de privacidad" },
      { to: "/terminos-y-condiciones-de-uso", label: "Condiciones de uso" },
      { to: "/contacto", label: "Contáctanos" },
    ],
  },
];

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
