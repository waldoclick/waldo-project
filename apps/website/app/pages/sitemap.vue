<template>
  <SitemapDefault :blocks="sitemapBlocks" />
</template>

<script setup lang="ts">
import {
  Home as IconHome,
  Megaphone as IconMegaphone,
  Mail as IconMail,
  LogIn as IconLogIn,
  Package as IconPackage,
  Shield as IconShield,
  HelpCircle as IconHelpCircle,
  KeyRound as IconKeyRound,
  UserPlus as IconUserPlus,
  Map as IconMap,
  Shapes as IconShapes,
  MapPin as IconMapPin,
} from "lucide-vue-next";
import { useCategoriesStore } from "@/stores/categories.store";
import { useCommunesStore } from "@/stores/communes.store";

// Componente principal
import SitemapDefault from "@/components/SitemapDefault.vue";

// Definir el layout
definePageMeta({
  layout: "about",
});

const { data: pageData } = await useAsyncData("sitemap-data", async () => {
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
});

const sitemapBlocks = [
  {
    title: "Páginas Principales",
    items: [
      { to: "/", label: "Inicio", icon: IconHome },
      { to: "/anuncios", label: "Anuncios", icon: IconMegaphone },
      { to: "/contacto", label: "Contacto", icon: IconMail },
      { to: "/login", label: "Iniciar Sesión", icon: IconLogIn },
      { to: "/packs", label: "Packs", icon: IconPackage },
      {
        to: "/politicas-de-privacidad",
        label: "Políticas de Privacidad",
        icon: IconShield,
      },
      {
        to: "/preguntas-frecuentes",
        label: "Preguntas Frecuentes",
        icon: IconHelpCircle,
      },
      {
        to: "/recuperar-contrasena",
        label: "Recuperar Contraseña",
        icon: IconKeyRound,
      },
      { to: "/registro", label: "Registro", icon: IconUserPlus },
      { to: "/sitemap", label: "Mapa del Sitio", icon: IconMap },
    ],
  },
];

if (pageData.value?.categories && pageData.value.categories.length > 0) {
  sitemapBlocks.push({
    title: "Categorías",
    items: pageData.value.categories.map((category) => ({
      to: `/anuncios?category=${category.slug}`,
      label: category.name,
      icon: IconShapes,
    })),
  });
}

if (pageData.value?.communes && pageData.value.communes.length > 0) {
  sitemapBlocks.push({
    title: "Comunas",
    items: pageData.value.communes.map((commune) => ({
      to: `/anuncios?commune=${commune.id}`,
      label: commune.name,
      icon: IconMapPin,
    })),
  });
}

// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();

$setSEO({
  title: "Mapa del Sitio",
  description:
    "Explora la estructura de nuestro sitio y encuentra fácilmente lo que buscas en Waldo.click.",
  imageUrl: "https://waldo.click/share.jpg",
});

$setStructuredData({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Mapa del Sitio",
  description:
    "Explora la estructura de nuestro sitio y encuentra fácilmente lo que buscas en Waldo.click.",
  url: "https://waldo.click/sitemap",
});
</script>
