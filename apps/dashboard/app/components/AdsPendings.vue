<template>
  <section class="ads ads--pendings">
    <div class="ads--pendings__container">
      <div class="ads--pendings__header">
        <SearchDefault
          :model-value="settingsStore.ads.searchTerm"
          placeholder="Buscar anuncios..."
          class="ads--pendings__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="ads--pendings__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="ads--pendings__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow v-for="ad in paginatedAds" :key="ad.id">
            <TableCell>
              <div class="ads--pendings__gallery">
                <img
                  v-if="ad.gallery && ad.gallery.length > 0"
                  :src="getImageUrl(ad.gallery[0])"
                  :alt="ad.name"
                  class="ads--pendings__gallery__image"
                />
                <span v-else class="ads--pendings__gallery__placeholder"
                  >-</span
                >
              </div>
            </TableCell>
            <TableCell>
              <div class="ads--pendings__name">{{ ad.name }}</div>
            </TableCell>
            <TableCell>
              <div class="ads--pendings__user">
                {{ ad.user?.username || "-" }}
              </div>
            </TableCell>
            <TableCell>{{ formatDate(ad.createdAt) }}</TableCell>
            <TableCell align="right">
              <button
                class="ads--pendings__action"
                title="Ver anuncio"
                @click="handleViewAd(ad.id)"
              >
                <Eye class="ads--pendings__action__icon" />
              </button>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="paginatedAds.length === 0 && !loading"
          class="ads--pendings__empty"
        >
          <p>No se encontraron anuncios pendientes</p>
        </div>

        <div v-if="loading" class="ads--pendings__loading">
          <p>Cargando anuncios...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.ads.currentPage"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="settingsStore.ads.pageSize"
        class="ads--pendings__pagination"
        @page-change="
          (page: number) => settingsStore.setCurrentPage(section, page)
        "
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Eye } from "lucide-vue-next";
import { useSettingsStore } from "@/stores/settings.store";
import SearchDefault from "@/components/SearchDefault.vue";
import FilterDefault from "@/components/FilterDefault.vue";
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";
import PaginationDefault from "@/components/PaginationDefault.vue";

interface Ad {
  id: number;
  name: string;
  createdAt: string;
  user?: { username: string };
  gallery?: Array<{ url: string; formats?: any }>;
}

// Store de settings
const settingsStore = useSettingsStore();
const section = "ads" as const;

// Computed para los filtros de anuncios
const filters = computed(() => settingsStore.getAdsFilters);

// Handler para cambios en filtros
const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

// Estado
const allAds = ref<Ad[]>([]);
const loading = ref(false);
const paginationMeta = ref<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} | null>(null);

// Fetch de anuncios pendientes desde Strapi
const fetchPendingAds = async () => {
  try {
    loading.value = true;
    const strapi = useStrapi();

    const searchParams: any = {
      pagination: {
        page: settingsStore.ads.currentPage,
        pageSize: settingsStore.ads.pageSize,
      },
      sort: settingsStore.ads.sortBy,
      populate: {
        user: {
          fields: ["username"],
        },
        gallery: {
          fields: ["url", "formats"],
        },
      },
    };

    // Agregar búsqueda si existe
    if (settingsStore.ads.searchTerm) {
      searchParams.filters = {
        $or: [
          { name: { $containsi: settingsStore.ads.searchTerm } },
          { description: { $containsi: settingsStore.ads.searchTerm } },
          { "user.username": { $containsi: settingsStore.ads.searchTerm } },
          { "user.email": { $containsi: settingsStore.ads.searchTerm } },
        ],
      };
    }

    const response = await strapi.find("ads/pendings", searchParams);
    allAds.value = Array.isArray(response.data) ? response.data : [];

    // Guardar información de paginación de Strapi
    paginationMeta.value = response.meta?.pagination
      ? response.meta.pagination
      : null;
  } catch (error) {
    console.error("Error fetching pending ads:", error);
    allAds.value = [];
  } finally {
    loading.value = false;
  }
};

// Usar los datos directamente de Strapi (ya vienen paginados y ordenados)
const paginatedAds = computed(() => allAds.value);

// Calcular totalPages desde meta.pagination de Strapi
const totalPages = computed(() => {
  return paginationMeta.value?.pageCount || 1;
});

const totalRecords = computed(() => {
  return paginationMeta.value?.total || 0;
});

// Columnas de la tabla
const tableColumns = [
  { label: "Galería" },
  { label: "Anuncio" },
  { label: "Usuario" },
  { label: "Fecha" },
  { label: "Acciones", align: "right" as const },
];

const sortOptions = [
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
  { value: "name:asc", label: "Título A-Z" },
  { value: "name:desc", label: "Título Z-A" },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const router = useRouter();
const media = useStrapiMedia("");

const getImageUrl = (image: { url: string; formats?: any }) => {
  if (!image) return "";
  // Usar formato thumbnail si existe, sino la URL original
  const imageUrl = image.formats?.thumbnail?.url || image.url;
  if (!imageUrl) return "";

  // Usar useStrapiMedia del plugin de Nuxt Strapi para obtener la URL completa
  return media + imageUrl;
};

const handleViewAd = (adId: number) => {
  router.push(`/anuncios/${adId}`);
};

// Watch para recargar cuando cambian los filtros o la búsqueda
watch(
  [
    () => settingsStore.ads.searchTerm,
    () => settingsStore.ads.sortBy,
    () => settingsStore.ads.pageSize,
    () => settingsStore.ads.currentPage,
  ],
  () => {
    fetchPendingAds();
  },
  { immediate: true },
);

// Cargar datos al montar
onMounted(() => {
  fetchPendingAds();
});
</script>
