<template>
  <section class="ads ads--archived">
    <div class="ads--archived__container">
      <div class="ads--archived__header">
        <SearchDefault
          :model-value="settingsStore.ads.searchTerm"
          placeholder="Buscar anuncios..."
          class="ads--archived__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="ads--archived__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="ads--archived__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow v-for="ad in paginatedAds" :key="ad.id">
            <TableCell>
              <div class="ads--archived__gallery">
                <img
                  v-if="ad.gallery && ad.gallery.length > 0 && ad.gallery[0]"
                  :src="getImageUrl(ad.gallery[0])"
                  :alt="ad.name"
                  class="ads--archived__gallery__image"
                />
                <span v-else class="ads--archived__gallery__placeholder"
                  >-</span
                >
              </div>
            </TableCell>
            <TableCell>
              <div class="ads--archived__name">{{ ad.name }}</div>
            </TableCell>
            <TableCell>
              <div class="ads--archived__user">
                {{ ad.user?.username || "-" }}
              </div>
            </TableCell>
            <TableCell>{{ formatDate(ad.createdAt) }}</TableCell>
            <TableCell align="right">
              <button
                class="ads--archived__action"
                title="Ver anuncio"
                @click="handleViewAd(ad.id)"
              >
                <Eye class="ads--archived__action__icon" />
              </button>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="filteredAds.length === 0 && !loading"
          class="ads--archived__empty"
        >
          <p>No se encontraron anuncios archivados</p>
        </div>

        <div v-if="loading" class="ads--archived__loading">
          <p>Cargando anuncios...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.ads.currentPage"
        :total-pages="totalPages"
        class="ads--archived__pagination"
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

// Fetch de anuncios archivados desde Strapi
const fetchArchivedAds = async () => {
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

    const response = await strapi.find("ads/archiveds", searchParams);
    allAds.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching archived ads:", error);
    allAds.value = [];
  } finally {
    loading.value = false;
  }
};

// Filtrar anuncios por búsqueda (cliente)
const filteredAds = computed(() => {
  if (!settingsStore.ads.searchTerm) {
    return allAds.value;
  }

  const search = settingsStore.ads.searchTerm.toLowerCase();
  return allAds.value.filter((ad) => {
    const name = ad.name?.toLowerCase() || "";
    const username = ad.user?.username?.toLowerCase() || "";

    return name.includes(search) || username.includes(search);
  });
});

// Ordenar anuncios
const sortedAds = computed(() => {
  const ads = [...filteredAds.value];
  const [field, direction] = settingsStore.ads.sortBy.split(":");

  return ads.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (field === "createdAt") {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    } else if (field === "name") {
      aValue = a.name || "";
      bValue = b.name || "";
    } else {
      aValue = a[field as keyof Ad];
      bValue = b[field as keyof Ad];
    }

    if (direction === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
});

// Paginar anuncios
const totalPages = computed(() => {
  return Math.ceil(sortedAds.value.length / settingsStore.ads.pageSize);
});

const paginatedAds = computed(() => {
  const start =
    (settingsStore.ads.currentPage - 1) * settingsStore.ads.pageSize;
  const end = start + settingsStore.ads.pageSize;
  return sortedAds.value.slice(start, end);
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

const media = useStrapiMedia("");

const getImageUrl = (image: { url: string; formats?: any }) => {
  if (!image) return "";
  // Usar formato thumbnail si existe, sino la URL original
  const imageUrl = image.formats?.thumbnail?.url || image.url;
  if (!imageUrl) return "";

  // Usar useStrapiMedia del plugin de Nuxt Strapi para obtener la URL completa
  return media + imageUrl;
};

const router = useRouter();

const handleViewAd = (adId: number) => {
  // Navegar a la página de detalle del anuncio
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
    fetchArchivedAds();
  },
  { immediate: true },
);

// Cargar datos al montar
onMounted(() => {
  fetchArchivedAds();
});
</script>
