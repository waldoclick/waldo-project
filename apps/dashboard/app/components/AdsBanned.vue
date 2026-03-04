<template>
  <section class="ads ads--banned">
    <div class="ads--banned__container">
      <div class="ads--banned__header">
        <SearchDefault
          :model-value="settingsStore.adsBanned.searchTerm"
          placeholder="Buscar anuncios..."
          class="ads--banned__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="ads--banned__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="ads--banned__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow v-for="ad in paginatedAds" :key="ad.id">
            <TableCell>
              <div class="ads--banned__gallery">
                <img
                  v-if="ad.gallery && ad.gallery.length > 0 && ad.gallery[0]"
                  :src="getImageUrl(ad.gallery[0])"
                  :alt="ad.name"
                  class="ads--banned__gallery__image"
                />
                <span v-else class="ads--banned__gallery__placeholder">-</span>
              </div>
            </TableCell>
            <TableCell>
              <div class="ads--banned__name">{{ ad.name }}</div>
            </TableCell>
            <TableCell>
              <div class="ads--banned__user">
                {{ ad.user?.username || "-" }}
              </div>
            </TableCell>
            <TableCell>{{ formatDate(ad.createdAt) }}</TableCell>
            <TableCell align="right">
              <button
                class="ads--banned__action"
                title="Ver anuncio"
                @click="handleViewAd(ad.id)"
              >
                <Eye class="ads--banned__action__icon" />
              </button>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="paginatedAds.length === 0 && !loading"
          class="ads--banned__empty"
        >
          <p>No se encontraron anuncios baneados</p>
        </div>

        <div v-if="loading" class="ads--banned__loading">
          <p>Cargando anuncios...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.adsBanned.currentPage"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="settingsStore.adsBanned.pageSize"
        class="ads--banned__pagination"
        @page-change="
          (page: number) => settingsStore.setCurrentPage(section, page)
        "
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
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
const section = "adsBanned" as const;

// Computed para los filtros de anuncios
const filters = computed(() => settingsStore.getAdsBannedFilters);

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

// Fetch de anuncios baneados desde Strapi
const fetchBannedAds = async () => {
  try {
    loading.value = true;
    const strapi = useStrapi();

    const searchParams: any = {
      pagination: {
        page: settingsStore.adsBanned.currentPage,
        pageSize: settingsStore.adsBanned.pageSize,
      },
      sort: settingsStore.adsBanned.sortBy,
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
    if (settingsStore.adsBanned.searchTerm) {
      searchParams.filters = {
        $or: [
          { name: { $containsi: settingsStore.adsBanned.searchTerm } },
          { description: { $containsi: settingsStore.adsBanned.searchTerm } },
          {
            "user.username": { $containsi: settingsStore.adsBanned.searchTerm },
          },
          { "user.email": { $containsi: settingsStore.adsBanned.searchTerm } },
        ],
      };
    }

    const response = await strapi.find("ads/banneds", searchParams);
    allAds.value = Array.isArray(response.data) ? response.data : [];

    // Guardar información de paginación de Strapi
    paginationMeta.value = response.meta?.pagination
      ? response.meta.pagination
      : null;
  } catch (error) {
    console.error("Error fetching banned ads:", error);
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

const { transformUrl } = useImageProxy();

const getImageUrl = (image: { url: string; formats?: any }) => {
  if (!image) return "";
  const imageUrl = image.formats?.thumbnail?.url || image.url;
  if (!imageUrl) return "";

  return transformUrl(imageUrl);
};

const router = useRouter();

const handleViewAd = (adId: number) => {
  router.push(`/anuncios/${adId}`);
};

// Watch para recargar cuando cambian los filtros o la búsqueda
watch(
  [
    () => settingsStore.adsBanned.searchTerm,
    () => settingsStore.adsBanned.sortBy,
    () => settingsStore.adsBanned.pageSize,
    () => settingsStore.adsBanned.currentPage,
  ],
  () => {
    fetchBannedAds();
  },
  { immediate: true },
);
</script>
