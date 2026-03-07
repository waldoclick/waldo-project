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

<script setup lang="ts">
import type { User } from "@/types/user";
import type { Ad } from "@/types/ad";
import type { Pagination } from "@/types/pagination";
// stores
import { useRoute } from "nuxt/app";
import { useAdsStore } from "@/stores/ads.store";
import { useUserStore } from "~/stores/user.store";
// components
import HeaderDefault from "@/components/HeaderDefault.vue";
import HeroProfile from "@/components/HeroProfile.vue";
import ProfileDefault from "@/components/ProfileDefault.vue";
import FooterDefault from "@/components/FooterDefault.vue";

interface ProfileData {
  user: User;
  ads: Ad[];
  pagination: Pagination;
}

// Define SEO
const { $setSEO, $setStructuredData } = useNuxtApp();

const route = useRoute();
const config = useRuntimeConfig();

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
    statusMessage: "Lo sentimos, la página que buscas no existe.",
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
} = await useAsyncData<ProfileData | null>(
  () => `adsData-${route.params.slug}`,
  async () => {
    const userStore = useUserStore();
    const username = String(route.params.slug || "");
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
          statusMessage: "Lo sentimos, la página que buscas no existe.",
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
      if ((err as any)?.statusCode) {
        throw err;
      }
      // Si es otro tipo de error, lanzamos un 404 genérico
      console.error("Error loading user data:", err);
      throw createError({
        statusCode: 404,
        message: "Página no encontrada",
        statusMessage: "Lo sentimos, la página que buscas no existe.",
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
      statusMessage: "Lo sentimos, la página que buscas no existe.",
    });
  });
}

// Set SEO and structured data when profile data is available
watch(
  () => adsData.value,
  (newData) => {
    if (!newData || !newData.user) return;
    const location = newData.user.commune?.name
      ? `en ${newData.user.commune.name}`
      : "en Chile";

    $setSEO({
      title: `Perfil de ${newData.user.username}`,
      description: `Vendedor verificado en Waldo.click®. Explora los anuncios de activos industriales de ${newData.user.username} ${location} y compra directo al vendedor.`,
      imageUrl:
        newData.user.avatar?.url || `${config.public.baseUrl}/share.jpg`,
      url: `${config.public.baseUrl}/${route.params.slug}`,
    });

    $setStructuredData({
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      name: `Perfil de ${newData.user.username}`,
      description: `Perfil de vendedor de ${newData.user.username} ${location}`,
      url: `${config.public.baseUrl}/${route.params.slug}`,
      mainEntity: {
        "@type": newData.user.is_company ? "Organization" : "Person",
        name: newData.user.is_company
          ? newData.user.business_name || newData.user.username
          : `${newData.user.firstname || ""} ${newData.user.lastname || ""}`.trim() ||
            newData.user.username,
        image: newData.user.avatar?.url || `${config.public.baseUrl}/share.jpg`,
        url: `${config.public.baseUrl}/${route.params.slug}`,
      },
    });
  },
  { immediate: true },
);

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
