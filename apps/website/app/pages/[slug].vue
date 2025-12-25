<template>
  <div v-if="adsData && adsData.user" class="page">
    <!-- <pre>{{ adsData }}</pre> -->
    <HeaderDefault :show-search="true" />
    <HeroProfile :user="adsData.user" />
    <ProfileDefault
      v-if="adsData.user && adsData.ads && adsData.pagination"
      :user="adsData.user"
      :ads="adsData.ads"
      :pagination="adsData.pagination"
    />
    <FooterDefault />
  </div>
</template>

<script setup>
// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();
// stores
import { useRoute } from "nuxt/app";
import { useAdsStore } from "@/stores/ads.store";
import { useUserStore } from "~/stores/user.store";
// components
import HeaderDefault from "@/components/HeaderDefault";
import HeroProfile from "@/components/HeroProfile";
import ProfileDefault from "@/components/ProfileDefault";
import FooterDefault from "@/components/FooterDefault";

const route = useRoute();

// Excluir rutas que no son perfiles de usuario
// Estas rutas deben ser manejadas por sus propias páginas específicas
const excludedRoutes = [
  "anuncios",
  "cuenta",
  "anunciar",
  "packs",
  "contacto",
  "login",
  "registro",
  "preguntas-frecuentes",
  "politicas-de-privacidad",
  "recuperar-contrasena",
];

// Si la ruta está excluida, mostrar error 404
// Esto previene que [slug].vue intercepte rutas que deben ser manejadas por otras páginas
const slug = String(route.params.slug || "");
if (excludedRoutes.includes(slug)) {
  throw createError({
    statusCode: 404,
    message: "Página no encontrada",
    description: "Lo sentimos, la página que buscas no existe.",
  });
}

// Crear una ref para la página actual
const currentPage = ref(
  Number.parseInt(route.query.page?.toString() || "1", 10),
);

const {
  data: adsData,
  pending,
  error,
} = await useAsyncData(
  () => `adsData-${route.params.slug}`,
  async () => {
    const userStore = useUserStore();
    const username = route.params.slug;
    const adsStore = useAdsStore();

    try {
      // Primero intentamos cargar el usuario
      await userStore.loadUser(username);

      // Si no existe el usuario, lanzar error 404 directamente
      if (
        !userStore.user ||
        typeof userStore.user !== "object" ||
        !userStore.user.id
      ) {
        throw createError({
          statusCode: 404,
          message: "Página no encontrada",
          description: "Lo sentimos, la página que buscas no existe.",
        });
      }

      const paginationParams = { pageSize: 12, page: currentPage.value };
      const sortParams = ["createdAt:desc"];
      const filtersParams = {
        active: { $eq: true },
        user: { username: { $eq: username } },
      };

      // Solo cargamos los anuncios si existe el usuario
      await adsStore.loadAds(filtersParams, paginationParams, sortParams);

      return {
        user: userStore.user,
        ads: adsStore.ads,
        pagination: adsStore.pagination,
      };
    } catch (err) {
      // Si el error ya es un createError, lo relanzamos
      if (err?.statusCode) {
        throw err;
      }
      // Si es otro tipo de error, lanzamos un 404 genérico
      console.error("Error loading user data:", err);
      throw createError({
        statusCode: 404,
        message: "Página no encontrada",
        description: "Lo sentimos, la página que buscas no existe.",
      });
    }
  },
  {
    watch: [() => route.params.slug, currentPage],
    server: true,
    lazy: false,
  },
);

// Observar los datos para cambios dinámicos (solo en cliente)
if (import.meta.client) {
  watchEffect(() => {
    if (pending.value) return;
    if (adsData.value && adsData.value.user) return;
    showError({
      statusCode: 404,
      message: "Página no encontrada",
      description: "Lo sentimos, la página que buscas no existe.",
    });
  });
}

// Configurar SEO solo cuando hay datos válidos (EJECUTAR DESPUÉS)
// Deshabilitado temporalmente para evitar errores 500
// watch(
//   () => adsData.value,
//   (newData) => {
//     if (pending.value || !newData || !newData.user || !newData.ads || !Array.isArray(newData.ads) || !newData.user.username) return;
//     try {
//       const totalAds = newData.ads.length || 0;
//       const location = newData.user.commune?.name ? `en ${newData.user.commune.name}` : "en Chile";
//       const categories = [...new Set(newData.ads.map((ad) => ad?.category?.name).filter(Boolean))].slice(0, 3).join(", ");
//       $setSEO({
//         title: `Perfil de ${newData.user.username}`,
//         description: `Explora los ${totalAds} anuncios de publicados por ${newData.user.username} ${location}. Encuentra los mejores precios en equipamiento industrial en Waldo.click`,
//         imageUrl: newData.user.avatar?.url || "https://waldo.click/share.jpg",
//         url: `https://waldo.click/${route.params.slug}`,
//       });
//       $setStructuredData({
//         "@context": "https://schema.org",
//         "@type": "ProfilePage",
//         name: newData.user.username,
//         description: `Perfil comercial de ${newData.user.username} - Vendedor especializado en ${categories || "equipo industrial"} ${location}`,
//         url: `https://waldo.click/${route.params.slug}`,
//         mainEntity: {
//           "@type": "Person",
//           name: newData.user.username,
//           image: newData.user.avatar?.url || "https://waldo.click/share.jpg",
//           description: `Vendedor con ${totalAds} anuncios activos en Waldo.click`,
//           url: `https://waldo.click/${route.params.slug}`,
//           memberOf: {
//             "@type": "Organization",
//             name: "Waldo.click",
//             url: "https://waldo.click",
//           },
//         },
//       });
//     } catch (err) {
//       console.error("Error setting SEO:", err);
//     }
//   },
// );

// Observar cambios en la URL y actualizar la página actual
watch(
  () => route.query.page,
  (newPage) => {
    if (newPage) {
      currentPage.value = Number.parseInt(newPage.toString(), 10);
    }
  },
);
</script>
