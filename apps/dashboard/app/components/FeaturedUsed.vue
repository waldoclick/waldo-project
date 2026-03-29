<template>
  <section class="featured featured--used">
    <div class="featured--used__container">
      <div class="featured--used__header">
        <SearchDefault
          :model-value="settingsStore.featured.searchTerm"
          placeholder="Buscar destacados..."
          class="featured--used__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="featured--used__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="featured--used__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow v-for="featured in paginatedFeatured" :key="featured.id">
            <TableCell>{{ featured.id }}</TableCell>
            <TableCell>
              <div class="featured--used__user">
                {{ featured.user?.username || "-" }}
              </div>
            </TableCell>
            <TableCell>
              <div class="featured--used__ad">
                {{ featured.ad?.name || "-" }}
              </div>
            </TableCell>
            <TableCell>{{ formatCurrency(featured.price) }}</TableCell>
            <TableCell>{{ formatDate(featured.createdAt) }}</TableCell>
            <TableCell align="right">
              <button
                class="featured--used__action"
                title="Ver destacado"
                @click="handleViewFeatured(featured.id)"
              >
                <Eye class="featured--used__action__icon" />
              </button>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="paginatedFeatured.length === 0 && !loading"
          class="featured--used__empty"
        >
          <p>No se encontraron destacados usados</p>
        </div>

        <div v-if="loading" class="featured--used__loading">
          <p>Cargando destacados...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.featured.currentPage"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="settingsStore.featured.pageSize"
        class="featured--used__pagination"
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
import { formatCurrency } from "@/utils/price";
import { useSettingsStore } from "@/stores/settings.store";
import SearchDefault from "@/components/SearchDefault.vue";
import FilterDefault from "@/components/FilterDefault.vue";
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";
import PaginationDefault from "@/components/PaginationDefault.vue";

interface Featured {
  id: number;
  price: number;
  createdAt: string;
  user?: { username: string };
  ad?: { name: string } | null;
}

// Store de settings
const settingsStore = useSettingsStore();
const section = "featured" as const;

// Computed para los filtros de destacados
const filters = computed(() => settingsStore.getFeaturedFilters);

// Handler para cambios en filtros
const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

// Estado
const apiClient = useApiClient();
const allFeatured = ref<Featured[]>([]);
const loading = ref(false);
const paginationMeta = ref<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} | null>(null);

// Fetch de destacados usados desde Strapi
const fetchUsedFeatured = async () => {
  try {
    loading.value = true;

    const searchParams: Record<string, unknown> = {
      pagination: {
        page: settingsStore.featured.currentPage,
        pageSize: settingsStore.featured.pageSize,
      },
      sort: settingsStore.featured.sortBy,
      populate: {
        user: {
          fields: ["username"],
        },
        ad: {
          fields: ["name"],
        },
      },
      filters: {
        ad: {
          $notNull: true,
        },
      },
    };

    // Agregar búsqueda si existe
    if (settingsStore.featured.searchTerm) {
      (searchParams.filters as Record<string, unknown>).$or = [
        {
          "user.username": {
            $containsi: settingsStore.featured.searchTerm,
          },
        },
        { "user.email": { $containsi: settingsStore.featured.searchTerm } },
        { "ad.name": { $containsi: settingsStore.featured.searchTerm } },
      ];
    }

    const response = (await apiClient("ad-featured-reservations", {
      method: "GET",
      params: searchParams as unknown as Record<string, unknown>,
    })) as {
      data: Featured[];
      meta: { pagination: typeof paginationMeta.value };
    };
    allFeatured.value = Array.isArray(response.data)
      ? (response.data as Featured[])
      : [];

    // Guardar información de paginación de Strapi
    paginationMeta.value = response.meta?.pagination
      ? (response.meta.pagination as typeof paginationMeta.value)
      : null;
  } catch (error) {
    console.error("Error fetching used featured:", error);
    allFeatured.value = [];
  } finally {
    loading.value = false;
  }
};

// Usar los datos directamente de Strapi (ya vienen paginados y ordenados)
const paginatedFeatured = computed(() => allFeatured.value);

// Calcular totalPages desde meta.pagination de Strapi
const totalPages = computed(() => {
  return paginationMeta.value?.pageCount || 1;
});

const totalRecords = computed(() => {
  return paginationMeta.value?.total || 0;
});

// Columnas de la tabla
const tableColumns = [
  { label: "ID" },
  { label: "Usuario" },
  { label: "Anuncio" },
  { label: "Precio" },
  { label: "Fecha" },
  { label: "Acciones", align: "right" as const },
];

const sortOptions = [
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
  { value: "user.username:asc", label: "Usuario A-Z" },
  { value: "user.username:desc", label: "Usuario Z-A" },
  { value: "ad.name:asc", label: "Anuncio A-Z" },
  { value: "ad.name:desc", label: "Anuncio Z-A" },
];

const router = useRouter();

const handleViewFeatured = (featuredId: number) => {
  // Navegar a la página de detalle del destacado
  router.push(`/featured/${featuredId}`);
};

defineExpose({ refresh: fetchUsedFeatured });

// Watch para recargar cuando cambian los filtros o la búsqueda
watch(
  [
    () => settingsStore.featured.searchTerm,
    () => settingsStore.featured.sortBy,
    () => settingsStore.featured.pageSize,
    () => settingsStore.featured.currentPage,
  ],
  () => {
    fetchUsedFeatured();
  },
  { immediate: true },
);
</script>
