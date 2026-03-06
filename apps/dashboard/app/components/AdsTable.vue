<template>
  <section class="ads" :class="`ads--${props.section}`">
    <div :class="`ads--${props.section}__container`">
      <div :class="`ads--${props.section}__header`">
        <SearchDefault
          :model-value="sectionSettings.searchTerm"
          placeholder="Buscar anuncios..."
          :class="`ads--${props.section}__search`"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(props.section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          :class="`ads--${props.section}__filters`"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div :class="`ads--${props.section}__table-wrapper`">
        <TableDefault :columns="tableColumns">
          <TableRow v-for="ad in paginatedAds" :key="ad.id">
            <TableCell>
              <div :class="`ads--${props.section}__gallery`">
                <img
                  v-if="ad.gallery && ad.gallery.length > 0 && ad.gallery[0]"
                  :src="getImageUrl(ad.gallery[0])"
                  :alt="ad.name"
                  :class="`ads--${props.section}__gallery__image`"
                />
                <span
                  v-else
                  :class="`ads--${props.section}__gallery__placeholder`"
                  >-</span
                >
              </div>
            </TableCell>
            <TableCell>
              <div :class="`ads--${props.section}__name`">{{ ad.name }}</div>
            </TableCell>
            <TableCell>
              <div :class="`ads--${props.section}__user`">
                {{ ad.user?.username || "-" }}
              </div>
            </TableCell>
            <TableCell>{{ formatDate(ad.createdAt) }}</TableCell>
            <TableCell align="right">
              <div :class="`ads--${props.section}__actions`">
                <button
                  :class="`ads--${props.section}__action`"
                  title="Ver anuncio"
                  @click="handleViewAd(ad.id)"
                >
                  <Eye :class="`ads--${props.section}__action__icon`" />
                </button>
                <a
                  v-if="showWebLink && ad.slug"
                  :href="`${websiteUrl}/anuncios/${ad.slug}`"
                  :class="`ads--${props.section}__action`"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver en web"
                >
                  <ExternalLink
                    :class="`ads--${props.section}__action__icon`"
                  />
                </a>
              </div>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="paginatedAds.length === 0 && !loading"
          :class="`ads--${props.section}__empty`"
        >
          <p>{{ emptyMessage }}</p>
        </div>

        <div v-if="loading" :class="`ads--${props.section}__loading`">
          <p>Cargando anuncios...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="sectionSettings.currentPage"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="sectionSettings.pageSize"
        :class="`ads--${props.section}__pagination`"
        @page-change="
          (page: number) => settingsStore.setCurrentPage(props.section, page)
        "
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { Eye, ExternalLink } from "lucide-vue-next";
import type { Ad, AdGalleryItem } from "@/types/ad";
import { useSettingsStore } from "@/stores/settings.store";
import SearchDefault from "@/components/SearchDefault.vue";
import FilterDefault from "@/components/FilterDefault.vue";
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";
import PaginationDefault from "@/components/PaginationDefault.vue";

// SettingsState section keys
type SettingsSection =
  | "orders"
  | "adsPendings"
  | "adsActives"
  | "adsArchived"
  | "adsBanned"
  | "adsRejected"
  | "adsAbandoned"
  | "users"
  | "reservations"
  | "featured"
  | "categories"
  | "conditions"
  | "faqs"
  | "packs"
  | "regions"
  | "communes";

interface Props {
  endpoint: string;
  section: SettingsSection;
  emptyMessage?: string;
  showWebLink?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  emptyMessage: "No se encontraron anuncios",
  showWebLink: false,
});

const { public: publicConfig } = useRuntimeConfig();
const websiteUrl = publicConfig.websiteUrl as string;

const settingsStore = useSettingsStore();

// Computed accessor for the current section's settings
const sectionSettings = computed(() => settingsStore[props.section]);

// Computed para los filtros de la sección
const filters = computed(() => ({
  sortBy: sectionSettings.value.sortBy,
  pageSize: sectionSettings.value.pageSize,
}));

// Handler para cambios en filtros
const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(props.section, newFilters);
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

// Fetch de anuncios desde Strapi
const fetchAds = async () => {
  try {
    loading.value = true;
    const strapi = useStrapi();
    const section = sectionSettings.value;

    const searchParams: Record<string, unknown> = {
      pagination: {
        page: section.currentPage,
        pageSize: section.pageSize,
      },
      sort: section.sortBy,
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
    if (section.searchTerm) {
      searchParams.filters = {
        $or: [
          { name: { $containsi: section.searchTerm } },
          { description: { $containsi: section.searchTerm } },
          { "user.username": { $containsi: section.searchTerm } },
          { "user.email": { $containsi: section.searchTerm } },
        ],
      };
    }

    const response = await strapi.find(props.endpoint, searchParams);
    allAds.value = Array.isArray(response.data) ? (response.data as Ad[]) : [];

    // Guardar información de paginación de Strapi
    paginationMeta.value = response.meta?.pagination
      ? (response.meta.pagination as typeof paginationMeta.value)
      : null;
  } catch (error) {
    console.error(`Error fetching ads from ${props.endpoint}:`, error);
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

const { transformUrl } = useImageProxy();

const getImageUrl = (image: AdGalleryItem) => {
  if (!image) return "";
  const imageUrl = image.formats?.thumbnail?.url || image.url;
  if (!imageUrl) return "";
  return transformUrl(imageUrl);
};

const router = useRouter();

const handleViewAd = (adId: number) => {
  router.push(`/ads/${adId}`);
};

// Watch para recargar cuando cambian los filtros o la búsqueda
// watch(immediate:true) es el único trigger de carga de datos — no onMounted
watch(
  [
    () => sectionSettings.value.searchTerm,
    () => sectionSettings.value.sortBy,
    () => sectionSettings.value.pageSize,
    () => sectionSettings.value.currentPage,
  ],
  () => {
    fetchAds();
  },
  { immediate: true },
);
</script>

<style scoped>
.ads [class$="__actions"] {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
