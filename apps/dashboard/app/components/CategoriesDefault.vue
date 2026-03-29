<template>
  <section class="categories categories--default">
    <div class="categories--default__container">
      <div class="categories--default__header">
        <SearchDefault
          :model-value="settingsStore.categories.searchTerm"
          placeholder="Buscar categorías..."
          class="categories--default__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="categories--default__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="categories--default__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow v-for="category in paginatedCategories" :key="category.id">
            <TableCell>{{ category.id }}</TableCell>
            <TableCell>
              <div class="categories--default__name">
                {{ category.name || "-" }}
              </div>
            </TableCell>
            <TableCell>
              <div class="categories--default__color">
                <span
                  v-if="isHexColor(category.color)"
                  class="categories--default__color__dot"
                  :style="{ backgroundColor: category.color }"
                ></span>
                <span>{{ category.color || "-" }}</span>
              </div>
            </TableCell>
            <TableCell>
              <BadgeDefault variant="outline">
                {{ getAdsCount(category.id) }} aviso{{
                  getAdsCount(category.id) !== 1 ? "s" : ""
                }}
              </BadgeDefault>
            </TableCell>
            <TableCell>{{ formatDate(category.updatedAt) }}</TableCell>
            <TableCell align="right">
              <div class="categories--default__actions">
                <button
                  class="categories--default__action"
                  title="Ver categoría"
                  @click="handleViewCategory(category.id)"
                >
                  <Eye class="categories--default__action__icon" />
                </button>
                <button
                  class="categories--default__action"
                  title="Editar categoría"
                  @click="handleEditCategory(category.id)"
                >
                  <Pencil class="categories--default__action__icon" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="paginatedCategories.length === 0 && !loading"
          class="categories--default__empty"
        >
          <p>No se encontraron categorías</p>
        </div>

        <div v-if="loading" class="categories--default__loading">
          <p>Cargando categorías...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.categories.currentPage"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="settingsStore.categories.pageSize"
        class="categories--default__pagination"
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
import { Eye, Pencil } from "lucide-vue-next";
import { useSettingsStore } from "@/stores/settings.store";
import SearchDefault from "@/components/SearchDefault.vue";
import FilterDefault from "@/components/FilterDefault.vue";
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";
import BadgeDefault from "@/components/BadgeDefault.vue";
import PaginationDefault from "@/components/PaginationDefault.vue";
import type { Category } from "@/types/category";

const settingsStore = useSettingsStore();
const section = "categories" as const;

const filters = computed(() => settingsStore.getCategoriesFilters);

const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

const apiClient = useApiClient();
const allCategories = ref<Category[]>([]);
const adsCountByCategory = ref<Record<number, number>>({});
const loading = ref(false);
const paginationMeta = ref<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} | null>(null);

const fetchCategories = async () => {
  try {
    loading.value = true;

    const searchParams: Record<string, unknown> = {
      pagination: {
        page: settingsStore.categories.currentPage,
        pageSize: settingsStore.categories.pageSize,
      },
      sort: settingsStore.categories.sortBy,
    };

    if (settingsStore.categories.searchTerm) {
      searchParams.filters = {
        name: {
          $containsi: settingsStore.categories.searchTerm,
        },
      };
    }

    const response = await apiClient("categories", {
      method: "GET",
      params: searchParams as unknown as Record<string, unknown>,
    }) as { data: Category[]; meta: { pagination: typeof paginationMeta.value } };
    allCategories.value = Array.isArray(response.data)
      ? (response.data as Category[])
      : [];
    paginationMeta.value = (response.meta?.pagination ||
      null) as typeof paginationMeta.value;

    // Fetch all ad counts in a single request
    const countsResponse = await apiClient("categories/ad-counts", {
      method: "GET",
    }) as { data: Array<{ categoryId: number; count: number }> };
    const countsData = Array.isArray(countsResponse.data)
      ? countsResponse.data
      : [];
    const counts: Record<number, number> = {};
    for (const entry of countsData) {
      counts[entry.categoryId] = entry.count;
    }
    adsCountByCategory.value = counts;
  } catch (error) {
    console.error("Error fetching categories:", error);
    allCategories.value = [];
  } finally {
    loading.value = false;
  }
};

const getAdsCount = (categoryId: number): number => {
  return adsCountByCategory.value[categoryId] || 0;
};

const paginatedCategories = computed(() => allCategories.value);

const totalPages = computed(() => {
  return paginationMeta.value?.pageCount || 1;
});

const totalRecords = computed(() => {
  return paginationMeta.value?.total || 0;
});

const tableColumns = [
  { label: "ID" },
  { label: "Nombre" },
  { label: "Color" },
  { label: "Anuncios" },
  { label: "Fecha" },
  { label: "Acciones", align: "right" as const },
];

const sortOptions = [
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
  { value: "name:asc", label: "Nombre A-Z" },
  { value: "name:desc", label: "Nombre Z-A" },
];

const router = useRouter();

const handleViewCategory = (categoryId: number) => {
  router.push(`/categories/${categoryId}`);
};

const handleEditCategory = (categoryId: number) => {
  router.push(`/categories/${categoryId}/edit`);
};

const isHexColor = (value?: string) => {
  if (!value) return false;
  return /^#([\dA-Fa-f]{3}|[\dA-Fa-f]{6})$/.test(value.trim());
};

watch(
  [
    () => settingsStore.categories.searchTerm,
    () => settingsStore.categories.sortBy,
    () => settingsStore.categories.pageSize,
    () => settingsStore.categories.currentPage,
  ],
  () => {
    fetchCategories();
  },
  { immediate: true },
);
</script>
