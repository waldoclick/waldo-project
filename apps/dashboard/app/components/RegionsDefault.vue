<template>
  <section class="regions regions--default">
    <div class="regions--default__container">
      <div class="regions--default__header">
        <SearchDefault
          :model-value="settingsStore.regions.searchTerm"
          placeholder="Buscar regiones..."
          class="regions--default__search"
          @update:model-value="
            (value: string) => settingsStore.setSearchTerm(section, value)
          "
        />
        <FilterDefault
          :model-value="filters"
          :sort-options="sortOptions"
          :page-sizes="[10, 25, 50, 100]"
          class="regions--default__filters"
          @update:model-value="handleFiltersChange"
        />
      </div>

      <div class="regions--default__table-wrapper">
        <TableDefault :columns="tableColumns">
          <TableRow v-for="region in paginatedRegions" :key="region.id">
            <TableCell>{{ region.id }}</TableCell>
            <TableCell>
              <div class="regions--default__name">
                {{ region.name || "-" }}
              </div>
            </TableCell>
            <TableCell>
              <BadgeDefault variant="outline">
                {{ getCommunesCount(region) }} comuna{{
                  getCommunesCount(region) !== 1 ? "s" : ""
                }}
              </BadgeDefault>
            </TableCell>
            <TableCell>{{ formatDate(region.createdAt) }}</TableCell>
            <TableCell align="right">
              <button
                class="regions--default__action"
                title="Ver región"
                @click="handleViewRegion(region.id)"
              >
                <Eye class="regions--default__action__icon" />
              </button>
            </TableCell>
          </TableRow>
        </TableDefault>

        <div
          v-if="paginatedRegions.length === 0 && !loading"
          class="regions--default__empty"
        >
          <p>No se encontraron regiones</p>
        </div>

        <div v-if="loading" class="regions--default__loading">
          <p>Cargando regiones...</p>
        </div>
      </div>

      <PaginationDefault
        :current-page="settingsStore.regions.currentPage"
        :total-pages="totalPages"
        :total-records="totalRecords"
        :page-size="settingsStore.regions.pageSize"
        class="regions--default__pagination"
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

interface Region {
  id: number;
  name: string;
  createdAt: string;
  communes?: Array<{ id: number; name: string }>;
}

const settingsStore = useSettingsStore();
const section = "regions" as const;

const filters = computed(() => settingsStore.getRegionsFilters);

const handleFiltersChange = (newFilters: {
  sortBy: string;
  pageSize: number;
}) => {
  settingsStore.setFilters(section, newFilters);
};

const allRegions = ref<Region[]>([]);
const loading = ref(false);
const paginationMeta = ref<{
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} | null>(null);

const fetchRegions = async () => {
  try {
    loading.value = true;
    const strapi = useStrapi();

    const searchParams: any = {
      pagination: {
        page: settingsStore.regions.currentPage,
        pageSize: settingsStore.regions.pageSize,
      },
      sort: settingsStore.regions.sortBy,
      populate: ["communes"],
    };

    if (settingsStore.regions.searchTerm) {
      searchParams.filters = {
        name: {
          $containsi: settingsStore.regions.searchTerm,
        },
      };
    }

    const response = await strapi.find("regions", searchParams);
    allRegions.value = Array.isArray(response.data) ? response.data : [];
    paginationMeta.value = response.meta?.pagination || null;
  } catch (error) {
    console.error("Error fetching regions:", error);
    allRegions.value = [];
  } finally {
    loading.value = false;
  }
};

const paginatedRegions = computed(() => allRegions.value);

const totalPages = computed(() => {
  return paginationMeta.value?.pageCount || 1;
});

const totalRecords = computed(() => {
  return paginationMeta.value?.total || 0;
});

const tableColumns = [
  { label: "ID" },
  { label: "Nombre" },
  { label: "Comunas" },
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

const getCommunesCount = (region: Region): number => {
  return region.communes?.length || 0;
};

const router = useRouter();

const handleViewRegion = (regionId: number) => {
  router.push(`/regiones/${regionId}`);
};

watch(
  [
    () => settingsStore.regions.searchTerm,
    () => settingsStore.regions.sortBy,
    () => settingsStore.regions.pageSize,
    () => settingsStore.regions.currentPage,
  ],
  () => {
    fetchRegions();
  },
  { immediate: true },
);

onMounted(() => {
  fetchRegions();
});
</script>
