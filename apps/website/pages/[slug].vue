<template>
  <div if="adsData" class="page">
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

      // Si no existe el usuario, retornamos null para manejar el 404
      if (!userStore.user) {
        return null;
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
    } catch (error) {
      console.error("Error loading user data:", error);
      return null;
    }
  },
  {
    watch: [() => route.params.slug, currentPage],
    server: true,
    lazy: false,
  },
);

// Configurar SEO cuando los datos estén disponibles
watch(
  () => adsData.value,
  (newData) => {
    if (newData && newData.user) {
      const totalAds = newData.ads.length;
      const location = newData.user.commune?.name
        ? `en ${newData.user.commune.name}`
        : "en Chile";
      const categories = [
        ...new Set(newData.ads.map((ad) => ad.category?.name)),
      ]
        .slice(0, 3)
        .join(", ");

      $setSEO({
        title: `Perfil de ${newData.user?.username}`,
        description: `Explora los ${totalAds} anuncios de publicados por ${newData.user?.username} ${location}. Encuentra los mejores precios en equipamiento industrial en Waldo.click`,
        imageUrl: newData.user?.avatar?.url || "https://waldo.click/share.jpg",
        url: `https://waldo.click/${route.params.slug}`,
      });

      $setStructuredData({
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        name: newData.user?.username,
        description: `Perfil comercial de ${newData.user?.username} - Vendedor especializado en ${categories || "equipo industrial"} ${location}`,
        url: `https://waldo.click/${route.params.slug}`,
        mainEntity: {
          "@type": "Person",
          name: newData.user?.username,
          image: newData.user?.avatar?.url || "https://waldo.click/share.jpg",
          description: `Vendedor con ${totalAds} anuncios activos en Waldo.click`,
          url: `https://waldo.click/${route.params.slug}`,
          memberOf: {
            "@type": "Organization",
            name: "Waldo.click",
            url: "https://waldo.click",
          },
        },
      });
    }
  },
  { immediate: true },
);

// Observar los datos y redirigir al 404 solo cuando la carga haya terminado
watchEffect(() => {
  if (!pending.value && !adsData.value && !error.value) {
    showError({
      statusCode: 404,
      message: "Página no encontrada",
      description: "Lo sentimos, la página que buscas no existe.",
    });
  }
});

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
