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
              <BadgeDefault variant="outline">
                {{ getAdsCount(category.id) }} aviso{{
                  getAdsCount(category.id) !== 1 ? "s" : ""
                }}
              </BadgeDefault>
            </TableCell>
            <TableCell>{{ formatDate(category.createdAt) }}</TableCell>
            <TableCell align="right">
              <button
                class="categories--default__action"
                title="Ver categoría"
                @click="handleViewCategory(category.id)"
              >
                <Eye class="categories--default__action__icon" />
              </button>
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
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { Eye } from "lucide-vue-next";
import { useSettingsStore } from "@/stores/settings.store";
import SearchDefault from "@/components/SearchDefault.vue";
import FilterDefault from "@/components/FilterDefault.vue";
import TableDefault from "@/components/TableDefault.vue";
import TableRow from "@/components/TableRow.vue";
import TableCell from "@/components/TableCell.vue";
import BadgeDefault from "@/components/BadgeDefault.vue";
import PaginationDefault from "@/components/PaginationDefault.vue";

interface Category {
  id: number;
  name: string;
  createdAt: string;
}

const settingsStore = useSettingsStore();
const section = "categories" as const;

const filters = computed(() => settingsStore.getCategoriesFilters);

const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

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
    const strapi = useStrapi();

    const searchParams: any = {
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

    const response = await strapi.find("categories", searchParams);
    allCategories.value = Array.isArray(response.data) ? response.data : [];
    paginationMeta.value = response.meta?.pagination || null;

    // Fetch ads count for each category
    await fetchAdsCountByCategory();
  } catch (error) {
    console.error("Error fetching categories:", error);
    allCategories.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchAdsCountByCategory = async () => {
  try {
    const strapi = useStrapi();
    const counts: Record<number, number> = {};

    // Fetch ads count for each category in parallel
    const countPromises = allCategories.value.map(async (category) => {
      try {
        const adsResponse = await strapi.find("ads", {
          filters: {
            category: {
              id: {
                $eq: category.id,
              },
            },
          },
          pagination: {
            page: 1,
            pageSize: 1,
          },
        });
        return {
          categoryId: category.id,
          count: adsResponse.meta?.pagination?.total || 0,
        };
      } catch (error) {
        console.error(
          `Error fetching ads count for category ${category.id}:`,
          error,
        );
        return {
          categoryId: category.id,
          count: 0,
        };
      }
    });

    const results = await Promise.all(countPromises);
    for (const { categoryId, count } of results) {
      counts[categoryId] = count;
    }

    adsCountByCategory.value = counts;
  } catch (error) {
    console.error("Error fetching ads count by category:", error);
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
  { label: "Avisos" },
  { label: "Fecha" },
  { label: "Acciones", align: "right" as const },
];

const sortOptions = [
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
  { value: "name:asc", label: "Nombre A-Z" },
  { value: "name:desc", label: "Nombre Z-A" },
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

const handleViewCategory = (categoryId: number) => {
  router.push(`/categorias/${categoryId}`);
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

onMounted(() => {
  fetchCategories();
});
</script>
